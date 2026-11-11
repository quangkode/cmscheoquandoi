/* ==========================================================
   Bộ dựng giao diện quản trị.
   Toàn bộ màn hình danh sách và biểu mẫu đều sinh ra từ js/luoc-do.js
   — không có màn hình nào viết tay riêng cho một mục. Thêm mục mới =
   thêm một khối vào lược đồ, không đụng file này.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";
import { LUOC_DO, DANH_MUC } from "./luoc-do.js";
import { TRANG_WEB } from "../cau-hinh.js";
import { xuatXlsx, soanNhap } from "./xuat-nhap.js";
import { bocBai, locHtml } from "./doc-bai.js";

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

/* Đưa mọi kiểu ngày về 'YYYY-MM-DD' để so với ô <input type="date">.
   Chuỗi sẵn dạng đó thì trả nguyên — KHÔNG đi qua new Date(), vì
   new Date('2026-09-15') hiểu là nửa đêm giờ UTC, ở múi giờ Việt Nam
   đổi ngược ra lại thành 14/9. Với Timestamp của Firestore thì lấy
   từng phần ngày theo giờ máy, cũng vì lý do đó: đơn gửi lúc 2h sáng
   giờ Hà Nội mà dùng toISOString sẽ bị tính sang hôm trước. */
function ngayISO(v) {
  if (!v) return "";
  if (typeof v === "string") return /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : "";
  const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
    </div>
    <div class="dau__phai">
      <a class="nut" href="./nap-du-lieu.html">Nạp dữ liệu</a>
    </div></div>

    ${trong.length ? `<div class="nhac">
      <h3>Còn ${trong.length} mục chưa có dữ liệu</h3>
      <p><a class="nut nut--nho nut--chinh" href="./nap-du-lieu.html">Nạp dữ liệu vào ${trong.length} mục này</a></p>
    </div>` : ""}

    <div class="the-so">
      ${DANH_MUC.map((ma) => `<a class="the-so__o" href="#/${ma}">
        <strong>${dem[ma]}</strong><span>${esc(LUOC_DO[ma].nhan)}</span></a>`).join("")}
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

/* ---------- Bộ lọc ----------
   Sinh thẳng từ lược đồ, không khai báo riêng cho từng mục: trường nào
   kiểu "chon" thì thành ô chọn, "cong-tac" thành Có/Không, "ngay" thành
   khoảng từ–đến. Thêm một trường mới vào luoc-do.js là có lọc theo nó
   ngay, khỏi đụng file này.

   Mục nào muốn lọc theo một trường KHÔNG nằm trong truong[] — ví dụ
   Đơn đặt chỗ lọc theo taoLuc, thứ Firestore tự ghi — thì khai locNgay. */
function dsLoc(m) {
  const ds = [];
  for (const t of m.truong || []) {
    if (t.kieu === "chon") ds.push({ loai: "chon", truong: t.ten, nhan: t.nhan, chon: t.chon });
    else if (t.kieu === "cong-tac") ds.push({ loai: "co", truong: t.ten, nhan: t.nhan });
    else if (t.kieu === "ngay") ds.push({ loai: "ngay", truong: t.ten, nhan: t.nhan });
  }
  if (m.locNgay) ds.push({ loai: "ngay", truong: m.locNgay.truong, nhan: m.locNgay.nhan });
  // xếp cùng một trật tự ở mọi mục để mắt quen chỗ, khỏi phải dò lại
  const uu = { chon: 0, ngay: 1, co: 2 };
  return ds.sort((a, b) => uu[a.loai] - uu[b.loai]);
}

function dungThanhLoc(m) {
  const o = dsLoc(m).map((f) => {
    if (f.loai === "chon") {
      return `<select data-loc="chon" data-truong="${esc(f.truong)}" aria-label="${esc(f.nhan)}">
        <option value="">${esc(f.nhan)}: tất cả</option>
        ${f.chon.map((c) => `<option value="${esc(c.gia)}">${esc(c.nhan)}</option>`).join("")}
      </select>`;
    }
    if (f.loai === "co") {
      /* Cố ý dùng Có/Không chứ không phải Hiện/Ẩn: nhãn của trường này khác
         nhau tuỳ mục ("Hiện trên web", "Nhận đặt chỗ"), ghép với Có/Không
         thì câu nào cũng xuôi. */
      return `<select data-loc="co" data-truong="${esc(f.truong)}" aria-label="${esc(f.nhan)}">
        <option value="">${esc(f.nhan)}: tất cả</option>
        <option value="1">Có</option><option value="0">Không</option>
      </select>`;
    }
    return `<span class="loc-ngay">
      <input type="date" data-loc="tu" data-truong="${esc(f.truong)}" title="${esc(f.nhan)} từ ngày" aria-label="${esc(f.nhan)} từ ngày" />
      <span aria-hidden="true">→</span>
      <input type="date" data-loc="den" data-truong="${esc(f.truong)}" title="${esc(f.nhan)} đến ngày" aria-label="${esc(f.nhan)} đến ngày" />
    </span>`;
  }).join("");

  /* Nút lọc nhanh: mấy bộ lọc dùng đi dùng lại hằng ngày, khai trong lược đồ
     để mỗi mục tự chọn cái hợp với mình. Bấm lần nữa là bỏ. */
  const nhanh = (m.locNhanh || [])
    .map((p, i) => `<button type="button" class="chip-loc" data-nhanh="${i}">${esc(p.nhan)}</button>`)
    .join("");

  /* Chia hai nhóm chứ không để một hàng dài tự rơi: mục nhiều bộ lọc thì
     kiểu gì cũng không đủ chỗ ở 1280px, mà rơi tự do thì còn lại một ô chọn
     nằm trơ giữa hàng dưới, nhìn như vỡ. Hai nhóm này rộng thì nằm cùng
     hàng, hẹp thì xuống hàng nguyên cụm. */
  return `<div class="thanh-loc" id="thanhLoc">
    <div class="thanh-loc__o">
      <input type="search" id="oTim" placeholder="Tìm trong ${esc(m.nhan.toLowerCase())}…" />
      ${o}
    </div>
    <div class="thanh-loc__phu">
      ${nhanh}
      <span class="loc-dem" id="locDem"></span>
      <button type="button" class="nut nut--nho" id="nutXoaLoc" hidden>Xoá lọc</button>
    </div>
  </div>`;
}

const oLoc = (thanh, khoa) => {
  if (khoa === "tim") return thanh.querySelector("#oTim");
  const [loai, truong] = khoa.split(":");
  return thanh.querySelector(`[data-loc="${loai}"][data-truong="${truong}"]`);
};
const khoaLoc = (e) => (e.id === "oTim" ? "tim" : e.dataset.loc + ":" + e.dataset.truong);

/* Giá trị của nút lọc nhanh: hoặc một chuỗi cố định, hoặc mốc ngày tính lúc
   bấm. Phải tính lúc bấm chứ không phải lúc dựng trang — CMS mở cả ngày,
   qua nửa đêm mà "Sắp diễn" vẫn giữ ngày hôm trước thì lọc sai. */
function giaTriNhanh(v) {
  const NGAY = 86400000;
  if (v === "@homNay") return ngayISO(new Date());
  if (v === "@homQua") return ngayISO(new Date(Date.now() - NGAY));
  if (v === "@30NgayTruoc") return ngayISO(new Date(Date.now() - 30 * NGAY));
  return v;
}
const nhanhDangBat = (thanh, p) =>
  Object.entries(p.dat).every(([k, v]) => oLoc(thanh, k)?.value === giaTriNhanh(v));

const coLoc = (thanh) => [...thanh.querySelectorAll("input, select")].some((o) => o.value !== "");

/* Nhớ bộ lọc theo từng mục. sessionStorage chứ không localStorage: đi xem
   mục khác rồi quay lại thì còn nguyên, nhưng mở buổi làm việc mới thì sạch
   — không ai muốn hôm sau mở CMS ra thấy bảng trống vì bộ lọc tuần trước. */
const KHOA_LOC = (ma) => "loc:" + ma;

function luuLoc(ma, thanh) {
  const o = {};
  thanh.querySelectorAll("input, select").forEach((e) => { if (e.value) o[khoaLoc(e)] = e.value; });
  try { sessionStorage.setItem(KHOA_LOC(ma), JSON.stringify(o)); } catch { /* chế độ riêng tư */ }
}

function napLoc(ma, thanh) {
  let o;
  try { o = JSON.parse(sessionStorage.getItem(KHOA_LOC(ma)) || "{}"); } catch { return; }
  thanh.querySelectorAll("input, select").forEach((e) => {
    const v = o[khoaLoc(e)];
    if (v != null) e.value = v;
  });
}

/* Chuỗi để tìm kiếm. Dựng theo lược đồ chứ không JSON.stringify cả bản ghi:
   - bài viết toàn văn phải bỏ thẻ HTML, không thì gõ "img" hay "href" là
     ra sạch mọi bài
   - trường dạng chọn ghép thêm nhãn tiếng Việt, để gõ "Chèo cổ" tìm được
     chứ không bắt người ta nhớ mã "cheo-co"
   Kết quả gắn lại vào bản ghi để gõ phím tiếp không phải dựng lại; onSnapshot
   trả về object mới mỗi lần đổi nên không sợ đọc phải bản cũ. Đặt
   enumerable:false để khoá này không lọt vào chỗ nào ghi ngược lên Firestore. */
const boThe = (h) => String(h).replace(/<[^>]*>/g, " ");

function chuoiTim(m, d) {
  if (d.__tim !== undefined) return d.__tim;
  const phan = [String(d.id || "")];
  for (const t of [...(m.truong || []), ...(m.chiXem || [])]) {
    const v = d[t.ten];
    if (v == null || v === "" || typeof v === "boolean" || typeof v === "object") continue;
    phan.push(t.kieu === "bai" ? boThe(v) : String(v));
    if (t.chon) phan.push(nhanCuaChon(t, v));
  }
  const s = phan.join(" ").toLowerCase();
  Object.defineProperty(d, "__tim", { value: s, enumerable: false, configurable: true });
  return s;
}

function apDungLoc(m, ds, thanh) {
  const tim = (thanh.querySelector("#oTim").value || "").trim().toLowerCase();
  let kq = tim ? ds.filter((d) => chuoiTim(m, d).includes(tim)) : ds;

  thanh.querySelectorAll("[data-loc]").forEach((o) => {
    const v = o.value;
    if (!v) return;
    const tr = o.dataset.truong;
    switch (o.dataset.loc) {
      case "chon": kq = kq.filter((d) => (d[tr] ?? "") === v); break;
      // thiếu hẳn trường thì coi như đang bật, khớp với cách bảng vẽ cột đó
      case "co": kq = kq.filter((d) => (d[tr] !== false) === (v === "1")); break;
      case "tu": kq = kq.filter((d) => { const x = ngayISO(d[tr]); return x && x >= v; }); break;
      case "den": kq = kq.filter((d) => { const x = ngayISO(d[tr]); return x && x <= v; }); break;
    }
  });
  return kq;
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
      ${m.xemTrenWeb ? `<a class="nut" href="${TRANG_WEB}${m.xemTrenWeb}" target="_blank" rel="noopener">Xem trên web ↗</a>` : ""}
      <button type="button" class="nut" id="nutXuat" title="Tải toàn bộ mục này về máy dạng .xlsx">Xuất Excel</button>
      ${m.layTuBao && !m.trangSoan ? `<button type="button" class="nut" id="nutLayBai" title="Lấy bài từ báo về">Lấy từ link báo</button>` : ""}
      ${m.chiDoc || m.motBanGhi ? "" : `<button type="button" class="nut" id="nutNhap">Nhập bảng tính</button>`}
      ${m.taiNhieu ? `<button type="button" class="nut" id="nutTaiNhieu" title="Chọn nhiều ảnh, tải lên một lượt">Tải nhiều ảnh</button>` : ""}
      ${m.chiDoc ? "" : `<button type="button" class="nut nut--chinh" id="nutThem">+ Thêm mới</button>`}
    </div></div>

    ${dungThanhLoc(m)}

    <div class="thanh-chon" id="thanhChon" hidden>
      <strong id="chonDem"></strong>
      <button type="button" class="nut nut--nho" id="nutChonHet">Chọn cả ${esc(m.nhan.toLowerCase())} đang lọc</button>
      <button type="button" class="nut nut--nho" id="nutBoChon">Bỏ chọn</button>
      <button type="button" class="nut nut--nho nut--nguy" id="nutXoaChon">Xoá mục đã chọn</button>
    </div>

    <div class="bang-bao" id="khungBang">
      <div class="dang-tai"><div class="xoay"></div>Đang tải…</div>
    </div>`;

  // Mục có trang soạn riêng thì mở tab mới, không dùng hộp thoại: bài báo
  // dài, soạn trong khung nhỏ thì cuộn mỏi tay.
  if (!m.chiDoc) document.getElementById("nutThem").addEventListener("click", () => {
    if (m.trangSoan) window.open(m.trangSoan, "_blank");
    else moBieuMau(ma, null);
  });

  let duLieu = [];     // toàn bộ mục
  let dangHien = [];   // phần còn lại sau khi lọc

  const thanh = document.getElementById("thanhLoc");
  const oDem = document.getElementById("locDem");
  const nutXoaLoc = document.getElementById("nutXoaLoc");

  /* Xuất đúng những dòng đang nhìn thấy. Lọc xong bấm Xuất mà ra cả bảng
     thì vừa bất ngờ vừa mất công xoá lại trong Excel. */
  document.getElementById("nutXuat").addEventListener("click", () => {
    if (!dangHien.length) return bao("Không có dòng nào để xuất.", "loi");
    const kq = xuatXlsx(ma, m, dangHien);
    bao(`Đã xuất ${kq.soDong} dòng ra ${kq.ten}`, "xong");
  });
  document.getElementById("nutNhap")?.addEventListener("click", () => moNhap(ma, m, () => duLieu));
  document.getElementById("nutLayBai")?.addEventListener("click", () => moLayBai(ma, m, () => duLieu));
  document.getElementById("nutTaiNhieu")?.addEventListener("click", () => moTaiNhieu(ma, m, () => duLieu));

  /* Các dòng được tích chọn, giữ theo id chứ không theo phần tử: onSnapshot
     vẽ lại bảng bất cứ lúc nào, bám vào ô checkbox là mất sạch lựa chọn. */
  const daChon = new Set();

  const veThanhChon = () => {
    // bỏ khỏi lựa chọn những mục người khác vừa xoá, không thì đếm ra số ma
    const con = new Set(duLieu.map((d) => d.id));
    for (const id of [...daChon]) if (!con.has(id)) daChon.delete(id);

    const n = daChon.size;
    document.getElementById("thanhChon").hidden = n === 0;
    if (n) document.getElementById("chonDem").textContent = `Đã chọn ${n} mục`;
    const oHet = document.getElementById("chonTatCa");
    if (oHet) {
      const soHien = dangHien.filter((d) => daChon.has(d.id)).length;
      oHet.checked = soHien > 0 && soHien === dangHien.length;
      oHet.indeterminate = soHien > 0 && soHien < dangHien.length;
    }
  };

  const ve = () => {
    dangHien = apDungLoc(m, duLieu, thanh);
    const dangLoc = coLoc(thanh);
    oDem.textContent = dangLoc
      ? `${dangHien.length} / ${duLieu.length} mục`
      : `${duLieu.length} mục`;
    nutXoaLoc.hidden = !dangLoc;
    thanh.querySelectorAll("[data-nhanh]").forEach((b) =>
      b.classList.toggle("dang-bat", nhanhDangBat(thanh, m.locNhanh[+b.dataset.nhanh])));
    veBang(ma, dangHien, duLieu.length, dangLoc, daChon, veThanhChon);
    veThanhChon();
    if (m.motBanGhi) {
      const nutThem = document.getElementById("nutThem");
      if (nutThem) nutThem.hidden = duLieu.length > 0;
    }
    luuLoc(ma, thanh);
  };

  // một listener trên cả thanh: ô tìm, ô chọn và ô ngày đều phát "input"
  thanh.addEventListener("input", ve);
  nutXoaLoc.addEventListener("click", () => {
    thanh.querySelectorAll("input, select").forEach((o) => { o.value = ""; });
    ve();
    thanh.querySelector("#oTim").focus();
  });
  thanh.querySelectorAll("[data-nhanh]").forEach((b) =>
    b.addEventListener("click", () => {
      const p = m.locNhanh[+b.dataset.nhanh];
      const bo = nhanhDangBat(thanh, p);   // đang bật sẵn thì bấm lần nữa là tắt
      for (const [k, v] of Object.entries(p.dat)) {
        const o = oLoc(thanh, k);
        if (o) o.value = bo ? "" : giaTriNhanh(v);
      }
      ve();
    }));

  document.getElementById("nutBoChon").addEventListener("click", () => { daChon.clear(); ve(); });
  document.getElementById("nutChonHet").addEventListener("click", () => {
    dangHien.forEach((d) => daChon.add(d.id));
    ve();
  });
  document.getElementById("nutXoaChon").addEventListener("click", () =>
    hoiXoaNhieu(ma, duLieu.filter((d) => daChon.has(d.id)), () => daChon.clear()));

  napLoc(ma, thanh);

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

/* ---------- Nhập từ bảng tính ----------
   Nhận hai đường vào vì hai thói quen khác nhau: tải lên tệp .csv (Excel và
   Google Sheets đều “Lưu dưới dạng CSV” được), hoặc bôi đen mấy ô trong bảng
   tính rồi dán thẳng vào ô văn bản — lúc đó dữ liệu sang dạng ngăn bằng ký tự
   tab, bộ đọc tự nhận ra.

   Xem trước rồi mới ghi: màn hình đếm rõ bao nhiêu dòng thêm mới, bao nhiêu
   dòng sửa, dòng nào lỗi, trước khi đụng vào Firestore. */
function moNhap(ma, m, layDuLieu) {
  let ketQua = null;

  const veXemTruoc = (hop) => {
    const o = hop.querySelector("#xemTruoc");
    const nutOk = hop.querySelector("[data-ok]");
    if (!ketQua) { o.innerHTML = ""; nutOk.disabled = true; return; }
    if (ketQua.loiChung) {
      o.innerHTML = `<div class="nhac nhac--nguy"><p>${esc(ketQua.loiChung)}</p></div>`;
      nutOk.disabled = true;
      return;
    }
    const { them, sua, loi, boQua, daNhan } = ketQua;
    nutOk.disabled = them.length + sua.length === 0;
    o.innerHTML = `
      <div class="tom-tat">
        <span class="chip chip--xanh">${them.length} dòng thêm mới</span>
        <span class="chip chip--vang">${sua.length} dòng cập nhật</span>
        ${loi.length ? `<span class="chip chip--do">${loi.length} dòng lỗi, sẽ bỏ qua</span>` : ""}
      </div>
      <p class="goi-y">Nhận ${daNhan.length} cột: ${esc(daNhan.join(", "))}.
        ${boQua.length ? `Bỏ qua cột không nhận ra: ${esc(boQua.join(", "))}.` : ""}</p>
      ${loi.length ? `<ul class="ds-loi">${loi.slice(0, 12).map((l) =>
        `<li><b>Dòng ${l.dong}</b>: ${esc(l.chu)}</li>`).join("")}
        ${loi.length > 12 ? `<li>… và ${loi.length - 12} dòng nữa</li>` : ""}</ul>` : ""}`;
  };

  moHop({
    tieuDe: "Nhập " + m.nhan.toLowerCase() + " từ bảng tính",
    nutChinh: "Nạp vào hệ thống",
    than: `
      <div class="o-nhap">
        <label for="tepCsv">Tệp .csv</label>
        <input type="file" id="tepCsv" accept=".csv,.txt,text/csv,text/plain" />
      </div>
      <div class="o-nhap">
        <label for="danVao">hoặc dán các ô đã sao chép từ Excel / Google Sheets</label>
        <textarea id="danVao" rows="5" placeholder="Dán vào đây…"></textarea>
      </div>
      <div id="xemTruoc"></div>`,
    khiMo: (hop) => {
      const xu = (vanBan) => {
        ketQua = String(vanBan).trim() ? soanNhap(m, vanBan, layDuLieu()) : null;
        veXemTruoc(hop);
      };
      hop.querySelector("#tepCsv").addEventListener("change", async (e) => {
        const t = e.target.files?.[0];
        if (!t) return;
        xu(await t.text());
        hop.querySelector("#danVao").value = "";
      });
      hop.querySelector("#danVao").addEventListener("input", (e) => xu(e.target.value));
      veXemTruoc(hop);
    },
    khiXacNhan: async () => {
      if (!ketQua || ketQua.loiChung) return false;
      const { them, sua } = ketQua;
      if (!them.length && !sua.length) { bao("Không có dòng nào hợp lệ để nạp.", "loi"); return false; }

      // ghi theo từng chùm 10 cho nhanh mà không dội quá nhiều yêu cầu một lúc
      const viec = [...sua.map((s) => () => fb.capNhat(ma, s.id, s.rec)),
                    ...them.map((t) => () => fb.themMoi(ma, t.rec))];
      for (let i = 0; i < viec.length; i += 10) {
        await Promise.all(viec.slice(i, i + 10).map((f) => f()));
      }
      bao(`Đã nạp: thêm ${them.length}, cập nhật ${sua.length}.`, "xong");
    }
  });
}

function veBang(ma, ds, tong, dangLoc, daChon, khiDoiChon) {
  const m = LUOC_DO[ma];
  const khung = document.getElementById("khungBang");
  if (!khung) return;

  if (!ds.length) {
    khung.innerHTML = `<div class="trong">
      <h3>${tong ? "Không có mục nào khớp" : "Chưa có gì ở đây"}</h3>
      <p>${tong
        ? (dangLoc
            ? `Cả ${tong} mục đều bị bộ lọc loại ra. Bấm “Xoá lọc” để xem lại tất cả.`
            : "Thử từ khoá khác.")
        : m.chiDoc
          ? "Đơn đặt chỗ sẽ tự hiện ở đây khi có người giữ chỗ trên web."
          : "Bấm “Thêm mới” để tạo mục đầu tiên."}</p>
    </div>`;
    return;
  }

  /* Cột tích chọn có ở mọi mục, kể cả mục chiDoc. chiDoc nghĩa là không gõ
     tay thêm bản ghi mới, chứ không phải cấm xoá — đơn đặt chỗ thử nghiệm
     hay đơn rác vẫn phải dọn được, và luật Firestore vốn cho quản trị xoá. */
  khung.innerHTML = `<table class="${m.bangTinh ? "bang-tinh" : ""}">
    <thead><tr>
      <th class="o-tich"><input type="checkbox" id="chonTatCa" aria-label="Chọn tất cả dòng đang hiện" /></th>
      ${m.cot.map((c) => `<th>${esc(c.nhan)}</th>`).join("")}<th></th></tr></thead>
    <tbody>${ds.map((d) => `<tr${daChon.has(d.id) ? ' class="dong-chon"' : ""}>
      <td class="o-tich"><input type="checkbox" data-tich="${esc(d.id)}"${daChon.has(d.id) ? " checked" : ""} aria-label="Chọn dòng này" /></td>
      ${m.cot.map((c) => oBang(m, c, d)).join("")}
      <td class="o-thao-tac">
        <button type="button" class="nut nut--nho" data-sua="${esc(d.id)}">${m.chiDoc ? "Xem" : "Sửa"}</button>
        ${m.motBanGhi ? "" : `<button type="button" class="nut nut--nho nut--nguy" data-xoa="${esc(d.id)}">Xoá</button>`}
      </td></tr>`).join("")}</tbody>
  </table>`;

  khung.querySelectorAll("[data-sua]").forEach((b) =>
    b.addEventListener("click", () => {
      const m2 = LUOC_DO[ma];
      if (m2.trangSoan) window.open(m2.trangSoan + "?id=" + encodeURIComponent(b.dataset.sua), "_blank");
      else moBieuMau(ma, ds.find((x) => x.id === b.dataset.sua));
    }));
  khung.querySelectorAll("[data-xoa]").forEach((b) =>
    b.addEventListener("click", () => hoiXoa(ma, ds.find((x) => x.id === b.dataset.xoa))));

  khung.querySelectorAll("[data-tich]").forEach((o) =>
    o.addEventListener("change", () => {
      if (o.checked) daChon.add(o.dataset.tich); else daChon.delete(o.dataset.tich);
      o.closest("tr").classList.toggle("dong-chon", o.checked);
      khiDoiChon();
    }));
  khung.querySelector("#chonTatCa").addEventListener("change", (e) => {
    ds.forEach((d) => { if (e.target.checked) daChon.add(d.id); else daChon.delete(d.id); });
    khung.querySelectorAll("[data-tich]").forEach((o) => {
      o.checked = e.target.checked;
      o.closest("tr").classList.toggle("dong-chon", e.target.checked);
    });
    khiDoiChon();
  });
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

/* ---------- Lấy bài từ báo ----------
   Dán đường dẫn một bài báo, CMS nhờ máy chủ đọc hộ rồi điền sẵn biểu mẫu.
   Trình duyệt không tự đọc được trang báo khác vì bị CORS chặn, nên phải đi
   vòng qua /api/lay-bai (xem api/_chung.js).

   Chỉ ĐIỀN SẴN chứ không tự lưu: máy đoán sai tiêu đề hay ngày là chuyện
   thường, và Chủ đề thì máy không thể biết. Người vẫn phải đọc lại rồi bấm
   Tạo mới.

   Lấy tiêu đề, tóm tắt, ảnh, nguồn — không lấy toàn văn. Mục Tin tức vốn
   không có ô nào chứa nội dung đầy đủ; nó làm theo lối điểm báo, dẫn nguồn
   và liên kết về bài gốc. */
function moLayBai(ma, m, layDuLieu) {
  let ketQua = null;

  const veKetQua = (hop, kq, trung) => {
    const o = hop.querySelector("#kqLayBai");
    o.innerHTML = `
      <div class="xem-bai">
        ${kq.anh ? `<img src="${esc(kq.anh)}" alt="" class="xem-bai__anh" />` : `<div class="xem-bai__anh xem-bai__anh--trong">Không tìm thấy ảnh</div>`}
        <div class="xem-bai__chu">
          <h3>${esc(kq.tieuDe) || "<em>không lấy được tiêu đề</em>"}</h3>
          <p>${esc(kq.tomTat) || "<em>không lấy được tóm tắt</em>"}</p>
          <p class="goi-y">${esc(kq.nguonTen)}${kq.ngay ? " · " + esc(ngayVN(kq.ngay)) : ""}</p>
        </div>
      </div>
      ${kq.bai.soChu
        ? `<p class="goi-y">Bóc được <strong>${kq.bai.soChu.toLocaleString("vi-VN")}</strong> ký tự toàn văn${kq.bai.anh.length ? ` và <strong>${kq.bai.anh.length}</strong> ảnh trong bài` : ""}. Ảnh sẽ được tải về kho Nhà hát.</p>`
        : `<div class="nhac"><h3>Không bóc được toàn văn</h3></div>`}
      ${kq.thieu.length ? `<div class="nhac"><h3>Máy không tự tìm được: ${esc(kq.thieu.join(", "))}</h3></div>` : ""}
      ${trung ? `<div class="nhac nhac--nguy"><h3>Bài này đã có trong Tin tức</h3>
        <p>Đang có mục <strong>${esc(trung.tieuDe)}</strong> cùng đường dẫn gốc. Lấy tiếp là thành hai bản.</p></div>` : ""}`;
  };

  moHop({
    tieuDe: "Lấy bài từ báo về",
    than: `
      <div class="o-nhap" data-o="urlBai">
        <label for="urlBai">Đường dẫn bài báo</label>
        <input type="url" id="urlBai" placeholder="https://..." />
      </div>
      <p><button type="button" class="nut" id="nutDoc">Lấy về</button></p>
      <div id="kqLayBai"></div>`,
    nutChinh: "Điền vào biểu mẫu",
    khiMo: (hop) => {
      const nut = hop.querySelector("#nutDoc");
      const oUrl = hop.querySelector("#urlBai");

      const doc = async () => {
        const dc = oUrl.value.trim();
        if (!dc) return bao("Chưa dán đường dẫn.", "loi");

        ketQua = null;
        nut.disabled = true;
        nut.textContent = "Đang đọc…";
        hop.querySelector("#kqLayBai").innerHTML =
          `<div class="dang-tai"><div class="xoay"></div>Đang đọc bài báo…</div>`;
        try {
          /* Hai lượt gọi song song: lay-bai (công khai, lấy OG metadata)
             và lay-bai-day-du (yêu cầu đăng nhập, trả HTML thô để bóc
             toàn văn). Tách ra sau khi vá lỗ cho phép ai cũng xin được
             HTML trang báo qua endpoint công khai. */
          const idToken = await fb.layIdToken();
          if (!idToken) throw new Error("Phiên đã hết hạn. Đăng nhập lại.");
          const [rMeta, rHtml] = await Promise.all([
            fetch("/api/lay-bai?url=" + encodeURIComponent(dc)),
            fetch("/api/lay-bai-day-du?url=" + encodeURIComponent(dc), {
              headers: { Authorization: "Bearer " + idToken }
            })
          ]);
          const kq = await rMeta.json();
          if (!rMeta.ok) throw new Error(kq.loi || "Không đọc được bài.");
          const kqHtml = await rHtml.json();
          if (!rHtml.ok) throw new Error(kqHtml.loi || "Không lấy được toàn văn.");

          // Bóc toàn văn ngay tại trình duyệt — máy chủ chỉ đưa HTML thô về
          kq.bai = kqHtml.html
            ? bocBai(kqHtml.html, kqHtml.goc || kq.nguonUrl || dc)
            : { html: "", anh: [], soChu: 0 };

          ketQua = kq;
          const trung = (layDuLieu() || []).find((x) => x.nguonUrl && x.nguonUrl === kq.nguonUrl);
          veKetQua(hop, kq, trung);
        } catch (e) {
          hop.querySelector("#kqLayBai").innerHTML =
            `<div class="nhac nhac--nguy"><h3>Không lấy được bài</h3><p>${esc(e.message)}</p></div>`;
        } finally {
          nut.disabled = false;
          nut.textContent = "Lấy về";
        }
      };

      nut.addEventListener("click", doc);
      oUrl.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doc(); } });
    },
    khiXacNhan: async () => {
      if (!ketQua) { bao("Dán đường dẫn rồi bấm Lấy về đã.", "loi"); return false; }

      const dienSan = {
        tieuDe: ketQua.tieuDe || "",
        ngay: ketQua.ngay || "",
        tomTat: ketQua.tomTat || "",
        nguonTen: ketQua.nguonTen || "",
        nguonUrl: ketQua.nguonUrl || "",
        anhNguon: ketQua.nguonTen ? "Ảnh: " + ketQua.nguonTen : ""
      };

      /* Mang MỌI ảnh về kho Firebase chứ không trỏ thẳng sang báo. Trỏ thẳng
         thì ảnh sống chết theo máy chủ người ta — đúng kiểu logo hỏng hôm
         10/9 — và nhiều báo chặn tải chéo nên ảnh cũng không hiện.
         Ảnh nào hỏng thì bỏ ảnh đó, không chặn cả việc. */
      const veKho = async (dc) => {
        const r = await fetch("/api/lay-anh?url=" + encodeURIComponent(dc) +
                              "&tu=" + encodeURIComponent(ketQua.nguonUrl || ""));
        if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).loi) || "lỗi " + r.status);
        const blob = await r.blob();
        const duoi = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
        return fb.taiAnhLen(new File([blob], `bai-bao.${duoi}`, { type: blob.type }), "tin-tuc");
      };

      const oTienDo = document.querySelector("#kqLayBai");
      const viet = (t) => { if (oTienDo) oTienDo.innerHTML = `<div class="dang-tai"><div class="xoay"></div>${esc(t)}</div>`; };

      if (ketQua.anh) {
        viet("Đang tải ảnh đại diện…");
        try { dienSan.anh = await veKho(ketQua.anh); }
        catch (e) { bao("Không lấy được ảnh đại diện (" + e.message + ").", "loi"); }
      }

      /* Ảnh trong thân bài. Chặn ở 20 tấm: bài ảnh dài của báo có khi vài
         chục tấm, tải hết vừa lâu vừa phình kho mà người đọc không cần. */
      let noiDung = ketQua.bai.html || "";
      const dsAnh = (ketQua.bai.anh || []).slice(0, 20);
      let hong = 0;

      for (let i = 0; i < dsAnh.length; i++) {
        viet(`Đang tải ảnh trong bài ${i + 1}/${dsAnh.length}…`);
        try {
          const kq = await veKho(dsAnh[i]);
          // thay mọi chỗ xuất hiện địa chỉ cũ bằng địa chỉ trong kho
          noiDung = noiDung.split(dsAnh[i]).join(kq.url);
        } catch { hong++; }
      }

      /* Ảnh nào không tải được thì gỡ hẳn thẻ img đi, đừng để lại ô vỡ
         trỏ về máy chủ báo. */
      if (hong) {
        const tam = document.createElement("div");
        tam.innerHTML = noiDung;
        tam.querySelectorAll("img").forEach((im) => {
          if (!/firebasestorage\.googleapis\.com/.test(im.getAttribute("src") || "")) im.remove();
        });
        noiDung = tam.innerHTML;
        bao(`${hong} ảnh trong bài không tải được, đã bỏ.`, "loi");
      }

      dienSan.noiDung = noiDung;
      moBieuMau(ma, null, dienSan);
    }
  });
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

/* ---------- Xoá nhiều mục cùng lúc ----------
   Đường ra cho hai việc nặng tay mà trước đây phải vào Firebase Console:
   dọn bản ghi bị nạp trùng, và bỏ hẳn một loạt bài cũ. Lọc lấy đúng thứ
   cần bỏ, bấm "Chọn cả …", rồi xoá một lượt.

   Bắt gõ chữ XOA chứ không chỉ bấm Đồng ý: bấm nhầm một nút thì mất 88 bản
   ghi, mà Firestore không có thùng rác để moi lại. */
function hoiXoaNhieu(ma, ds, xong) {
  if (!ds.length) return;
  const m = LUOC_DO[ma];
  const truongAnh = (m.truong || []).filter((t) => t.kieu === "anh");
  const ten = (d) => d.tieuDe || d.hoTen || d.ten || d.tenVo || d.chuThich || d.ma || d.id;

  moHop({
    tieuDe: `Xoá ${ds.length} mục?`,
    nutChinh: "Xoá vĩnh viễn",
    lopNutChinh: "nut--nguy",
    than: `
      <div class="nhac nhac--nguy">
        <h3>Sắp xoá ${ds.length} mục khỏi ${esc(m.nhan)}</h3>
        <p>Xoá xong không lấy lại được${truongAnh.length ? ", ảnh kèm theo cũng mất khỏi kho" : ""}.
           Trang web mất những mục này ngay lập tức.</p>
      </div>
      <ul class="ds-loi">${ds.slice(0, 10).map((d) => `<li>${esc(ten(d))}</li>`).join("")}
        ${ds.length > 10 ? `<li>… và ${ds.length - 10} mục nữa</li>` : ""}</ul>
      <div class="o-nhap">
        <label for="xacNhanXoa">Gõ <code>XOA</code> vào ô dưới rồi mới xoá được</label>
        <input type="text" id="xacNhanXoa" autocomplete="off" placeholder="XOA" />
      </div>
      <div id="tienDoXoa"></div>`,
    khiXacNhan: async () => {
      const o = document.getElementById("xacNhanXoa");
      if ((o.value || "").trim().toUpperCase() !== "XOA") {
        bao("Gõ đúng chữ XOA rồi mới xoá được.", "loi");
        o.focus();
        return false;
      }

      const tienDo = document.getElementById("tienDoXoa");
      const CHUM = 5;   // vài cái một lượt cho nhanh, không dội hết một lúc
      let hong = 0;

      for (let i = 0; i < ds.length; i += CHUM) {
        tienDo.innerHTML = `<div class="dang-tai"><div class="xoay"></div>
          Đang xoá ${Math.min(i + CHUM, ds.length)}/${ds.length}…</div>`;
        await Promise.all(ds.slice(i, i + CHUM).map(async (d) => {
          try {
            // ảnh trước, bản ghi sau — xoá ngược lại mà lỗi giữa chừng thì ảnh
            // nằm lại trong kho vĩnh viễn, không còn đường nào lần ra để dọn
            for (const t of truongAnh) if (d[t.ten]?.duongDan) await fb.xoaAnh(d[t.ten].duongDan);
            await fb.xoaBo(ma, d.id);
          } catch { hong++; }
        }));
      }

      xong();
      bao(hong
        ? `Đã xoá ${ds.length - hong} mục, ${hong} mục không xoá được.`
        : `Đã xoá ${ds.length} mục.`, hong ? "loi" : "xong");
    }
  });
}

/* ---------- Biểu mẫu thêm/sửa ---------- */
/* dienSan: giá trị điền sẵn cho một bản ghi MỚI (dùng khi lấy bài từ báo về).
   Cố ý tách khỏi tham số d — d có nghĩa là "đang sửa bản ghi đã có", điền sẵn
   thì vẫn là tạo mới, nút phải ghi "Tạo mới" và phải gọi themMoi chứ không
   phải capNhat vào một id không tồn tại. */
function moBieuMau(ma, d, dienSan) {
  const m = LUOC_DO[ma];
  const laSua = !!d;
  const giaTri = d || dienSan || null;
  const anhDaChon = {};   // { tenTruong: {url, duongDan} } cho ảnh vừa tải lên

  const chiXem = (m.chiXem || []).map((f) => `<dt>${esc(f.nhan)}</dt><dd>${esc(d?.[f.ten] ?? "—")}</dd>`).join("");

  moHop({
    tieuDe: (laSua ? (m.chiDoc ? "Chi tiết " : "Sửa ") : "Thêm ") + m.nhan.toLowerCase(),
    than:
      (chiXem ? `<div class="chi-xem"><dl>${chiXem}
         ${d?.taoLuc ? `<dt>Gửi lúc</dt><dd>${esc(ngayGioVN(d.taoLuc))}</dd>` : ""}</dl></div>` : "") +
      `<form id="bmChinh" novalidate>${m.truong.map((t) => veTruong(t, giaTri)).join("")}</form>`,
    nutChinh: laSua ? "Lưu thay đổi" : "Tạo mới",
    khiMo: (hop) => { ganTaiAnh(hop, m, giaTri, anhDaChon); ganPhuThuoc(hop, m); napGoiY(hop, m); },
    khiXacNhan: async () => {
      const bm = document.getElementById("bmChinh");
      const duLieu = {};
      let hopLe = true;

      for (const t of m.truong) {
        const o = bm.querySelector(`[name="${t.ten}"]`);
        let gia;
        // ô soạn bài là div contenteditable, không có name và không có .value
        if (t.kieu === "bai") gia = locHtml(bm.querySelector(`[data-bai="${t.ten}"]`).innerHTML, giaTri?.nguonUrl);
        else if (t.kieu === "anh") gia = anhDaChon[t.ten] ?? giaTri?.[t.ten] ?? null;
        else if (t.kieu === "cong-tac") gia = o.checked;
        else if (t.kieu === "so") gia = o.value === "" ? null : Number(o.value);
        else gia = o.value.trim();

        const oNhap = bm.querySelector(`[data-o="${t.ten}"]`);
        /* Ô đang bị ẩn vì công tắc phụ thuộc đang tắt thì không đòi điền, và
           cũng không giữ lại giá trị cũ: tắt "Là lãnh đạo" mà vẫn lưu nhiệm kỳ
           thì trang web lọc theo laLanhDao là đúng, nhưng ai mở bản ghi ra xem
           lại thấy dữ liệu mâu thuẫn. */
        if (!truongDangHien(bm, m, t)) {
          oNhap.classList.remove("co-loi");
          oNhap.querySelector(".loi")?.remove();
          duLieu[t.ten] = t.kieu === "so" ? null : t.kieu === "anh" ? gia : "";
          continue;
        }
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

/* Trường khai phuThuoc: "tenCongTac" chỉ hiện khi công tắc đó đang bật.
   Một người trong Nhân sự có thể chỉ là nghệ sĩ, chỉ là lãnh đạo, hoặc cả
   hai — không ẩn đi thì ai nhập một ông Chính trị viên cũng phải nhìn ô
   "Năm phong NSND" nằm chình ình.

   Khai thêm khiLa thì trường cha là ô chọn: chỉ hiện khi ô đó đang chọn
   đúng giá trị ấy (Thư viện ảnh: "Xếp theo vở diễn" thì hiện ô Vở diễn).
   Phụ thuộc lồng được: cha đang ẩn thì con ẩn theo, dù giá trị khớp. */
function truongDangHien(goc, m, t) {
  if (!t.phuThuoc) return true;
  const cha = (m.truong || []).find((x) => x.ten === t.phuThuoc);
  if (cha && !truongDangHien(goc, m, cha)) return false;
  const o = goc.querySelector(`[name="${t.phuThuoc}"]`);
  if (!o) return false;
  return t.khiLa !== undefined ? o.value === t.khiLa : o.checked;
}

function ganPhuThuoc(hop, m) {
  const con = (m.truong || []).filter((t) => t.phuThuoc);
  if (!con.length) return;
  const dong = () => con.forEach((t) => {
    const o = hop.querySelector(`[data-o="${t.ten}"]`);
    if (o) o.hidden = !truongDangHien(hop, m, t);
  });
  for (const ten of new Set(con.map((t) => t.phuThuoc))) {
    hop.querySelector(`[name="${ten}"]`)?.addEventListener("change", dong);
  }
  dong();
}

/* Trường khai goiYTu: ô chữ có danh sách gợi ý (datalist) lấy từ một mục
   khác — tên vở lấy từ mục Vở diễn, chủ đề lấy từ các chủ đề đã dùng. Vẫn
   gõ tự do được; gợi ý chỉ để các ảnh cùng nhóm ghi giống hệt nhau. */
async function napGoiY(hop, m) {
  for (const t of (m.truong || []).filter((x) => x.goiYTu)) {
    const dl = hop.querySelector(`#dl-${t.ten}`);
    if (!dl) continue;
    const { muc, truong, them = [] } = t.goiYTu;
    let ds = [];
    try { ds = await fb.layDanhSach(muc); } catch (e) { /* không đọc được thì chỉ còn gợi ý sẵn */ }
    const gia = [...new Set([...them, ...ds.map((d) => String(d[truong] || "").trim())].filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "vi"));
    dl.innerHTML = gia.map((g) => `<option value="${esc(g)}"></option>`).join("");
  }
}

