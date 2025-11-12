# 도메인 설정 완벽 가이드

## 📌 전체 흐름도

```
도메인 구매 → DNS 설정 → 플랫폼 연결 → SSL/TLS → 최종 확인
   ↓           ↓          ↓           ↓         ↓
  1~2시간    5분~       5분         자동      완료
```

---

## 1️⃣ 도메인 구매

### 도메인 구매처 비교

| 서비스 | 가격 | 한국 | 추천 |
|--------|------|------|------|
| **Namecheap** | $0.99-12.98/년 | ⭐⭐⭐ | ⭐⭐⭐ |
| **GoDaddy** | $1.99-15.95/년 | ⭐⭐ | ⭐⭐ |
| **AWS Route 53** | $12/년 | ⭐⭐⭐ | ⭐⭐ |
| **Cloudflare** | 무료-200/년 | ⭐⭐⭐ | ⭐⭐⭐ |
| **국내 호스팅** | 10,000-15,000원 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### 1단계: 도메인 이름 결정

**좋은 도메인 이름의 조건**:
- ✅ 짧고 기억하기 쉬움 (3-15자)
- ✅ 알파벳, 숫자, 하이픈만 사용
- ✅ 하이픈으로 시작/끝나지 않음
- ✅ 상표권 확인

**예시**:
- ❌ `my-very-long-and-complicated-domain-name.com` (너무 길음)
- ✅ `wbs-tool.com` (적당함)
- ✅ `ai-wbs.io` (짧고 기억하기 쉬움)

### 2단계: 도메인 검색 및 가용성 확인

#### Namecheap에서:
1. https://www.namecheap.com 접속
2. 도메인 검색창에 `yourname.com` 입력
3. "Search" 클릭
4. 가능한 도메인 확인

```
✅ 초록색 = 사용 가능
🔴 빨간색 = 이미 등록됨
```

#### 무료 서비스로 확인:
```bash
whois yourname.com
nslookup yourname.com
```

### 3단계: 도메인 구매

**Namecheap 예시**:

1. 원하는 도메인 선택
2. "ADD TO CART" 클릭
3. 장바구니 → "CHECKOUT"
4. 계정 생성 또는 로그인
5. 결제 정보 입력
6. 완료!

**주의사항**:
- 자동 갱신 설정 확인 (연간 갱신료)
- Privacy 보호 옵션 (개인정보 보호, 추가 비용)
- 에스크로 서비스 (분쟁 중재)

---

## 2️⃣ DNS 설정

### DNS란?

Domain Name System의 약자로, 도메인 이름을 IP 주소로 변환하는 시스템입니다.

```
사용자 입력:  https://yourname.com
    ↓
DNS 조회:     yourname.com → 12.34.56.78
    ↓
서버 접속:    12.34.56.78로 접속
```

### DNS 레코드 종류

| 레코드 | 용도 | 예시 |
|--------|------|------|
| **A** | IPv4 주소 | `12.34.56.78` |
| **AAAA** | IPv6 주소 | `2001:0db8::1` |
| **CNAME** | 다른 도메인으로 리다이렉트 | `railway.app` |
| **MX** | 메일 서버 | `mail.yourname.com` |
| **TXT** | 텍스트 정보 (SPF, DKIM 등) | `v=spf1 ...` |
| **NS** | 네임서버 | `ns1.namecheap.com` |

### 🎯 호스팅 플랫폼별 DNS 설정

#### **Railway 플랫폼 사용 시**

1. **Railway에서 도메인 추가**:
   - Dashboard → 프로젝트 선택
   - "Settings" → "Domains" 탭
   - "Add Custom Domain" 클릭
   - 도메인 입력 (예: `yourname.com`)

2. **Railway가 제공하는 정보 확인**:
   ```
   Type: CNAME
   Name: yourname.com 또는 www.yourname.com
   Value: yourname-xxxxx.up.railway.app
   TTL: 300 (또는 자동)
   ```

3. **Namecheap DNS 설정**:
   - Namecheap 로그인
   - "Domain List" 클릭
   - 도메인 옆의 "Manage" 클릭
   - "Advanced DNS" 탭
   
   **A. www 서브도메인 설정**:
   ```
   Host:  www
   Type:  CNAME
   Value: yourname-xxxxx.up.railway.app
   TTL:   300
   ```
   
   **B. Root 도메인 설정** (yourname.com):
   ```
   Host:  @
   Type:  A (또는 CNAME, 서비스에 따라)
   Value: Railway에서 제공하는 IP 또는 CNAME
   TTL:   300
   ```

