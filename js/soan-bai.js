/* ==========================================================
   Trang soạn bài viết — soan-bai.html

   Mở trong tab riêng chứ không phải hộp thoại: viết một bài báo dài cần
   cả màn hình, mà hộp thoại thì cuộn trong khung nhỏ, gõ được vài dòng
   là mỏi. Không id = viết bài mới, ?id=... = sửa bài đã có.

   HAI LỐI VÀO, chọn ngay khi mở bài mới:
     • tự soạn  — bài của Nhà hát. Có ảnh bìa, KHÔNG có ô nguồn: bài mình
                  tự viết thì chẳng dẫn nguồn ai cả, để ô đó trống lửng
                  chỉ tổ có người điền bừa.
     • từ báo   — chép link bài báo về rồi biên soạn lại. Có thanh dán
                  link và hai ô nguồn, bắt buộc ghi công.
   Sửa bài cũ thì tự suy ra lối nào theo chỗ bài đó có nguồn hay không.

   Ô soạn thảo dùng contenteditable + document.execCommand. execCommand
   tuy đã bị đánh dấu lỗi thời nhưng vẫn chạy ở mọi trình duyệt hiện
   hành, và nó là cách duy nhất làm được thanh công cụ định dạng mà
   không phải kéo cả một thư viện soạn thảo về — dự án này cố ý không
   dùng npm, không có bước build.

   Cỡ chữ, phông, màu đi bằng LỚP CSS cố định khai trong kieu-chu.js,
   không phải style="" — xem lời giải thích ở đầu tệp đó.

   Mọi thứ gõ hay dán vào đây đều được lọc lại lúc lưu (locHtml), nên
   người dùng có dán từ Word hay từ trang khác cũng không mang rác vào.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";
import { LUOC_DO } from "./luoc-do.js";
import { bocBai, locHtml } from "./doc-bai.js";
import { CO_CHU, PHONG, MAU, NEN, HO, cssKieu } from "./kieu-chu.js";

const than = document.getElementById("sbThan");
const khayBao = document.getElementById("khayBao");
const MUC = "tin-tuc";
const GIOI_HAN_MB = 5;
const MOC_TOI_DA = 60;          // số bước hoàn tác giữ lại
const NHAP_CHO = 1500;          // ms im lặng rồi mới lưu nháp

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function bao(t, k) {
  const el = document.createElement("div");
  el.className = "bao" + (k ? " bao--" + k : "");
  el.textContent = t;
  khayBao.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

let fb, bai = null, id = null, anhBia = null, daDoi = false, che = "tu";

/* ----------------------------------------------------------
   Khởi động
   ---------------------------------------------------------- */
if (!daCauHinh) {
  than.innerHTML = `<div class="nhac"><h3>Chưa nối Firebase</h3>
    <p>Dán <code>firebaseConfig</code> vào <code>cau-hinh.js</code> trước đã.</p></div>`;
} else {
  chay().catch((e) => {
    than.innerHTML = `<div class="nhac nhac--nguy"><h3>Không mở được trang</h3><p><code>${esc(e.message)}</code></p></div>`;
  });
}

async function chay() {
  fb = await import("./firebase.js");
  const nd = await fb.nguoiDungHienTai();
  if (!nd || !(await fb.laQuanTri(nd.uid))) {
    location.replace("./index.html");
    return;
  }

  // CSS của cỡ chữ/phông/màu sinh thẳng từ kieu-chu.js, xem chú thích ở đó
  document.head.insertAdjacentHTML("beforeend", `<style>${cssKieu(".soan-bai")}</style>`);

  const tham = new URLSearchParams(location.search);
  id = tham.get("id");

  if (id) {
    bai = await fb.layMot(MUC, id);
    if (!bai) { than.innerHTML = `<div class="nhac nhac--nguy"><h3>Không tìm thấy bài</h3></div>`; return; }
    document.getElementById("sbTieuDeTrang").textContent = "Sửa bài viết";
    // bài cũ có ghi nguồn nghĩa là lấy từ báo về
    che = (bai.nguonTen || bai.nguonUrl) ? "bao" : "tu";
  } else {
    const xin = tham.get("che");
    if (xin !== "tu" && xin !== "bao") { veManChon(); return; }
    che = xin;
  }

  moBai();
}

/* ----------------------------------------------------------
   Màn chọn lối vào

   Hiện khi mở bài mới mà chưa nói rõ làm kiểu gì. Ghi vào địa chỉ
   (?che=…) chứ không giữ trong biến: tải lại trang hay lưu lại địa chỉ
   thì vẫn đúng lối đang làm.
   ---------------------------------------------------------- */
function veManChon() {
  document.getElementById("nutXemTruoc").hidden = true;
  document.getElementById("nutLuu").hidden = true;
  than.innerHTML = `
    <div class="sb-chon">
      <h1>Bài viết mới</h1>
      <p class="sb-chon__dan">Làm theo cách nào?</p>
      <div class="sb-chon__luoi">
        <button type="button" class="sb-the" data-che="tu">
          <span class="sb-the__hinh" aria-hidden="true">✍</span>
          <strong>Tự soạn thảo</strong>
        </button>
        <button type="button" class="sb-the" data-che="bao">
          <span class="sb-the__hinh" aria-hidden="true">🔗</span>
          <strong>Chép link rồi biên soạn</strong>
        </button>
      </div>
    </div>`;
  than.querySelectorAll("[data-che]").forEach((b) =>
    b.addEventListener("click", () => {
      history.replaceState(null, "", "./soan-bai.html?che=" + b.dataset.che);
      che = b.dataset.che;
      document.getElementById("nutXemTruoc").hidden = false;
      document.getElementById("nutLuu").hidden = false;
      moBai();
    }));
}

function moBai() {
  ve();
  ganSuKien();
  demChu();
  datMocDau();
  hoiNhap();
}

/* ----------------------------------------------------------
   Dựng giao diện
   ---------------------------------------------------------- */
