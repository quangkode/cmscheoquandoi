/* ==========================================================
   Trang soạn bài viết — soan-bai.html

   Mở trong tab riêng chứ không phải hộp thoại: viết một bài báo dài cần
   cả màn hình, mà hộp thoại thì cuộn trong khung nhỏ, gõ được vài dòng
   là mỏi. Không id = viết bài mới, ?id=... = sửa bài đã có.

   Ô soạn thảo dùng contenteditable + document.execCommand. execCommand
   tuy đã bị đánh dấu lỗi thời nhưng vẫn chạy ở mọi trình duyệt hiện
   hành, và nó là cách duy nhất làm được thanh công cụ định dạng mà
   không phải kéo cả một thư viện soạn thảo về — dự án này cố ý không
   dùng npm, không có bước build.

   Mọi thứ gõ hay dán vào đây đều được lọc lại lúc lưu (locHtml), nên
   người dùng có dán từ Word hay từ trang khác cũng không mang rác vào.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";
import { LUOC_DO } from "./luoc-do.js";
import { bocBai, locHtml } from "./doc-bai.js";

const than = document.getElementById("sbThan");
const khayBao = document.getElementById("khayBao");
const MUC = "tin-tuc";
const GIOI_HAN_MB = 5;

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function bao(t, k) {
  const el = document.createElement("div");
  el.className = "bao" + (k ? " bao--" + k : "");
  el.textContent = t;
  khayBao.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

let fb, bai = null, id = null, anhBia = null, daDoi = false;

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

  id = new URLSearchParams(location.search).get("id");
  if (id) {
    bai = await fb.layMot(MUC, id);
    if (!bai) { than.innerHTML = `<div class="nhac nhac--nguy"><h3>Không tìm thấy bài</h3></div>`; return; }
    document.getElementById("sbTieuDeTrang").textContent = "Sửa bài viết";
  }
  anhBia = bai?.anh ?? null;

  ve();
  ganSuKien();
  demChu();
}

/* ----------------------------------------------------------
   Dựng giao diện
   ---------------------------------------------------------- */
