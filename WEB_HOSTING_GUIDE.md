# AI WBS Tool 웹 호스팅 배포 가이드

## 🌐 주요 웹 호스팅 서비스별 배포 방법

### 📊 플랫폼 비교표

| 플랫폼 | 무료 계층 | 비용 | 설정 난이도 | 추천 대상 |
|--------|---------|------|----------|---------|
| **Heroku** | ❌ | $5-50/월 | ⭐⭐ (쉬움) | 빠른 배포 필요 |
| **Railway** | ✅ (제한) | $5-100/월 | ⭐⭐ (쉬움) | 스타트업 |
| **Render** | ✅ (제한) | $7-150/월 | ⭐⭐ (쉬움) | 소규모 프로젝트 |
| **AWS** | ✅ (1년) | 가변 | ⭐⭐⭐ (어려움) | 대규모 프로젝트 |
| **Azure** | ✅ (1년) | 가변 | ⭐⭐⭐ (어려움) | 엔터프라이즈 |
| **Google Cloud** | ✅ (300$) | 가변 | ⭐⭐⭐ (어려움) | 고성능 필요 |
| **Vercel** | ✅ | $20/월 | ⭐ (매우 쉬움) | 정적/SSR 사이트 |
| **Netlify** | ✅ | $19/월 | ⭐ (매우 쉬움) | 정적 사이트 |

---

## 1️⃣ Heroku (클래식, 권장)

### 장점
- ✅ 가장 간단한 배포
- ✅ Git 연동으로 자동 배포
- ✅ 환경변수 관리 편함
- ✅ Node.js 기본 지원

### 단점
- ❌ 무료 계층 폐지 (2022년)
- ❌ 최소 $5/월 필요
- ❌ 사용량 기반 비용 증가 가능

### 배포 단계

#### 1단계: Heroku CLI 설치
```bash
# Windows
choco install heroku-cli

# 또는 직접 설치
# https://devcenter.heroku.com/articles/heroku-cli
```

#### 2단계: Heroku 로그인
```bash
heroku login
```

#### 3단계: Procfile 생성
프로젝트 루트에 `Procfile` 파일 생성:
```
web: npm start
```

#### 4단계: 헤로쿠 앱 생성
```bash
heroku create your-app-name
```

#### 5단계: 환경변수 설정
```bash
heroku config:set NODE_ENV=production
heroku config:set PUBLIC_HOST=your-app-name.herokuapp.com
```

#### 6단계: 배포
```bash
git push heroku main
```

#### 7단계: 로그 확인
```bash
heroku logs --tail
```

#### 앱 열기
```bash
heroku open
```

### Heroku 배포 확인
```bash
heroku apps          # 배포된 앱 목록
heroku ps:scale web=1  # 웹 다이노 스케일 (유료)
```

---

## 2️⃣ Railway (권장, 무료 제한)

### 장점
- ✅ 무료 계층 제공 ($5 크레딧/월)
- ✅ 매우 간단한 배포
- ✅ GitHub 자동 연동
- ✅ 환경변수 UI 제공
- ✅ 데이터베이스 포함 가능

### 단점
- ⚠️ 무료 크레딧 초과 시 유료
- ⚠️ 소규모 프로젝트용

### 배포 단계

#### 1단계: Railway 가입
https://railway.app 에서 GitHub로 가입

#### 2단계: 프로젝트 생성
1. Dashboard에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. AI_WBS_tool 저장소 선택

#### 3단계: 환경변수 설정
Railway Dashboard에서:
```
PORT = 5173
HOST = 0.0.0.0
PUBLIC_HOST = your-project.up.railway.app
NODE_ENV = production
```

#### 4단계: 자동 배포
- GitHub에 푸시하면 자동 배포

#### 5단계: 도메인 연결
- Custom Domain 탭에서 커스텀 도메인 설정

### Railway 배포 모니터링
```
Dashboard → Logs에서 실시간 로그 확인
```

---

## 3️⃣ Render (권장, 무료 제한)