function oMau(ds, ho, nhan) {
  return `<details class="sb-thavo">
      <summary title="${esc(nhan)}">${ho === "mau" ? "A" : "▭"}<i class="sb-thavo__vach"></i></summary>
      <div class="sb-thavo__o">
        ${ds.map((m) => `<button type="button" class="sb-o-mau" data-ho="${ho}" data-lop="${m.lop}"
             style="background:${m.hex}" title="${esc(m.nhan)}"></button>`).join("")}
        <button type="button" class="sb-o-mau sb-o-mau--bo" data-ho="${ho}" data-lop="" title="Bỏ màu">✕</button>
      </div>
    </details>`;
}

function ve() {
  const t = (ten) => bai?.[ten] ?? "";
  const chuDe = LUOC_DO[MUC].truong.find((x) => x.ten === "chuDe");
  const laBao = che === "bao";
  anhBia = bai?.anh ?? null;

  than.innerHTML = `
    <div class="sb-che">
      <span class="sb-che__nhan">${laBao ? "🔗 Biên soạn từ bài báo" : "✍ Nhà hát tự soạn"}</span>
      <button type="button" class="nut nut--nho" id="sbDoiChe">Đổi sang ${laBao ? "tự soạn" : "biên soạn từ bài báo"}</button>
    </div>

    ${laBao ? `
    <!-- Dán link bài báo: chỉ một dòng, nằm trên cùng cho dễ thấy -->
    <div class="sb-lay">
      <input type="url" id="sbUrl" placeholder="Dán link bài báo…" />
      <button type="button" class="nut" id="sbNutLay">Lấy về</button>
    </div>
    <div id="sbKetQuaLay"></div>` : ""}

    <div class="sb-luoi">
      <div class="sb-chinh">
        <div class="o-nhap" data-o="tieuDe">
          <label for="f-tieuDe">Tiêu đề <span class="bat-buoc">*</span></label>
          <input type="text" id="f-tieuDe" class="sb-tieude" value="${esc(t("tieuDe"))}" placeholder="Tiêu đề bài viết" />
        </div>

        <div class="o-nhap" data-o="tomTat">
          <label for="f-tomTat">Tóm tắt <span class="bat-buoc">*</span></label>
          <textarea id="f-tomTat" rows="3" placeholder="Tóm tắt">${esc(t("tomTat"))}</textarea>
        </div>

        <div class="o-nhap" data-o="noiDung">
          <label>Nội dung bài</label>

          <div class="sb-cong-cu" id="sbCongCu">
            <button type="button" id="sbHoanTac" title="Hoàn tác (Ctrl+Z)" disabled>↶</button>
            <button type="button" id="sbLamLai" title="Làm lại (Ctrl+Y)" disabled>↷</button>
            <span class="sb-cach"></span>

            <button type="button" data-lenh="bold" title="Đậm (Ctrl+B)"><b>B</b></button>
            <button type="button" data-lenh="italic" title="Nghiêng (Ctrl+I)"><i>I</i></button>
            <span class="sb-cach"></span>

            <select id="sbPhong" class="sb-chon-nho" title="Phông chữ">
              <option value="">Phông</option>
              ${PHONG.map((p) => `<option value="${p.lop}">${esc(p.nhan)}</option>`).join("")}
              <option value="__bo">— về mặc định —</option>
            </select>
            <select id="sbCo" class="sb-chon-nho sb-chon-nho--hep" title="Cỡ chữ (pt)">
              <option value="">Cỡ</option>
              ${CO_CHU.map((n) => `<option value="co-${n}">${n}</option>`).join("")}
              <option value="__bo">—</option>
            </select>
            <span class="sb-cach"></span>

            ${oMau(MAU, "mau", "Màu chữ")}
            ${oMau(NEN, "nen", "Tô nền chữ")}
            <span class="sb-cach"></span>

            <button type="button" data-can="" title="Căn trái">⬅</button>
            <button type="button" data-can="can-giua" title="Căn giữa">↔</button>
            <button type="button" data-can="can-phai" title="Căn phải">➡</button>
            <button type="button" data-can="can-deu" title="Căn đều hai bên">☰</button>
            <span class="sb-cach"></span>

            <button type="button" data-khoi="p" title="Đoạn văn thường">¶</button>
            <button type="button" data-khoi="h2" title="Tiêu đề lớn">H2</button>
            <button type="button" data-khoi="h3" title="Tiêu đề nhỏ">H3</button>
            <button type="button" data-khoi="blockquote" title="Trích dẫn">❝</button>
            <span class="sb-cach"></span>

            <button type="button" data-lenh="insertUnorderedList" title="Danh sách gạch đầu dòng">•—</button>
            <button type="button" data-lenh="insertOrderedList" title="Danh sách đánh số">1—</button>
            <span class="sb-cach"></span>

            <button type="button" id="sbLink" title="Chèn liên kết">🔗</button>
            <button type="button" id="sbBoLink" title="Bỏ liên kết">⛓</button>
            <button type="button" id="sbAnh" title="Chèn ảnh">🖼</button>
            <span class="sb-cach"></span>

            <button type="button" id="sbXoaDinhDang" title="Xoá định dạng">Tx</button>
            <span class="sb-dem" id="sbDem">0 chữ</span>
          </div>

          <div class="soan-bai sb-o" id="f-noiDung" contenteditable="true"
               role="textbox" aria-multiline="true">${bai?.noiDung || ""}</div>
          <input type="file" accept="image/*" id="sbTepAnh" hidden />
        </div>
      </div>

      <aside class="sb-ben">
        <div class="o-nhap" data-o="ngay">
          <label for="f-ngay">Ngày đăng <span class="bat-buoc">*</span></label>
          <input type="date" id="f-ngay" value="${esc(t("ngay"))}" />
        </div>

        <div class="o-nhap" data-o="chuDe">
          <label for="f-chuDe">Chủ đề <span class="bat-buoc">*</span></label>
          <select id="f-chuDe">
            <option value="">— chọn —</option>
            ${chuDe.chon.map((c) => `<option value="${esc(c.gia)}"${c.gia === t("chuDe") ? " selected" : ""}>${esc(c.nhan)}</option>`).join("")}
          </select>
        </div>

        <div class="o-nhap" data-o="anh">
          <label>Ảnh minh hoạ</label>
          <div class="o-anh-tai">
            <div class="o-anh-tai__xem" id="sbXemBia">${anhBia?.url ? `<img src="${esc(anhBia.url)}" alt="" />` : "Chưa có ảnh"}</div>
            <div class="o-anh-tai__nut">
              <input type="file" accept="image/*" id="sbTepBia" hidden />
              <button type="button" class="nut nut--nho" id="sbChonBia">Chọn ảnh…</button>
              <button type="button" class="nut nut--nho" id="sbBoBia"${anhBia?.url ? "" : " hidden"}>Bỏ ảnh</button>
            </div>
          </div>
        </div>

        <div class="o-nhap" data-o="anhNguon">
          <label for="f-anhNguon">Ghi công ảnh</label>
          <input type="text" id="f-anhNguon" value="${esc(t("anhNguon"))}" placeholder="${laBao ? "Ảnh: Báo Quân đội nhân dân" : "Ảnh: Nhà hát Chèo Quân đội"}" />
        </div>

        ${laBao ? `
        <div class="o-nhap" data-o="nguonTen">
          <label for="f-nguonTen">Tên nguồn</label>
          <input type="text" id="f-nguonTen" value="${esc(t("nguonTen"))}" placeholder="Báo Nhân Dân" />
        </div>

        <div class="o-nhap" data-o="nguonUrl">
          <label for="f-nguonUrl">Đường dẫn bài gốc</label>
          <input type="url" id="f-nguonUrl" value="${esc(t("nguonUrl"))}" placeholder="https://…" />
        </div>` : ""}

        <div class="o-nhap">
          <label class="cong-tac">
            <input type="checkbox" id="f-hienThi"${bai ? (bai.hienThi === false ? "" : " checked") : " checked"} />
            <span>Hiện trên web</span>
          </label>
        </div>
      </aside>
    </div>`;
}

