require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "hoonsung0123@naver.com";

app.use(cors());
app.use(express.json());
// Vercel는 public/을 CDN으로 제공. 로컬에서는 express.static 사용
app.use(express.static(path.join(__dirname, "public")));

if (!RESEND_API_KEY) {
  console.warn("⚠ RESEND_API_KEY가 .env에 없습니다. 연락하기 API는 동작하지 않습니다.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

app.post("/api/contact", async (req, res) => {
  const { name, phone, email } = req.body || {};

  if (!name || !phone || !email) {
    return res.status(400).json({
      message: "이름, 전화번호, 이메일을 모두 입력해 주세요.",
    });
  }

  if (!resend) {
    return res.status(503).json({
      message: "메일 발송 설정이 되어 있지 않습니다. RESEND_API_KEY를 설정해 주세요.",
    });
  }

  const html = `
    <h2>일본어 퀴즈 사이트 - 연락하기 제출</h2>
    <p><strong>이름:</strong> ${escapeHtml(name)}</p>
    <p><strong>전화번호:</strong> ${escapeHtml(phone)}</p>
    <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
    <hr>
    <p style="color:#888;font-size:12px;">이 메일은 사이트의 "일본인 친구를 만나고 싶으면 누르세요" 폼에서 발송되었습니다.</p>
  `;

  try {
    // Resend: 발신 주소는 Resend 대시보드에서 인증한 도메인으로 변경 가능
    const { data, error } = await resend.emails.send({
      from: "Japanese Quiz <onboarding@resend.dev>",
      to: [TO_EMAIL],
      subject: `[일본어 퀴즈] 연락하기 - ${escapeHtml(name)}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        message: "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }

    res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Contact API error:", err);
    res.status(500).json({
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
});

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

// Vercel 서버리스에서는 listen 호출 안 함
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`서버: http://localhost:${PORT}`);
    console.log(`연락 메일 수신: ${TO_EMAIL}`);
  });
}

module.exports = app;
