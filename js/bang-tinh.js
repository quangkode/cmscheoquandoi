/* ==========================================================
   XUẤT .XLSX VÀ ĐỌC .CSV — không dùng thư viện ngoài.

   Vì sao tự viết thay vì nạp SheetJS từ CDN: cả CMS này chạy không npm,
   không bundler, và phần xuất dữ liệu là thứ Nhà hát sẽ bấm hằng tuần —
   treo nó vào một CDN bên thứ ba nghĩa là hôm nào CDN chết thì không xuất
   được. Toàn bộ phần cần dùng chỉ gồm: ghi vài tệp XML, nén kiểu "store"
   (không nén thật) vào một tệp ZIP, và tính CRC32. Gói gọn trong tệp này.

   XUẤT ra .xlsx chứ không phải .csv vì .csv hay vỡ tiếng Việt và Excel bản
   tiếng Việt còn tách cột bằng dấu chấm phẩy — mở ra dồn hết vào một cột.
   NHẬP thì ngược lại, chỉ nhận .csv: đọc được .xlsx phải giải nén DEFLATE,
   dài gấp nhiều lần phần còn lại của tệp này, trong khi Excel lẫn Google
   Sheets đều "Lưu dưới dạng CSV" chỉ bằng một thao tác.
   ========================================================== */

