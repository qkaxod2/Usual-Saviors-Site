#!/bin/bash

# Usual Saviors 배포 스크립트
echo "🚀 Usual Saviors 배포 시작..."

# 환경 변수 설정
PROJECT_ID="vibrant-abbey-464310-n2"
INSTANCE_NAME="usual-saviors-instance"
ZONE="us-central1-a"
MACHINE_TYPE="e2-micro"  # 무료 티어

# 1. Google Cloud 프로젝트 설정
echo "📋 Google Cloud 프로젝트 설정..."
gcloud config set project $PROJECT_ID

# 2. 필요한 API 활성화
echo "🔧 API 활성화..."
gcloud services enable compute.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Compute Engine 인스턴스 생성
echo "🖥️ Compute Engine 인스턴스 생성..."
gcloud compute instances create $INSTANCE_NAME \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --image-family=debian-11 \
    --image-project=debian-cloud \
    --boot-disk-size=10GB \
    --boot-disk-type=pd-standard \
    --tags=http-server,https-server \
    --metadata=startup-script='#! /bin/bash
        # Node.js 설치
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
        
        # Git 설치
        apt-get install -y git
        
        # 애플리케이션 디렉토리 생성
        mkdir -p /app
        cd /app
        
        # 애플리케이션 클론 (실제 저장소 URL로 변경 필요)
        git clone https://github.com/qkaxod2/Usual-Saviors-Site.git .
        
        # 의존성 설치
        cd server
        npm install
        
        # PM2 설치 및 애플리케이션 시작
        npm install -g pm2
        pm2 start server.js --name "usual-saviors"
        pm2 startup
        pm2 save'

# 4. 방화벽 규칙 생성
echo "🔥 방화벽 규칙 생성..."
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags=http-server \
    --description="Allow HTTP traffic"

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --target-tags=https-server \
    --description="Allow HTTPS traffic"

gcloud compute firewall-rules create allow-nodejs \
    --allow tcp:3000 \
    --target-tags=http-server \
    --description="Allow Node.js application traffic"

# 5. 인스턴스 IP 주소 출력
echo "🌐 인스턴스 정보:"
gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)"

echo "✅ 배포 완료!"
echo "📝 다음 단계:"
echo "1. 위의 IP 주소로 접속하여 애플리케이션 확인"
echo "2. 도메인 설정 (선택사항)"
echo "3. SSL 인증서 설정 (선택사항)" 