function ve() {
  const t = (ten) => bai?.[ten] ?? "";
  const chuDe = LUOC_DO[MUC].truong.find((x) => x.ten === "chuDe");

  than.innerHTML = `
    <!-- Dán link bài báo: chỉ một dòng, nằm trên cùng cho dễ thấy -->
    <div class="sb-lay">
      <input type="url" id="sbUrl" placeholder="Dán link bài báo để lấy toàn bộ chữ và ảnh về đây…" />
      <button type="button" class="nut" id="sbNutLay">Lấy về</button>
    </div>
    <div id="sbKetQuaLay"></div>

    <div class="sb-luoi">
      <div class="sb-chinh">
        <div class="o-nhap" data-o="tieuDe">
          <label for="f-tieuDe">Tiêu đề <span class="bat-buoc">*</span></label>
          <input type="text" id="f-tieuDe" class="sb-tieude" value="${esc(t("tieuDe"))}" placeholder="Tiêu đề bài viết" />
        </div>

        <div class="o-nhap" data-o="tomTat">
          <label for="f-tomTat">Tóm tắt <span class="bat-buoc">*</span></label>
          <textarea id="f-tomTat" rows="3" placeholder="2-4 câu, hiện dưới tiêu đề trong thẻ tin.">${esc(t("tomTat"))}</textarea>
        </div>

        <div class="o-nhap" data-o="noiDung">
          <label>Nội dung bài</label>

          <div class="sb-cong-cu" id="sbCongCu">
            <button type="button" data-lenh="bold" title="Đậm (Ctrl+B)"><b>B</b></button>
            <button type="button" data-lenh="italic" title="Nghiêng (Ctrl+I)"><i>I</i></button>
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
            <button type="button" data-lenh="removeFormat" title="Xoá định dạng">Tx</button>
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
          <input type="text" id="f-anhNguon" value="${esc(t("anhNguon"))}" placeholder="Ảnh: Báo Quân đội nhân dân" />
        </div>

        <div class="o-nhap" data-o="nguonTen">
          <label for="f-nguonTen">Tên nguồn</label>
          <input type="text" id="f-nguonTen" value="${esc(t("nguonTen"))}" placeholder="Báo Nhân Dân" />
        </div>

        <div class="o-nhap" data-o="nguonUrl">
          <label for="f-nguonUrl">Đường dẫn bài gốc</label>
          <input type="url" id="f-nguonUrl" value="${esc(t("nguonUrl"))}" placeholder="https://…" />
        </div>

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
   Thanh công cụ
   ---------------------------------------------------------- */
const oSoan = () => document.getElementById("f-noiDung");

function lenh(ten, gia) {
  oSoan().focus();
  document.execCommand(ten, false, gia);
  danhDauDoi();
  demChu();
}

function ganSuKien() {
  /* styleWithCSS=false để execCommand sinh <b>/<i> thay vì <span style>.
     Thẻ span và thuộc tính style đều bị bộ lọc vứt lúc lưu, nên nếu để
     mặc định thì người dùng bôi đậm xong lưu lại là mất sạch định dạng. */
  try { document.execCommand("styleWithCSS", false, false); } catch { /* trình duyệt cũ */ }

  document.querySelectorAll("#sbCongCu [data-lenh]").forEach((b) =>
    b.addEventListener("click", () => lenh(b.dataset.lenh)));

  document.querySelectorAll("#sbCongCu [data-khoi]").forEach((b) =>
    b.addEventListener("click", () => lenh("formatBlock", "<" + b.dataset.khoi + ">")));

  document.getElementById("sbLink").addEventListener("click", chenLink);
  document.getElementById("sbBoLink").addEventListener("click", () => lenh("unlink"));

  const tepAnh = document.getElementById("sbTepAnh");
  document.getElementById("sbAnh").addEventListener("click", () => tepAnh.click());
  tepAnh.addEventListener("change", () => chenAnh(tepAnh));

  const tepBia = document.getElementById("sbTepBia");
  document.getElementById("sbChonBia").addEventListener("click", () => tepBia.click());
  tepBia.addEventListener("change", () => taiAnhBia(tepBia));
  document.getElementById("sbBoBia").addEventListener("click", boAnhBia);

  document.getElementById("sbNutLay").addEventListener("click", layTuBao);
  document.getElementById("sbUrl").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); layTuBao(); }
  });

  oSoan().addEventListener("input", () => { danhDauDoi(); demChu(); });
  than.addEventListener("input", danhDauDoi);
  than.addEventListener("change", danhDauDoi);

  document.getElementById("nutLuu").addEventListener("click", luu);
  document.getElementById("nutXemTruoc").addEventListener("click", xemTruoc);

  /* Đóng tab giữa chừng là mất bài. Chặn lại nếu có thay đổi chưa lưu. */
  window.addEventListener("beforeunload", (e) => {
    if (!daDoi) return;
    e.preventDefault();
    e.returnValue = "";
  });
}

function danhDauDoi() {
  daDoi = true;
  document.getElementById("sbTrangThai").textContent = "Chưa lưu";
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
   Xem thử và Lưu
   ---------------------------------------------------------- */
function xemTruoc() {
  const w = window.open("", "_blank");
  if (!w) { bao("Trình duyệt chặn cửa sổ mới.", "loi"); return; }
  const nguonTen = document.getElementById("f-nguonTen").value.trim();
  const nguonUrl = document.getElementById("f-nguonUrl").value.trim();
  w.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />
    <title>Xem thử</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
    <style>
      body{font-family:Montserrat,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;
           line-height:1.8;font-size:17.5px;color:#1c1a17}
      h1{font-family:"Playfair Display",Georgia,serif;font-size:36px;line-height:1.22}
      img{max-width:100%;height:auto;border-radius:10px;display:block;margin:10px 0}
      figcaption{font-size:14px;color:#6b6459;font-style:italic;text-align:center;margin-top:8px}
      blockquote{border-left:3px solid #ffcd00;margin:24px 0;padding-left:18px;color:#6b6459}
      .nguon{margin-top:40px;padding:18px 20px;border-left:3px solid #cc4752;background:#faf7f1}
      .tt{font-size:18px;font-weight:500;border-left:3px solid #ffcd00;padding-left:16px}
    </style></head><body>
    <h1>${esc(document.getElementById("f-tieuDe").value)}</h1>
    <p class="tt">${esc(document.getElementById("f-tomTat").value)}</p>
    ${anhBia?.url ? `<img src="${esc(anhBia.url)}" alt="" />` : ""}
    ${locHtml(oSoan().innerHTML, nguonUrl)}
    ${nguonTen || nguonUrl ? `<div class="nguon"><strong>Nguồn:</strong>
      ${nguonUrl ? `<a href="${esc(nguonUrl)}" target="_blank" rel="noopener">${esc(nguonTen || nguonUrl)}</a>` : esc(nguonTen)}</div>` : ""}
    </body></html>`);
  w.document.close();
}

async function luu() {
  const g = (id) => document.getElementById(id).value.trim();

  const duLieu = {
    tieuDe: g("f-tieuDe"),
    ngay: g("f-ngay"),
    chuDe: g("f-chuDe"),
    tomTat: g("f-tomTat"),
    noiDung: locHtml(oSoan().innerHTML, g("f-nguonUrl")),
    anh: anhBia,
    anhNguon: g("f-anhNguon"),
    nguonTen: g("f-nguonTen"),
    nguonUrl: g("f-nguonUrl"),
    hienThi: document.getElementById("f-hienThi").checked
  };

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
    if (id) await fb.capNhat(MUC, id, duLieu);
    else {
      const ref = await fb.themMoi(MUC, duLieu);
      id = ref.id;
      // đổi địa chỉ thành chế độ sửa, để bấm Lưu lần nữa không đẻ bài mới
      history.replaceState(null, "", `./soan-bai.html?id=${encodeURIComponent(id)}`);
      document.getElementById("sbTieuDeTrang").textContent = "Sửa bài viết";
    }
    daDoi = false;
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
