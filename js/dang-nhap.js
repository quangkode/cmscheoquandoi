/* Màn đăng nhập. Tách khỏi app.js vì đây là trang duy nhất được
   phép xem khi chưa có phiên. */
import { daCauHinh } from "../cau-hinh.js";

const canhBao = document.getElementById("canhBao");
const bieuMau = document.getElementById("bieuMau");
const oLoi = document.getElementById("loi");
const nutGui = document.getElementById("nutGui");

/* Chưa dán config mà vẫn cho bấm Đăng nhập thì người dùng chỉ nhận
   được một lỗi Firebase khó hiểu. Chặn ngay từ đây và chỉ đúng việc
   cần làm. */
if (!daCauHinh) {
  canhBao.innerHTML = `
    <div class="nhac" style="margin-bottom:18px">
      <h3>Chưa nối Firebase</h3>
      <p>Mở file <code>cau-hinh.js</code> rồi dán khối <code>firebaseConfig</code>
         lấy từ Firebase Console vào. Xem <code>README.md</code> để biết các bước.</p>
    </div>`;
  bieuMau.querySelectorAll("input, button").forEach((e) => (e.disabled = true));
} else {
  khoiDong();
}

async function khoiDong() {
  const fb = await import("./firebase.js");

  // đã có phiên thì vào thẳng, không bắt đăng nhập lại
  const sanCo = await fb.nguoiDungHienTai();
  if (sanCo) { location.replace("./app.html"); return; }

  const baoLoi = (t) => { oLoi.textContent = t; oLoi.style.display = t ? "block" : "none"; };

  const DIEN_GIAI = {
    "auth/invalid-email": "Email không đúng định dạng.",
    "auth/user-disabled": "Tài khoản này đã bị khoá.",
    "auth/user-not-found": "Không có tài khoản nào dùng email này.",
    "auth/wrong-password": "Sai mật khẩu.",
    "auth/invalid-credential": "Sai email hoặc mật khẩu.",
    "auth/too-many-requests": "Sai quá nhiều lần, thử lại sau vài phút.",
    "auth/network-request-failed": "Không kết nối được. Kiểm tra mạng rồi thử lại."
  };

  bieuMau.addEventListener("submit", async (e) => {
    e.preventDefault();
    baoLoi("");
    const email = bieuMau.email.value.trim();
    const mk = bieuMau.matKhau.value;
    if (!email || !mk) { baoLoi("Nhập đủ email và mật khẩu."); return; }

    nutGui.disabled = true;
    nutGui.textContent = "Đang đăng nhập…";
    try {
      const { user } = await fb.dangNhap(email, mk);
      // Đăng nhập được không có nghĩa là được quyền quản trị. Luật Firestore
      // vẫn chặn, nhưng chặn ở đây thì người dùng hiểu chuyện gì đang xảy ra
      // thay vì vào tới nơi rồi thấy mọi thứ báo "thiếu quyền".
      if (!(await fb.laQuanTri(user.uid))) {
        await fb.dangXuat();
        baoLoi("Tài khoản này chưa được cấp quyền quản trị. Xem mục Cấp quyền trong README.");
        return;
      }
      location.replace("./app.html");
    } catch (err) {
      baoLoi(DIEN_GIAI[err.code] || ("Không đăng nhập được: " + (err.code || err.message)));
    } finally {
      nutGui.disabled = false;
      nutGui.textContent = "Đăng nhập";
    }
  });

  document.getElementById("quenMk").addEventListener("click", async (e) => {
    e.preventDefault();
    const email = bieuMau.email.value.trim();
    if (!email) { baoLoi("Nhập email vào ô trên rồi bấm lại."); return; }
    try {
      await fb.doiMatKhau(email);
      baoLoi("");
      canhBao.innerHTML = `<div class="nhac" style="margin-bottom:18px"><p>Đã gửi thư đặt lại mật khẩu tới <strong>${email}</strong>. Kiểm tra cả hộp thư rác.</p></div>`;
    } catch (err) {
      baoLoi(DIEN_GIAI[err.code] || "Không gửi được thư đặt lại mật khẩu.");
    }
  });
}