/* ----------------------------------------------------------
   Vùng chọn: đọc và đặt lại vị trí con trỏ

   Hoàn tác của mình là thay nguyên innerHTML, nên phải tự nhớ con trỏ
   đang ở đâu rồi đặt lại — không thì mỗi lần Ctrl+Z con trỏ nhảy về đầu
   bài, gõ tiếp là chữ rơi lung tung.

   Đo bằng SỐ KÝ TỰ tính từ đầu ô soạn, không phải theo nút DOM: sau khi
   thay innerHTML thì mọi nút đều là nút mới, giữ tham chiếu cũ là trỏ
   vào cây đã bị vứt.
   ---------------------------------------------------------- */
const oSoan = () => document.getElementById("f-noiDung");

function viTriCon() {
  const s = window.getSelection();
  if (!s || !s.rangeCount) return 0;
  const r = s.getRangeAt(0);
  if (!oSoan().contains(r.startContainer)) return 0;
  const d = r.cloneRange();
  d.selectNodeContents(oSoan());
  d.setEnd(r.startContainer, r.startOffset);
  return d.toString().length;
}

function datCon(n) {
  const o = oSoan();
  const di = document.createTreeWalker(o, NodeFilter.SHOW_TEXT);
  let da = 0, nut;
  const r = document.createRange();
  while ((nut = di.nextNode())) {
    const d = nut.nodeValue.length;
    if (da + d >= n) {
      r.setStart(nut, Math.max(0, n - da));
      r.collapse(true);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      return;
    }
    da += d;
  }
  r.selectNodeContents(o);
  r.collapse(false);
  const s = window.getSelection();
  s.removeAllRanges();
  s.addRange(r);
}

/* ----------------------------------------------------------
   Hoàn tác / Làm lại

   Tự làm chứ không nhờ execCommand("undo"): mấy lệnh cỡ chữ, phông, màu
   ở dưới đều sửa thẳng cây DOM sau khi execCommand chạy xong, nên chồng
   hoàn tác sẵn có của trình duyệt không biết gì về những sửa đổi ấy —
   Ctrl+Z sẽ nhảy cóc qua chúng hoặc làm hỏng bài.

   Chụp nguyên innerHTML mỗi mốc. Bài dài nhất của Nhà hát cỡ vài chục
   nghìn ký tự, giữ 60 mốc vẫn chỉ vài MB trong bộ nhớ, không đáng lo.
   ---------------------------------------------------------- */
let lichSu = [], viTri = -1, hen = null;

function datMocDau() {
  lichSu = [{ html: oSoan().innerHTML, con: 0 }];
  viTri = 0;
  capNhatNutMoc();
}

function ghiMoc() {
  const html = oSoan().innerHTML;
  if (lichSu[viTri] && lichSu[viTri].html === html) return;
  lichSu.length = viTri + 1;            // đi nhánh mới thì bỏ phần làm lại
  lichSu.push({ html, con: viTriCon() });
  if (lichSu.length > MOC_TOI_DA) lichSu.shift();
  viTri = lichSu.length - 1;
  capNhatNutMoc();
}

/* Gõ chữ thì đợi ngừng tay 400ms mới ghi một mốc, không ghi từng phím:
   ghi từng phím thì Ctrl+Z xoá lùi từng chữ cái, bấm mỏi tay mới về
   được chỗ cần. */
function ghiMocCho() {
  clearTimeout(hen);
  hen = setTimeout(ghiMoc, 400);
}

function diMoc(buoc) {
  const m = viTri + buoc;
  if (m < 0 || m >= lichSu.length) return;
  viTri = m;
  oSoan().innerHTML = lichSu[m].html;
  oSoan().focus();
  datCon(lichSu[m].con);
  capNhatNutMoc();
  danhDauDoi();
  demChu();
}

function capNhatNutMoc() {
  const a = document.getElementById("sbHoanTac");
  const b = document.getElementById("sbLamLai");
  if (a) a.disabled = viTri <= 0;
  if (b) b.disabled = viTri >= lichSu.length - 1;
}

