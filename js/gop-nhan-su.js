/* ==========================================================
   GỘP NGHỆ SĨ + LÃNH ĐẠO THÀNH MỘT DANH SÁCH NHÂN SỰ

   Chạy MỘT LẦN. Đọc hai mục cũ, ghép những dòng cùng một người lại,
   ghi sang mục nhan-su. KHÔNG đụng vào dữ liệu cũ — hai mục kia vẫn
   nằm nguyên làm bản lưu, đối chiếu xong ưng thì xoá sau.

   Vì sao phải gộp: chín dòng bên Lãnh đạo chính là người đã có trong
   bảng Nghệ sĩ. Sửa tên hay đổi ảnh một bên thì bên kia giữ bản cũ,
   không ai biết cho tới lúc nhìn ra trang web thấy hai chỗ ghi khác
   nhau. Hai người còn tệ hơn: tên bên Lãnh đạo có ghi NSƯT nhưng bảng
   Nghệ sĩ không hề có họ.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";

const noiDung = document.getElementById("noiDung");
const khayBao = document.getElementById("khayBao");
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function bao(t, k) {
  const el = document.createElement("div");
  el.className = "bao" + (k ? " bao--" + k : "");
  el.textContent = t;
  khayBao.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* ---------- Bóc tên ----------
   Bên Lãnh đạo, ô họ tên gói cả cụm: "Đại tá, Đạo diễn, NSƯT Đào Văn Lê".
   Tách ra thành từng ô riêng thì mới lọc, sắp và đối chiếu được, mà thăng
   quân hàm cũng chỉ sửa một ô thay vì sửa chuỗi. */
const QUAN_HAM = ["Thiếu tướng", "Đại tá", "Thượng tá", "Trung tá", "Thiếu tá", "Đại úy", "Thượng úy", "Trung úy"];
const NGHE = ["Đạo diễn", "Nhạc sĩ", "Biên đạo múa", "Biên đạo", "Nhà viết kịch", "Hoạ sĩ", "Họa sĩ"];
const HANG = { "giam-doc": 0, "doan-truong": 1, "chinh-tri-vien": 2, "cap-pho": 3 };
const NHAN_NHOM = {
  "doan-truong": "Đoàn trưởng", "giam-doc": "Giám đốc Nhà hát",
  "chinh-tri-vien": "Chính trị viên - Bí thư Đảng ủy", "cap-pho": "Phó Đoàn trưởng - Phó Giám đốc"
};

export function bocTen(ten) {
  let s = String(ten || "").trim();
  let quanHam = "", ngheChinh = "", danhHieu = "";
  for (const q of QUAN_HAM) if (s.includes(q)) { quanHam = q; s = s.replace(q, ""); break; }
  for (const n of NGHE) if (s.includes(n)) { ngheChinh = n; s = s.replace(n, ""); break; }
  const m = s.match(/NSND|NSƯT|NSUT/i);
  if (m) { danhHieu = m[0].toUpperCase() === "NSND" ? "NSND" : "NSƯT"; s = s.replace(m[0], ""); }
  return { hoTen: s.replace(/[,·]/g, " ").replace(/\s+/g, " ").trim(), quanHam, ngheChinh, danhHieu };
}

export const tenDayDu = (r) => {
  const dau = [r.quanHam, r.ngheChinh, r.danhHieu].filter(Boolean).join(", ");
  return (dau ? dau + " " : "") + (r.hoTen || "");
};

const namDau = (nk) => { const m = String(nk || "").match(/(19|20)\d{2}/); return m ? +m[0] : 9999; };
const khoaNguoi = (t) => bocTen(t).hoTen.toLowerCase();

/* ---------- Phép gộp ----------
   Tách riêng khỏi phần giao diện để chạy thử được bằng dữ liệu giả. */