### 장점
- ✅ 무료 계층 제공 (제한적)
- ✅ 간단한 배포
- ✅ GitHub 자동 동기화
- ✅ 무료 SSL 인증서
- ✅ 깔끔한 인터페이스

### 단점
- ⚠️ 무료 서비스는 15분 유휴 후 자동 종료
- ⚠️ 구성 옵션이 적음

### 배포 단계

#### 1단계: Render 가입
https://render.com 에서 GitHub로 가입

#### 2단계: 새 Web Service 생성
1. Dashboard → "New +" → "Web Service"
2. GitHub 저장소 연결 (AI_WBS_tool)
3. Repository 선택

#### 3단계: 배포 설정
- **Name**: ai-wbs-tool
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free 또는 Paid

#### 4단계: 환경변수 설정
```
PORT=5173
HOST=0.0.0.0
PUBLIC_HOST=ai-wbs-tool.onrender.com
NODE_ENV=production
```

#### 5단계: 배포 시작
"Create Web Service" 클릭하면 자동 배포 시작

### 자동 재배포 활성화
- Environment 탭 → Auto-Deploy on Push 활성화

---

## 4️⃣ AWS Elastic Beanstalk (확장성)

### 장점
- ✅ 강력한 확장성
- ✅ 다양한 서비스 통합 가능
- ✅ 1년 무료 계층 제공 (t2.micro)
- ✅ 엔터프라이즈급 기능

### 단점
- ❌ 설정이 복잡함
- ❌ 초기 학습곡선이 높음
- ❌ 과다 사용 시 비용 급증 가능

### 배포 단계

#### 1단계: AWS 계정 생성
https://aws.amazon.com

#### 2단계: EB CLI 설치
```bash
pip install awsebcli
```

#### 3단계: 초기화
```bash
eb init -p node.js-18 ai-wbs-tool --region us-east-1
```

#### 4단계: 환경 생성 및 배포
```bash
eb create ai-wbs-tool-env
eb setenv NODE_ENV=production PUBLIC_HOST=ai-wbs-tool.elasticbeanstalk.com
eb deploy
```

#### 5단계: 상태 확인
```bash
eb status
eb logs
```

#### 6단계: 브라우저에서 열기
```bash
eb open
```

### .ebextensions 설정 (선택사항)

프로젝트 루트에 `.ebextensions/nodejs.config` 생성:
```yaml
option_settings:
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 80
```

---

## 5️⃣ Azure App Service (엔터프라이즈)

### 장점
- ✅ 엔터프라이즈급 기능
- ✅ Microsoft 생태계 연동
- ✅ 1년 무료 계층
- ✅ 자동 SSL/TLS

### 단점
- ❌ 설정이 복잡
- ❌ UI가 복잡함

### 배포 단계

#### 1단계: Azure 계정 생성
https://azure.microsoft.com/free

#### 2단계: Azure CLI 설치
```bash
# Windows
choco install azure-cli

# https://aka.ms/installazurecliwindows
```

#### 3단계: 로그인
```bash
az login
```

#### 4단계: 리소스 그룹 생성
```bash
az group create --name ai-wbs-rg --location eastus
```

#### 5단계: App Service 플랜 생성
```bash
az appservice plan create --name ai-wbs-plan --resource-group ai-wbs-rg --sku B1 --is-linux
```

#### 6단계: 웹 앱 생성
```bash
az webapp create --resource-group ai-wbs-rg --plan ai-wbs-plan --name ai-wbs-tool --runtime "node|18"
```

#### 7단계: 코드 배포
```bash
# ZIP 파일로 배포
zip -r app.zip . -x "node_modules/*" ".git/*"
az webapp deployment source config-zip --resource-group ai-wbs-rg --name ai-wbs-tool --src app.zip

# 또는 Git 배포
az webapp deployment user set --user-name <username> --password <password>
git remote add azure https://<username>@ai-wbs-tool.scm.azurewebsites.net/ai-wbs-tool.git
git push azure main
```

