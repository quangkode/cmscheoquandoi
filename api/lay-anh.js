/* ==========================================================
   GET /api/lay-anh?url=...

   Tải hộ một tấm ảnh của báo rồi trả nguyên byte về cho trình duyệt.
   Trình duyệt nhận xong sẽ đẩy thẳng lên Firebase Storage bằng quyền
   của người quản trị đang đăng nhập.

   Vì sao phải mang ảnh về kho của mình thay vì trỏ thẳng sang báo:
   trỏ thẳng thì ảnh sống chết theo máy chủ người ta. Họ đổi đường dẫn,
   chặn tải chéo, hay hết hạn chứng chỉ — như i.postimg.cc vừa làm hỏng
   logo cả hai trang hôm 10/9 — là ảnh trên web Nhà hát vỡ theo, mà mình
   không làm gì được.

   Chặn đúng 5 MB cho khớp giới hạn trong storage.rules. Vượt mức thì
   Firebase từ chối lúc đẩy lên, thà báo sớm ở đây còn hơn để người dùng
   chờ tải xong rồi mới thấy lỗi.
   ========================================================== */

const { tai, docCoHan } = require("./_chung");

const HAN_ANH = 5 * 1024 * 1024;
const KIEU_CHO_PHEP = /^image\/(jpeg|png|webp|gif|avif)$/i;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ loi: "Chỉ nhận phương thức GET." });
  }

  const dc = (req.query && req.query.url) || "";
  if (!dc) return res.status(400).json({ loi: "Thiếu tham số url." });

  try {
    /* Kho ảnh của báo lớn chặn tải chéo: thiếu Referer là trả 401/403.
       VnExpress chặn đúng như vậy. Gửi kèm Referer trỏ về trang bài — hoặc
       về chính tên miền chứa ảnh nếu không biết trang bài — thì máy chủ của
       họ coi như người đọc đang xem bài và cho tải bình thường. */
    let dauThem = {};
    try {
      const goc = new URL(String((req.query && req.query.tu) || dc));
      dauThem = { Referer: goc.href, Origin: goc.origin };
    } catch { /* không dựng được thì thôi, cứ tải trần */ }

    const { r } = await tai(dc, "image/*", dauThem);

    // Bắt buộc phải là ảnh thật. Thiếu chốt này thì đây thành chỗ tải hộ
    // mọi loại tệp, ai cũng mượn được băng thông và tên miền của Nhà hát.
    const kieu = (r.headers.get("content-type") || "").split(";")[0].trim();
    if (!KIEU_CHO_PHEP.test(kieu)) {
      return res.status(415).json({ loi: `Đường dẫn này không phải ảnh (${kieu || "không rõ kiểu"}).` });
    }

    const byte = await docCoHan(r, HAN_ANH);

    res.setHeader("Content-Type", kieu);
    res.setHeader("Content-Length", String(byte.length));
    return res.status(200).send(byte);
  } catch (e) {
    const t = e.message || "Không tải được ảnh.";
    return res.status(400).json({ loi: t.includes("quá nặng") ? "Ảnh nặng quá 5 MB, không đẩy lên được." : t });
  }
};