/* ----------------------------------------------------------
   Đặt lớp cỡ chữ / phông / màu lên vùng đang bôi đen

   Cách làm: nhờ execCommand("fontSize", 7) đánh dấu hộ. Trình duyệt tự
   lo phần khó nhất — cắt đúng vùng chọn ra khỏi các thẻ đang bao quanh,
   kể cả khi vùng chọn vắt qua nhiều đoạn — rồi bọc mỗi mảnh vào một thẻ
   <font size="7">. Mình chỉ việc thay mấy thẻ font đó bằng <span> mang
   lớp của mình. Tự cắt tay thì phải viết lại đúng phần logic ấy, dài và
   dễ sai.

   Cỡ 7 là cỡ lớn nhất execCommand nhận, chọn nó vì chắc chắn không trùng
   với thẻ font nào sẵn có trong bài.
   ---------------------------------------------------------- */
function goLopHo(el, ho) {
  (HO[ho] || []).forEach((c) => el.classList.remove(c));
}

/* Không bôi đen gì thì hiểu là áp cho cả đoạn đang đứng — cách này đoán
   đúng ý hơn là báo lỗi bắt bôi đen, vì phần lớn lúc người ta muốn đổi
   cỡ cả đoạn chứ không phải vài chữ. */
function chonCaKhoi() {
  const s = window.getSelection();
  if (!s || !s.rangeCount) return false;
  let el = s.getRangeAt(0).startContainer;
  if (el.nodeType === 3) el = el.parentNode;
  while (el && el !== oSoan() && !/^(P|H2|H3|H4|LI|BLOCKQUOTE|FIGCAPTION|TD|TH)$/.test(el.tagName)) el = el.parentNode;
  if (!el || el === oSoan()) el = oSoan();
  const r = document.createRange();
  r.selectNodeContents(el);
  s.removeAllRanges();
  s.addRange(r);
  return true;
}

function datLop(ho, lop) {
  const o = oSoan();
  o.focus();
  const s = window.getSelection();
  if (!s || !s.rangeCount || s.isCollapsed) {
    if (!chonCaKhoi()) { bao("Đặt con trỏ vào bài đã.", "loi"); return; }
  }
  if (!o.innerText.trim()) { bao("Chưa có chữ nào để định dạng.", "loi"); return; }

  document.execCommand("fontSize", false, "7");
  const dau = [...o.querySelectorAll('font[size="7"]')];
  if (!dau.length) return;

  dau.forEach((f) => {
    const sp = document.createElement("span");
    while (f.firstChild) sp.appendChild(f.firstChild);
    // lớp mới phủ lên cả vùng, nên lớp cùng họ nằm bên trong thành thừa
    sp.querySelectorAll("span").forEach((con) => goLopHo(con, ho));
    if (lop) sp.classList.add(lop);
    sp.setAttribute("data-moi", "1");   // để tìm lại sau khi dọn, xem gopSpan
    f.replaceWith(sp);
  });

  gopSpan(o);
  donSpan(o);

  const moi = [...o.querySelectorAll("[data-moi]")];
  moi.forEach((e) => e.removeAttribute("data-moi"));
  chonLaiDay(moi);
  ghiMoc();
  danhDauDoi();
  demChu();
}

/* Gộp span lồng span thành một.

   Mỗi lần đặt một thuộc tính là execCommand bọc thêm một lớp vỏ: chọn cỡ
   rồi phông rồi màu cho cùng một đoạn là ra ba tầng span lồng nhau. Hiện
   ra màn hình vẫn đúng — CSS kế thừa, thẻ trong cùng thắng — nhưng HTML
   lưu xuống thì rối, và mỗi lần người ta chỉnh lại là dày thêm một tầng.

   Chỉ gộp khi cha có đúng một con và con đó là span: lúc ấy hai thẻ phủ
   đúng cùng một đoạn chữ nên gộp không đổi nghĩa gì. Họ nào con đã có
   thì bỏ lớp của cha — con nằm gần chữ hơn nên vốn đang thắng. */
function gopSpan(goc) {
  const hoCua = (c) => Object.keys(HO).find((h) => HO[h].indexOf(c) >= 0);
  let doi = true;
  while (doi) {
    doi = false;
    [...goc.querySelectorAll("span")].forEach((cha) => {
      if (!cha.isConnected || cha.childNodes.length !== 1) return;
      const con = cha.firstElementChild;
      if (!con || con.tagName !== "SPAN") return;

      const lopCon = [...con.classList];
      const giu = [...cha.classList].filter((c) => {
        const h = hoCua(c);
        return !h || !lopCon.some((x) => HO[h].indexOf(x) >= 0);
      });
      con.className = giu.concat(lopCon).join(" ");
      if (cha.hasAttribute("data-moi")) con.setAttribute("data-moi", "1");
      cha.replaceWith(con);
      doi = true;
    });
  }
}

/* Bóc những span chẳng còn lớp nào — chúng chỉ là vỏ rỗng sau khi gỡ
   lớp cũ, để lại thì mỗi lần đổi cỡ chữ bài lại dày thêm một lớp thẻ. */
function donSpan(goc) {
  goc.querySelectorAll("span").forEach((sp) => {
    if (sp.getAttribute("class")) return;
    while (sp.firstChild) sp.parentNode.insertBefore(sp.firstChild, sp);
    sp.remove();
  });
}

/* Giữ nguyên vùng bôi đen sau khi đã thay thẻ, để bấm tiếp nút khác
   (đổi màu rồi đổi cỡ chẳng hạn) không phải bôi đen lại. */
function chonLaiDay(ds) {
  const con = ds.filter((e) => e.isConnected);
  if (!con.length) return;
  const r = document.createRange();
  r.setStartBefore(con[0]);
  r.setEndAfter(con[con.length - 1]);
  const s = window.getSelection();
  s.removeAllRanges();
  s.addRange(r);
}

/* ----------------------------------------------------------
   Căn lề

   Không dùng execCommand("justifyCenter"): nó đặt thuộc tính align=""
   hoặc bọc thêm <div align>, mà cả hai đều rụng ở bộ lọc lúc lưu — căn
   xong lưu lại là mất. Tự đặt lớp lên từng khối nằm trong vùng chọn.
   ---------------------------------------------------------- */
function khoiTrongVungChon() {
  const o = oSoan();
  const s = window.getSelection();
  const ds = [...o.querySelectorAll("p, h2, h3, h4, li, blockquote, figcaption")];
  if (!s || !s.rangeCount) return [];
  const r = s.getRangeAt(0);
  const trong = ds.filter((el) => r.intersectsNode(el));
  // con trỏ đang ở ô soạn trống hoặc ở đoạn chưa thành thẻ: căn cả ô
  return trong.length ? trong : (o.contains(r.startContainer) ? [o] : []);
}

