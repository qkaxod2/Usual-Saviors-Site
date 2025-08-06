#!/bin/bash

# Usual Saviors Site - 안전한 업데이트 스크립트
echo "🚀 Usual Saviors Site 업데이트 시작..."

# 1. 데이터베이스 백업
echo "📦 데이터베이스 백업 중..."
BACKUP_DIR="/app/backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/worldbuilding_$(date +%Y%m%d_%H%M%S).db"
cp /app/worldbuilding.db "$BACKUP_FILE"
echo "✅ 백업 완료: $BACKUP_FILE"

# 2. Git에서 최신 코드 가져오기
echo "📥 최신 코드 다운로드 중..."
cd /app
git stash 2>/dev/null || true
git pull origin main

# 3. 의존성 업데이트
echo "📦 의존성 업데이트 중..."
npm install

# 4. 서버 재시작 (데이터베이스 삭제 없이)
echo "🔄 서버 재시작 중..."
pm2 restart usual-saviors

# 5. 상태 확인
echo "🔍 서버 상태 확인 중..."
sleep 3
pm2 status

echo "✅ 업데이트 완료!"
echo "📊 백업 파일: $BACKUP_FILE"
echo "🌐 사이트 접속: http://34.63.185.176:3000" 