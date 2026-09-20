/* ==========================================================
   CỠ CHỮ, PHÔNG, MÀU, CĂN LỀ — khai báo ở đúng một chỗ

   Vì sao phải có tệp riêng: bài viết đi qua HAI bộ lọc danh sách trắng
   trước khi tới mắt người đọc —

     ô soạn thảo → locHtml() (doc-bai.js) → Firestore
                 → quet()   (tin-bai.js bên kho web) → trang Tin bài

   Cả hai đều vứt sạch thuộc tính lạ. Nên định dạng KHÔNG được đi bằng
   style="" tự do: nó sẽ bị xoá lúc lưu, người dùng chỉnh cỡ chữ xong mở
   lại thấy mất trắng. Nó đi bằng MỘT BỘ LỚP CSS CỐ ĐỊNH khai ở đây, hai
   bộ lọc cùng tra vào danh sách này mà giữ lại.

   Cho đi bằng lớp cố định còn chặn luôn đường nhét CSS lạ vào bài: lớp
   nào không có tên trong LOP_CHO_PHEP thì rụng, kể cả khi người ta dán
   HTML từ chỗ khác vào.

   TỆP NÀY CÓ BẢN SAO bên kho web (tin-bai.js, hằng LOP_CHO_PHEP). Hai
   kho khác nhau, trang web lại nạp bằng <script> thường nên không import
   qua được. Sửa ở đây thì phải sửa cả bên kia, nếu không lớp mới sẽ qua
   được CMS mà rụng ở trang công khai.
   ========================================================== */

/* Cỡ chữ tính bằng pt, đúng như Word — 8pt đến 14pt.
   Quy đổi: 1pt = 4/3 px. Thân bài trang Tin bài đang là 17.5px ≈ 13pt,
   nên 13 là cỡ "bằng chữ thường", 14 hơi to, còn 8-10 chỉ hợp cho chú
   thích. pt là đơn vị tuyệt đối nên 12pt trong ô soạn hiện đúng bằng
   12pt ngoài trang, xem thử thế nào thì đăng ra thế ấy. */
export const CO_CHU = [8, 9, 10, 11, 12, 13, 14];

export const PHONG = [
  { lop: "phong-thuong", nhan: "Chữ thường", mau: "Montserrat" },
  { lop: "phong-tieude", nhan: "Chữ tiêu đề", mau: "Playfair Display" },
  { lop: "phong-cochan", nhan: "Chữ có chân", mau: "Noto Serif" }
];

/* Bảng màu khoá cứng theo màu Nhà hát, không cho chọn màu tự do: mỗi bài
   một màu tuỳ hứng thì trang tin trông như tờ rơi. Bốn màu chữ này đều
   đã kiểm tương phản trên nền kem của trang. */
export const MAU = [
  { lop: "mau-do", nhan: "Đỏ", hex: "#cc4752" },
  { lop: "mau-vang", nhan: "Vàng", hex: "#8a6f00" },
  { lop: "mau-xanh", nhan: "Xanh quân đội", hex: "#22372f" },
  { lop: "mau-xam", nhan: "Xám", hex: "#514c45" }
];

/* Nền tô sau chữ. Toàn màu rất nhạt để chữ đen vẫn đọc được đè lên. */
export const NEN = [
  { lop: "nen-vang", nhan: "Nền vàng", hex: "#fff3c4" },
  { lop: "nen-do", nhan: "Nền đỏ", hex: "#fbe1e3" },
  { lop: "nen-xanh", nhan: "Nền xanh", hex: "#e2efe0" },
  { lop: "nen-xam", nhan: "Nền xám", hex: "#eae5db" }
];

export const CAN = [
  { lop: "", nhan: "Căn trái", ky: "trai" },
  { lop: "can-giua", nhan: "Căn giữa", ky: "giua" },
  { lop: "can-phai", nhan: "Căn phải", ky: "phai" },
  { lop: "can-deu", nhan: "Căn đều hai bên", ky: "deu" }
];

/* Lớp cùng một họ thì loại trừ nhau: đặt cỡ 12 lên đoạn đang cỡ 9 là
   thay hẳn, không phải chồng lên. Thẻ lồng nhau vẫn đúng nhờ tính kế
   thừa của CSS — thẻ trong cùng thắng — nhưng vẫn gỡ lớp cũ cho gọn. */
export const HO = {
  co: CO_CHU.map((n) => "co-" + n),
  phong: PHONG.map((p) => p.lop),
  mau: MAU.map((m) => m.lop),
  nen: NEN.map((m) => m.lop),
  can: CAN.map((c) => c.lop).filter(Boolean)
};

export const LOP_CHO_PHEP = new Set(
  [].concat(HO.co, HO.phong, HO.mau, HO.nen, HO.can)
);

/* Giữ lại những lớp có tên trong danh sách, bỏ hết phần còn lại.
   Trả về chuỗi rỗng nghĩa là thẻ đó chẳng còn lớp nào đáng giữ. */
export function locLop(gia) {
  return String(gia || "")
    .split(/\s+/)
    .filter((c) => LOP_CHO_PHEP.has(c))
    .join(" ");
}

/* Sinh thẳng CSS từ chính bảng trên, cho ô soạn thảo và cho trang xem
   thử. Viết tay hai bản là kiểu gì cũng có ngày thêm một cỡ chữ ở đây mà
   quên thêm quy tắc CSS, rồi ngồi đoán vì sao chọn xong không thấy gì.

   tienTo là bộ chọn bọc ngoài, ví dụ ".soan-bai"; để rỗng thì áp cho cả
   trang (dùng ở cửa sổ xem thử).

   Bên kho web có một bản CSS tương đương viết tay trong styles.css —
   trang công khai không nạp được tệp .js dạng module của CMS. */
export function cssKieu(tienTo) {
  const t = tienTo ? tienTo + " " : "";
  const dong = [];
  CO_CHU.forEach((n) => dong.push(`${t}.co-${n}{font-size:${n}pt}`));
  PHONG.forEach((p) => {
    const dp = p.lop === "phong-thuong"
      ? "system-ui,-apple-system,'Segoe UI',sans-serif"
      : "Georgia,'Times New Roman',serif";
    dong.push(`${t}.${p.lop}{font-family:"${p.mau}",${dp}}`);
  });
  MAU.forEach((m) => dong.push(`${t}.${m.lop}{color:${m.hex}}`));
  NEN.forEach((m) => dong.push(`${t}.${m.lop}{background:${m.hex};padding:.1em .22em;border-radius:3px}`));
  dong.push(`${t}.can-giua{text-align:center}`);
  dong.push(`${t}.can-phai{text-align:right}`);
  dong.push(`${t}.can-deu{text-align:justify}`);
  return dong.join("\n");
}
