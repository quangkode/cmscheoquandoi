/* ==========================================================
   Bộ dựng giao diện quản trị.
   Toàn bộ màn hình danh sách và biểu mẫu đều sinh ra từ js/luoc-do.js
   — không có màn hình nào viết tay riêng cho một mục. Thêm mục mới =
   thêm một khối vào lược đồ, không đụng file này.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";
import { LUOC_DO, DANH_MUC } from "./luoc-do.js";

const chinh = document.getElementById("chinh");
const menu = document.getElementById("menu");
const khayBao = document.getElementById("khayBao");

/* ---------- Tiện ích ---------- */
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function bao(loi, kieu) {
  const el = document.createElement("div");
  el.className = "bao" + (kieu ? " bao--" + kieu : "");
  el.textContent = loi;
  khayBao.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* Firestore trả Timestamp chứ không phải Date; ngày tự nhập lại là chuỗi
   'YYYY-MM-DD'. Gom hai kiểu về một chỗ để mọi nơi hiển thị giống nhau. */
function ngayVN(v) {
  if (!v) return "";
  const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleDateString("vi-VN");
}
function ngayGioVN(v) {
  if (!v) return "";
  const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

const MAU_CHIP = { moi: "vang", "da-goi": "xam", "da-xac-nhan": "xanh", "da-huy": "do" };

function nhanCuaChon(truong, gia) {
  const c = (truong.chon || []).find((x) => x.gia === gia);
  return c ? c.nhan : gia;
}

/* ---------- Khởi động ---------- */
if (!daCauHinh) {
  chinh.innerHTML = `<div class="nhac"><h3>Chưa nối Firebase</h3>
    <p>Dán khối <code>firebaseConfig</code> vào <code>cau-hinh.js</code> rồi tải lại trang.</p></div>`;
} else {
  khoiDong().catch((e) => {
    chinh.innerHTML = `<div class="nhac"><h3>Không khởi động được</h3><p><code>${esc(e.message)}</code></p></div>`;
  });
}

let fb, nguoiDung;

async function khoiDong() {
  fb = await import("./firebase.js");
  nguoiDung = await fb.nguoiDungHienTai();
  if (!nguoiDung) { location.replace("./index.html"); return; }
  if (!(await fb.laQuanTri(nguoiDung.uid))) {
    await fb.dangXuat();
    location.replace("./index.html");
    return;
  }

  document.getElementById("tenNguoiDung").textContent = nguoiDung.email;
  document.getElementById("nutThoat").addEventListener("click", async () => {
    await fb.dangXuat();
    location.replace("./index.html");
  });

  dungMenu();
  window.addEventListener("hashchange", dinhTuyen);
  dinhTuyen();
  demDonMoi();
}

/* ---------- Menu bên ---------- */
function dungMenu() {
  menu.innerHTML =
    `<a href="#/" data-tuyen="/">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12l8-7 8 7M6 10v9h12v-9"/></svg>
       Tổng quan
     </a>` +
    DANH_MUC.map((ma) => {
      const m = LUOC_DO[ma];
      return `<a href="#/${ma}" data-tuyen="/${ma}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="${m.bieuTuong}"/></svg>
        ${esc(m.nhan)}${ma === "dat-cho" ? '<span class="ben__so" id="soDonMoi" hidden>0</span>' : ""}
      </a>`;
    }).join("");

  // menu trượt trên điện thoại
  const ben = document.getElementById("ben");
  const che = document.getElementById("manChe");
  const dong = () => { ben.classList.remove("dang-mo"); che.classList.remove("dang-mo"); };
  che.addEventListener("click", dong);
  menu.addEventListener("click", dong);
  window.moBen = () => { ben.classList.add("dang-mo"); che.classList.add("dang-mo"); };
}

function toSangMenu(tuyen) {
  menu.querySelectorAll("a").forEach((a) => a.classList.toggle("dang-mo", a.dataset.tuyen === tuyen));
}

/* ---------- Định tuyến ---------- */
function dinhTuyen() {
  const tuyen = (location.hash || "#/").slice(1);
  toSangMenu(tuyen);
  const ma = tuyen.replace(/^\//, "");
  if (!ma) return veTongQuan();
  if (LUOC_DO[ma]) return veDanhSach(ma);
  chinh.innerHTML = `<div class="trong"><h3>Không có mục này</h3><p>Đường dẫn <code>${esc(tuyen)}</code> không tồn tại.</p><a class="nut" href="#/">Về Tổng quan</a></div>`;
}

const nutMoBen = `<button type="button" class="mo-ben" onclick="moBen()" aria-label="Mở menu">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>`;

/* ---------- Màn Tổng quan ---------- */
async function veTongQuan() {
  chinh.innerHTML = `<div class="dang-tai"><div class="xoay"></div>Đang tải…</div>`;
  const dem = {};
  await Promise.all(
    DANH_MUC.map(async (ma) => {
      try { dem[ma] = (await fb.layDanhSach(ma)).length; } catch { dem[ma] = "—"; }
    })
  );

  const trong = DANH_MUC.filter((ma) => dem[ma] === 0 && ma !== "dat-cho");
  chinh.innerHTML = `
    <div class="dau">${nutMoBen}<div>
      <h1>Tổng quan</h1>
      <p>Sửa ở đây xong là trang web đổi ngay, không cần đăng lại.</p>
    </div></div>

    ${trong.length ? `<div class="nhac">
      <h3>Còn ${trong.length} mục chưa có dữ liệu</h3>
      <p>Trang web vẫn hiện nội dung tĩnh sẵn có, nên hiện tại không có gì hỏng.
         Mở <code>nap-du-lieu.html</code> để đưa nội dung đang có trên web vào đây một lần,
         khỏi phải gõ lại tay.</p>
    </div>` : ""}

    <div class="the-so">
      ${DANH_MUC.map((ma) => `<a class="the-so__o" href="#/${ma}">
        <strong>${dem[ma]}</strong><span>${esc(LUOC_DO[ma].nhan)}</span></a>`).join("")}
    </div>

    <div class="nhac" style="background:#f2f6f1;border-color:#cfe0cd;border-left-color:#2f7d4f">
      <h3>Ảnh tải lên ở đâu?</h3>
      <p>Mọi ảnh bạn chọn trong CMS được tải thẳng lên Firebase Storage rồi web lấy về.
         Không cần gửi ảnh cho ai, không cần đụng vào mã nguồn.</p>
    </div>`;
}

async function demDonMoi() {
  try {
    const ds = await fb.layDanhSach("dat-cho");
    const moi = ds.filter((d) => (d.trangThai || "moi") === "moi").length;
    const el = document.getElementById("soDonMoi");
    if (el && moi > 0) { el.textContent = moi; el.hidden = false; }
  } catch { /* chưa có collection hoặc chưa có quyền — không phải lỗi cần kêu */ }
}

/* ---------- Màn danh sách ---------- */
let boNghe = null;

function veDanhSach(ma) {
  const m = LUOC_DO[ma];
  chinh.innerHTML = `
    <div class="dau">${nutMoBen}<div>
      <h1>${esc(m.nhan)}</h1>
      <p>${esc(m.moTa)}</p>
    </div>
    <div class="dau__phai">
      ${m.chiDoc ? "" : `<button type="button" class="nut nut--chinh" id="nutThem">+ Thêm mới</button>`}
    </div></div>

    <div class="thanh-loc">
      <input type="search" id="oTim" placeholder="Tìm trong ${esc(m.nhan.toLowerCase())}…" />
    </div>

    <div class="bang-bao" id="khungBang">
      <div class="dang-tai"><div class="xoay"></div>Đang tải…</div>
    </div>`;

  if (!m.chiDoc) document.getElementById("nutThem").addEventListener("click", () => moBieuMau(ma, null));

  let duLieu = [];
  const ve = () => {
    const tim = (document.getElementById("oTim").value || "").trim().toLowerCase();
    const loc = tim
      ? duLieu.filter((d) => JSON.stringify(Object.values(d)).toLowerCase().includes(tim))
      : duLieu;
    veBang(ma, loc, duLieu.length);
  };
  document.getElementById("oTim").addEventListener("input", ve);

  // onSnapshot: hai người cùng sửa thì bảng của cả hai tự cập nhật
  if (boNghe) boNghe();
  boNghe = fb.ngheDanhSach(ma, m.sapXep, (ds) => { duLieu = ds; ve(); }, (err) => {
    document.getElementById("khungBang").innerHTML =
      `<div class="trong"><h3>Không đọc được dữ liệu</h3>
       <p>${esc(err.code === "permission-denied"
          ? "Luật Firestore đang chặn. Kiểm tra đã đăng firestore.rules và đã thêm UID của bạn vào collection quan-tri chưa."
          : err.message)}</p></div>`;
  });
}

function veBang(ma, ds, tong) {
  const m = LUOC_DO[ma];
  const khung = document.getElementById("khungBang");
  if (!khung) return;

  if (!ds.length) {
    khung.innerHTML = `<div class="trong">
      <h3>${tong ? "Không tìm thấy" : "Chưa có gì ở đây"}</h3>
      <p>${tong
        ? "Thử từ khoá khác."
        : m.chiDoc
          ? "Đơn đặt chỗ sẽ tự hiện ở đây khi có người giữ chỗ trên web."
          : "Bấm “Thêm mới” để tạo mục đầu tiên."}</p>
    </div>`;
    return;
  }

  khung.innerHTML = `<table>
    <thead><tr>${m.cot.map((c) => `<th>${esc(c.nhan)}</th>`).join("")}<th></th></tr></thead>
    <tbody>${ds.map((d) => `<tr>${m.cot.map((c) => oBang(m, c, d)).join("")}
      <td class="o-thao-tac">
        <button type="button" class="nut nut--nho" data-sua="${esc(d.id)}">${m.chiDoc ? "Xem" : "Sửa"}</button>
        ${m.chiDoc ? "" : `<button type="button" class="nut nut--nho nut--nguy" data-xoa="${esc(d.id)}">Xoá</button>`}
      </td></tr>`).join("")}</tbody>
  </table>`;

  khung.querySelectorAll("[data-sua]").forEach((b) =>
    b.addEventListener("click", () => moBieuMau(ma, ds.find((x) => x.id === b.dataset.sua))));
  khung.querySelectorAll("[data-xoa]").forEach((b) =>
    b.addEventListener("click", () => hoiXoa(ma, ds.find((x) => x.id === b.dataset.xoa))));
}

function oBang(m, c, d) {
  const gia = d[c.truong];
  if (c.kieu === "anh") {
    return `<td class="o-anh">${gia?.url
      ? `<img src="${esc(gia.url)}" alt="" loading="lazy" />`
      : `<span class="khong-anh">—</span>`}</td>`;
  }
  if (c.kieu === "cong-tac") {
    return `<td><span class="chip chip--${gia === false ? "xam" : "xanh"}">${gia === false ? "Ẩn" : "Hiện"}</span></td>`;
  }
  if (c.kieu === "ngay") return `<td>${esc(ngayVN(gia))}</td>`;
  if (c.truong === "trangThai") {
    const t = LUOC_DO["dat-cho"].truong.find((x) => x.ten === "trangThai");
    return `<td><span class="chip chip--${MAU_CHIP[gia || "moi"] || "xam"}">${esc(nhanCuaChon(t, gia || "moi"))}</span></td>`;
  }
  // cột có thể trỏ vào một trường dạng chọn — hiện nhãn tiếng Việt chứ không phải mã
  const truong = m.truong.find((t) => t.ten === c.truong);
  const chu = truong?.chon ? nhanCuaChon(truong, gia) : gia;
  return `<td>${esc(chu ?? "")}</td>`;
}

/* ---------- Hộp thoại xoá ---------- */
function hoiXoa(ma, d) {
  const ten = d.tieuDe || d.hoTen || d.ten || d.tenVo || d.chuThich || d.id;
  moHop({
    tieuDe: "Xoá mục này?",
    hep: true,
    than: `<p>Sắp xoá <strong>${esc(ten)}</strong>.</p>
           <p style="color:#6b6459;font-size:14px">Xoá xong không lấy lại được, và trang web sẽ mất mục này ngay lập tức.</p>`,
    nutChinh: "Xoá",
    lopNutChinh: "nut--nguy",
    khiXacNhan: async () => {
      // xoá ảnh trước: xoá bản ghi trước rồi lỗi giữa chừng là ảnh nằm lại
      // trong Storage vĩnh viễn, không còn đường nào tìm ra để dọn
      for (const t of LUOC_DO[ma].truong.filter((t) => t.kieu === "anh")) {
        if (d[t.ten]?.duongDan) await fb.xoaAnh(d[t.ten].duongDan);
      }
      await fb.xoaBo(ma, d.id);
      bao("Đã xoá.", "xong");
    }
  });
}

/* ---------- Biểu mẫu thêm/sửa ---------- */
function moBieuMau(ma, d) {
  const m = LUOC_DO[ma];
  const laSua = !!d;
  const anhDaChon = {};   // { tenTruong: {url, duongDan} } cho ảnh vừa tải lên

  const chiXem = (m.chiXem || []).map((f) => `<dt>${esc(f.nhan)}</dt><dd>${esc(d?.[f.ten] ?? "—")}</dd>`).join("");

  moHop({
    tieuDe: (laSua ? (m.chiDoc ? "Chi tiết " : "Sửa ") : "Thêm ") + m.nhan.toLowerCase(),
    than:
      (chiXem ? `<div class="chi-xem"><dl>${chiXem}
         ${d?.taoLuc ? `<dt>Gửi lúc</dt><dd>${esc(ngayGioVN(d.taoLuc))}</dd>` : ""}</dl></div>` : "") +
      `<form id="bmChinh" novalidate>${m.truong.map((t) => veTruong(t, d)).join("")}</form>`,
    nutChinh: laSua ? "Lưu thay đổi" : "Tạo mới",
    khiMo: (hop) => ganTaiAnh(hop, m, d, anhDaChon),
    khiXacNhan: async () => {
      const bm = document.getElementById("bmChinh");
      const duLieu = {};
      let hopLe = true;

      for (const t of m.truong) {
        const o = bm.querySelector(`[name="${t.ten}"]`);
        let gia;
        if (t.kieu === "anh") gia = anhDaChon[t.ten] ?? d?.[t.ten] ?? null;
        else if (t.kieu === "cong-tac") gia = o.checked;
        else if (t.kieu === "so") gia = o.value === "" ? null : Number(o.value);
        else gia = o.value.trim();

        const oNhap = bm.querySelector(`[data-o="${t.ten}"]`);
        const thieu = t.batBuoc && (gia === null || gia === "" || gia === undefined);
        oNhap.classList.toggle("co-loi", !!thieu);
        const elLoi = oNhap.querySelector(".loi");
        if (elLoi) elLoi.remove();
        if (thieu) {
          hopLe = false;
          oNhap.insertAdjacentHTML("beforeend", `<p class="loi">Bắt buộc điền.</p>`);
        }
        duLieu[t.ten] = gia;
      }
      if (!hopLe) { bao("Còn ô bắt buộc chưa điền.", "loi"); return false; }

      if (laSua) await fb.capNhat(ma, d.id, duLieu);
      else await fb.themMoi(ma, duLieu);
      bao(laSua ? "Đã lưu." : "Đã tạo mới.", "xong");
    }
  });
}

function veTruong(t, d) {
  const gia = d?.[t.ten] ?? t.macDinh ?? (t.kieu === "cong-tac" ? false : "");
  const nhan = `<label for="f-${t.ten}">${esc(t.nhan)}${t.batBuoc ? ' <span class="bat-buoc">*</span>' : ""}</label>`;
  const goiY = t.goiY ? `<p class="goi-y">${esc(t.goiY)}</p>` : "";
  const mo = `<div class="o-nhap" data-o="${t.ten}">`;

  switch (t.kieu) {
    case "dai":
      return `${mo}${nhan}<textarea id="f-${t.ten}" name="${t.ten}">${esc(gia)}</textarea>${goiY}</div>`;
    case "chon":
      return `${mo}${nhan}<select id="f-${t.ten}" name="${t.ten}">
        <option value="">— chọn —</option>
        ${t.chon.map((c) => `<option value="${esc(c.gia)}"${c.gia === gia ? " selected" : ""}>${esc(c.nhan)}</option>`).join("")}
      </select>${goiY}</div>`;
    case "cong-tac":
      return `${mo}<label class="cong-tac"><input type="checkbox" id="f-${t.ten}" name="${t.ten}"${gia ? " checked" : ""} />
        <span>${esc(t.nhan)}</span></label>${goiY}</div>`;
    case "anh":
      return `${mo}${nhan}
        <div class="o-anh-tai">
          <div class="o-anh-tai__xem" data-xem="${t.ten}">${gia?.url ? `<img src="${esc(gia.url)}" alt="" />` : "Chưa có ảnh"}</div>
          <div class="o-anh-tai__nut">
            <input type="file" accept="image/*" data-tep="${t.ten}" id="tep-${t.ten}" />
            <button type="button" class="nut nut--nho" data-chon="${t.ten}">Chọn ảnh…</button>
            <button type="button" class="nut nut--nho" data-bo="${t.ten}"${gia?.url ? "" : " hidden"}>Bỏ ảnh</button>
            <span class="goi-y" data-tt="${t.ten}"></span>
          </div>
        </div>${goiY}</div>`;
    case "so":
      return `${mo}${nhan}<input type="number" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
    case "ngay":
      return `${mo}${nhan}<input type="date" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
    case "gio":
      return `${mo}${nhan}<input type="time" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
    case "url":
      return `${mo}${nhan}<input type="url" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" placeholder="https://…" />${goiY}</div>`;
    default:
      return `${mo}${nhan}<input type="text" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
  }
}

const GIOI_HAN_MB = 5;

function ganTaiAnh(hop, m, d, anhDaChon) {
  hop.querySelectorAll("[data-chon]").forEach((b) =>
    b.addEventListener("click", () => hop.querySelector(`[data-tep="${b.dataset.chon}"]`).click()));

  hop.querySelectorAll("[data-bo]").forEach((b) =>
    b.addEventListener("click", () => {
      const ten = b.dataset.bo;
      anhDaChon[ten] = null;
      hop.querySelector(`[data-xem="${ten}"]`).innerHTML = "Chưa có ảnh";
      b.hidden = true;
    }));

  hop.querySelectorAll("[data-tep]").forEach((inp) =>
    inp.addEventListener("change", async () => {
      const tep = inp.files[0];
      if (!tep) return;
      const ten = inp.dataset.tep;
      const tt = hop.querySelector(`[data-tt="${ten}"]`);
      const truong = m.truong.find((t) => t.ten === ten);

      if (!tep.type.startsWith("image/")) { bao("Tệp này không phải ảnh.", "loi"); inp.value = ""; return; }
      if (tep.size > GIOI_HAN_MB * 1024 * 1024) {
        bao(`Ảnh nặng ${(tep.size / 1048576).toFixed(1)} MB, vượt mức ${GIOI_HAN_MB} MB. Nén bớt rồi tải lại.`, "loi");
        inp.value = "";
        return;
      }

      tt.textContent = "Đang tải lên…";
      try {
        const kq = await fb.taiAnhLen(tep, truong.thuMuc || "khac");
        anhDaChon[ten] = kq;
        hop.querySelector(`[data-xem="${ten}"]`).innerHTML = `<img src="${esc(kq.url)}" alt="" />`;
        hop.querySelector(`[data-bo="${ten}"]`).hidden = false;
        tt.textContent = "Đã tải lên";
      } catch (e) {
        tt.textContent = "";
        bao("Không tải được ảnh: " + (e.code || e.message), "loi");
      }
      inp.value = "";
    }));
}

/* ---------- Hộp thoại dùng chung ---------- */
function moHop({ tieuDe, than, nutChinh, lopNutChinh, khiXacNhan, khiMo, hep }) {
  const phu = document.createElement("div");
  phu.className = "lop-phu";
  phu.innerHTML = `<div class="hop${hep ? " hop--hep" : ""}" role="dialog" aria-modal="true" aria-label="${esc(tieuDe)}">
      <div class="hop__dau"><h2>${esc(tieuDe)}</h2></div>
      <div class="hop__than">${than}</div>
      <div class="hop__chan">
        <button type="button" class="nut" data-huy>Huỷ</button>
        ${nutChinh ? `<button type="button" class="nut ${lopNutChinh || "nut--chinh"}" data-ok>${esc(nutChinh)}</button>` : ""}
      </div>
    </div>`;
  document.body.appendChild(phu);
  requestAnimationFrame(() => phu.classList.add("dang-mo"));

  const dong = () => { phu.classList.remove("dang-mo"); setTimeout(() => phu.remove(), 200); document.removeEventListener("keydown", phim); };
  const phim = (e) => { if (e.key === "Escape") dong(); };
  document.addEventListener("keydown", phim);

  phu.querySelector("[data-huy]").addEventListener("click", dong);
  phu.addEventListener("click", (e) => { if (e.target === phu) dong(); });

  const ok = phu.querySelector("[data-ok]");
  if (ok) {
    ok.addEventListener("click", async () => {
      ok.disabled = true;
      const chuGoc = ok.textContent;
      ok.textContent = "Đang lưu…";
      try {
        // trả về false = biểu mẫu chưa hợp lệ, giữ hộp thoại lại cho sửa
        if ((await khiXacNhan()) !== false) dong();
      } catch (e) {
        bao(e.code === "permission-denied"
          ? "Luật Firestore chặn thao tác này. Kiểm tra UID của bạn đã có trong collection quan-tri chưa."
          : "Lỗi: " + (e.code || e.message), "loi");
      } finally {
        ok.disabled = false;
        ok.textContent = chuGoc;
      }
    });
  }

  if (khiMo) khiMo(phu);
  phu.querySelector("input, select, textarea, button")?.focus();
}