/* ---------- CRC32 ---------- */
let BANG_CRC = null;
function crc32(u8) {
  if (!BANG_CRC) {
    BANG_CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      BANG_CRC[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < u8.length; i++) crc = (crc >>> 8) ^ BANG_CRC[(crc ^ u8[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

/* ---------- ZIP kiểu "store" ----------
   Không nén thật (method 0). Tệp .xlsx của một bảng lịch diễn chỉ vài chục KB
   nên nén hay không đều không đáng kể, mà bỏ được toàn bộ phần DEFLATE. */
function taoZip(tepList) {
  const bo = new TextEncoder();
  const cuc = [];
  const mucLuc = [];
  let viTri = 0;

  const so16 = (n) => [n & 0xff, (n >>> 8) & 0xff];
  const so32 = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];

  for (const { ten, noiDung } of tepList) {
    const tenB = bo.encode(ten);
    const duLieu = typeof noiDung === "string" ? bo.encode(noiDung) : noiDung;
    const crc = crc32(duLieu);
    // cờ 0x0800 = tên tệp mã hoá UTF-8; ngày giờ để 0 cho tệp luôn giống nhau
    const dauCuc = [
      ...so32(0x04034b50), ...so16(20), ...so16(0x0800), ...so16(0),
      ...so16(0), ...so16(0), ...so32(crc), ...so32(duLieu.length), ...so32(duLieu.length),
      ...so16(tenB.length), ...so16(0)
    ];
    cuc.push(new Uint8Array(dauCuc), tenB, duLieu);
    mucLuc.push({ ten: tenB, crc, cd: duLieu.length, viTri });
    viTri += dauCuc.length + tenB.length + duLieu.length;
  }

  const mucLucB = [];
  let cvMucLuc = 0;
  for (const m of mucLuc) {
    const dau = [
      ...so32(0x02014b50), ...so16(20), ...so16(20), ...so16(0x0800), ...so16(0),
      ...so16(0), ...so16(0), ...so32(m.crc), ...so32(m.cd), ...so32(m.cd),
      ...so16(m.ten.length), ...so16(0), ...so16(0), ...so16(0), ...so16(0),
      ...so32(0), ...so32(m.viTri)
    ];
    mucLucB.push(new Uint8Array(dau), m.ten);
    cvMucLuc += dau.length + m.ten.length;
  }
  const ket = new Uint8Array([
    ...so32(0x06054b50), ...so16(0), ...so16(0),
    ...so16(mucLuc.length), ...so16(mucLuc.length),
    ...so32(cvMucLuc), ...so32(viTri), ...so16(0)
  ]);

  return new Blob([...cuc, ...mucLucB, ket], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

/* ---------- XML ---------- */
const xmlEsc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]))
    // ký tự điều khiển không hợp lệ trong XML 1.0 sẽ làm Excel báo tệp hỏng
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

function chuCot(i) {
  let s = "";
  i += 1;
  while (i > 0) { const d = (i - 1) % 26; s = String.fromCharCode(65 + d) + s; i = Math.floor((i - d) / 26); }
  return s;
}

/* Ô số ghi dạng <v>, ô chữ ghi dạng inlineStr để khỏi phải dựng sharedStrings.
   Chuỗi toàn chữ số nhưng có số 0 đứng đầu (ví dụ mã đơn) phải giữ nguyên là
   chữ, không thì Excel nuốt mất số 0. */
function oXml(gia, hang, cot, kieuDam) {
  const r = chuCot(cot) + (hang + 1);
  const s = kieuDam ? ' s="1"' : "";
  if (typeof gia === "number" && Number.isFinite(gia)) return `<c r="${r}"${s}><v>${gia}</v></c>`;
  const chu = String(gia ?? "");
  if (chu === "") return `<c r="${r}"${s}/>`;
  return `<c r="${r}"${s} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(chu)}</t></is></c>`;
}

/**
 * Dựng một tệp .xlsx một trang tính.
 * @param {string} tenTrang  tên tab trong Excel
 * @param {Array<Array<string|number>>} hang  hàng đầu tiên là tiêu đề cột
 * @returns {Blob}
 */
export function taoXlsx(tenTrang, hang) {
  const soCot = hang.reduce((m, h) => Math.max(m, h.length), 1);

  // bề rộng cột đoán theo nội dung dài nhất, chặn trên 60 để cột ghi chú
  // không kéo dài cả màn hình
  const rong = [];
  for (let c = 0; c < soCot; c++) {
    let d = 10;
    for (const h of hang) d = Math.max(d, String(h[c] ?? "").length + 2);
    rong.push(Math.min(60, d));
  }

  const dongXml = hang.map((h, i) =>
    `<row r="${i + 1}">${Array.from({ length: soCot }, (_, c) => oXml(h[c], i, c, i === 0)).join("")}</row>`
  ).join("");

  const vungLoc = `A1:${chuCot(soCot - 1)}${hang.length}`;
  const sheet =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0">` +
    // khoá hàng tiêu đề: cuộn xuống vẫn thấy tên cột
    `<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>` +
    `</sheetView></sheetViews>` +
    `<cols>${rong.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>` +
    `<sheetData>${dongXml}</sheetData>` +
    (hang.length > 1 ? `<autoFilter ref="${vungLoc}"/>` : "") +
    `</worksheet>`;

  const styles =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
    `<fills count="2"><fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="gray125"/></fill></fills>` +
    `<borders count="1"><border/></borders>` +
    `<cellStyleXfs count="1"><xf/></cellStyleXfs>` +
    `<cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" applyFont="1"/></cellXfs>` +
    `</styleSheet>`;

  return taoZip([
    {
      ten: "[Content_Types].xml",
      noiDung:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`
    },
    {
      ten: "_rels/.rels",
      noiDung:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`
    },
    {
      ten: "xl/workbook.xml",
      noiDung:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
        `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${xmlEsc(tenTrang).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets>` +
        `</workbook>`
    },
    {
      ten: "xl/_rels/workbook.xml.rels",
      noiDung:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`
    },
    { ten: "xl/styles.xml", noiDung: styles },
    { ten: "xl/worksheets/sheet1.xml", noiDung: sheet }
  ]);
}

/* ---------- Tải tệp về máy ---------- */
export function taiVe(blob, tenTep) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tenTep;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // thu hồi ngay thì Safari đôi khi huỷ mất lượt tải, nên chờ một nhịp
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- Đọc .csv ----------
   Tự đoán dấu tách cột: Excel bản tiếng Việt xuất ra dấu chấm phẩy, bản
   tiếng Anh và Google Sheets xuất ra dấu phẩy. Đếm ở dòng đầu, bỏ qua phần
   nằm trong ngoặc kép. */
function doanDauTach(dong) {
  const dem = { ",": 0, ";": 0, "\t": 0 };
  let trongNgoac = false;
  for (let i = 0; i < dong.length; i++) {
    const c = dong[i];
    if (c === '"') { trongNgoac = !trongNgoac; continue; }
    if (!trongNgoac && c in dem) dem[c]++;
  }
  return Object.keys(dem).sort((a, b) => dem[b] - dem[a])[0];
}

/**
 * Đọc chuỗi CSV thành mảng hai chiều. Hiểu ô có ngoặc kép, dấu phẩy và
 * xuống dòng nằm trong ô, và ngoặc kép nhân đôi ("") là một ngoặc kép.
 */
export function docCsv(chuoi) {
  let s = String(chuoi).replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const tach = doanDauTach(s.split("\n")[0] || "");
  const hang = [];
  let o = "", dong = [], trongNgoac = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (trongNgoac) {
      if (c === '"') {
        if (s[i + 1] === '"') { o += '"'; i++; }
        else trongNgoac = false;
      } else o += c;
      continue;
    }
    if (c === '"') { trongNgoac = true; continue; }
    if (c === tach) { dong.push(o); o = ""; continue; }
    if (c === "\n") { dong.push(o); hang.push(dong); o = ""; dong = []; continue; }
    o += c;
  }
  if (o !== "" || dong.length) { dong.push(o); hang.push(dong); }

  // bỏ những dòng trống hoàn toàn ở cuối tệp
  while (hang.length && hang[hang.length - 1].every((x) => String(x).trim() === "")) hang.pop();
  return hang;
}