function canLe(lop) {
  oSoan().focus();
  const ds = khoiTrongVungChon();
  if (!ds.length) { bao("Đặt con trỏ vào đoạn muốn căn đã.", "loi"); return; }
  ds.forEach((el) => {
    goLopHo(el, "can");
    if (lop) el.classList.add(lop);
  });
  ghiMoc();
  danhDauDoi();
}

/* ----------------------------------------------------------
   Thanh công cụ
   ---------------------------------------------------------- */
function lenh(ten, gia) {
  oSoan().focus();
  document.execCommand(ten, false, gia);
  ghiMoc();
  danhDauDoi();
  demChu();
}

/* Xoá định dạng phải gỡ cả lớp của mình: removeFormat chỉ biết mấy thẻ
   <b>/<i> chuẩn, span mang lớp thì nó để nguyên, bấm xong thấy chữ vẫn
   xanh đỏ như cũ. */
function xoaDinhDang() {
  oSoan().focus();
  const s = window.getSelection();
  if (s && s.rangeCount && !s.isCollapsed) {
    const r = s.getRangeAt(0);
    oSoan().querySelectorAll("span").forEach((sp) => {
      if (r.intersectsNode(sp)) sp.removeAttribute("class");
    });
    khoiTrongVungChon().forEach((el) => goLopHo(el, "can"));
  }
  document.execCommand("removeFormat", false, null);
  donSpan(oSoan());
  ghiMoc();
  danhDauDoi();
  demChu();
}

function ganSuKien() {
  /* styleWithCSS=false để execCommand sinh <b>/<i> thay vì <span style>.
     Thẻ style bị bộ lọc vứt lúc lưu, nên nếu để mặc định thì người dùng
     bôi đậm xong lưu lại là mất sạch định dạng. Nó cũng là thứ khiến
     fontSize sinh ra <font size="7"> — chỗ datLop() bám vào. */
  try { document.execCommand("styleWithCSS", false, false); } catch { /* trình duyệt cũ */ }

  document.querySelectorAll("#sbCongCu [data-lenh]").forEach((b) =>
    b.addEventListener("click", () => lenh(b.dataset.lenh)));

  document.querySelectorAll("#sbCongCu [data-khoi]").forEach((b) =>
    b.addEventListener("click", () => lenh("formatBlock", "<" + b.dataset.khoi + ">")));

  document.querySelectorAll("#sbCongCu [data-can]").forEach((b) =>
    b.addEventListener("click", () => canLe(b.dataset.can)));

  const oPhong = document.getElementById("sbPhong");
  oPhong.addEventListener("change", () => {
    if (oPhong.value) datLop("phong", oPhong.value === "__bo" ? "" : oPhong.value);
    oPhong.value = "";
  });

  const oCo = document.getElementById("sbCo");
  oCo.addEventListener("change", () => {
    if (oCo.value) datLop("co", oCo.value === "__bo" ? "" : oCo.value);
    oCo.value = "";
  });

  document.querySelectorAll(".sb-o-mau").forEach((b) =>
    b.addEventListener("click", () => {
      datLop(b.dataset.ho, b.dataset.lop);
      b.closest("details").open = false;
    }));

  document.getElementById("sbHoanTac").addEventListener("click", () => diMoc(-1));
  document.getElementById("sbLamLai").addEventListener("click", () => diMoc(1));
  document.getElementById("sbXoaDinhDang").addEventListener("click", xoaDinhDang);

  document.getElementById("sbLink").addEventListener("click", chenLink);
  document.getElementById("sbBoLink").addEventListener("click", () => lenh("unlink"));

  const tepAnh = document.getElementById("sbTepAnh");
  document.getElementById("sbAnh").addEventListener("click", () => tepAnh.click());
  tepAnh.addEventListener("change", () => chenAnh(tepAnh));

  const tepBia = document.getElementById("sbTepBia");
  document.getElementById("sbChonBia").addEventListener("click", () => tepBia.click());
  tepBia.addEventListener("change", () => taiAnhBia(tepBia));
  document.getElementById("sbBoBia").addEventListener("click", boAnhBia);

  document.getElementById("sbDoiChe").addEventListener("click", doiChe);

  if (che === "bao") {
    document.getElementById("sbNutLay").addEventListener("click", layTuBao);
    document.getElementById("sbUrl").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); layTuBao(); }
    });
  }

  oSoan().addEventListener("input", () => { ghiMocCho(); danhDauDoi(); demChu(); });
  than.addEventListener("input", danhDauDoi);
  than.addEventListener("change", danhDauDoi);

  document.getElementById("nutLuu").addEventListener("click", luu);
  document.getElementById("nutXemTruoc").addEventListener("click", xemTruoc);

  ganPhimTat();

  /* Đóng tab giữa chừng là mất bài. Chặn lại nếu có thay đổi chưa lưu. */
  window.addEventListener("beforeunload", (e) => {
    if (!daDoi) return;
    luuNhap();          // lưu nốt lần cuối trước khi trang đóng
    e.preventDefault();
    e.returnValue = "";
  });
}

/* ----------------------------------------------------------
   Phím tắt

   Ctrl+B và Ctrl+I trình duyệt vốn tự làm trong contenteditable, nhưng
   vẫn bắt lại: làm vậy chúng mới đi qua ghiMoc(), nếu không thì bôi đậm
   bằng phím tắt sẽ không nằm trong chồng hoàn tác của mình.
   ---------------------------------------------------------- */
function ganPhimTat() {
  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();

    if (k === "s") { e.preventDefault(); luu(); return; }

    // mấy phím dưới chỉ có nghĩa khi đang gõ trong ô soạn
    if (!oSoan() || !oSoan().contains(document.activeElement) && document.activeElement !== oSoan()) {
      if (k === "z" || k === "y") return;
    }

    if (k === "z" && !e.shiftKey) { e.preventDefault(); diMoc(-1); return; }
    if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); diMoc(1); return; }
    if (k === "b") { e.preventDefault(); lenh("bold"); return; }
    if (k === "i") { e.preventDefault(); lenh("italic"); return; }
  });
}