4. **DNS 전파 확인** (5-48시간 소요):
   ```bash
   nslookup yourname.com
   dig yourname.com
   ```

---

#### **Render 플랫폼 사용 시**

1. **Render에서 도메인 추가**:
   - Dashboard → 서비스 선택
   - "Settings" 탭
   - "Custom Domains" 섹션
   - 도메인 입력

2. **Render가 제공하는 정보**:
   ```
   Type: CNAME
   Name: yourname.com (또는 www.yourname.com)
   Value: onrender.com
   TTL: 3600
   ```

3. **DNS 설정** (Namecheap):
   ```
   Host:  www
   Type:  CNAME
   Value: [Render에서 제공하는 값]
   TTL:   3600
   ```

---

#### **AWS Elastic Beanstalk 사용 시**

1. **Elastic Beanstalk 환경 URL 확인**:
   ```
   ai-wbs-tool-env.elasticbeanstalk.com
   ```

2. **Route 53에서 설정** (AWS를 사용하는 경우):
   ```bash
   aws route53 create-resource-record-set \
     --hosted-zone-id ZONE_ID \
     --change-batch '{
       "Changes": [{
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "yourname.com",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [{"Value": "ai-wbs-tool-env.elasticbeanstalk.com"}]
         }
       }]
     }'
   ```

3. **외부 DNS 사용 시** (Namecheap):
   ```
   Host:  @
   Type:  CNAME
   Value: ai-wbs-tool-env.elasticbeanstalk.com
   TTL:   300
   ```

---

#### **Heroku 사용 시**

1. **Heroku 도메인 추가**:
   ```bash
   heroku domains:add www.yourname.com
   heroku domains:add yourname.com
   ```

2. **Heroku가 제공하는 정보**:
   ```
   Type: CNAME
   Host: www.yourname.com
   Value: ai-wbs-tool.herokuapp.com
   TTL: 300
   ```

3. **Root 도메인 설정** (yourname.com → www.yourname.com):
   ```
   Host:  @
   Type:  CNAME (지원하지 않으면 A 레코드 사용)
   Value: ai-wbs-tool.herokuapp.com
   TTL:   300
   ```

   **CNAME 레코드 불가능하면**:
   ```
   Host:  @
   Type:  A
   Value: 34.198.221.32 (Heroku IP)
   ```

---

### DNS 설정 단계별 실행 (Namecheap 기준)

```
1. Namecheap 로그인
   ↓
2. "Domain List" → "Manage" 클릭
   ↓
3. "Advanced DNS" 탭
   ↓
4. 기존 레코드 삭제 또는 수정
   ↓
5. 새로운 CNAME 레코드 추가
   ├─ Host: www
   ├─ Type: CNAME
   ├─ Value: [플랫폼에서 제공]
   └─ TTL: 300 ~ 3600
   ↓
6. "Save Changes"
   ↓
7. DNS 전파 대기 (5분 ~ 48시간)
   ↓
8. 브라우저에서 확인
```

### DNS 전파 확인

#### Windows에서:
```powershell
# 기본 확인
nslookup yourname.com

# 특정 DNS 서버에서 확인
nslookup yourname.com 8.8.8.8

# 상세 정보
Resolve-DnsName yourname.com
```

