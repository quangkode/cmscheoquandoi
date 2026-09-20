/* ==========================================================
   Bóc toàn văn một bài báo từ HTML thô.

   Chạy trong trình duyệt chứ không ở máy chủ, vì trình duyệt có sẵn
   DOMParser — dựng được cây HTML đàng hoàng. Bóc bài bằng biểu thức
   chính quy thì sai ngay khi gặp thẻ lồng nhau, mà trang báo thì lồng
   nhau chằng chịt.

   DOMParser tạo ra một tài liệu "chết": script trong đó KHÔNG chạy, ảnh
   không tải. Nên đọc HTML của trang lạ ở đây là an toàn, miễn là đừng
   bao giờ ném thẳng HTML thô vào trang đang sống.

   Đầu ra đã lọc theo DANH SÁCH THẺ CHO PHÉP: chỉ giữ đúng những thẻ và
   thuộc tính có tên trong danh sách, mọi thứ khác bỏ hết. Làm ngược lại
   — liệt kê thứ cần cấm — là sai hướng, vì luôn sót thứ chưa nghĩ tới.
   ========================================================== */

import { locLop } from "./kieu-chu.js";

/* Thẻ được giữ lại. Đủ để đọc một bài báo: đoạn văn, tiêu đề phụ, danh
   sách, trích dẫn, ảnh, chú thích ảnh, in đậm nghiêng, liên kết.

   SPAN nằm đây để cõng cỡ chữ, phông và màu do người soạn đặt. Thẻ span
   nào không mang lớp nào trong danh sách cho phép thì bị bóc vỏ ngay
   trong loc() — báo nào cũng rắc span khắp bài, giữ lại là mang về cả
   đống thẻ rỗng vô nghĩa. */
const THE_CHO_PHEP = new Set([
  "P", "BR", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE",
  "STRONG", "B", "EM", "I", "FIGURE", "FIGCAPTION", "IMG", "A", "TABLE",
  "THEAD", "TBODY", "TR", "TH", "TD", "SPAN"
]);

/* Thuộc tính giữ lại, theo từng thẻ. Không có on* nào ở đây, nên mọi
   bẫy kiểu onclick/onerror rụng hết.

   class chỉ qua được sau khi lọc qua locLop(): chỉ đúng mấy tên lớp khai
   trong kieu-chu.js, mọi tên khác rụng. Nhờ vậy dán HTML từ trang lạ vào
   cũng không lôi được CSS của họ sang. */
const CO_LOP = ["SPAN", "P", "H2", "H3", "H4", "LI", "BLOCKQUOTE", "FIGURE", "FIGCAPTION"];
const THUOC_TINH = { A: ["href"], IMG: ["src", "alt"] };
CO_LOP.forEach((t) => { THUOC_TINH[t] = (THUOC_TINH[t] || []).concat("class"); });

/* Bỏ sạch, không cần xét nội dung bên trong.

   Cố ý KHÔNG có <form> ở đây. Trang dựng bằng ASP.NET đời cũ — qdnd.vn là
   một — bọc toàn bộ thân trang trong <form runat="server">. Vứt cả thẻ
   form là mất luôn bài báo, mà trước đó tìm thấy thân bài rồi vẫn ra
   rỗng, rất khó đoán ra nguyên nhân. Thẻ form không nằm trong danh sách
   cho phép nên bộ lọc sẽ tự bóc vỏ giữ ruột, đúng như mong muốn. */
const VUT_HAN = "script,style,noscript,iframe,svg,canvas,input,button,select,textarea,video,audio,object,embed,link,meta";

/* Khối rác quanh bài: tin liên quan, nút chia sẻ, quảng cáo, bình luận…
   Nhận ra qua class/id vì báo nào cũng đặt tên đại loại như vậy. */
const RAC = /(^|[\s_-])(related|lien-quan|share|social|comment|binh-luan|tag|banner|adver|advert|ads?|quangcao|taboola|outbrain|newsletter|subscribe|breadcrumb|author-box|box-tinlienquan|tinlienquan|footer|header|sidebar|widget|popup|modal|toolbar|zalo|facebook)([\s_-]|$)/i;

/* Nơi báo Việt hay để thân bài. Thử lần lượt, lấy cái đầu tiên có chữ. */
const CHO_HAY_DE_BAI = [
  '[itemprop="articleBody"]',
  ".fck_detail",            // VnExpress
  ".detail-content",
  ".detail__content",
  ".article-content",
  ".article__body",
  ".article-body",
  ".entry-content",
  ".post-content",
  ".content-detail",
  ".singular-content",      // Nhân Dân
  "#main-detail",
  ".cms-body",
  ".news-content",
  "article"
];

/* Đếm chữ trong các thẻ <p> — dùng để chấm điểm khi phải tự đoán. */
function demChu(el) {
  return [...el.querySelectorAll("p")].reduce((t, p) => t + (p.textContent || "").trim().length, 0);
}