function danhDauDoi() {
  daDoi = true;
  document.getElementById("sbTrangThai").textContent = "Chưa lưu";
  henNhap();
}

/* ----------------------------------------------------------
   Đổi lối vào giữa chừng

   Giữ nguyên chữ đang viết, chỉ đổi mấy ô bên phải. Đổi sang tự soạn thì
   hỏi trước vì hai ô nguồn sẽ bị bỏ — mất công gõ mà không báo là bực.
   ---------------------------------------------------------- */
function doiChe() {
  const noiDungCu = oSoan().innerHTML;
  const giu = {
    tieuDe: document.getElementById("f-tieuDe").value,
    tomTat: document.getElementById("f-tomTat").value,
    ngay: document.getElementById("f-ngay").value,
    chuDe: document.getElementById("f-chuDe").value,
    anhNguon: document.getElementById("f-anhNguon").value,
    hienThi: document.getElementById("f-hienThi").checked
  };

  if (che === "bao") {
    const coNguon = (document.getElementById("f-nguonTen")?.value || "").trim() ||
                    (document.getElementById("f-nguonUrl")?.value || "").trim();
    if (coNguon && !confirm("Đổi sang tự soạn sẽ bỏ Tên nguồn và Đường dẫn bài gốc đã điền. Tiếp tục?")) return;
    che = "tu";
  } else {
    che = "bao";
  }
  if (!id) history.replaceState(null, "", "./soan-bai.html?che=" + che);

  const nguonTen = document.getElementById("f-nguonTen")?.value || "";
  const nguonUrl = document.getElementById("f-nguonUrl")?.value || "";

  /* ve() dựng lại từ biến bai, nên nhồi tạm những gì đang gõ dở vào đó —
     không thì đổi lối một cái là mất trắng bài đang viết. */
  bai = Object.assign({}, bai, giu, {
    noiDung: noiDungCu,
    nguonTen: che === "bao" ? nguonTen : "",
    nguonUrl: che === "bao" ? nguonUrl : ""
  });

  ve();
  ganSuKien();
  demChu();
  capNhatNutMoc();
  danhDauDoi();
  bao(che === "bao" ? "Đã chuyển sang biên soạn từ bài báo." : "Đã chuyển sang Nhà hát tự soạn.", "xong");
}

/* ----------------------------------------------------------
   Lưu nháp vào máy

   Chỉ nằm trong trình duyệt của chính người đang soạn, không lên mạng,
   không ai khác thấy. Cứu lấy bài khi đóng nhầm tab, mất điện, hay trình
   duyệt sập — những lúc đó chưa kịp bấm Lưu.

   Ảnh trong bài đã nằm trên Firebase từ lúc chèn nên nháp chỉ chứa
   đường dẫn, dung lượng rất nhẹ, không lo đầy bộ nhớ.
   ---------------------------------------------------------- */
const khoaNhap = () => "nhap-bai:" + (id || "moi");
let henNhapId = null;

function henNhap() {
  clearTimeout(henNhapId);
  henNhapId = setTimeout(luuNhap, NHAP_CHO);
}

function luuNhap() {
  if (!oSoan()) return;
  try {
    localStorage.setItem(khoaNhap(), JSON.stringify({
      che, luc: Date.now(), ...gomDuLieu(false)
    }));
    const el = document.getElementById("sbTrangThai");
    if (el && daDoi) el.textContent = "Chưa lưu · đã giữ nháp";
  } catch { /* hết chỗ hoặc trình duyệt chặn — không đáng làm hỏng việc đang làm */ }
}

function xoaNhap() {
  try { localStorage.removeItem(khoaNhap()); } catch { /* kệ */ }
}

function hoiNhap() {
  let n = null;
  try { n = JSON.parse(localStorage.getItem(khoaNhap()) || "null"); } catch { n = null; }
  if (!n || !n.luc) return;

  /* Nháp cũ hơn lần sửa gần nhất trên máy chủ thì bỏ đi: nghĩa là sau khi
     có nháp này, bài đã được lưu ở đâu đó (máy khác, tab khác) rồi. */
  const sua = bai?.suaLuc?.toDate ? bai.suaLuc.toDate().getTime() : 0;
  if (sua && n.luc <= sua) { xoaNhap(); return; }
  if (!id && !(n.tieuDe || "").trim() && !(n.noiDung || "").trim()) { xoaNhap(); return; }

  const luc = new Date(n.luc).toLocaleString("vi-VN");
  than.insertAdjacentHTML("afterbegin", `
    <div class="nhac nhac--tot sb-nhap" id="sbNhap">
      <div>
        <strong>Có bản nháp chưa lưu</strong> — giữ lúc ${esc(luc)}.
      </div>
      <div class="sb-nhap__nut">
        <button type="button" class="nut nut--nho nut--chinh" id="sbKhoiPhuc">Khôi phục</button>
        <button type="button" class="nut nut--nho" id="sbBoNhap">Bỏ nháp</button>
      </div>
    </div>`);

  document.getElementById("sbKhoiPhuc").addEventListener("click", () => {
    if (n.che && n.che !== che) { che = n.che; }
    bai = Object.assign({}, bai, n);
    ve();
    ganSuKien();
    demChu();
    datMocDau();
    danhDauDoi();
    bao("Đã khôi phục bản nháp.", "xong");
  });
  document.getElementById("sbBoNhap").addEventListener("click", () => {
    xoaNhap();
    document.getElementById("sbNhap").remove();
  });
}

/* ----------------------------------------------------------
   Đếm chữ
   ---------------------------------------------------------- */
function demChu() {
  const chu = (oSoan().innerText || "").trim();
  const so = chu ? chu.split(/\s+/).length : 0;
  const kyTu = chu.length;
  const anh = oSoan().querySelectorAll("img").length;
  document.getElementById("sbDem").textContent =
    `${so.toLocaleString("vi-VN")} chữ · ${kyTu.toLocaleString("vi-VN")} ký tự` + (anh ? ` · ${anh} ảnh` : "");
}

