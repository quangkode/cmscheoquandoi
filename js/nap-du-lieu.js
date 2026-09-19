/* ==========================================================
   Nạp dữ liệu ban đầu vào Firestore.
   Chạy một lần khi mới dựng xong hệ thống. Cố ý KHÔNG tự chạy:
   bấm nhầm lần hai là mọi mục nhân đôi, nên phải bấm tay từng
   mục và phải xác nhận lại nếu mục đó đã có dữ liệu.
   ========================================================== */
import { daCauHinh } from "../cau-hinh.js";
import { DU_LIEU_GOC } from "./du-lieu-goc.js";
import { LUOC_DO } from "./luoc-do.js";
import { dungDoiChieu } from "./doi-chieu.js";

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
    </p>

    <h2 class="doi-chieu__tieude">Đối chiếu với bản gốc</h2>
    <div class="nhac">
      <p>Dùng khi CMS <strong>đã có dữ liệu</strong> nhưng còn thiếu — hay gặp nhất là
         ô ảnh bỏ trống, hoặc lược đồ vừa thêm trường mới mà bản ghi cũ chưa có.</p>
      <p>Bảng dưới so từng trường với bản gốc rồi <strong>chỉ điền vào chỗ trống</strong>.
         Chỗ bạn đã nhập và bản ghi bạn tự thêm đều được giữ nguyên, không xoá gì cả.</p>
    </div>
    <div id="doiChieu"><div class="dang-tai"><div class="xoay"></div>Đang đối chiếu…</div></div>

    <div class="nhac nhac--nguy" style="margin-top:34px">
      <h3>Lỡ nạp trùng thì dùng nút này</h3>
      <p>Xoá sạch cả 6 mục nội dung rồi nạp lại từ đầu đúng một lần. Dùng khi
         bảng trên hiện số lớn hơn cột “Sẽ thêm”.</p>
      <p><strong>Mọi chỉnh sửa bạn đã làm trong CMS sẽ mất</strong>, chỉ còn lại
         đúng nội dung gốc rút từ trang web. Xoá xong không lấy lại được.</p>
      <p>Không đụng tới <strong>Đơn đặt chỗ</strong> và danh sách <strong>quản trị</strong>.</p>
      <p id="tienDo" style="display:none;font-weight:600;color:var(--do-dam)"></p>
      <button type="button" class="nut nut--nguy" id="xoaNapLai">Xoá sạch rồi nạp lại</button>
    </div>`;

  /* Nạp một mục, báo tiến độ ra ngoài qua hàm tien(). Tách khỏi napMot để
     nút "Xoá sạch rồi nạp lại" dùng lại được mà không phải chép lại vòng lặp. */
  const napVao = async (ma, khoa, tien) => {
    const ds = DU_LIEU_GOC[khoa];
    let xong = 0;
    for (const muc of ds) {
      // maCu chỉ để đối chiếu với mã suất cũ trong booking.js, không thuộc lược đồ
      await fb.themMoi(ma, muc);
      tien(++xong, ds.length);
    }
    return ds.length;
  };

  /* Xoá sạch một mục. Ảnh trong Firebase Storage phải xoá TRƯỚC bản ghi,
     giống hệt lúc xoá tay trong CMS: xoá bản ghi trước rồi hỏng giữa chừng
     là ảnh nằm lại trong kho vĩnh viễn, không còn đường nào tìm ra để dọn. */
  const xoaSach = async (ma, tien) => {
    const ds = await fb.layDanhSach(ma);
    const oAnh = LUOC_DO[ma].truong.filter((t) => t.kieu === "anh");
    let xong = 0;
    for (const d of ds) {
      for (const t of oAnh) if (d[t.ten]?.duongDan) await fb.xoaAnh(d[t.ten].duongDan);
      await fb.xoaBo(ma, d.id);
      tien(++xong, ds.length);
    }
    return ds.length;
  };

  const napMot = async (ma, khoa, nut) => {
    nut.disabled = true;
    let xong = 0;
    try {
      xong = await napVao(ma, khoa, (i, tong) => { nut.textContent = `Đang nạp ${i}/${tong}…`; });
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

  dungDoiChieu(fb, document.getElementById("doiChieu"), bao).catch((e) => {
    document.getElementById("doiChieu").innerHTML =
      `<div class="nhac"><h3>Không đối chiếu được</h3><p><code>${esc(e.message)}</code></p></div>`;
  });

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

  document.getElementById("xoaNapLai").addEventListener("click", async (e) => {
    const tong = Object.values(hienTai).reduce((a, b) => a + b, 0);

    /* Hai lớp chắn, cố ý phiền. Nút này xoá hàng trăm bản ghi và không có
       đường hoàn tác — chính vì bấm nhầm một nút mà dữ liệu mới thành trùng
       gấp đôi, nên nút dọn hậu quả không được phép bấm nhầm lần nữa. */
    if (!confirm(
      `Sắp xoá toàn bộ ${tong} bản ghi của 6 mục nội dung, rồi nạp lại từ đầu.\n\n` +
      `Mọi chỉnh sửa bạn đã làm trong CMS sẽ mất.\n` +
      `Đơn đặt chỗ và danh sách quản trị không bị đụng tới.\n\nTiếp tục?`
    )) return;

    if ((prompt("Gõ XOA (in hoa, không dấu) để xác nhận:") || "").trim().toUpperCase() !== "XOA") {
      bao("Đã huỷ, không xoá gì cả.");
      return;
    }

    const nut = e.target;
    const tienDo = document.getElementById("tienDo");
    const viet = (t) => { tienDo.textContent = t; };

    nut.disabled = true;
    document.getElementById("napTatCa").disabled = true;
    noiDung.querySelectorAll("[data-nap]").forEach((b) => (b.disabled = true));
    tienDo.style.display = "block";

    try {
      // Xoá hết rồi mới nạp, không xen kẽ: nếu hỏng giữa chừng thì mục nào
      // đã xoá vẫn còn trống hẳn, nhìn bảng là biết ngay đang dở tới đâu.
      for (const [ma] of BANG) {
        await xoaSach(ma, (i, t) => viet(`Đang xoá ${LUOC_DO[ma].nhan}: ${i}/${t}`));
      }
      for (const [ma, khoa] of BANG) {
        await napVao(ma, khoa, (i, t) => viet(`Đang nạp ${LUOC_DO[ma].nhan}: ${i}/${t}`));
      }
      viet("Xong. Đang tải lại bảng…");
      bao("Đã xoá sạch và nạp lại.", "xong");
      await chay();
    } catch (err) {
      nut.disabled = false;
      viet(`Hỏng giữa chừng: ${err.code || err.message}. Bấm lại để chạy tiếp từ đầu.`);
      bao(
        err.code === "permission-denied"
          ? "Firestore chặn. Kiểm tra firestore.rules và UID của bạn trong quan-tri."
          : "Lỗi: " + (err.code || err.message),
        "loi"
      );
    }
  });
}
