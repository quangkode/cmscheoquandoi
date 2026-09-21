/* ==========================================================
   ĐỐI CHIẾU CMS VỚI DỮ LIỆU GỐC

   Vì sao cần: "Xoá sạch rồi nạp lại" là búa tạ — nó xoá bằng hết, kể cả
   những bài bạn đã tự tay soạn trong CMS. Nhưng có hai lúc rất hay gặp
   mà không đáng phải dùng tới búa:

     • Lược đồ thêm trường mới (ví dụ Vở diễn vừa có thêm "Nhóm phụ",
       "Thẻ lớn đầu mục"). Bản ghi cũ trong Firestore không có trường đó,
       trang web đọc ra rỗng nên hiện thiếu.
     • Ảnh: trang web có sẵn 20 ảnh chân dung lãnh đạo trong kho mã, mà
       bản ghi trong CMS thì ô ảnh còn trống.

   Trang này so từng trường một, rồi CHỈ ĐIỀN VÀO CHỖ TRỐNG. Chỗ nào bạn
   đã nhập thì không đụng tới. Bản ghi bạn tự thêm trong CMS mà dữ liệu
   gốc không có cũng để yên — không xoá gì hết.

   Nút "ghi đè cả chỗ khác" là đường thoát cho trường hợp bản ghi trong
   CMS đã sai và muốn kéo về đúng bản gốc. Nó vẫn chừa ảnh đã tải lên kho
   Firebase ra (xem ghi chú ở giongNhau).
   ========================================================== */
import { DU_LIEU_GOC } from "./du-lieu-goc.js";
import { LUOC_DO } from "./luoc-do.js";

/* Ghép mục Firestore ↔ mảng trong dữ liệu gốc ↔ cách nhận ra "cùng một
   bản ghi". Khoá đối chiếu phải là thứ người nhập nhìn vào là biết, chứ
   không dùng id: id do Firestore sinh, dữ liệu gốc không có. */
export const MUC = [
  /* Tin tức không có mặt ở đây: dữ liệu gốc không còn giữ tin bài nào,
     tin chỉ do người dùng viết trong CMS.

     khongThem: chỉ so trường của bản ghi đang có, KHÔNG thêm lại bản ghi đã
     mất. Lịch diễn gắn với thời gian, suất diễn qua rồi xoá đi là chuyện
     bình thường; dữ liệu gốc là ảnh chụp trang web hồi 2024, thêm lại theo
     nó là dựng dậy đúng mấy suất vừa cố ý xoá. Bốn mục còn lại là danh mục
     tra cứu, thiếu bản nào đúng là thiếu thật. */
  { ma: "lich-dien",    khoa: "lichDien", nhanKhoa: "tên vở + ngày diễn", khongThem: true,
    lay: (r) => ch(r.tenVo) + "|" + ngay10(r.ngay) },
  { ma: "thu-vien-anh", khoa: "thuVien",  nhanKhoa: "chú thích",
    lay: (r) => ch(r.chuThich) },
  { ma: "nghe-si",      khoa: "ngheSi",   nhanKhoa: "họ tên",
    lay: (r) => ch(r.hoTen) },
  /* Không đưa nhiệm kỳ vào khoá: sửa một chữ trong nhiệm kỳ là bản ghi hoá
     ra "chưa có", công cụ lại thêm mới một bản trùng. Một người giữ hai
     cương vị thì hai dòng đã khác nhóm rồi. */
  { ma: "lanh-dao",     khoa: "lanhDao",  nhanKhoa: "họ tên + nhóm",
    lay: (r) => ch(r.hoTen) + "|" + ch(r.nhom) },
  { ma: "vo-dien",      khoa: "voDien",   nhanKhoa: "tên vở",
    lay: (r) => ch(r.ten) }
];

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ch = (v) => String(v ?? "").replace(/\s+/g, " ").trim().toLowerCase();

/* Ngày trong Firestore có khi là chuỗi "2026-08-08", có khi là Timestamp.
   Cắt về mười ký tự để hai bên so được với nhau. */
