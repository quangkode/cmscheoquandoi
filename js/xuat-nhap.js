/* ==========================================================
   XUẤT / NHẬP BẢNG TÍNH CHO TỪNG MỤC QUẢN LÝ

   Cách làm việc mà phần này phục vụ: Nhà hát xếp lịch cả tháng thì gõ trong
   Excel hoặc Google Sheets nhanh hơn hẳn mở từng biểu mẫu. Nên:
     Xuất  -> .xlsx, mở thẳng bằng Excel hoặc Google Sheets (Tệp > Nhập)
     Sửa   -> ngay trong bảng tính
     Nhập  -> lưu lại thành .csv rồi nạp ngược vào đây

   Cột `id` là chìa khoá của vòng đi-về: dòng nào giữ nguyên id thì CẬP NHẬT
   đúng bản ghi đó, dòng nào bỏ trống id thì THÊM MỚI. Nhập KHÔNG BAO GIỜ xoá:
   xoá một dòng trong Excel rồi nạp lại thì bản ghi đó vẫn còn nguyên trên web,
   phải vào bảng bấm Xoá. Cố ý như vậy — một lần lỡ tay trong bảng tính không
   được phép cuốn mất lịch diễn thật.
   ========================================================== */
import { taoXlsx, taiVe, docCsv } from "./bang-tinh.js";

/* ---------- Đổi giá trị giữa Firestore và ô bảng tính ---------- */

/* Ngày xuất ra dạng YYYY-MM-DD chứ không phải dd/mm/yyyy: đó là dạng duy nhất
   không nhập nhằng giữa máy đặt vùng Việt Nam và máy đặt vùng Mỹ, lại sắp xếp
   đúng thứ tự khi bấm sắp xếp cột trong Excel. */
