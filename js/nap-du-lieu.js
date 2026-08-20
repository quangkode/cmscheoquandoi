/* ==========================================================
   Nạp dữ liệu ban đầu vào Firestore.
   Chạy một lần khi mới dựng xong hệ thống. Cố ý KHÔNG tự chạy:
   bấm nhầm lần hai là mọi mục nhân đôi, nên phải bấm tay từng
   mục và phải xác nhận lại nếu mục đó đã có dữ liệu.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";
import { DU_LIEU_GOC } from "./du-lieu-goc.js";
import { LUOC_DO } from "./luoc-do.js";

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

/* Ghép mục trong Firestore với mảng dữ liệu tương ứng */
const BANG = [
  ["tin-tuc", "tinTuc"],
  ["lich-dien", "lichDien"],
  ["thu-vien-anh", "thuVien"],
  ["nghe-si", "ngheSi"],
  ["lanh-dao", "lanhDao"],
  ["vo-dien", "voDien"]
];

if (!daCauHinh) {
  noiDung.innerHTML = `<div class="nhac"><h3>Chưa nối Firebase</h3>
    <p>Dán <code>firebaseConfig</code> vào <code>cau-hinh.js</code> trước đã.</p></div>`;
} else {
  chay().catch((e) => {
    noiDung.innerHTML = `<div class="nhac"><h3>Lỗi</h3><p><code>${esc(e.message)}</code></p></div>`;
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

  const hienTai = {};
  for (const [ma] of BANG) {
    try { hienTai[ma] = (await fb.layDanhSach(ma)).length; } catch { hienTai[ma] = 0; }
  }

  noiDung.innerHTML = `
    <div class="nhac">
      <h3>Đọc kỹ trước khi bấm</h3>
      <p>Trang này <strong>thêm mới</strong> chứ không thay thế. Bấm hai lần vào cùng một mục
         là dữ liệu nhân đôi, phải vào CMS xoá tay từng cái.</p>
      <p>Ảnh giữ nguyên đường dẫn của trang web (<code>/anh/…</code>), chưa nằm trong kho
         Firebase. Web hiện đúng ngay; muốn đưa ảnh về hẳn Firebase thì vào CMS tải lại từng ảnh.</p>
    </div>

    <div class="bang-bao">
      <table>
        <thead><tr><th>Mục</th><th>Sẽ thêm</th><th>Đang có</th><th></th></tr></thead>
        <tbody>${BANG.map(([ma, khoa]) => `<tr>
          <td><strong>${esc(LUOC_DO[ma].nhan)}</strong></td>
          <td>${DU_LIEU_GOC[khoa].length} mục</td>
          <td>${hienTai[ma] ? `<span class="chip chip--vang">${hienTai[ma]} mục</span>` : `<span class="chip chip--xam">trống</span>`}</td>
          <td class="o-thao-tac">
            <button type="button" class="nut nut--nho ${hienTai[ma] ? "" : "nut--chinh"}" data-nap="${ma}" data-khoa="${khoa}">
              ${hienTai[ma] ? "Vẫn nạp thêm" : "Nạp"}
            </button>
          </td></tr>`).join("")}
        </tbody>
      </table>
    </div>

    <p style="margin-top:20px">
      <button type="button" class="nut nut--chinh" id="napTatCa">Nạp tất cả mục đang trống</button>
    </p>`;

  const napMot = async (ma, khoa, nut) => {
    const ds = DU_LIEU_GOC[khoa];
    nut.disabled = true;
    let xong = 0;
    try {
      for (const muc of ds) {
        // maCu chỉ để đối chiếu với mã suất cũ trong booking.js, không thuộc lược đồ
        await fb.themMoi(ma, muc);
        nut.textContent = `Đang nạp ${++xong}/${ds.length}…`;
      }
      nut.textContent = `Đã nạp ${xong}`;
      bao(`${LUOC_DO[ma].nhan}: đã nạp ${xong} mục.`, "xong");
    } catch (e) {
      nut.disabled = false;
      nut.textContent = "Thử lại";
      bao(
        e.code === "permission-denied"
          ? "Firestore chặn ghi. Kiểm tra đã đăng firestore.rules và UID của bạn có trong collection quan-tri chưa."
          : "Lỗi: " + (e.code || e.message),
        "loi"
      );
      // dừng hẳn: chạy tiếp sẽ để lại một mục nạp dở, khó biết đã tới đâu
      throw e;
    }
  };

  noiDung.querySelectorAll("[data-nap]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.textContent.includes("Vẫn nạp thêm") &&
          !confirm(`Mục này đã có ${hienTai[b.dataset.nap]} mục. Nạp thêm sẽ tạo bản trùng. Vẫn tiếp tục?`)) return;
      napMot(b.dataset.nap, b.dataset.khoa, b).catch(() => {});
    }));

  document.getElementById("napTatCa").addEventListener("click", async (e) => {
    e.target.disabled = true;
    for (const [ma, khoa] of BANG) {
      if (hienTai[ma]) continue;
      const nut = noiDung.querySelector(`[data-nap="${ma}"]`);
      try { await napMot(ma, khoa, nut); } catch { break; }
    }
    e.target.disabled = false;
    e.target.textContent = "Xong";
  });
}
