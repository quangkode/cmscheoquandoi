/* ==========================================================
   GET /api/lay-bai-day-du?url=...
   HEADER: Authorization: Bearer <Firebase ID Token>

   Giống /api/lay-bai nhưng TRẢ CẢ HTML THÔ của trang báo để trình
   duyệt bóc toàn văn trong js/doc-bai.js. Chỉ quản trị viên đã đăng
   nhập mới gọi được — endpoint công khai /api/lay-bai không bao giờ
   trả HTML nữa, vá đường cho kẻ xấu mượn làm proxy scraping ẩn danh.

   Kiểm quyền: xác minh Firebase ID Token qua Firebase REST Identity
   Toolkit (không cần Firebase Admin SDK, giữ nguyên tinh thần "không
   cần npm, không cần build"), rồi tra UID có trong collection quan-tri.
   Cùng một chốt với luật Firestore phía client, nhưng đặt ở máy chủ
   để khoá đường gọi thẳng bằng curl.

   Biến môi trường cần có trên Vercel:
     FIREBASE_WEB_API_KEY  — apiKey của dự án Firebase (đã công khai
                             trong cau-hinh.js, copy sang Vercel Env)
     FIREBASE_PROJECT_ID   — projectId của dự án Firebase
   ========================================================== */

const { tai, docCoHan } = require("./_chung");

const HAN_HTML = 3 * 1024 * 1024;

/* Verify Firebase ID token qua REST Identity Toolkit, trả UID nếu hợp lệ.
   Rồi gọi Firestore REST đọc quan-tri/<uid> — có doc là admin. Hai lượt
   gọi Firebase thêm ~200ms/request, chấp nhận được cho việc admin dán
   link bài báo (vài lần một ngày). */
async function xacThucQuanTri(idToken) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("Máy chủ chưa đặt FIREBASE_WEB_API_KEY và FIREBASE_PROJECT_ID.");
  }

  const r1 = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  if (!r1.ok) return null;
  const kq = await r1.json();
  const uid = kq && kq.users && kq.users[0] && kq.users[0].localId;
  if (!uid) return null;

  const r2 = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/quan-tri/${uid}`,
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  return r2.ok ? uid : null;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ loi: "Chỉ nhận phương thức GET." });
  }

  const auth = req.headers.authorization || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ loi: "Thiếu Authorization: Bearer <idToken>." });

  let uid;
  try { uid = await xacThucQuanTri(m[1]); }
  catch (e) { return res.status(500).json({ loi: e.message }); }
  if (!uid) return res.status(401).json({ loi: "Phiên không hợp lệ hoặc không có quyền quản trị." });

  const dc = (req.query && req.query.url) || "";
  if (!dc) return res.status(400).json({ loi: "Thiếu tham số url." });

  try {
    const { r, u } = await tai(dc, "text/html,application/xhtml+xml");

    const kieu = r.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml/i.test(kieu)) {
      return res.status(415).json({ loi: "Đường dẫn này không phải trang web (có thể là tệp tải về)." });
    }

    const html = (await docCoHan(r, HAN_HTML)).toString("utf8");
    return res.status(200).json({ html, goc: u.href });
  } catch (e) {
    return res.status(400).json({ loi: e.message || "Không lấy được bài." });
  }
};
