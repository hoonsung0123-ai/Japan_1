# 일본어 단어 퀴즈

일본어 단어 퀴즈 웹사이트 + 연락하기(Resend 메일 전송)

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. Resend API 키 설정 (연락하기 기능용)

1. [Resend](https://resend.com) 가입 후 [API Keys](https://resend.com/api-keys)에서 API 키 발급
2. 프로젝트 폴더에 `.env` 파일 생성 후 아래 내용 추가

```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

(`.env.example`을 복사해 `.env`로 이름 변경 후 `RESEND_API_KEY` 값만 넣어도 됩니다.)

3. Resend 대시보드에서 **도메인 인증**을 하면 실제 메일 발송이 가능합니다.  
   인증 전에는 테스트용으로만 동작할 수 있습니다.

### 3. 서버 실행

```bash
npm start
```

브라우저에서 **http://localhost:3000** 으로 접속합니다.

- 퀴즈는 그대로 이용 가능합니다.
- **「일본인 친구를 만나고 싶으면 누르세요」** 버튼을 누르면 이름/전화번호/이메일 입력 폼이 뜹니다.
- 제출하면 `hoonsung0123@naver.com` 으로 Resend를 통해 메일이 전송됩니다.

## 연락하기만 쓰지 않고 퀴즈만 볼 때

`public/index.html`을 브라우저에서 직접 열면 퀴즈만 사용할 수 있습니다.  
연락하기 제출은 **서버를 띄운 뒤** `http://localhost:3000` 에서만 동작합니다.

## Vercel 배포

이 프로젝트는 Vercel에 배포할 수 있습니다. GitHub 저장소를 Vercel에 연결하면 자동 배포됩니다.

- **정적 파일**: `public/` 폴더 (index.html, style.css, script.js)
- **연락하기 API**: Vercel 프로젝트 설정 → Environment Variables에 `RESEND_API_KEY` 추가
