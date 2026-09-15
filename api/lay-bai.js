/* ==========================================================
   GET /api/lay-bai?url=...

   Tải một bài báo rồi rút ra đúng những trường mà mục Tin tức cần:
   tiêu đề, ngày đăng, tóm tắt, ảnh đại diện, tên báo, đường dẫn gốc.

   Chỉ lấy TÓM TẮT, cố ý không lấy toàn văn. Lược đồ Tin tức trong
   js/luoc-do.js vốn không có ô nào chứa nội dung đầy đủ — nó được
   thiết kế theo lối điểm báo: tiêu đề + vài câu + dẫn nguồn + liên kết
   về bài gốc. Chép nguyên bài của báo khác đăng lại là chuyện khác hẳn,
   cả về bản quyền lẫn về việc trang mình thành bản sao của báo người ta.

   Cách rút: đọc thẻ Open Graph. Báo nào cũng gắn đủ vì cần hiện đẹp khi
   chia sẻ lên Facebook, nên đây là chỗ đáng tin nhất, ổn định hơn nhiều
   so với dò theo cấu trúc HTML riêng của từng báo.
   ========================================================== */

const { tai, docCoHan } = require("./_chung");

const HAN_HTML = 3 * 1024 * 1024;

/* Gỡ thực thể HTML thường gặp. Không dùng thư viện cho một việc nhỏ thế này. */
function goEntity(s) {
  return String(s || "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (cả, m) => {
      if (m[0] === "#") {
        const ma = m[1] === "x" || m[1] === "X" ? parseInt(m.slice(2), 16) : parseInt(m.slice(1), 10);
        return Number.isFinite(ma) ? String.fromCodePoint(ma) : cả;
      }
      return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—" }[m.toLowerCase()] ?? cả;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/* Tìm một thẻ meta theo property hoặc name. Viết thành regex chứ không
   dựng cây DOM: chỉ cần vài thẻ trong phần <head>, không đáng kéo cả bộ
   phân tích HTML vào. Thuộc tính có thể xếp trước hoặc sau nội dung nên
   thử cả hai chiều. */
function meta(html, ten) {
  const t = ten.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mau = [
    new RegExp(`<meta[^>]+(?:property|name)\\s*=\\s*["']${t}["'][^>]*\\scontent\\s*=\\s*["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content\\s*=\\s*["']([^"']*)["'][^>]*\\s(?:property|name)\\s*=\\s*["']${t}["']`, "i")
  ];
  for (const m of mau) {
    const kq = html.match(m);
    if (kq && kq[1].trim()) return goEntity(kq[1]);
  }
  return "";
}

/* Ngày đăng về dạng YYYY-MM-DD cho khớp ô <input type="date"> của CMS. */
function chuanNgay(s) {
  if (!s) return "";
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  // Báo Việt hay ghi kiểu 25/08/2026 hoặc 25-08-2026
  const m = String(s).match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

/* Tên báo: ưu tiên og:site_name, không có thì lấy tên miền cho gọn. */
function tenBao(html, u) {
  const og = meta(html, "og:site_name");
  if (og) return og;
  return u.hostname.replace(/^www\./, "");
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ loi: "Chỉ nhận phương thức GET." });
  }

  const dc = (req.query && req.query.url) || "";
  if (!dc) return res.status(400).json({ loi: "Thiếu tham số url." });

  try {
    const { r, u } = await tai(dc, "text/html,application/xhtml+xml");

    const kieu = r.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml/i.test(kieu)) {
      return res.status(415).json({ loi: "Đường dẫn này không phải trang web (có thể là tệp tải về)." });
    }

    const html = (await docCoHan(r, HAN_HTML)).toString("utf8");

    const tieuDe = meta(html, "og:title") ||
                   goEntity((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);

    const tomTat = meta(html, "og:description") || meta(html, "description");

    let anh = meta(html, "og:image") || meta(html, "twitter:image");
    if (anh) { try { anh = new URL(anh, u.href).href; } catch { anh = ""; } }

    const ngay = chuanNgay(
      meta(html, "article:published_time") ||
      meta(html, "article:modified_time") ||
      meta(html, "pubdate") ||
      (html.match(/<time[^>]+datetime\s*=\s*["']([^"']+)["']/i) || [])[1]
    );

    return res.status(200).json({
      tieuDe,
      tomTat,
      anh,
      ngay,
      nguonTen: tenBao(html, u),
      nguonUrl: meta(html, "og:url") || u.href,
      // Để CMS nhắc người dùng ô nào máy không tự tìm ra
      thieu: [
        !tieuDe && "tiêu đề",
        !tomTat && "tóm tắt",
        !anh && "ảnh",
        !ngay && "ngày đăng"
      ].filter(Boolean)
    });
  } catch (e) {
    return res.status(400).json({ loi: e.message || "Không lấy được bài." });
  }
};