export function gopNhanSu(dsNgheSi, dsLanhDao) {
  const nguoi = new Map();

  for (const a of dsNgheSi) {
    const b = bocTen(a.hoTen);
    nguoi.set(khoaNguoi(a.hoTen), {
      hoTen: b.hoTen, quanHam: b.quanHam, ngheChinh: b.ngheChinh,
      laNgheSi: true, danhHieu: a.danhHieu || b.danhHieu, namNSND: a.namNSND || "", namNSUT: a.namNSUT || "",
      laLanhDao: false, nhom: "", nhiemKy: "", chucDanh: "",
      anh: a.anh || null, thuTu: a.thuTu ?? 10, hienThi: a.hienThi !== false,
      tu: ["nghe-si"], moi: false
    });
  }

  const theo = new Map();
  for (const l of dsLanhDao) {
    const k = khoaNguoi(l.hoTen);
    if (!theo.has(k)) theo.set(k, []);
    theo.get(k).push(l);
  }

  for (const [k, ds] of theo) {
    const bocs = ds.map((x) => bocTen(x.hoTen));
    const quanHam = bocs.map((b) => b.quanHam).find(Boolean) || "";
    const ngheChinh = bocs.map((b) => b.ngheChinh).find(Boolean) || "";
    // hai dòng của cùng một người có thể ghi danh hiệu khác nhau (lên NSND
    // sau) — lấy bậc cao hơn
    const dhTen = bocs.some((b) => b.danhHieu === "NSND") ? "NSND"
      : bocs.some((b) => b.danhHieu === "NSƯT") ? "NSƯT" : "";

    // cương vị chính = bậc cao nhất từng giữ; cùng bậc thì lấy nhiệm kỳ gần đây
    const sap = ds.slice().sort((a, b) =>
      (HANG[a.nhom] ?? 9) - (HANG[b.nhom] ?? 9) || namDau(b.nhiemKy) - namDau(a.nhiemKy));
    const chinh = sap[0];

    /* Giữ MỘT nguồn cho "cương vị trước đó", không cộng hai.
       Nhiều dòng -> sinh lại từ chính các dòng kia, có kèm nhiệm kỳ.
       Một dòng   -> giữ nguyên chữ người ta đã gõ.
       Cộng cả hai thì Vũ Tự Long ra "Phó Giám đốc · Phó Đoàn trưởng - Phó
       Giám đốc (9/2014 - 12/2024)" — cùng một việc kể hai lần. */
    const truocDo = ds.length > 1
      ? sap.slice(1).sort((a, b) => namDau(a.nhiemKy) - namDau(b.nhiemKy))
          .map((r) => (NHAN_NHOM[r.nhom] || r.nhom) + (r.nhiemKy ? ` (${r.nhiemKy})` : "")).join(" · ")
      : (chinh.chucDanh || "");

    const co = nguoi.get(k);
    if (co) {
      co.laLanhDao = true;
      co.quanHam = co.quanHam || quanHam;
      co.ngheChinh = co.ngheChinh || ngheChinh;
      co.nhom = chinh.nhom; co.nhiemKy = chinh.nhiemKy; co.chucDanh = truocDo;
      if (!co.anh) co.anh = ds.map((r) => r.anh).find(Boolean) || null;
      co.tu.push("lanh-dao");
      co.soDong = ds.length;
    } else {
      nguoi.set(k, {
        hoTen: bocs[0].hoTen, quanHam, ngheChinh,
        // tên có ghi NSND/NSƯT thì người này ĐANG có danh hiệu, dù bảng
        // Nghệ sĩ bỏ sót — đánh dấu để bên dưới nhắc người kiểm lại
        laNgheSi: !!dhTen, danhHieu: dhTen, namNSND: "", namNSUT: "",
        laLanhDao: true, nhom: chinh.nhom, nhiemKy: chinh.nhiemKy, chucDanh: truocDo,
        anh: ds.map((r) => r.anh).find(Boolean) || null,
        thuTu: Math.min(...ds.map((r) => r.thuTu ?? 999)),
        hienThi: ds.some((r) => r.hienThi !== false),
        tu: ["lanh-dao"], moi: !!dhTen, soDong: ds.length
      });
    }
  }

  return [...nguoi.values()].sort((a, b) => (a.thuTu ?? 999) - (b.thuTu ?? 999));
}