/* ---------- Tải nhiều ảnh một lượt ----------
   Chọn (hoặc kéo thả) cả loạt ảnh, điền các ô dùng chung một lần — khu vực,
   xếp theo vở hay chủ đề, nguồn, khổ — rồi mỗi tấm thành một bản ghi riêng,
   y như bấm Thêm mới từng cái. Chú thích sửa riêng được từng tấm; để trống
   thì lấy tên vở / chủ đề làm chú thích.

   Tải lên ba tấm một lúc. Tấm nào lỗi thì ở lại trong hộp để bấm lưu lại,
   tấm đã xong thì rút khỏi danh sách — bấm lần nữa không ra bản trùng. */
const TAI_CUNG_LUC = 3;

function moTaiNhieu(ma, m, layDuLieu) {
  const tAnh = m.truong.find((t) => t.kieu === "anh");
  // các ô điền chung: bỏ ảnh, chú thích (riêng từng tấm) và thứ tự (tự đánh)
  const chung = m.truong.filter((t) => t.kieu !== "anh" && t.ten !== "chuThich" && t.ten !== "thuTu");
  const mChung = { ...m, truong: chung };
  let tep = [];   // [{ id, file, url, chuThich }]
  let dem = 0;

  moHop({
    tieuDe: "Tải nhiều ảnh",
    than: `
      <div class="tai-nhieu__vung" id="tnVung">
        <input type="file" accept="image/*" multiple id="tnTep" hidden />
        <p><strong>Kéo thả ảnh vào đây</strong> hoặc</p>
        <button type="button" class="nut" id="tnChon">Chọn ảnh…</button>
        <p class="goi-y">Chọn được nhiều tấm cùng lúc. Mỗi tấm tối đa ${GIOI_HAN_MB} MB.</p>
      </div>
      <div class="tai-nhieu__drive">
        <label for="tnDrive">Hoặc dán link Google Drive: link thư mục (lấy hết ảnh trong đó) hoặc link từng ảnh, mỗi dòng một link</label>
        <textarea id="tnDrive" rows="3" placeholder="https://drive.google.com/drive/folders/…"></textarea>
        <p class="goi-y">Thư mục / ảnh trên Drive phải chia sẻ “Bất kỳ ai có đường liên kết”. Ảnh nặng bao nhiêu cũng được.</p>
        <button type="button" class="nut nut--nho" id="tnLayDrive">Thêm ảnh từ Drive</button>
      </div>
      <p class="tai-nhieu__so" id="tnSo" hidden></p>
      <div class="tai-nhieu__luoi" id="tnLuoi"></div>
      <p class="tai-nhieu__tt" id="tnTT" hidden></p>
      <form id="bmNhieu" novalidate>${chung.map((t) => veTruong(t, null)).join("")}</form>`,
    nutChinh: "Tải lên",
    khiMo: (hop) => {
      ganPhuThuoc(hop, mChung);
      napGoiY(hop, mChung);
      const inp = hop.querySelector("#tnTep");
      const vung = hop.querySelector("#tnVung");
      const luoi = hop.querySelector("#tnLuoi");

      const ve = () => {
        luoi.innerHTML = tep.map((x) => `
          <div class="tai-nhieu__the" data-id="${x.id}">
            <div class="tai-nhieu__anh"><img src="${esc(x.url)}" alt="" data-anh-tep="${x.id}" />
              ${x.drive ? `<span class="tai-nhieu__nhan">Drive</span>` : ""}
              <button type="button" class="tai-nhieu__bo" data-bo-tep="${x.id}" aria-label="Bỏ ảnh này">×</button></div>
            <input type="text" data-cap="${x.id}" value="${esc(x.chuThich)}" placeholder="Chú thích (để trống: lấy tên vở / chủ đề)" />
            ${x.loi ? `<p class="loi">${esc(x.loi)}</p>` : ""}
          </div>`).join("");
        /* Ảnh Drive chưa chia sẻ công khai thì Google trả lỗi. Đánh dấu hỏng và
           ghi lỗi ngay dưới thẻ — không vẽ lại cả lưới, vẽ lại thì ảnh lại
           tải hỏng lần nữa, lặp mãi. */
        luoi.querySelectorAll("[data-anh-tep]").forEach((im) => {
          const x = tep.find((y) => String(y.id) === im.dataset.anhTep);
          if (!x || !x.drive) return;
          im.onerror = () => {
            x.hong = true;
            const the = im.closest(".tai-nhieu__the");
            if (the && !the.querySelector(".loi")) the.insertAdjacentHTML("beforeend", `<p class="loi">${esc(LOI_CHIA_SE)}</p>`);
          };
          im.onload = () => { x.hong = false; };
        });
        const so = hop.querySelector("#tnSo");
        so.hidden = !tep.length;
        so.textContent = `Đã chọn ${tep.length} ảnh`;
      };
      luoi.addEventListener("ve-lai", ve);

      const them = (ds) => {
        let bo = 0;
        for (const f of ds) {
          if (!f.type.startsWith("image/") || f.size > GIOI_HAN_MB * 1024 * 1024) { bo++; continue; }
          tep.push({ id: ++dem, file: f, url: URL.createObjectURL(f), chuThich: "" });
        }
        if (bo) bao(`Bỏ qua ${bo} tệp không phải ảnh hoặc nặng quá ${GIOI_HAN_MB} MB.`, "loi");
        ve();
      };

      // Dán một loạt link Drive: tách theo dòng / dấu cách / dấu phẩy, bỏ link
      // trùng (cả với ảnh đã có trong danh sách), link lỗi thì báo gộp một câu.
      // Link thư mục thì nhờ /api/drive-thu-muc liệt kê ảnh bên trong.
      const nutDrive = hop.querySelector("#tnLayDrive");
      nutDrive.addEventListener("click", async () => {
        const o = hop.querySelector("#tnDrive");
        const link = o.value.split(/[\s,]+/).filter(Boolean);
        if (!link.length) { bao("Chưa dán link nào.", "loi"); return; }
        const daCo = new Set(tep.filter((x) => x.drive).map((x) => x.drive.driveId));
        let hong = 0, trung = 0, them = 0, conThuMuc = 0, khongAnh = 0;
        const loiThuMuc = [];
        const nhan = (id) => {
          if (daCo.has(id)) { trung++; return; }
          daCo.add(id);
          const anh = anhDrive(id);
          tep.push({ id: ++dem, drive: anh, url: anh.url, chuThich: "" });
          them++;
        };

        nutDrive.disabled = true;
        const chuNut = nutDrive.textContent;
        try {
          for (const l of link) {
            const tm = maThuMuc(l);
            if (tm) {
              nutDrive.textContent = "Đang đọc thư mục…";
              try {
                const r = await fetch(`/api/drive-thu-muc?id=${encodeURIComponent(tm)}`);
                const kq = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(kq.loi || `Lỗi ${r.status}`);
                if (!kq.tep.length) loiThuMuc.push("thư mục không có ảnh nào");
                kq.tep.forEach((f) => nhan(f.id));
                conThuMuc += kq.thuMucCon || 0;
                khongAnh += kq.boQua || 0;
              } catch (e) { loiThuMuc.push(e.message); }
              continue;
            }
            const id = maDrive(l);
            if (id) nhan(id); else hong++;
          }
        } finally {
          nutDrive.disabled = false;
          nutDrive.textContent = chuNut;
        }

        const loi = [...loiThuMuc];
        if (hong) loi.push(`bỏ qua ${hong} link không phải ảnh Drive`);
        if (trung) loi.push(`bỏ qua ${trung} ảnh trùng`);
        if (khongAnh) loi.push(`bỏ qua ${khongAnh} tệp không phải ảnh`);
        if (conThuMuc) loi.push(`${conThuMuc} thư mục con không đọc vào, dán link riêng nếu cần`);
        if (them) { o.value = ""; ve(); bao(`Đã thêm ${them} ảnh từ Drive.` + (loi.length ? " " + loi.join("; ") + "." : ""), "xong"); }
        else if (loi.length) bao(loi.join("; ") + ".", "loi");
      });

      hop.querySelector("#tnChon").addEventListener("click", () => inp.click());
      inp.addEventListener("change", () => { them([...inp.files]); inp.value = ""; });
      vung.addEventListener("dragover", (e) => { e.preventDefault(); vung.classList.add("dang-keo"); });
      vung.addEventListener("dragleave", () => vung.classList.remove("dang-keo"));
      vung.addEventListener("drop", (e) => {
        e.preventDefault();
        vung.classList.remove("dang-keo");
        them([...e.dataTransfer.files]);
      });
      luoi.addEventListener("input", (e) => {
        const x = tep.find((y) => String(y.id) === e.target.dataset.cap);
        if (x) x.chuThich = e.target.value;
      });
      luoi.addEventListener("click", (e) => {
        const id = e.target.closest("[data-bo-tep]")?.dataset.boTep;
        if (!id) return;
        const x = tep.find((y) => String(y.id) === id);
        if (x && x.file) URL.revokeObjectURL(x.url);
        tep = tep.filter((y) => String(y.id) !== id);
        ve();
      });
    },
    khiXacNhan: async () => {
      if (!tep.length) { bao("Chưa chọn ảnh nào.", "loi"); return false; }
      const bm = document.getElementById("bmNhieu");
      const duLieu = {};
      let hopLe = true;
      for (const t of chung) {
        const o = bm.querySelector(`[name="${t.ten}"]`);
        const oNhap = bm.querySelector(`[data-o="${t.ten}"]`);
        oNhap.classList.remove("co-loi");
        oNhap.querySelector(".loi")?.remove();
        if (!truongDangHien(bm, mChung, t)) { duLieu[t.ten] = t.kieu === "so" ? null : ""; continue; }
        const gia = t.kieu === "cong-tac" ? o.checked : t.kieu === "so" ? (o.value === "" ? null : Number(o.value)) : o.value.trim();
        if (t.batBuoc && (gia === "" || gia === null)) {
          hopLe = false;
          oNhap.classList.add("co-loi");
          oNhap.insertAdjacentHTML("beforeend", `<p class="loi">Bắt buộc điền.</p>`);
        }
        duLieu[t.ten] = gia;
      }
      if (!hopLe) { bao("Còn ô bắt buộc chưa điền.", "loi"); return false; }

      const tenNhom = duLieu.tenVo || duLieu.chuDe || "";
      if (!tenNhom && tep.some((x) => !x.chuThich.trim())) {
        bao("Có ảnh chưa có chú thích. Điền chú thích, hoặc điền tên vở / chủ đề để dùng làm chú thích chung.", "loi");
        return false;
      }

      // ảnh mới xếp nối tiếp sau ảnh cuối cùng đang có, giữ đúng thứ tự đã chọn
      const thuTuMax = Math.max(0, ...layDuLieu().map((d) => Number(d.thuTu) || 0));
      const tt = document.getElementById("tnTT");
      tt.hidden = false;
      let xong = 0;
      const tong = tep.length;
      const viTri = new Map(tep.map((x, i) => [x.id, i]));
      tt.textContent = `Đang tải lên 0 / ${tong} ảnh…`;

      const hang = [...tep];
      const chay = async () => {
        while (hang.length) {
          const x = hang.shift();
          try {
            // ảnh Drive không tải tệp nào, chỉ lưu địa chỉ; link hỏng thì không lưu
            if (x.hong) throw new Error(LOI_CHIA_SE);
            const anh = x.drive || await fb.taiAnhLen(x.file, tAnh.thuMuc || "khac");
            await fb.themMoi(ma, {
              ...duLieu,
              [tAnh.ten]: anh,
              chuThich: x.chuThich.trim() || tenNhom,
              thuTu: thuTuMax + 1 + viTri.get(x.id)
            });
            x.xong = true;
            if (x.file) URL.revokeObjectURL(x.url);
          } catch (e) {
            x.loi = x.hong ? LOI_CHIA_SE : "Lỗi: " + (e.code || e.message);
          }
          xong++;
          tt.textContent = `Đang tải lên ${xong} / ${tong} ảnh…`;
        }
      };
      await Promise.all(Array.from({ length: Math.min(TAI_CUNG_LUC, tep.length) }, chay));

      const loi = tep.filter((x) => !x.xong);
      const thanhCong = tong - loi.length;
      if (!loi.length) { bao(`Đã tải lên ${thanhCong} ảnh.`, "xong"); return; }
      // giữ lại những tấm lỗi để bấm Tải lên lần nữa
      tep = loi;
      tt.textContent = `Đã tải ${thanhCong} / ${tong} ảnh. ${loi.length} ảnh lỗi còn lại bên trên, bấm Tải lên để thử lại.`;
      document.getElementById("tnLuoi").dispatchEvent(new Event("ve-lai"));
      bao(`${loi.length} ảnh chưa tải được.`, "loi");
      return false;
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
        </div>
        <div class="o-anh-drive">
          <input type="url" data-drive="${t.ten}" placeholder="…hoặc dán link ảnh Google Drive" aria-label="Link ảnh Google Drive" />
          <button type="button" class="nut nut--nho" data-lay-drive="${t.ten}">Lấy ảnh</button>
        </div>${goiY}</div>`;
    case "bai":
      // Cố ý KHÔNG esc(): nội dung này đã lọc theo danh sách thẻ cho phép
      // lúc lưu (locHtml), ném thẳng vào để người dùng sửa được như văn bản.
      return `${mo}${nhan}
        <div class="soan-bai" data-bai="${t.ten}" contenteditable="true" role="textbox" aria-multiline="true">${gia || ""}</div>
        ${goiY}</div>`;
    case "so":
      return `${mo}${nhan}<input type="number" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
    case "ngay":
      return `${mo}${nhan}<input type="date" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
    case "gio":
      return `${mo}${nhan}<input type="time" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
    case "url":
      return `${mo}${nhan}<input type="url" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" placeholder="https://…" />${goiY}</div>`;
    default:
      // goiYTu: danh sách gợi ý nạp sau bằng napGoiY(), lúc dựng còn rỗng
      return t.goiYTu
        ? `${mo}${nhan}<input type="text" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" list="dl-${t.ten}" autocomplete="off" />
           <datalist id="dl-${t.ten}"></datalist>${goiY}</div>`
        : `${mo}${nhan}<input type="text" id="f-${t.ten}" name="${t.ten}" value="${esc(gia)}" />${goiY}</div>`;
  }
}

const GIOI_HAN_MB = 5;

/* ---------- Ảnh lấy từ Google Drive ----------
   Ảnh nặng (quá 5 MB, ảnh gốc máy ảnh) thì để trên Drive, chia sẻ "Bất kỳ
   ai có đường liên kết", dán link vào CMS. Không tải tệp qua Firebase: bản
   ghi chỉ giữ địa chỉ ảnh do Google phục vụ, kèm driveId để nhận ra.

   Dùng lh3.googleusercontent.com/d/<id>=w2000: Google tự thu ảnh về cạnh
   dài 2000px nên ảnh gốc 20 MB ra web vẫn nhẹ, mà phóng to xem vẫn nét.
   duongDan để null — không có tệp nào trong Storage để xoá kèm. */
function maDrive(link) {
  const s = String(link || "").trim();
  if (!/(drive|docs)\.google\.com|googleusercontent\.com/.test(s)) return "";
  const m = s.match(/\/file\/d\/([\w-]{10,})/) || s.match(/[?&]id=([\w-]{10,})/)
    || s.match(/googleusercontent\.com\/d\/([\w-]{10,})/);
  return m ? m[1] : "";
}
// link thư mục: drive.google.com/drive/folders/<id> (có thể kèm /u/0/)
function maThuMuc(link) {
  const m = String(link || "").match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]{10,})/);
  return m ? m[1] : "";
}
const anhDrive = (id) => ({ url: `https://lh3.googleusercontent.com/d/${id}=w2000`, duongDan: null, driveId: id });
const loiLinkDrive = (link) => /\/folders\//.test(link)
  ? "Đây là link thư mục. Ô này nhận một ảnh; muốn lấy cả thư mục thì dùng nút “Tải nhiều ảnh”."
  : "Link này không phải link ảnh Google Drive.";
