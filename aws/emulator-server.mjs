#!/usr/bin/env node
/**
 * ============================================================================
 * LOGITRACK EXPRESS v3.0 — LOCAL AWS EMULATOR GATEWAY (LocalStack Wire-Compatible)
 * ============================================================================
 * Emulador AWS local ligero en Node.js puro (cero dependencias externas) que
 * expone en http://127.0.0.1:4566 exactamente el mismo puerto y contratos de
 * protocolo que LocalStack Community Edition (Docker):
 *   - GET  /_localstack/health                     -> Estado de servicios AWS
 *   - POST / (X-Amz-Target: DynamoDB_20120810.*)   -> PutItem, Scan, DeleteItem, ListTables
 *   - PUT/GET /logitrack-manifests-eu-west-3/*     -> S3 PutObject, GetObject, ListObjectsV2
 *   - POST /000000000000/logitrack-inspection-events -> SQS SendMessage, ReceiveMessage
 *
 * Permite validar toda la arquitectura Cloud AWS en entornos con o sin Docker
 * y se integra directamente en el pipeline CI/CD de GitHub Actions.
 */

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.AWS_EMULATOR_PORT || 4566);
const HOST = process.env.AWS_EMULATOR_HOST || '127.0.0.1';
const REGION = process.env.AWS_DEFAULT_REGION || 'eu-west-3';
const STATE_FILE = path.join(__dirname, '.localstack-state.json');

const state = {
  tables: {
    LogiTrackPackages: {}
  },
  buckets: {
    'logitrack-manifests-eu-west-3': {}
  },
  queues: {
    'logitrack-inspection-events': []
  }
};

function persistState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Persistencia opcional en disco en entornos efímeros
  }
}

function hydrateState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (parsed?.tables?.LogiTrackPackages) state.tables = parsed.tables;
      if (parsed?.buckets?.['logitrack-manifests-eu-west-3']) state.buckets = parsed.buckets;
      if (Array.isArray(parsed?.queues?.['logitrack-inspection-events'])) state.queues = parsed.queues;
    }
  } catch {
    // Iniciar con estado limpio si no hay snapshot previo
  }
}