function ngay10(v) {
  if (!v) return "";
  if (typeof v.toDate === "function") return v.toDate().toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

/* Rỗng = chưa ai nhập gì. Số 0 và false KHÔNG rỗng: "Số chỗ đã nhận = 0"
   và "Hiện trên web = tắt" đều là lựa chọn có chủ ý, điền đè lên là sửa
   trộm ý người dùng. */
function rong(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "object") return !v.url;   // ô ảnh
  return false;
}

function giongNhau(a, b) {
  if (rong(a) && rong(b)) return true;
  if (a && b && typeof a === "object" && typeof b === "object") return a.url === b.url;
  return String(a ?? "") === String(b ?? "");
}

function toGon(v) {
  if (rong(v)) return "—";
  if (typeof v === "object") return v.url;
  if (v === true) return "bật";
  if (v === false) return "tắt";
  return String(v);
}

/* ----------------------------------------------------------
   So một mục: trả về danh sách việc phải làm, chưa ghi gì cả.
   ---------------------------------------------------------- */
export function soMot(m, dsCms) {
  const goc = DU_LIEU_GOC[m.khoa] || [];
  const truong = (LUOC_DO[m.ma].truong || []).map((t) => t.ten);

  const banDo = new Map();
  dsCms.forEach((r) => {
    const k = m.lay(r);
    // trùng khoá thì giữ bản đầu, bản sau đánh dấu là trùng để người dùng biết
    if (banDo.has(k)) (banDo.get(k).trung = banDo.get(k).trung || []).push(r);
    else banDo.set(k, { r });
  });

  const thieuTruong = [];   // { id, ten, dat:{...}, dong:[...] }
  const khacTruong = [];
  const thieuBanGhi = [];
  const daDung = new Set();

  goc.forEach((g) => {
    const k = m.lay(g);
    const o = banDo.get(k);
    if (!o) { if (!m.khongThem) thieuBanGhi.push(g); return; }
    daDung.add(k);

    const datThieu = {}, datKhac = {}, dongThieu = [], dongKhac = [];
    truong.forEach((t) => {
      if (!(t in g) || rong(g[t])) return;         // gốc không có gì để cho
      if (giongNhau(g[t], o.r[t])) return;
      /* Ảnh đã tải lên kho Firebase (có duongDan) thì tuyệt đối không đè:
         ghi đè xong là tệp trong Storage mất đường tìm ra, nằm lại đó
         vĩnh viễn và vẫn tính tiền. */
      const anhRieng = o.r[t] && typeof o.r[t] === "object" && o.r[t].duongDan;
      if (anhRieng) return;
      if (rong(o.r[t])) { datThieu[t] = g[t]; dongThieu.push(t + ": " + toGon(g[t])); }
      else { datKhac[t] = g[t]; dongKhac.push(t + ": " + toGon(o.r[t]) + " → " + toGon(g[t])); }
    });

    const ten = g.tieuDe || g.ten || g.hoTen || g.tenVo || g.chuThich || "(không tên)";
    if (dongThieu.length) thieuTruong.push({ id: o.r.id, ten, dat: datThieu, dong: dongThieu });
    if (dongKhac.length) khacTruong.push({ id: o.r.id, ten, dat: datKhac, dong: dongKhac });
  });

  const laVoiCms = dsCms.filter((r) => !daDung.has(m.lay(r)));
  const trung = [];
  banDo.forEach((o) => { if (o.trung) o.trung.forEach((r) => trung.push(r)); });

  return { thieuTruong, khacTruong, thieuBanGhi, laVoiCms, trung, tongGoc: goc.length, tongCms: dsCms.length };
}

/* ----------------------------------------------------------
   Vẽ ra màn hình
   ---------------------------------------------------------- */