/* Tỉ lệ chữ nằm trong thẻ <a> trên tổng số chữ.

   Đây là cách phân biệt thân bài với menu. Menu và khối "tin liên quan"
   gần như chữ nào cũng là liên kết nên tỉ lệ sát 1; bài báo thật thì chỉ
   lác đác vài liên kết nên tỉ lệ rất thấp. Thiếu phép đo này thì trang
   nào không khớp selector sẽ bị bóc nhầm vào thanh điều hướng — đúng
   như nhandan.vn. */
function matDoLienKet(el) {
  const tong = (el.textContent || "").trim().length;
  if (!tong) return 1;
  const chuLienKet = [...el.querySelectorAll("a")]
    .reduce((t, a) => t + (a.textContent || "").trim().length, 0);
  return chuLienKet / tong;
}

/* Đi sâu xuống đúng thân bài.

   Khi phải tự đoán, khối nhiều chữ nhất thường là cái <div> bọc gần như
   cả trang — kéo theo tên báo, menu ngôn ngữ, mời đặt mua báo giấy. Nếu
   một đứa con nắm gần hết số chữ ấy thì chính nó mới là thân bài, còn
   phần dôi ra là vỏ. Cứ thế đi xuống cho tới khi chữ bắt đầu phân tán
   ra nhiều con — đó là lúc đã tới đúng chỗ. */
function thuHep(el) {
  if (!el) return el;
  for (let i = 0; i < 6; i++) {
    const chu = demChu(el);
    if (!chu) break;
    const con = [...el.children].find((c) => demChu(c) >= chu * 0.9);
    if (!con || con.querySelectorAll("p").length < 3) break;
    el = con;
  }
  return el;
}

function laRac(el) {
  const n = (el.getAttribute("class") || "") + " " + (el.getAttribute("id") || "");
  return RAC.test(n);
}

/* Đưa mọi đường dẫn về tuyệt đối. Ảnh và liên kết trong bài thường viết
   tương đối, mang sang trang mình là gãy hết. */
function tuyetDoi(dc, goc) {
  try { return new URL(dc, goc).href; } catch { return ""; }
}

/* Báo hay hoãn tải ảnh: src để ảnh trắng 1px, ảnh thật giấu trong
   data-src. Không lấy mấy thuộc tính đó thì bê về toàn ảnh trắng. */
function nguonAnh(img) {
  for (const t of ["data-src", "data-original", "data-lazy-src", "data-srcset", "src", "srcset"]) {
    const v = img.getAttribute(t);
    if (!v) continue;
    // srcset là danh sách "url cỡ, url cỡ" — lấy cái đầu
    const dc = v.split(",")[0].trim().split(/\s+/)[0];
    if (dc && !/^data:image\/(gif|svg)/i.test(dc)) return dc;
  }
  return "";
}

/* Gom các con đã lọc vào một mảnh rời — dùng khi phải bỏ vỏ giữ ruột. */
function gomCon(nut, goc, ra) {
  const manh = document.createDocumentFragment();
  for (const con of [...nut.childNodes]) {
    const s = loc(con, goc, ra);
    if (s) manh.appendChild(s);
  }
  return manh.childNodes.length ? manh : null;
}