#### 온라인 도구:
- [MXToolbox DNS Checker](https://mxtoolbox.com/dnscheck)
- [whatsmydns.net](https://whatsmydns.net)

```
DNS 전파 확인 예시:
✅ 초록색 = 반영됨
🟡 노란색 = 반영 중
⚠️ 빨간색 = 미반영
```

---

## 3️⃣ www vs @(root) 도메인

### 차이점

| 항목 | www | @ (Root) |
|------|-----|----------|
| **URL** | `www.yourname.com` | `yourname.com` |
| **CNAME** | 가능 | 불가능 (일반적) |
| **A 레코드** | 가능 | 가능 |
| **성능** | 같음 | 같음 |

### 권장 설정

**Option 1: www만 사용** (권장)
```
www.yourname.com → CNAME → 플랫폼
yourname.com → 리다이렉트 → www.yourname.com
```

**Option 2: www 없이 사용**
```
yourname.com → A 레코드 → IP 주소
```

**Option 3: 둘 다 지원**
```
yourname.com → A 레코드 → IP 주소
www.yourname.com → CNAME → yourname.com
```

### Namecheap에서 설정

#### www 서브도메인:
```
Host:  www
Type:  CNAME
Value: railway.app
TTL:   300
```

#### Root 도메인 (@):
```
Host:  @
Type:  A 또는 CNAME (플랫폼에 따라)
Value: IP 주소 또는 CNAME 값
TTL:   300
```

---

## 4️⃣ SSL/TLS 인증서

### SSL/TLS란?

HTTPS 프로토콜을 사용하기 위한 보안 인증서입니다.

```
HTTP  = 암호화 없음 (위험) 🔓
HTTPS = 암호화됨 (안전)   🔒
```

### 대부분의 플랫폼에서 자동 처리

- ✅ **Railway**: 자동 적용
- ✅ **Render**: 자동 적용
- ✅ **Heroku**: 자동 적용
- ✅ **AWS**: Let's Encrypt 자동
- ✅ **Azure**: 자동 적용
- ✅ **Google Cloud Run**: 자동 적용

### 수동 인증서 설정 (필요시)

#### Let's Encrypt 무료 인증서:
```bash
# Certbot 설치
pip install certbot

# 인증서 발급
certbot certonly --standalone -d yourname.com -d www.yourname.com

# 인증서 위치
# /etc/letsencrypt/live/yourname.com/
```

#### 인증서 자동 갱신:
```bash
certbot renew --auto
# 또는 cron job으로 자동화
```

---

## 5️⃣ HTTP → HTTPS 리다이렉트

### 자동 리다이렉트

대부분의 플랫폼이 자동으로 처리합니다.

**수동 설정** (server.js):
```javascript
// HTTP 요청을 HTTPS로 리다이렉트
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 6️⃣ 도메인 연결 확인

### 체크리스트

- [ ] 도메인 구매 완료
- [ ] DNS 레코드 추가 완료
- [ ] 플랫폼에서 도메인 설정 완료
- [ ] DNS 전파 확인됨 (5분~48시간)
- [ ] HTTPS 인증서 적용됨
- [ ] 브라우저에서 접속 가능

### 최종 확인 명령어

```bash
# DNS 확인
nslookup yourname.com
Resolve-DnsName yourname.com

# 웹 서버 응답 확인
curl -I https://yourname.com

# SSL 인증서 확인
curl -I --insecure https://yourname.com

# Ping 테스트
ping yourname.com
```

### 브라우저에서 확인

1. 주소창에 `yourname.com` 입력
2. 자동으로 `https://yourname.com`으로 리다이렉트됨
3. 🔒 잠금 아이콘 표시됨 (HTTPS)
4. 웹사이트 정상 로드됨

---

## 7️⃣ 플랫폼별 도메인 연결 설정 요약

### Railway
```
1. Dashboard → Settings → Domains
2. "Add Custom Domain" 클릭
3. yourname.com 입력
4. CNAME 정보 확인
5. DNS 설정
```

### Render
```
1. Dashboard → 서비스 → Settings
2. "Custom Domains" 입력
3. DNS 설정
4. 자동 HTTPS 적용
```

### Heroku
```bash
heroku domains:add www.yourname.com
heroku domains:add yourname.com
# DNS에서 CNAME 설정
```

### AWS Elastic Beanstalk
```
1. Route 53에서 호스팅 영역 생성
2. CNAME 또는 A 레코드 추가
3. 또는 외부 DNS에서 설정
```

### Azure App Service
```
1. Custom Domains 메뉴
2. 도메인 추가
3. DNS 설정 지침 따르기
```

---

## ⚠️ 문제 해결

### DNS가 반영되지 않음 (48시간 초과)

```bash
# 1. DNS 서버 확인
nslookup -type=NS yourname.com

# 2. 특정 DNS에서 조회
nslookup yourname.com 8.8.8.8 (Google DNS)
nslookup yourname.com 1.1.1.1 (Cloudflare DNS)

# 3. 레코드 타입 확인
nslookup -type=CNAME www.yourname.com

# 4. DNS 캐시 초기화 (Windows)
ipconfig /flushdns

# 5. 레코드 값 다시 확인
# Namecheap에서 설정한 값이 정확한지 확인
```

### HTTPS 인증서 오류

```
증상: ERR_CERT_AUTHORITY_INVALID
원인: SSL 인증서가 도메인과 일치하지 않음

해결:
1. DNS 설정이 올바른지 확인
2. 플랫폼에서 인증서 발급 대기 (최대 30분)
3. 캐시 초기화 후 재시도
```

### 도메인은 작동하지만 플랫폼 기본 도메인은 작동 안 함

```
원인: DNS 리다이렉트로 인해 원래 도메인 비활성화됨

해결:
원래 도메인 (railway.app, onrender.com 등)으로 
접속할 필요 없음
```

---

## 💡 팁 및 모범 사례

### 도메인 자동 갱신 설정
- Namecheap에서 "Auto Renew" 활성화
- 만료 전 30일 자동 갱신

### 도메인 보호
- WHOIS Privacy 활성화 (개인정보 보호)
- 스팸 차단

### 여러 도메인 관리
```
1단계: 주도메인 설정 (yourname.com)
2단계: 별칭 도메인 추가 (yourname.net, yourname.io 등)
3단계: 모두 같은 호스팅으로 리다이렉트
```

### 이메일도 함께 설정하려면

```
1. 도메인 호스팅 + 이메일 서비스 선택
   예: Namecheap + Google Workspace
   
2. DNS에 MX 레코드 추가:
   Host:  @
   Type:  MX
   Value: aspmx.l.google.com (또는 서비스 제공자)
   
3. SPF/DKIM 레코드 추가 (스팸 방지)
```

---

## 📋 설정 체크리스트

### 도메인 구매
- [ ] 도메인 이름 결정
- [ ] 가용성 확인
- [ ] 도메인 구매 완료
- [ ] 자동 갱신 설정
- [ ] WHOIS Privacy 설정 (선택)

### DNS 설정
- [ ] 플랫폼에서 CNAME/IP 정보 확인
- [ ] Namecheap 로그인
- [ ] Advanced DNS 탭 접속
- [ ] CNAME 또는 A 레코드 추가
- [ ] www 서브도메인 설정
- [ ] Root 도메인 설정

### 플랫폼 설정
- [ ] 플랫폼에서 도메인 추가
- [ ] SSL 인증서 적용 확인

### 최종 확인
- [ ] DNS 전파 확인 (nslookup)
- [ ] HTTPS 접속 가능 확인
- [ ] 🔒 잠금 아이콘 표시
- [ ] 웹사이트 정상 로드

---

## 🎯 전체 설정 예시

### Namecheap + Railway 조합 (가장 추천)

```
Step 1: Namecheap에서 yourname.com 구매 ($9.98/년)

Step 2: Railway에서 도메인 추가
→ Dashboard → Settings → Domains
→ "Add Custom Domain": yourname.com
→ CNAME 정보 확인: yourname-xxxxx.up.railway.app

Step 3: Namecheap DNS 설정
→ Domain List → Manage → Advanced DNS
→ 추가 레코드:
   Host:  www
   Type:  CNAME
   Value: yourname-xxxxx.up.railway.app
   TTL:   300

Step 4: DNS 전파 대기 (5-30분)
→ 확인: nslookup yourname.com

Step 5: https://yourname.com 접속
→ 🔒 잠금 아이콘 확인
→ 완료!
```

### 비용
- 도메인: $9.98/년
- Railway 호스팅: $5-100/월 (사용량)
- **합계**: $10-200/연

---

## 📞 자주 묻는 질문

**Q: 도메인 구매 후 얼마나 걸려야 작동하나?**
A: 구매 직후부터 DNS 설정은 바로 가능하며, DNS 전파는 5분~48시간 소요

**Q: 도메인을 변경할 수 있나?**
A: 변경 불가능. 새로운 도메인을 구매하고 DNS를 다시 설정해야 함

**Q: 서브도메인을 여러 개 만들 수 있나?**
A: 가능. DNS 레코드를 여러 개 추가하면 됨
```
api.yourname.com → API 서버
admin.yourname.com → 관리자 페이지
blog.yourname.com → 블로그
```

**Q: HTTPS 인증서는 직접 설정해야 하나?**
A: 대부분의 플랫폼이 자동으로 처리함 (Let's Encrypt)

---

## 다음 단계

1. ✅ 도메인 구매 (Namecheap)
2. ✅ 플랫폼 선택 (Railway 권장)
3. ✅ DNS 설정 (10분)
4. ✅ 도메인 연결 확인 (5-48시간)
5. ✅ HTTPS 확인 (자동)

**완료되면 `https://yourname.com`에서 AI WBS Tool 접속 가능!** 🎉