function veHang(m, kq) {
  const sl = kq.thieuTruong.length + kq.khacTruong.length + kq.thieuBanGhi.length;
  const chip = (n, lop, chu) => (n ? `<span class="chip chip--${lop}">${n} ${chu}</span>` : "");
  return `<tr data-muc="${m.ma}">
    <td><strong>${esc(LUOC_DO[m.ma].nhan)}</strong>
        <span class="doi-chieu__phu">${kq.tongCms} trong CMS · ${kq.tongGoc} trong bản gốc</span></td>
    <td>
      ${sl || kq.laVoiCms.length || kq.trung.length ? "" : `<span class="chip chip--xanh">khớp</span>`}
      ${m.khongThem ? `<span class="chip chip--xam" title="Bài cũ gỡ đi, suất diễn qua rồi xoá đi là chuyện bình thường — công cụ này không dựng lại">chỉ so trường</span>` : ""}
      ${chip(kq.thieuTruong.length, "vang", "thiếu trường")}
      ${chip(kq.khacTruong.length, "xam", "khác bản gốc")}
      ${chip(kq.thieuBanGhi.length, "vang", "thiếu bản ghi")}
      ${chip(kq.laVoiCms.length, "xam", "chỉ có trong CMS")}
      ${chip(kq.trung.length, "do", "trùng khoá")}
    </td>
    <td class="o-thao-tac">
      ${sl ? `<button type="button" class="nut nut--nho" data-xem="${m.ma}">Xem</button>` : ""}
      ${kq.thieuTruong.length || kq.thieuBanGhi.length
        ? `<button type="button" class="nut nut--nho nut--chinh" data-dien="${m.ma}">Điền chỗ trống</button>` : ""}
    </td>
  </tr>
  <tr class="doi-chieu__chitiet" data-chitiet="${m.ma}" hidden><td colspan="3">${veChiTiet(m, kq)}</td></tr>`;
}

function veChiTiet(m, kq) {
  const khoi = (nhan, ds, ve) => ds.length
    ? `<h4>${esc(nhan)} (${ds.length})</h4><ul class="doi-chieu__ds">${ds.map(ve).join("")}</ul>` : "";
  return khoi("Bản ghi thiếu trường — sẽ điền vào chỗ trống", kq.thieuTruong,
        (x) => `<li><strong>${esc(x.ten)}</strong><br /><code>${esc(x.dong.join("  ·  "))}</code></li>`)
    + khoi("Bản ghi khác bản gốc — chỉ đổi khi bấm ghi đè", kq.khacTruong,
        (x) => `<li><strong>${esc(x.ten)}</strong><br /><code>${esc(x.dong.join("  ·  "))}</code></li>`)
    + khoi("Bản gốc có mà CMS chưa có — sẽ thêm mới", kq.thieuBanGhi,
        (x) => `<li>${esc(x.tieuDe || x.ten || x.hoTen || x.tenVo || x.chuThich || "(không tên)")}</li>`)
    + khoi("Chỉ có trong CMS — không đụng tới", kq.laVoiCms,
        (x) => `<li>${esc(x.tieuDe || x.ten || x.hoTen || x.tenVo || x.chuThich || "(không tên)")}</li>`)
    + khoi("Trùng khoá — hai bản ghi cùng " + m.nhanKhoa + ", nên xoá bớt một", kq.trung,
        (x) => `<li>${esc(x.tieuDe || x.ten || x.hoTen || x.tenVo || x.chuThich || "(không tên)")}</li>`);
}

/* ----------------------------------------------------------
   Gắn vào trang
   ---------------------------------------------------------- */
