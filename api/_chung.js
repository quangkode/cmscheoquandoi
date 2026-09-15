/* ==========================================================
   Phần dùng chung cho hai hàm máy chủ lấy bài báo.

   Vì sao phải có mã chạy trên máy chủ: trình duyệt KHÔNG tự tải được
   trang của báo khác. Quy tắc CORS chặn — báo Việt Nam không ai gửi
   Access-Control-Allow-Origin cho người lạ. Máy chủ thì không bị chặn,
   nên CMS nhờ máy chủ tải hộ rồi trả về.

   Vercel tự nhận thư mục api/ thành hàm máy chủ, không cần npm, không
   cần build — đúng tinh thần phần còn lại của dự án. Tệp bắt đầu bằng
   dấu gạch dưới thì Vercel bỏ qua, không thành đường dẫn công khai.

   CẢNH GIÁC: đây là hai đường dẫn ai cũng gọi được. Kẻ xấu có thể lợi
   dụng để dò mạng nội bộ (SSRF) hoặc mượn làm chỗ tải hộ. Các chốt chặn
   bên dưới là để hạn chế chuyện đó.
   ========================================================== */

const dns = require("dns").promises;
const net = require("net");

const CHO_TOI_DA = 12000;        // ms — quá lâu thì bỏ, đừng để hàm treo
const SO_LAN_CHUYEN_HUONG = 4;

/* Dải địa chỉ nội bộ. Cho phép gọi vào đây là mở đường cho người lạ dò
   mạng riêng của máy chủ qua chính trang web của mình. */
function laDiaChiNoiBo(dc) {
  if (net.isIPv4(dc)) {
    const [a, b] = dc.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 ||
           (a === 169 && b === 254) ||
           (a === 172 && b >= 16 && b <= 31) ||
           (a === 192 && b === 168) ||
           a >= 224;
  }
  const t = dc.toLowerCase();
  return t === "::1" || t === "::" ||
         t.startsWith("fc") || t.startsWith("fd") ||   // riêng tư
         t.startsWith("fe80") ||                        // link-local
         t.startsWith("::ffff:");                       // IPv4 đội lốt IPv6
}

/* Kiểm một địa chỉ trước khi tải. Trả về URL đã chuẩn hoá, hoặc ném lỗi
   với câu tiếng Việt đọc được để hiện thẳng cho người dùng. */
async function kiemDiaChi(chuoi) {
  let u;
  try { u = new URL(String(chuoi || "").trim()); }
  catch { throw new Error("Đường dẫn không hợp lệ."); }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Chỉ nhận đường dẫn http hoặc https.");
  }

  // Chặn cả tên miền trỏ về máy chủ, không chỉ chặn IP gõ thẳng
  let ds;
  try { ds = await dns.lookup(u.hostname, { all: true }); }
  catch { throw new Error("Không tìm thấy tên miền này."); }

  if (ds.some((x) => laDiaChiNoiBo(x.address))) {
    throw new Error("Đường dẫn trỏ vào mạng nội bộ, không tải.");
  }
  return u;
}

/* Tải một địa chỉ, tự đi theo chuyển hướng nhưng kiểm lại từng chặng —
   trang bên ngoài có thể chuyển hướng về 127.0.0.1 để lách chốt ở trên. */
async function tai(chuoi, nhan, themDau) {
  let u = await kiemDiaChi(chuoi);

  for (let i = 0; i <= SO_LAN_CHUYEN_HUONG; i++) {
    const bo = new AbortController();
    const hen = setTimeout(() => bo.abort(), CHO_TOI_DA);
    let r;
    try {
      r = await fetch(u.href, {
        redirect: "manual",
        signal: bo.signal,
        headers: {
          // Báo nào cũng chặn tải tự động không khai danh tính
          "User-Agent": "Mozilla/5.0 (compatible; NhaHatCheoQuanDoi-CMS/1.0)",
          "Accept": nhan,
          "Accept-Language": "vi,en;q=0.8",
          ...(themDau || {})
        }
      });
    } catch (e) {
      throw new Error(e.name === "AbortError" ? "Trang phản hồi quá chậm." : "Không tải được trang.");
    } finally {
      clearTimeout(hen);
    }

    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
      u = await kiemDiaChi(new URL(r.headers.get("location"), u.href).href);
      continue;
    }
    if (!r.ok) throw new Error(`Trang trả về lỗi ${r.status}.`);
    return { r, u };
  }
  throw new Error("Trang chuyển hướng vòng vo quá nhiều lần.");
}

/* Đọc thân phản hồi nhưng dừng khi vượt hạn mức, để một trang nặng bất
   thường không ngốn hết bộ nhớ của hàm. */
async function docCoHan(r, gioiHanByte) {
  const khai = Number(r.headers.get("content-length") || 0);
  if (khai && khai > gioiHanByte) throw new Error("Nội dung quá nặng.");

  const doc = r.body.getReader();
  const manh = [];
  let tong = 0;
  for (;;) {
    const { done, value } = await doc.read();
    if (done) break;
    tong += value.length;
    if (tong > gioiHanByte) { doc.cancel(); throw new Error("Nội dung quá nặng."); }
    manh.push(value);
  }
  return Buffer.concat(manh.map((x) => Buffer.from(x)), tong);
}

module.exports = { kiemDiaChi, tai, docCoHan, CHO_TOI_DA };