function ngayIso(v) {
  if (!v) return "";
  const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
  if (isNaN(d)) return String(v);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* Đọc ngược lại: nhận cả YYYY-MM-DD lẫn dd/mm/yyyy, vì người dùng gõ tay
   trong Excel rất hay gõ theo thói quen Việt Nam. */
function docNgay(chu) {
  const s = String(chu || "").trim();
  if (!s) return "";
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null; // không hiểu được -> báo lỗi dòng
}

const BAT = ["hiện", "hien", "có", "co", "x", "true", "1", "bật", "bat", "yes"];
const TAT = ["ẩn", "an", "không", "khong", "", "false", "0", "tắt", "tat", "no"];

function nhanCuaChon(t, gia) {
  const c = (t.chon || []).find((x) => x.gia === gia);
  return c ? c.nhan : (gia ?? "");
}
/* Cho phép người dùng gõ nhãn tiếng Việt ("Chèo cổ") hoặc mã ("cheo-co") */
function giaCuaNhan(t, chu) {
  const s = String(chu || "").trim();
  if (!s) return "";
  const c = (t.chon || []).find(
    (x) => x.gia === s || x.nhan.toLowerCase() === s.toLowerCase()
  );
  return c ? c.gia : null;
}

function oXuat(t, gia) {
  switch (t.kieu) {
    case "ngay": return ngayIso(gia);
    case "cong-tac": return gia === false ? "Ẩn" : "Hiện";
    case "so": return gia === null || gia === undefined || gia === "" ? "" : Number(gia);
    case "anh": return gia?.url || "";
    case "chon": return nhanCuaChon(t, gia);
    default: return gia ?? "";
  }
}

/* ---------- XUẤT ---------- */
export function xuatXlsx(ma, m, ds) {
  const truong = m.truong;
  const tieuDe = ["id", ...truong.map((t) => t.nhan)];
  const hang = [tieuDe, ...ds.map((d) => [d.id, ...truong.map((t) => oXuat(t, d[t.ten]))])];

  const nay = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const ten = `${ma}-${nay.getFullYear()}${p(nay.getMonth() + 1)}${p(nay.getDate())}.xlsx`;
  taiVe(taoXlsx(m.nhan, hang), ten);
  return { soDong: ds.length, ten };
}

/* ---------- NHẬP ---------- */

/* Bỏ dấu để so tiêu đề cột: người dùng hay gõ lại tiêu đề thiếu dấu, hoặc
   Google Sheets trả về tiêu đề đã bị đổi hoa thường. */
const chuanHoa = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Đọc nội dung CSV thành danh sách thao tác cần ghi.
 * Không ghi gì cả — chỉ soạn ra để màn hình xác nhận cho người dùng xem trước.
 */
export function soanNhap(m, vanBan, dsHienCo) {
  const hang = docCsv(vanBan);
  if (hang.length < 2) {
    return { loiChung: "Tệp không có dòng dữ liệu nào (cần dòng tiêu đề và ít nhất một dòng)." };
  }

  const tieuDe = hang[0].map(chuanHoa);
  // ghép tiêu đề cột -> trường trong lược đồ
  const cot = {};
  let cotId = -1;
  tieuDe.forEach((h, i) => {
    if (h === "id") { cotId = i; return; }
    const t = m.truong.find((x) => chuanHoa(x.nhan) === h || chuanHoa(x.ten) === h);
    if (t) cot[t.ten] = i;
  });

  // bỏ trường ảnh: ảnh phải tải lên qua biểu mẫu, bảng tính chỉ mang đường dẫn
  const daNhan = m.truong.filter((t) => t.kieu !== "anh" && cot[t.ten] !== undefined);
  if (!daNhan.length) {
    return {
      loiChung: "Không nhận ra cột nào. Tiêu đề cột phải trùng với tệp đã xuất ra — "
        + "cách chắc nhất là bấm Xuất Excel trước, sửa trên tệp đó rồi lưu thành CSV."
    };
  }
  const boQua = tieuDe.filter((h, i) => h && i !== cotId
    && !m.truong.some((x) => chuanHoa(x.nhan) === h || chuanHoa(x.ten) === h));

  const idCo = new Set(dsHienCo.map((d) => d.id));
  const them = [], sua = [], loi = [];

  for (let i = 1; i < hang.length; i++) {
    const d = hang[i];
    if (d.every((x) => String(x).trim() === "")) continue;
    const soDong = i + 1; // số dòng như người dùng thấy trong Excel
    const id = cotId >= 0 ? String(d[cotId] || "").trim() : "";
    const rec = {};
    const loiDong = [];

    for (const t of daNhan) {
      const chu = String(d[cot[t.ten]] ?? "").trim();
      let gia;
      switch (t.kieu) {
        case "ngay": {
          gia = docNgay(chu);
          if (gia === null) loiDong.push(`cột “${t.nhan}”: không đọc được ngày “${chu}”`);
          break;
        }
        case "so": {
          if (chu === "") { gia = null; break; }
          const n = Number(chu.replace(/[ .](?=\d{3}\b)/g, "").replace(",", "."));
          if (!Number.isFinite(n)) loiDong.push(`cột “${t.nhan}”: “${chu}” không phải số`);
          gia = Number.isFinite(n) ? n : null;
          break;
        }
        case "cong-tac": {
          const k = chuanHoa(chu);
          if (BAT.includes(k)) gia = true;
          else if (TAT.includes(k)) gia = false;
          else { loiDong.push(`cột “${t.nhan}”: điền “Hiện” hoặc “Ẩn”, không phải “${chu}”`); gia = true; }
          break;
        }
        case "chon": {
          gia = giaCuaNhan(t, chu);
          if (gia === null) {
            loiDong.push(`cột “${t.nhan}”: “${chu}” không nằm trong danh sách cho phép`);
            gia = "";
          }
          break;
        }
        default:
          gia = chu;
      }
      rec[t.ten] = gia;
    }

    for (const t of daNhan) {
      if (t.batBuoc && (rec[t.ten] === "" || rec[t.ten] === null || rec[t.ten] === undefined)) {
        loiDong.push(`thiếu “${t.nhan}”`);
      }
    }

    if (loiDong.length) { loi.push({ dong: soDong, chu: loiDong.join("; ") }); continue; }
    if (id && idCo.has(id)) sua.push({ id, rec });
    else if (id) loi.push({ dong: soDong, chu: `id “${id}” không có trên hệ thống — xoá ô id đi nếu muốn thêm mới` });
    else them.push({ rec });
  }

  return { them, sua, loi, boQua, daNhan: daNhan.map((t) => t.nhan) };
}