#### 8단계: 환경변수 설정
```bash
az webapp config appsettings set --resource-group ai-wbs-rg --name ai-wbs-tool \
  --settings NODE_ENV=production PUBLIC_HOST=ai-wbs-tool.azurewebsites.net
```

---

## 6️⃣ Google Cloud Run (서버리스, 권장)

### 장점
- ✅ 사용 기반 요금 (저렴함)
- ✅ 자동 스케일링
- ✅ Docker 네이티브
- ✅ $300 무료 크레딧

### 단점
- ❌ 콜드 스타트 지연 가능
- ❌ 장시간 연결 유지 어려움

### 배포 단계

#### 1단계: Google Cloud 프로젝트 생성
https://console.cloud.google.com

#### 2단계: Cloud SDK 설치
https://cloud.google.com/sdk/docs/install

#### 3단계: 로그인
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### 4단계: Artifact Registry 활성화
```bash
gcloud services enable artifactregistry.googleapis.com run.googleapis.com
```

#### 5단계: 이미지 빌드 및 푸시
```bash
# Docker 이미지 빌드
docker build -t gcr.io/YOUR_PROJECT_ID/ai-wbs-tool:latest .

# Google Cloud에 푸시
docker push gcr.io/YOUR_PROJECT_ID/ai-wbs-tool:latest
```

#### 6단계: Cloud Run 배포
```bash
gcloud run deploy ai-wbs-tool \
  --image gcr.io/YOUR_PROJECT_ID/ai-wbs-tool:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PUBLIC_HOST=ai-wbs-tool-xxxxx.a.run.app
```

---

## 7️⃣ DigitalOcean App Platform (추천)

### 장점
- ✅ 간단한 배포
- ✅ 합리적인 가격 ($5-12/월)
- ✅ GitHub 자동 동기화
- ✅ 한국 사용자 많음

### 단점
- ⚠️ 무료 계층 없음

### 배포 단계

#### 1단계: DigitalOcean 가입
https://www.digitalocean.com

#### 2단계: App Platform 선택
Dashboard → "Create" → "Apps"

#### 3단계: GitHub 연결
- GitHub 계정 연결
- AI_WBS_tool 저장소 선택

#### 4단계: 배포 설정
- **Name**: ai-wbs-tool
- **Source**: GitHub
- **Build Command**: `npm install && npm run build`
- **Run Command**: `npm start`

#### 5단계: 환경변수 설정
```
PORT=8080
NODE_ENV=production
PUBLIC_HOST=ai-wbs-tool-xxxxx.ondigitalocean.app
```

#### 6단계: 배포
"Deploy" 클릭

---

## 🔗 커스텀 도메인 연결

### 모든 플랫폼에서 도메인 연결 방법

#### 1단계: 도메인 구매
- Namecheap, GoDaddy, Route 53 등에서 구매

#### 2단계: DNS 설정
플랫폼별로:
- **Heroku**: `*.herokuapp.com`으로 CNAME 설정
- **Railway**: `*.up.railway.app`으로 CNAME 설정
- **Render**: `*.onrender.com`으로 CNAME 설정
- **AWS**: Route 53에서 CNAME 또는 Alias 설정
- **Azure**: Traffic Manager 또는 CNAME 설정

#### 3단계: 플랫폼에서 도메인 추가
각 플랫폼의 "Custom Domain" 또는 "Domain Settings"에서 도메인 추가

#### 4단계: SSL/TLS 인증서 자동 활성화
대부분의 플랫폼이 Let's Encrypt로 자동 설정

### 예시: Namecheap에서 CNAME 설정
```
Host: www
Value: ai-wbs-tool.up.railway.app
TTL: 30 min (또는 자동)
```

---

## 💰 비용 추정 (월)

### 무료/저비용 옵션
```
Railway        $5 크레딧/월 (제한적)
Render         무료 (15분 유휴 후 중단)
AWS EC2        $0-5 (1년 무료 후)
Google Cloud   $0-5 ($300 크레딧)
```