/* ----------------------------------------------------------
   Chèn liên kết và ảnh
   ---------------------------------------------------------- */
function chenLink() {
  const chon = window.getSelection();
  if (!chon || chon.isCollapsed) { bao("Bôi đen đoạn chữ muốn gắn liên kết đã.", "loi"); return; }
  const dc = prompt("Dán đường dẫn:", "https://");
  if (!dc) return;
  if (!/^https?:\/\//i.test(dc)) { bao("Đường dẫn phải bắt đầu bằng http:// hoặc https://", "loi"); return; }
  lenh("createLink", dc);
}

async function chenAnh(inp) {
  const tep = inp.files[0];
  inp.value = "";
  if (!tep) return;
  if (!kiemTep(tep)) return;

  bao("Đang tải ảnh lên…");
  try {
    const kq = await fb.taiAnhLen(tep, "tin-tuc");
    oSoan().focus();
    document.execCommand("insertHTML", false,
      `<figure><img src="${esc(kq.url)}" alt="" /><figcaption>Chú thích ảnh</figcaption></figure><p><br></p>`);
    ghiMoc();
    danhDauDoi();
    demChu();
    bao("Đã chèn ảnh.", "xong");
  } catch (e) {
    bao("Không tải được ảnh: " + (e.code || e.message), "loi");
  }
}

function kiemTep(tep) {
  if (!tep.type.startsWith("image/")) { bao("Tệp này không phải ảnh.", "loi"); return false; }
  if (tep.size > GIOI_HAN_MB * 1024 * 1024) {
    bao(`Ảnh nặng ${(tep.size / 1048576).toFixed(1)} MB, vượt mức ${GIOI_HAN_MB} MB.`, "loi");
    return false;
  }
  return true;
}

async function taiAnhBia(inp) {
  const tep = inp.files[0];
  inp.value = "";
  if (!tep || !kiemTep(tep)) return;
  bao("Đang tải ảnh lên…");
  try {
    anhBia = await fb.taiAnhLen(tep, "tin-tuc");
    document.getElementById("sbXemBia").innerHTML = `<img src="${esc(anhBia.url)}" alt="" />`;
    document.getElementById("sbBoBia").hidden = false;
    danhDauDoi();
    bao("Đã tải ảnh bìa.", "xong");
  } catch (e) {
    bao("Không tải được ảnh: " + (e.code || e.message), "loi");
  }
}

function boAnhBia() {
  anhBia = null;
  document.getElementById("sbXemBia").textContent = "Chưa có ảnh";
  document.getElementById("sbBoBia").hidden = true;
  danhDauDoi();
}

/* ----------------------------------------------------------
   Lấy bài từ link báo — thế thẳng vào ô soạn để sửa tiếp
   ---------------------------------------------------------- */
async function layTuBao() {
  const dc = document.getElementById("sbUrl").value.trim();
  if (!dc) { bao("Chưa dán đường dẫn.", "loi"); return; }

  const nut = document.getElementById("sbNutLay");
  const oKq = document.getElementById("sbKetQuaLay");
  nut.disabled = true;
  nut.textContent = "Đang đọc…";
  oKq.innerHTML = `<div class="dang-tai"><div class="xoay"></div>Đang đọc bài báo…</div>`;

  try {
    const r = await fetch("/api/lay-bai?html=1&url=" + encodeURIComponent(dc));
    const kq = await r.json();
    if (!r.ok) throw new Error(kq.loi || "Không đọc được bài.");

    const b = kq.html ? bocBai(kq.html, kq.goc || kq.nguonUrl || dc) : { html: "", anh: [], soChu: 0 };

    /* Đã có chữ trong ô soạn thì hỏi trước. Lấy về là thế đè toàn bộ,
       lỡ tay là mất bài đang viết dở. */
    if (oSoan().innerText.trim() && !confirm("Ô soạn đang có nội dung. Lấy bài mới về sẽ thay thế toàn bộ. Tiếp tục?")) {
      oKq.innerHTML = "";
      return;
    }

    dien("f-tieuDe", kq.tieuDe);
    dien("f-ngay", kq.ngay);
    dien("f-tomTat", kq.tomTat);
    dien("f-nguonTen", kq.nguonTen);
    dien("f-nguonUrl", kq.nguonUrl);
    if (kq.nguonTen && !document.getElementById("f-anhNguon").value) {
      document.getElementById("f-anhNguon").value = "Ảnh: " + kq.nguonTen;
    }

    let noiDung = b.html || "";
    const ds = (b.anh || []).slice(0, 20);
    let hong = 0;

    // ảnh bìa
    if (kq.anh) {
      oKq.innerHTML = `<div class="dang-tai"><div class="xoay"></div>Đang tải ảnh đại diện…</div>`;
      try {
        anhBia = await veKho(kq.anh, kq.nguonUrl);
        document.getElementById("sbXemBia").innerHTML = `<img src="${esc(anhBia.url)}" alt="" />`;
        document.getElementById("sbBoBia").hidden = false;
      } catch { bao("Không lấy được ảnh đại diện.", "loi"); }
    }

    // ảnh trong bài
    for (let i = 0; i < ds.length; i++) {
      oKq.innerHTML = `<div class="dang-tai"><div class="xoay"></div>Đang tải ảnh trong bài ${i + 1}/${ds.length}…</div>`;
      try {
        const a = await veKho(ds[i], kq.nguonUrl);
        noiDung = noiDung.split(ds[i]).join(a.url);
      } catch { hong++; }
    }

    if (hong) {
      const tam = document.createElement("div");
      tam.innerHTML = noiDung;
      tam.querySelectorAll("img").forEach((im) => {
        if (!/firebasestorage\.googleapis\.com/.test(im.getAttribute("src") || "")) im.remove();
      });
      noiDung = tam.innerHTML;
    }

    oSoan().innerHTML = noiDung;
    ghiMoc();
    danhDauDoi();
    demChu();

    oKq.innerHTML = b.soChu
      ? `<div class="nhac nhac--tot"><h3>Đã lấy về ${b.soChu.toLocaleString("vi-VN")} ký tự${ds.length ? `, ${ds.length - hong}/${ds.length} ảnh` : ""}</h3>
         <p>Đọc lại rồi sửa cho gọn. Nhớ chọn <strong>Chủ đề</strong> — máy không đoán được.</p></div>`
      : `<div class="nhac"><h3>Không bóc được toàn văn</h3>
         <p>Trang này dựng nội dung bằng JavaScript hoặc có cấu trúc lạ. Các ô khác vẫn điền rồi, phần nội dung bạn tự dán vào.</p></div>`;
    if (hong) bao(`${hong} ảnh trong bài không tải được, đã bỏ.`, "loi");
  } catch (e) {
    oKq.innerHTML = `<div class="nhac nhac--nguy"><h3>Không lấy được bài</h3><p>${esc(e.message)}</p></div>`;
  } finally {
    nut.disabled = false;
    nut.textContent = "Lấy về";
  }
}

function dien(id, gia) {
  if (!gia) return;
  const o = document.getElementById(id);
  if (o && !o.value) o.value = gia;
}

async function veKho(dc, tu) {
  const r = await fetch("/api/lay-anh?url=" + encodeURIComponent(dc) + "&tu=" + encodeURIComponent(tu || ""));
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).loi) || "lỗi " + r.status);
  const blob = await r.blob();
  const duoi = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  return fb.taiAnhLen(new File([blob], `bai-bao.${duoi}`, { type: blob.type }), "tin-tuc");
}