export async function dungDoiChieu(fb, khung, bao) {
  const veLai = async () => {
    khung.innerHTML = `<div class="dang-tai"><div class="xoay"></div>Đang đối chiếu…</div>`;
    const kqs = [];
    for (const m of MUC) {
      let ds = [];
      try { ds = await fb.layDanhSach(m.ma); } catch { ds = []; }
      kqs.push([m, soMot(m, ds)]);
    }

    const conViec = kqs.some(([, k]) => k.thieuTruong.length || k.thieuBanGhi.length);
    const coKhac = kqs.some(([, k]) => k.khacTruong.length);

    khung.innerHTML = `
      <div class="bang-bao">
        <table>
          <thead><tr><th>Mục</th><th>Tình trạng</th><th></th></tr></thead>
          <tbody>${kqs.map(([m, k]) => veHang(m, k)).join("")}</tbody>
        </table>
      </div>
      <p class="doi-chieu__nut">
        ${conViec ? `<button type="button" class="nut nut--chinh" id="dienTatCa">Điền chỗ trống cho tất cả</button>` : `<span class="chip chip--xanh">Không còn chỗ trống nào</span>`}
        ${coKhac ? `<button type="button" class="nut" id="ghiDe">Ghi đè cả chỗ khác bản gốc</button>` : ""}
      </p>
      <p id="doiChieuTienDo" class="doi-chieu__tiendo" hidden></p>`;

    const tienDo = khung.querySelector("#doiChieuTienDo");
    const viet = (t) => { tienDo.hidden = false; tienDo.textContent = t; };

    khung.querySelectorAll("[data-xem]").forEach((b) =>
      b.addEventListener("click", () => {
        const h = khung.querySelector(`[data-chitiet="${b.dataset.xem}"]`);
        h.hidden = !h.hidden;
        b.textContent = h.hidden ? "Xem" : "Thu lại";
      }));

    /* Ghi thật. deGiu = true thì chỉ điền chỗ trống; false thì đè cả chỗ
       khác. Thêm bản ghi mới chỉ làm ở chế độ điền chỗ trống — đè và thêm
       cùng lúc dễ nhân đôi nếu khoá đối chiếu gõ sai một dấu. */
    const chay = async (chiChoTrong) => {
      khung.querySelectorAll("button").forEach((b) => (b.disabled = true));
      let sua = 0, them = 0;
      try {
        for (const [m, k] of kqs) {
          const viecSua = chiChoTrong ? k.thieuTruong : k.thieuTruong.concat(k.khacTruong);
          for (const v of viecSua) {
            viet(`${LUOC_DO[m.ma].nhan}: đang sửa ${esc(v.ten)}…`);
            await fb.capNhat(m.ma, v.id, v.dat);
            sua++;
          }
          if (chiChoTrong) {
            for (const g of k.thieuBanGhi) {
              viet(`${LUOC_DO[m.ma].nhan}: đang thêm ${esc(g.tieuDe || g.ten || g.hoTen || g.tenVo || g.chuThich)}…`);
              await fb.themMoi(m.ma, g);
              them++;
            }
          }
        }
        viet(`Xong: sửa ${sua} bản ghi, thêm ${them} bản ghi. Đang đối chiếu lại…`);
        bao(`Đã sửa ${sua}, thêm ${them}.`, "xong");
        await veLai();
      } catch (e) {
        viet(`Hỏng giữa chừng sau ${sua} bản sửa: ${e.code || e.message}. Bấm lại để chạy tiếp phần còn lại.`);
        bao(
          e.code === "permission-denied"
            ? "Firestore chặn ghi. Kiểm tra firestore.rules và UID của bạn trong quan-tri."
            : "Lỗi: " + (e.code || e.message),
          "loi"
        );
        khung.querySelectorAll("button").forEach((b) => (b.disabled = false));
      }
    };

    khung.querySelectorAll("[data-dien]").forEach((b) =>
      b.addEventListener("click", async () => {
        const [m, k] = kqs.find(([x]) => x.ma === b.dataset.dien);
        khung.querySelectorAll("button").forEach((x) => (x.disabled = true));
        let sua = 0, them = 0;
        try {
          for (const v of k.thieuTruong) { viet(`Đang sửa ${v.ten}…`); await fb.capNhat(m.ma, v.id, v.dat); sua++; }
          for (const g of k.thieuBanGhi) { viet(`Đang thêm…`); await fb.themMoi(m.ma, g); them++; }
          bao(`${LUOC_DO[m.ma].nhan}: sửa ${sua}, thêm ${them}.`, "xong");
          await veLai();
        } catch (e) {
          viet(`Hỏng: ${e.code || e.message}`);
          bao("Lỗi: " + (e.code || e.message), "loi");
          khung.querySelectorAll("button").forEach((x) => (x.disabled = false));
        }
      }));

    khung.querySelector("#dienTatCa")?.addEventListener("click", () => chay(true));

    khung.querySelector("#ghiDe")?.addEventListener("click", () => {
      const n = kqs.reduce((a, [, k]) => a + k.khacTruong.length, 0);
      if (!confirm(
        `Sắp ghi đè ${n} bản ghi bằng nội dung trong dữ liệu gốc.\n\n` +
        `Những chỗ bạn đã sửa trong CMS mà khác bản gốc sẽ mất.\n` +
        `Ảnh bạn đã tải lên kho Firebase không bị đụng tới.\n\nTiếp tục?`
      )) return;
      chay(false);
    });
  };

  await veLai();
}