### 소규모 프로젝트 ($5-20/월)
```
Heroku         $5-50/월
DigitalOcean   $5-12/월
Railway        $10-50/월
Render         $7+/월
```

### 중규모 프로젝트 ($20-100/월)
```
AWS Elastic Beanstalk   $20-50/월
Azure App Service       $15-100/월
DigitalOcean Droplet    $12-24/월
Google Cloud Run        ~$10-50/월
```

---

## 📋 배포 방식 선택 가이드

### 🎯 추천 조합

**빠르고 간단하게**: Railway + 커스텀 도메인
```bash
# 5분 안에 배포 완료
```

**무료/저비용**: Render 무료 + 업그레이드 필요시
```bash
# 아이디어 검증용
# 트래픽 증가시 유료로 전환
```

**확장성 필요**: AWS Elastic Beanstalk
```bash
# 장기 운영용
# 대규모 트래픽 대응
```

**간편한 관리**: DigitalOcean App Platform
```bash
# 한국 사용자 친화적
# 합리적 가격
```

---

## 🚀 빠른 배포 비교

| 작업 | Railway | Render | Heroku |
|------|---------|--------|--------|
| 가입부터 배포까지 | 5분 | 10분 | 15분 |
| GitHub 자동 동기화 | ✅ | ✅ | ✅ |
| 환경변수 관리 | UI | UI | CLI/UI |
| 도메인 연결 | ✅ | ✅ | ✅ |
| 모니터링 | 기본 | 기본 | 상세 |

---

## 🔐 배포 전 보안 체크

```bash
# 1. 환경변수 확인
grep -r "password\|secret\|key\|token" . --include="*.js" --exclude-dir=node_modules

# 2. 의존성 보안 감사
npm audit

# 3. .gitignore 확인
cat .gitignore | grep -E "\.env|node_modules"

# 4. 배포 설정 보안
# .env 파일이 리포지토리에 포함되지 않았는지 확인
git ls-files | grep .env
```

---

## 📞 배포 후 모니터링

### 로그 확인
```bash
# Railway
railway logs

# Render
# Dashboard → Logs

# Heroku
heroku logs --tail

# AWS EB
eb logs

# Google Cloud Run
gcloud run services describe ai-wbs-tool --region us-central1 --format json
```

### 성능 확인
- 응답 시간 < 1초
- CPU 사용률 < 50%
- 메모리 사용률 < 70%
- 에러율 < 1%

---

## ⚠️ 트러블슈팅

### 배포 후 앱이 실행되지 않음
```bash
# 로그 확인
# → 빌드 오류: npm install 실패 확인
# → 런타임 오류: server.js 오류 확인

# 확인 항목:
# 1. PORT 환경변수 설정 확인
# 2. package.json start script 확인
# 3. 노드 버전 호환성 확인
```

### 포트 에러
```bash
# 플랫폼이 할당한 포트 사용 확인
# server.js에서:
const PORT = process.env.PORT || 5173;
```

### 메모리 부족
```bash
# 스케일 업
# Railway/Render/Heroku의 유료 플랜으로 전환
```

### CORS 에러
```bash
# server.js에서 CORS 설정 확인
res.setHeader('Access-Control-Allow-Origin', '*');
```

---

## 📚 추가 리소스

- [Heroku Node.js 가이드](https://devcenter.heroku.com/articles/nodejs-support)
- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk)
- [Azure App Service](https://docs.microsoft.com/azure/app-service)
- [Google Cloud Run](https://cloud.google.com/run/docs)

---

## 🎯 다음 단계

1. **선택**: 위의 플랫폼 중 하나 선택
2. **가입**: 플랫폼에 회원 가입 (GitHub 계정 사용 권장)
3. **배포**: 해당 플랫폼의 배포 단계 따라하기
4. **테스트**: 배포된 URL에서 기능 테스트
5. **모니터링**: 정기적으로 로그 및 성능 확인

**특별히 추천**: Railway 또는 Render (무료/저비용 + 간편함)
