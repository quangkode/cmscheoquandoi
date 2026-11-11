/* ==========================================================
   Diễn giải lỗi từ Firebase / fetch / Error chung thành câu
   tiếng Việt dễ hiểu cho người không rành máy tính. Gom các
   mã hay gặp; mã chưa có trong bảng rơi về chuỗi mặc định.
   Mã kỹ thuật vẫn được ghi ra console để quản trị F12 xem.
   ========================================================== */

const DIEN_GIAI = {
  /* --- Auth (sau khi đã đăng nhập; màn đăng nhập tự dịch riêng) --- */
  "auth/user-token-expired": "Phiên làm việc đã hết hạn. Đăng nhập lại.",
  "auth/user-disabled": "Tài khoản này đã bị khoá.",
  "auth/network-request-failed": "Không kết nối được Firebase. Kiểm tra mạng rồi thử lại.",

  /* --- Firestore --- */
  "permission-denied": "Luật Firestore chặn thao tác này. Kiểm tra đã đăng firestore.rules và UID của bạn có trong collection quan-tri chưa.",
  "unauthenticated": "Phiên đã hết hạn. Đăng nhập lại.",
  "not-found": "Không tìm thấy bản ghi. Có thể đã bị xoá.",
  "already-exists": "Bản ghi này đã tồn tại.",
  "unavailable": "Mất kết nối Firebase. Kiểm tra mạng rồi thử lại.",
  "cancelled": "Thao tác đã bị huỷ.",
  "deadline-exceeded": "Mạng chậm, quá thời gian chờ. Thử lại.",
  "resource-exhausted": "Đang quá tải. Thử lại sau ít phút.",
  "failed-precondition": "Firestore cần chỉ mục cho truy vấn này. Mở console (F12) xem link tạo chỉ mục.",

  /* --- Storage --- */
  "storage/unauthorized": "Luật Storage chặn tải ảnh. Kiểm tra đã đăng storage.rules và UID của bạn có trong collection quan-tri chưa.",
  "storage/unauthenticated": "Phiên đã hết hạn. Đăng nhập lại.",
  "storage/canceled": "Đã huỷ tải ảnh.",
  "storage/unknown": "Lỗi không rõ khi tải ảnh. Thử lại.",
  "storage/object-not-found": "Không tìm thấy ảnh trong kho. Có thể đã bị xoá.",
  "storage/bucket-not-found": "Chưa bật Storage trên Firebase Console.",
  "storage/project-not-found": "Dự án Firebase không tồn tại.",
  "storage/quota-exceeded": "Kho ảnh Firebase đã hết dung lượng. Liên hệ người quản trị hệ thống.",
  "storage/retry-limit-exceeded": "Thử nhiều lần không được. Kiểm tra mạng rồi tải lại.",
  "storage/invalid-checksum": "File tải lên bị lỗi đường truyền. Thử lại.",
  "storage/server-file-wrong-size": "File tải lên không khớp kích thước. Thử lại."
};

const MAC_DINH = "Có lỗi xảy ra — thử tải lại trang hoặc liên hệ người quản trị hệ thống.";

/* err có thể là FirebaseError (có .code), DOMException, TypeError,
   hoặc Error tự tạo trong code (new Error("câu tiếng Việt")).
   - Có .code khớp bảng: trả câu tiếng Việt từ bảng.
   - Có .message nhưng không có .code (Error tự tạo trong code của ta
     thường có message tiếng Việt sẵn): trả .message.
   - Còn lại: trả câu mặc định.
   Luôn ghi log kỹ thuật ra console để quản trị F12 xem. */
export function dienGiaiLoi(err) {
  const ma = err && err.code;
  if (err) console.error("[CMS] Lỗi:", ma || "(không mã)", err);
  if (ma && DIEN_GIAI[ma]) return DIEN_GIAI[ma];
  if (err && err.message && !ma) return err.message;
  return MAC_DINH;
}