/* ---------- Giao diện ---------- */
if (!daCauHinh) {
  noiDung.innerHTML = `<div class="nhac"><h3>Chưa nối Firebase</h3>
    <p>Dán <code>firebaseConfig</code> vào <code>cau-hinh.js</code> trước đã.</p></div>`;
} else {
  chay().catch((e) => {
    noiDung.innerHTML = `<div class="nhac nhac--nguy"><h3>Lỗi</h3><p><code>${esc(e.message)}</code></p></div>`;
  });
}

async function chay() {
  const fb = await import("./firebase.js");
  const nd = await fb.nguoiDungHienTai();
  if (!nd || !(await fb.laQuanTri(nd.uid))) {
    noiDung.innerHTML = `<div class="nhac"><h3>Cần đăng nhập bằng tài khoản quản trị</h3>
      <p><a href="./index.html">Đăng nhập</a> rồi quay lại trang này.</p></div>`;
    return;
  }

  const [dsNS, dsLD] = await Promise.all([fb.layDanhSach("nghe-si"), fb.layDanhSach("lanh-dao")]);

  /* nhan-su là mục MỚI: chưa đăng lại firestore.rules thì Firestore trả
     permission-denied. Bắt lỗi ở đây để báo đúng việc phải làm, thay vì
     để người ta bấm Gộp rồi mới đổ lỗi giữa chừng. */
  let daCo = [], chuaCoLuat = false;
  try { daCo = await fb.layDanhSach("nhan-su"); }
  catch (e) { chuaCoLuat = e.code === "permission-denied"; }

  const gop = gopNhanSu(dsNS, dsLD);
  const caHai = gop.filter((r) => r.laNgheSi && r.laLanhDao);
  const moi = gop.filter((r) => r.moi);
  const nhieuDong = gop.filter((r) => r.soDong > 1);

  noiDung.innerHTML = `
    ${chuaCoLuat ? `<div class="nhac nhac--nguy">
      <h3>Chưa đăng luật Firestore cho mục nhan-su</h3>
      <p>Firebase Console → Firestore Database → tab <strong>Rules</strong> → dán đè toàn bộ
         <code>firestore.rules</code> → <strong>Publish</strong>. Rồi tải lại trang này.</p>
    </div>` : ""}

    ${daCo.length ? `<div class="nhac nhac--nguy">
      <h3>Mục Nhân sự đã có ${daCo.length} bản ghi</h3>
      <p>Gộp tiếp là thành hai bản. Vào mục Nhân sự xoá sạch trước, rồi quay lại đây.</p>
    </div>` : ""}

    <div class="bang-bao" style="margin-bottom:18px">
      <table>
        <thead><tr><th>Trước khi gộp</th><th>Sau khi gộp</th></tr></thead>
        <tbody>
          <tr><td>Nghệ sĩ <strong>${dsNS.length}</strong> + Lãnh đạo <strong>${dsLD.length}</strong>
              = <strong>${dsNS.length + dsLD.length}</strong> bản ghi</td>
              <td><strong>${gop.length}</strong> người
              <span class="chip chip--xanh">bớt ${dsNS.length + dsLD.length - gop.length} bản trùng</span></td></tr>
          <tr><td>Một người ở hai mục phải sửa hai lần</td>
              <td><strong>${caHai.length}</strong> người giữ cả hai vai, mỗi người một bản ghi</td></tr>
          <tr><td>Chỉ nghệ sĩ</td><td>${gop.filter((r) => r.laNgheSi && !r.laLanhDao).length} người</td></tr>
          <tr><td>Chỉ lãnh đạo</td><td>${gop.filter((r) => !r.laNgheSi && r.laLanhDao).length} người</td></tr>
        </tbody>
      </table>
    </div>

    ${moi.length ? `<div class="nhac">
      <h3>${moi.length} người sẽ được nhận là nghệ sĩ có danh hiệu</h3>
      <p>Tên bên Lãnh đạo có ghi danh hiệu nhưng bảng Nghệ sĩ bỏ sót:
         <strong>${moi.map((r) => esc(r.danhHieu + " " + r.hoTen)).join(", ")}</strong>.
         Danh sách NSƯT trên web sẽ tăng thêm ${moi.length} người — câu mở đầu mục đó
         đang viết tay, nhớ xem lại con số.</p>
    </div>` : ""}

    ${nhieuDong.length ? `<div class="nhac">
      <h3>${nhieuDong.length} người từng giữ nhiều cương vị</h3>
      <p>Lấy cương vị cao nhất làm chính, các cương vị trước dồn vào ô "Các cương vị đã giữ trước đó".</p>
    </div>` : ""}

    <h2 style="font-size:19px;margin:22px 0 10px">Xem trước ${gop.length} bản ghi sẽ tạo</h2>
    <div class="bang-bao">
      <table>
        <thead><tr><th>Ảnh</th><th>Tên đầy đủ khi hiện ra web</th><th>Vai</th><th>Cương vị</th><th>Ghép từ</th></tr></thead>
        <tbody>${gop.map((r) => `<tr>
          <td class="o-anh">${r.anh?.url ? `<img src="${esc(r.anh.url)}" alt="" loading="lazy" />` : `<span class="khong-anh">—</span>`}</td>
          <td><strong>${esc(tenDayDu(r))}</strong>${r.moi ? ` <span class="chip chip--vang">mới nhận danh hiệu</span>` : ""}</td>
          <td>${r.laNgheSi ? `<span class="chip chip--xanh">Nghệ sĩ</span> ` : ""}${r.laLanhDao ? `<span class="chip chip--vang">Lãnh đạo</span>` : ""}</td>
          <td>${r.laLanhDao ? esc((NHAN_NHOM[r.nhom] || r.nhom) + (r.nhiemKy ? " · " + r.nhiemKy : "")) +
                (r.chucDanh ? `<br /><span class="goi-y">trước đó: ${esc(r.chucDanh)}</span>` : "") : "—"}</td>
          <td>${r.tu.length > 1 ? `<span class="chip chip--xanh">cả hai mục</span>` : esc(r.tu[0])}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>

    <p style="margin-top:20px">
      <button type="button" class="nut nut--chinh" id="nutGop"
        ${chuaCoLuat || daCo.length ? "disabled" : ""}>Gộp ${gop.length} người sang mục Nhân sự</button>
    </p>
    <div id="tienDo"></div>`;

  document.getElementById("nutGop")?.addEventListener("click", async (e) => {
    const nut = e.target;
    const tienDo = document.getElementById("tienDo");
    nut.disabled = true;
    let hong = 0;

    for (let i = 0; i < gop.length; i += 5) {
      tienDo.innerHTML = `<div class="dang-tai"><div class="xoay"></div>
        Đang ghi ${Math.min(i + 5, gop.length)}/${gop.length}…</div>`;
      await Promise.all(gop.slice(i, i + 5).map(async (r) => {
        // tu/moi/soDong chỉ để hiện bảng xem trước, đừng ghi lên Firestore
        const { tu, moi, soDong, ...ghi } = r;
        try { await fb.themMoi("nhan-su", ghi); } catch { hong++; }
      }));
    }

    tienDo.innerHTML = hong
      ? `<div class="nhac nhac--nguy"><h3>Ghi được ${gop.length - hong}/${gop.length}</h3>
         <p>${hong} bản ghi lỗi. Xoá sạch mục Nhân sự rồi thử lại.</p></div>`
      : `<div class="nhac"><h3>Xong — đã tạo ${gop.length} bản ghi trong mục Nhân sự</h3>
         <p>Hai mục cũ vẫn còn nguyên làm bản lưu. Đối chiếu trên web thấy đúng rồi thì
            vào <strong>Nghệ sĩ (bản cũ)</strong> và <strong>Lãnh đạo (bản cũ)</strong> chọn tất cả rồi xoá.</p>
         <p><a class="nut nut--chinh" href="./app.html#/nhan-su">Mở mục Nhân sự</a></p></div>`;
    bao(hong ? `Ghi hụt ${hong} bản ghi.` : `Đã gộp xong ${gop.length} người.`, hong ? "loi" : "xong");
  });
}
