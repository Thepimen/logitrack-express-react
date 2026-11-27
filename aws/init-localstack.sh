#!/usr/bin/env bash
# ==============================================================================
# Bootstrap IaC del AWS Emulator (LocalStack v3.8 · Puerto 4566 · eu-west-3)
# Aprovisiona automáticamente DynamoDB, S3 y SQS para LogiTrack Express v3.0
# ==============================================================================
set -euo pipefail

export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-eu-west-3}"

echo "[LogiTrack::LocalStack] Inicializando servicios AWS emulados en región ${AWS_DEFAULT_REGION}..."

# 1. Tabla Amazon DynamoDB para replicación NoSQL de baja latencia de paquetes en cinta
awslocal dynamodb create-table \
  --table-name LogiTrackPackages \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=trackingCode,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"TrackingCodeIndex","KeySchema":[{"AttributeName":"trackingCode","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region "${AWS_DEFAULT_REGION}" || true

# 2. Bucket Amazon S3 para archivado inmutable de manifiestos JSON de inspección
awslocal s3 mb s3://logitrack-manifests-eu-west-3 --region "${AWS_DEFAULT_REGION}" || true

# 3. Cola Amazon SQS para bus de eventos asíncronos de clasificación en cinta
awslocal sqs create-queue \
  --queue-name logitrack-inspection-events \
  --region "${AWS_DEFAULT_REGION}" || true

echo "[LogiTrack::LocalStack] Provisionamiento completado: DynamoDB (LogiTrackPackages), S3 (logitrack-manifests-eu-west-3) y SQS (logitrack-inspection-events)."
