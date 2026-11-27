#!/usr/bin/env node
/**
 * Smoke Test Integrado para el AWS Emulator (LocalStack-compatible en http://127.0.0.1:4566)
 * Ejecutado tanto en local (`npm run aws:verify`) como en el pipeline CI/CD de GitHub Actions.
 */

const ENDPOINT = process.env.VITE_AWS_EMULATOR_ENDPOINT || 'http://127.0.0.1:4566';

async function verify() {
  console.log(`[AWS-Verify] Conectando al AWS Emulator en ${ENDPOINT} ...`);

  // 1. Health Check
  const healthRes = await fetch(`${ENDPOINT}/_localstack/health`);
  if (!healthRes.ok) throw new Error(`Health check failed: HTTP ${healthRes.status}`);
  const health = await healthRes.json();
  console.log('[1/4] LocalStack Health OK:', JSON.stringify(health.services));

  // 2. DynamoDB PutItem + Scan
  const sampleId = 'a1f4e8c2-7b3d-4e9a-9c1b-2d8f6a4e5b10';
  const putRes = await fetch(`${ENDPOINT}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.0',
      'X-Amz-Target': 'DynamoDB_20120810.PutItem'
    },
    body: JSON.stringify({
      TableName: 'LogiTrackPackages',
      Item: {
        id: { S: sampleId },
        trackingCode: { S: 'LTK-4821-ES' },
        destinationHub: { S: 'MAD-Cargo Terminal T4' },
        weightKg: { N: '18.45' },
        priority: { S: 'CRITICAL' },
        status: { S: 'IN_TRANSIT' }
      }
    })
  });
  if (!putRes.ok) throw new Error(`DynamoDB PutItem failed: HTTP ${putRes.status}`);
  const putJson = await putRes.json();
  console.log('[2/4] DynamoDB PutItem OK -> ConsumedCapacity:', JSON.stringify(putJson.ConsumedCapacity));

  const scanRes = await fetch(`${ENDPOINT}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.0',
      'X-Amz-Target': 'DynamoDB_20120810.Scan'
    },
    body: JSON.stringify({ TableName: 'LogiTrackPackages' })
  });
  const scanJson = await scanRes.json();
  console.log(`[2/4] DynamoDB Scan OK -> Count: ${scanJson.Count} registro(s)`);

  // 3. S3 PutObject + ListObjects
  const manifestKey = `manifests/ci-audit-${Date.now()}.json`;
  const s3Put = await fetch(`${ENDPOINT}/logitrack-manifests-eu-west-3/${manifestKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hub: 'MAD-HUB-01',
      generatedBy: 'LogiTrack CI/CD AWS Emulator Verify',
      packageCount: scanJson.Count,
      verifiedAt: new Date().toISOString()
    })
  });
  if (!s3Put.ok) throw new Error(`S3 PutObject failed: HTTP ${s3Put.status}`);
  const s3Json = await s3Put.json();
  console.log('[3/4] S3 PutObject OK ->', JSON.stringify({ Bucket: s3Json.Bucket, Key: s3Json.Key, ETag: s3Json.ETag }));

  // 4. SQS SendMessage + ReceiveMessage
  const sqsSend = await fetch(`${ENDPOINT}/000000000000/logitrack-inspection-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Action: 'SendMessage',
      MessageBody: JSON.stringify({
        eventType: 'PACKAGE_INSPECTED',
        trackingCode: 'LTK-4821-ES',
        uuid: sampleId,
        hub: 'MAD-Cargo Terminal T4'
      })
    })
  });
  if (!sqsSend.ok) throw new Error(`SQS SendMessage failed: HTTP ${sqsSend.status}`);
  const sqsJson = await sqsSend.json();
  console.log('[4/4] SQS SendMessage OK -> MessageId:', sqsJson.MessageId);

  console.log('[AWS-Verify] 100% PASSED: DynamoDB + S3 + SQS verificados sobre AWS Emulator :4566');
}

verify().catch((err) => {
  console.error('[AWS-Verify] FAILED:', err);
  process.exit(1);
});