/* ----------------------------------------------------------
   Gom dữ liệu từ biểu mẫu

   loc=true là bản sắp ghi xuống Firestore, phải lọc HTML. loc=false là
   bản nháp giữ trong máy — giữ nguyên HTML thô để khôi phục lại đúng
   như lúc đang gõ dở.
   ---------------------------------------------------------- */
function gomDuLieu(loc) {
  const g = (x) => (document.getElementById(x)?.value || "").trim();
  const nguonUrl = che === "bao" ? g("f-nguonUrl") : "";
  return {
    tieuDe: g("f-tieuDe"),
    ngay: g("f-ngay"),
    chuDe: g("f-chuDe"),
    tomTat: g("f-tomTat"),
    noiDung: loc ? locHtml(oSoan().innerHTML, nguonUrl) : oSoan().innerHTML,
    anh: anhBia,
    anhNguon: g("f-anhNguon"),
    // lối tự soạn thì xoá hẳn hai ô nguồn, kể cả bài trước đó lấy từ báo
    nguonTen: che === "bao" ? g("f-nguonTen") : "",
    nguonUrl,
    hienThi: document.getElementById("f-hienThi").checked
  };
}

/* ----------------------------------------------------------
   Xem thử và Lưu
   ---------------------------------------------------------- */
function xemTruoc() {
  const w = window.open("", "_blank");
  if (!w) { bao("Trình duyệt chặn cửa sổ mới.", "loi"); return; }
  const d = gomDuLieu(true);
  w.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />
    <title>Xem thử</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Serif:wght@400;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
    <style>
      body{font-family:Montserrat,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;
           line-height:1.8;font-size:17.5px;color:#1c1a17}
      h1{font-family:"Playfair Display","Noto Serif",Montserrat,serif;font-size:36px;line-height:1.22}
      img{max-width:100%;height:auto;border-radius:10px;display:block;margin:10px 0}
      figcaption{font-size:14px;color:#6b6459;font-style:italic;text-align:center;margin-top:8px}
      blockquote{border-left:3px solid #ffcd00;margin:24px 0;padding-left:18px;color:#6b6459}
      .nguon{margin-top:40px;padding:18px 20px;border-left:3px solid #cc4752;background:#faf7f1}
      .tt{font-size:18px;font-weight:500;border-left:3px solid #ffcd00;padding-left:16px}
${cssKieu("")}
    </style></head><body>
    <h1>${esc(d.tieuDe)}</h1>
    <p class="tt">${esc(d.tomTat)}</p>
    ${anhBia?.url ? `<img src="${esc(anhBia.url)}" alt="" />` : ""}
    ${d.noiDung}
    ${d.nguonTen ? `<div class="nguon"><strong>Nguồn:</strong> ${esc(d.nguonTen)}</div>` : ""}
    </body></html>`);
  w.document.close();
}

async function luu() {
  const duLieu = gomDuLieu(true);

  // Bốn ô bắt buộc, đúng theo lược đồ
  let thieu = false;
  for (const ten of ["tieuDe", "ngay", "chuDe", "tomTat"]) {
    const o = document.querySelector(`[data-o="${ten}"]`);
    const trong = !duLieu[ten];
    o.classList.toggle("co-loi", trong);
    o.querySelector(".loi")?.remove();
    if (trong) {
      thieu = true;
      o.insertAdjacentHTML("beforeend", `<p class="loi">Bắt buộc điền.</p>`);
    }
  }
  if (thieu) {
    bao("Còn ô bắt buộc chưa điền.", "loi");
    document.querySelector(".co-loi")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const nut = document.getElementById("nutLuu");
  nut.disabled = true;
  nut.textContent = "Đang lưu…";
  try {
    const khoaCu = khoaNhap();
    if (id) await fb.capNhat(MUC, id, duLieu);
    else {
      const ref = await fb.themMoi(MUC, duLieu);
      id = ref.id;
      // đổi địa chỉ thành chế độ sửa, để bấm Lưu lần nữa không đẻ bài mới
      history.replaceState(null, "", `./soan-bai.html?id=${encodeURIComponent(id)}`);
      document.getElementById("sbTieuDeTrang").textContent = "Sửa bài viết";
    }
    daDoi = false;
    clearTimeout(henNhapId);
    try { localStorage.removeItem(khoaCu); } catch { /* kệ */ }
    xoaNhap();
    document.getElementById("sbTrangThai").textContent = "Đã lưu";
    bao("Đã lưu bài.", "xong");
  } catch (e) {
    bao(e.code === "permission-denied"
      ? "Luật Firestore chặn. Kiểm tra UID của bạn trong collection quan-tri."
      : "Lỗi: " + (e.code || e.message), "loi");
  } finally {
    nut.disabled = false;
    nut.textContent = "Lưu bài";
  }
}
