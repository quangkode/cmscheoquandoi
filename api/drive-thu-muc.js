/* ==========================================================
   GET /api/drive-thu-muc?id=<mã thư mục Google Drive>

   Liệt kê ảnh trong một thư mục Drive đã chia sẻ "Bất kỳ ai có đường
   liên kết", để hộp "Tải nhiều ảnh" của CMS dán MỘT link thư mục là
   ra cả loạt ảnh, khỏi chép link từng tấm.

   Không dùng Drive API (đòi bật API và khoá riêng trong Google Cloud).
   Thay vào đó đọc trang embeddedfolderview — trang Google dựng sẵn để
   nhúng thư mục công khai vào web khác — rồi nhặt mã từng tệp ra.
   Trình duyệt không tự đọc được trang này vì CORS, nên phải qua đây.

   Trả về { tep: [{ id, ten }], thuMucCon, boQua }:
     tep        ảnh (nhận theo đuôi tên tệp)
     thuMucCon  số thư mục con — không đọc lồng vào, chỉ báo cho biết
     boQua      số tệp không phải ảnh (video, pdf…)

   An toàn: tên miền cố định là drive.google.com, mã thư mục kiểm bằng
   regex chỉ gồm chữ, số, - và _, nên không ai mượn được hàm này để tải
   hộ địa chỉ khác (khác hẳn lay-anh.js phải chặn SSRF).
   ========================================================== */

const CHO_TOI_DA = 12000;
const HAN_BYTE = 4 * 1024 * 1024;
const DUOI_ANH = /\.(jpe?g|png|webp|gif|heic|heif|bmp|tiff?|avif)$/i;

const giaiMa = (s) => String(s || "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .trim();

/* Mỗi tệp trong trang là một khối class="flip-entry", bên trong có
   link /file/d/<id>/ (thư mục con thì /drive/folders/<id>) và tên tệp
   trong class="flip-entry-title". Không có khối nào thì lùi về nhặt mọi
   link /file/d/ trong trang — Google đổi giao diện thì vẫn còn đường. */
function docTrang(html) {
  const tep = [];
  let thuMucCon = 0, boQua = 0;
  const daCo = new Set();

  const khoi = html.split(/class="flip-entry"/).slice(1);
  for (const k of khoi) {
    const ten = giaiMa((k.match(/class="flip-entry-title"[^>]*>([^<]*)</) || [])[1]);
    if (/\/drive\/(?:u\/\d+\/)?folders\//.test(k.slice(0, 600))) { thuMucCon++; continue; }
    const id = (k.match(/\/file\/d\/([\w-]{10,})/) || k.match(/^\s*id="entry-([\w-]{10,})"/) || [])[1];
    if (!id || daCo.has(id)) continue;
    daCo.add(id);
    if (ten && !DUOI_ANH.test(ten)) { boQua++; continue; }
    tep.push({ id, ten });
  }

  if (!khoi.length) {
    for (const m of html.matchAll(/\/file\/d\/([\w-]{10,})/g)) {
      if (daCo.has(m[1])) continue;
      daCo.add(m[1]);
      tep.push({ id: m[1], ten: "" });
    }
  }
  return { tep, thuMucCon, boQua };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ loi: "Chỉ nhận phương thức GET." });

  const id = String((req.query && req.query.id) || "");
  if (!/^[\w-]{10,100}$/.test(id)) return res.status(400).json({ loi: "Mã thư mục không hợp lệ." });

  const bo = new AbortController();
  const hen = setTimeout(() => bo.abort(), CHO_TOI_DA);
  try {
    const r = await fetch(`https://drive.google.com/embeddedfolderview?id=${id}`, {
      signal: bo.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NhaHatCheoQuanDoi-CMS/1.0)",
        "Accept": "text/html",
        "Accept-Language": "vi,en;q=0.8"
      }
    });
    if (r.status === 404) {
      return res.status(404).json({ loi: "Không mở được thư mục. Kiểm tra thư mục đã chia sẻ “Bất kỳ ai có đường liên kết” chưa." });
    }
    if (!r.ok) return res.status(502).json({ loi: `Google Drive trả về lỗi ${r.status}.` });

    const html = await r.text();
    if (html.length > HAN_BYTE) return res.status(502).json({ loi: "Thư mục quá lớn, chia nhỏ ra rồi thử lại." });

    /* Thư mục riêng tư thì Google không báo 404 mà chuyển sang trang đăng
       nhập — trang đó không có khối tệp nào. */
    if (/accounts\.google\.com\/(ServiceLogin|v3\/signin)/.test(html) && !/flip-entry/.test(html)) {
      return res.status(403).json({ loi: "Thư mục đang để riêng tư. Chia sẻ “Bất kỳ ai có đường liên kết” rồi thử lại." });
    }
    return res.status(200).json(docTrang(html));
  } catch (e) {
    return res.status(502).json({ loi: e.name === "AbortError" ? "Google Drive phản hồi quá chậm." : "Không đọc được thư mục." });
  } finally {
    clearTimeout(hen);
  }
};