/* Lọc một nhánh cây theo danh sách cho phép, trả về nhánh sạch. */
function loc(nut, goc, ra) {
  if (nut.nodeType === 3) return document.createTextNode(nut.nodeValue);
  if (nut.nodeType !== 1) return null;

  const ten = nut.tagName;

  // Thẻ không có trong danh sách: bỏ vỏ nhưng giữ ruột, để không mất chữ
  // nằm trong <div>, <span>, <section>…
  if (!THE_CHO_PHEP.has(ten)) {
    if (laRac(nut)) return null;
    return gomCon(nut, goc, ra);
  }

  /* Span không mang lớp nào mình dùng thì chẳng để làm gì: bóc vỏ luôn,
     khỏi xét tiếp. Bài chép từ báo về có hàng trăm cái như vậy. */
  if (ten === "SPAN" && !locLop(nut.getAttribute("class"))) {
    if (laRac(nut)) return null;
    return gomCon(nut, goc, ra);
  }

  if (laRac(nut)) return null;

  const moi = document.createElement(ten);

  if (ten === "IMG") {
    const dc = tuyetDoi(nguonAnh(nut), goc);
    if (!dc) return null;
    moi.setAttribute("src", dc);
    const alt = nut.getAttribute("alt");
    if (alt) moi.setAttribute("alt", alt);
    ra.anh.push(dc);
    return moi;
  }

  for (const t of THUOC_TINH[ten] || []) {
    let v = nut.getAttribute(t);
    if (!v) continue;
    if (t === "class") {
      v = locLop(v);
      if (!v) continue;
      moi.setAttribute("class", v);
      continue;
    }
    if (t === "href") {
      v = tuyetDoi(v, goc);
      // chặn javascript: và mọi giao thức lạ
      if (!/^https?:\/\//i.test(v)) continue;
      moi.setAttribute("rel", "noopener");
      moi.setAttribute("target", "_blank");
    }
    moi.setAttribute(t, v);
  }

  for (const con of [...nut.childNodes]) {
    const s = loc(con, goc, ra);
    if (s) moi.appendChild(s);
  }

  // Thẻ rỗng thì bỏ, trừ ảnh và xuống dòng
  if (!moi.textContent.trim() && !moi.querySelector("img") && ten !== "BR" && ten !== "IMG") return null;
  return moi;
}

/* Dọn nốt sau khi lọc: bỏ đoạn rỗng, gộp khoảng trắng, bỏ đoạn quá ngắn
   ở cuối kiểu "Theo TTXVN" (mình đã ghi nguồn riêng ở cuối bài rồi). */
function donLai(khung) {
  khung.querySelectorAll("p").forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector("img")) p.remove();
  });

  /* Bỏ đoạn mà gần như chữ nào cũng là liên kết. Đó là khối "tin liên
     quan" hoặc mẩu menu lọt vào giữa bài — chúng không có class để nhận
     ra nên phải xét theo hình dạng. Đòi từ hai liên kết trở lên để không
     xoá nhầm đoạn văn thật chỉ có một liên kết dẫn nguồn. */
  khung.querySelectorAll("p, li").forEach((el) => {
    if (el.querySelectorAll("a").length >= 2 && matDoLienKet(el) > 0.8) el.remove();
  });
  return khung;
}

/* ----------------------------------------------------------
   Hàm chính: nhận HTML thô + địa chỉ gốc, trả về
   { html, anh[], soChu } — html đã sạch, sẵn sàng lưu.
   ---------------------------------------------------------- */
/* Lọc lại một đoạn HTML đã sạch sẵn. Dùng lúc LƯU: người quản trị sửa bài
   trong ô soạn thảo, mà dán từ Word hay từ trang khác vào là kéo theo cả
   đống thẻ lạ. Lọc lần nữa trước khi ghi xuống Firestore. */
export function locHtml(html, goc) {
  const tl = new DOMParser().parseFromString(`<div id="g">${html}</div>`, "text/html");
  tl.querySelectorAll(VUT_HAN).forEach((e) => e.remove());
  const than = tl.getElementById("g");
  const ra = { anh: [] };
  const sach = document.createElement("div");
  for (const con of [...than.childNodes]) {
    const s = loc(con, goc || location.href, ra);
    if (s) sach.appendChild(s);
  }
  donLai(sach);
  return sach.innerHTML.trim();
}

export function bocBai(htmlTho, goc) {
  const tl = new DOMParser().parseFromString(htmlTho, "text/html");
  tl.querySelectorAll(VUT_HAN).forEach((e) => e.remove());

  let than = null;
  for (const chon of CHO_HAY_DE_BAI) {
    const el = tl.querySelector(chon);
    if (el && demChu(el) > 200 && matDoLienKet(el) < 0.5) { than = el; break; }
  }

  /* Không khớp chỗ nào thì tự đoán: khối nào nhiều chữ trong <p> nhất mà
     không phải menu. Bỏ luôn khối chứa <nav> — không bài báo nào lồng
     thanh điều hướng vào giữa thân bài. */
  if (!than) {
    let diem = 0;
    tl.querySelectorAll("div,section,main,article").forEach((el) => {
      const d = demChu(el);
      if (d <= diem || el.querySelectorAll("p").length < 3) return;
      if (el.querySelector("nav") || matDoLienKet(el) > 0.4) return;
      diem = d;
      than = el;
    });
    than = thuHep(than);
  }

  if (!than) return { html: "", anh: [], soChu: 0 };

  const ra = { anh: [] };
  const sach = document.createElement("div");
  for (const con of [...than.childNodes]) {
    const s = loc(con, goc, ra);
    if (s) sach.appendChild(s);
  }
  donLai(sach);

  /* Chốt cuối: dọn xong mà vẫn quá nửa là liên kết thì cái bóc được không
     phải bài báo — nhiều khả năng trúng menu. Thà báo "không bóc được" để
     người dùng tự dán, còn hơn đưa cho họ một mớ rác trông như bài. */
  if (matDoLienKet(sach) > 0.5 || sach.textContent.trim().length < 200) {
    return { html: "", anh: [], soChu: 0 };
  }

  return {
    html: sach.innerHTML.trim(),
    anh: [...new Set(ra.anh)],
    soChu: sach.textContent.trim().length
  };
}