const LOI_CHIA_SE = "Không mở được ảnh. Kiểm tra ảnh trên Drive đã chia sẻ “Bất kỳ ai có đường liên kết” chưa.";

// thử tải ảnh trước khi nhận: link riêng tư thì Google trả lỗi, báo ngay
function thuAnh(url) {
  return new Promise((ok) => {
    const im = new Image();
    im.onload = () => ok(im.naturalWidth > 0);
    im.onerror = () => ok(false);
    im.src = url;
  });
}

function ganTaiAnh(hop, m, d, anhDaChon) {
  hop.querySelectorAll("[data-chon]").forEach((b) =>
    b.addEventListener("click", () => hop.querySelector(`[data-tep="${b.dataset.chon}"]`).click()));

  const layDrive = async (ten) => {
    const o = hop.querySelector(`[data-drive="${ten}"]`);
    const tt = hop.querySelector(`[data-tt="${ten}"]`);
    const id = maDrive(o.value);
    if (!id) { bao(loiLinkDrive(o.value), "loi"); return; }
    const anh = anhDrive(id);
    tt.textContent = "Đang lấy ảnh từ Drive…";
    if (!(await thuAnh(anh.url))) { tt.textContent = ""; bao(LOI_CHIA_SE, "loi"); return; }
    anhDaChon[ten] = anh;
    hop.querySelector(`[data-xem="${ten}"]`).innerHTML = `<img src="${esc(anh.url)}" alt="" />`;
    hop.querySelector(`[data-bo="${ten}"]`).hidden = false;
    tt.textContent = "Đã lấy ảnh từ Drive";
    o.value = "";
  };
  hop.querySelectorAll("[data-lay-drive]").forEach((b) =>
    b.addEventListener("click", () => layDrive(b.dataset.layDrive)));
  // Enter trong ô link = bấm Lấy ảnh, không để nó bấm nút Lưu của hộp thoại
  hop.querySelectorAll("[data-drive]").forEach((o) =>
    o.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); layDrive(o.dataset.drive); }
    }));

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