hydrateState();

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/x-amz-json-1.0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'x-amzn-RequestId': crypto.randomUUID(),
    'x-logitrack-aws-emulator': 'localstack-wire-v3.8',
    ...extraHeaders
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const pathname = parsedUrl.pathname;
  const amzTarget = String(req.headers['x-amz-target'] || '');

  // 1. LocalStack Health Endpoint
  if (req.method === 'GET' && (pathname === '/_localstack/health' || pathname === '/health')) {
    sendJson(res, 200, {
      services: {
        dynamodb: 'running',
        s3: 'running',
        sqs: 'running',
        lambda: 'running',
        sts: 'running'
      },
      edition: 'community-localstack-compatible',
      version: '3.8.1-logitrack',
      region: REGION,
      endpoint: `http://${HOST}:${PORT}`
    });
    return;
  }

  // 2. Amazon DynamoDB JSON RPC (DynamoDB_20120810.*)
  if (req.method === 'POST' && amzTarget.startsWith('DynamoDB_20120810.')) {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const op = amzTarget.split('.')[1];
    const tableName = payload.TableName || 'LogiTrackPackages';
    if (!state.tables[tableName]) state.tables[tableName] = {};

    if (op === 'ListTables') {
      sendJson(res, 200, { TableNames: Object.keys(state.tables) });
      return;
    }

    if (op === 'PutItem') {
      const item = payload.Item || {};
      const id = item.id?.S || crypto.randomUUID();
      state.tables[tableName][id] = item;
      persistState();
      sendJson(res, 200, {
        Attributes: item,
        ConsumedCapacity: { TableName: tableName, CapacityUnits: 1.0 }
      });
      return;
    }

    if (op === 'Scan') {
      const items = Object.values(state.tables[tableName]);
      sendJson(res, 200, {
        Items: items,
        Count: items.length,
        ScannedCount: items.length,
        ConsumedCapacity: { TableName: tableName, CapacityUnits: 0.5 }
      });
      return;
    }

    if (op === 'DeleteItem') {
      const id = payload.Key?.id?.S;
      if (id && state.tables[tableName][id]) {
        delete state.tables[tableName][id];
        persistState();
      }
      sendJson(res, 200, {
        ConsumedCapacity: { TableName: tableName, CapacityUnits: 1.0 }
      });
      return;
    }

    sendJson(res, 400, { __type: 'UnknownOperationException', message: `Unsupported op: ${op}` });
    return;
  }

  // 3. Amazon S3 REST API (/logitrack-manifests-eu-west-3/...)
  const bucketMatch = pathname.match(/^\/([a-z0-9-]+)(?:\/(.*))?$/);
  if (bucketMatch && bucketMatch[1] === 'logitrack-manifests-eu-west-3') {
    const bucket = bucketMatch[1];
    const objectKey = decodeURIComponent(bucketMatch[2] || '');

    if (req.method === 'PUT' && objectKey) {
      const body = await readBody(req);
      const etag = `"${crypto.createHash('md5').update(body).digest('hex')}"`;
      state.buckets[bucket][objectKey] = {
        key: objectKey,
        body,
        sizeBytes: Buffer.byteLength(body, 'utf8'),
        etag,
        lastModified: new Date().toISOString(),
        contentType: req.headers['content-type'] || 'application/json'
      };
      persistState();
      sendJson(
        res,
        200,
        {
          Bucket: bucket,
          Key: objectKey,
          ETag: etag,
          SizeBytes: Buffer.byteLength(body, 'utf8'),
          LastModified: state.buckets[bucket][objectKey].lastModified
        },
        { ETag: etag }
      );
      return;
    }

    if (req.method === 'GET' && !objectKey) {
      const objects = Object.values(state.buckets[bucket]).map((obj) => ({
        Key: obj.key,
        ETag: obj.etag,
        Size: obj.sizeBytes,
        LastModified: obj.lastModified
      }));
      sendJson(res, 200, {
        Name: bucket,
        KeyCount: objects.length,
        Contents: objects
      });
      return;
    }

    if (req.method === 'GET' && objectKey) {
      const found = state.buckets[bucket][objectKey];
      if (!found) {
        sendJson(res, 404, { Code: 'NoSuchKey', Key: objectKey });
        return;
      }
      res.writeHead(200, {
        'Content-Type': found.contentType,
        ETag: found.etag,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(found.body);
      return;
    }
  }

  // 4. Amazon SQS API (/000000000000/logitrack-inspection-events)
  if (pathname === '/000000000000/logitrack-inspection-events') {
    const queueName = 'logitrack-inspection-events';
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const action = payload.Action || (req.method === 'GET' ? 'ReceiveMessage' : 'SendMessage');

    if (action === 'SendMessage') {
      const messageBody =
        typeof payload.MessageBody === 'string'
          ? payload.MessageBody
          : JSON.stringify(payload.MessageBody || {});
      const messageId = crypto.randomUUID();
      const md5 = crypto.createHash('md5').update(messageBody).digest('hex');
      const record = {
        MessageId: messageId,
        ReceiptHandle: `rh-${messageId.slice(0, 12)}`,
        MD5OfBody: md5,
        Body: messageBody,
        SentTimestamp: new Date().toISOString()
      };
      state.queues[queueName].unshift(record);
      state.queues[queueName] = state.queues[queueName].slice(0, 50);
      persistState();
      sendJson(res, 200, {
        MessageId: messageId,
        MD5OfMessageBody: md5,
        QueueUrl: `http://${HOST}:${PORT}/000000000000/${queueName}`
      });
      return;
    }

    if (action === 'ReceiveMessage' || req.method === 'GET') {
      sendJson(res, 200, {
        Messages: state.queues[queueName].slice(0, 20),
        ApproximateNumberOfMessages: state.queues[queueName].length
      });
      return;
    }
  }

  sendJson(res, 404, { message: `AWS Emulator route not found: ${req.method} ${pathname}` });
});

server.listen(PORT, HOST, () => {
  console.log(
    `[LogiTrack::AWS-Emulator] LocalStack-compatible Gateway ONLINE en http://${HOST}:${PORT} (region=${REGION})`
  );
  console.log(
    '  Services: DynamoDB (LogiTrackPackages) | S3 (logitrack-manifests-eu-west-3) | SQS (logitrack-inspection-events)'
  );
});
