/* ==========================================================
   CẤU HÌNH FIREBASE — file DUY NHẤT bạn cần sửa để chạy được.

   Lấy ở đâu: console.firebase.google.com → chọn dự án →
   biểu tượng bánh răng ⚙ → Project settings → kéo xuống mục
   "Your apps" → chọn app Web (biểu tượng </>) → phần
   "SDK setup and configuration" → chọn "Config".
   Chép nguyên khối firebaseConfig rồi dán đè vào dưới đây.

   Mấy khoá này KHÔNG phải mật khẩu, lộ ra ngoài cũng không sao —
   Firebase thiết kế để chúng nằm công khai trong mã trang web.
   Cái thực sự chặn người lạ ghi dữ liệu là firestore.rules và
   storage.rules trong cùng thư mục này. Nhớ đăng hai file luật đó.
   ========================================================== */

export const cauHinhFirebase = {
  apiKey: "AIzaSyBNgKNSMPAOGsgLOmnH1yso3HWPcML_SIQ",
  authDomain: "cmsnhahatcheoquandoi.firebaseapp.com",
  projectId: "cmsnhahatcheoquandoi",
  storageBucket: "cmsnhahatcheoquandoi.firebasestorage.app",
  messagingSenderId: "298927410640",
  appId: "1:298927410640:web:5f41b7c0c2d86caca03dd5"
};

/* Đổi số này khi muốn nâng phiên bản Firebase SDK. Để một chỗ
   thay vì rải khắp các file, nâng cấp sau này chỉ sửa một dòng. */
export const PHIEN_BAN_SDK = "11.0.2";

/* Cờ tự kiểm: còn chữ DAN_VAO_DAY nghĩa là chưa cấu hình xong,
   các trang sẽ hiện lời nhắc thay vì lỗi trắng màn hình khó hiểu. */
export const daCauHinh = !JSON.stringify(cauHinhFirebase).includes("DAN_VAO_DAY");
