/* ==========================================================
   LƯỢC ĐỒ DỮ LIỆU
   Mỗi mục quản lý được mô tả ở đây, giao diện tự dựng theo mô tả
   này. Muốn thêm một trường mới thì khai báo thêm một dòng, KHÔNG
   phải viết thêm màn hình. Muốn thêm hẳn một mục mới cũng chỉ cần
   thêm một khối vào object bên dưới.

   Kiểu trường: text | dai (nhiều dòng) | so | ngay | gio | chon
                | anh | url | cong-tac (bật/tắt)
   ========================================================== */

/* Cột hiện trong bảng danh sách. Ảnh và cờ bật/tắt có cách vẽ riêng
   nên đánh dấu bằng kieu để bảng biết mà không phải đoán. */
const cot = (truong, nhan, kieu) => ({ truong, nhan, kieu: kieu || "text" });

export const LUOC_DO = {
  "tin-tuc": {
    nhan: "Tin tức",
    moTa: "Bài viết hiện ở trang Tin tức và khối tin mới nhất ngoài trang chủ.",
    bieuTuong: "M4 5h16v14H4zM7 9h10M7 13h10M7 17h6",
    sapXep: { truong: "ngay", chieu: "desc" },
    cot: [cot("anh", "Ảnh", "anh"), cot("tieuDe", "Tiêu đề"), cot("ngay", "Ngày", "ngay"), cot("chuDe", "Chủ đề"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "tieuDe", nhan: "Tiêu đề", kieu: "text", batBuoc: true },
      { ten: "ngay", nhan: "Ngày đăng", kieu: "ngay", batBuoc: true },
      { ten: "chuDe", nhan: "Chủ đề", kieu: "chon", batBuoc: true,
        chon: [{ gia: "hoat-dong", nhan: "Hoạt động" }, { gia: "su-kien", nhan: "Sự kiện" }] },
      { ten: "tomTat", nhan: "Tóm tắt", kieu: "dai", batBuoc: true, goiY: "2-4 câu, hiện ngay dưới tiêu đề trong thẻ tin." },
      { ten: "anh", nhan: "Ảnh minh hoạ", kieu: "anh", thuMuc: "tin-tuc" },
      { ten: "anhNguon", nhan: "Ghi công ảnh", kieu: "text", goiY: "Ví dụ: Ảnh: Báo Quân đội nhân dân" },
      { ten: "nguonTen", nhan: "Tên nguồn", kieu: "text", goiY: "Ví dụ: Báo Thanh Niên" },
      { ten: "nguonUrl", nhan: "Đường dẫn bài gốc", kieu: "url" },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  "lich-dien": {
    nhan: "Lịch diễn",
    moTa: "Suất diễn hiện ở trang chủ và là danh sách người xem chọn khi đặt chỗ.",
    bieuTuong: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4",
    sapXep: { truong: "ngay", chieu: "asc" },
    cot: [cot("ngay", "Ngày", "ngay"), cot("gio", "Giờ"), cot("tenVo", "Vở diễn"), cot("diaDiem", "Địa điểm"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "tenVo", nhan: "Tên vở diễn", kieu: "text", batBuoc: true },
      { ten: "ngay", nhan: "Ngày diễn", kieu: "ngay", batBuoc: true },
      { ten: "gio", nhan: "Giờ mở màn", kieu: "gio", batBuoc: true, macDinh: "20:00" },
      { ten: "theLoai", nhan: "Thể loại", kieu: "chon",
        chon: [{ gia: "Chèo cổ", nhan: "Chèo cổ" }, { gia: "Chèo hiện đại", nhan: "Chèo hiện đại" }, { gia: "Chương trình nghệ thuật", nhan: "Chương trình nghệ thuật" }] },
      { ten: "diaDiem", nhan: "Địa điểm", kieu: "text", batBuoc: true, macDinh: "Rạp Nhà hát Chèo Quân đội" },
      { ten: "diaChi", nhan: "Địa chỉ", kieu: "text", macDinh: "45 Ng. 126 Đ. Xuân Đỉnh, Xuân Đỉnh, Hà Nội" },
      { ten: "thoiLuong", nhan: "Thời lượng", kieu: "text", goiY: "Ví dụ: 120 phút" },
      { ten: "tongGhe", nhan: "Tổng số chỗ", kieu: "so", macDinh: 120,
        goiY: "Dùng để tính còn bao nhiêu chỗ. Đặt chỗ luôn miễn phí, không có giá vé." },
      { ten: "hienThi", nhan: "Nhận đặt chỗ", kieu: "cong-tac", macDinh: true }
    ]
  },

  "thu-vien-anh": {
    nhan: "Thư viện ảnh",
    moTa: "Mảng ảnh ở trang Tin tức. Bấm vào ảnh trên web sẽ mở bản đầy đủ.",
    bieuTuong: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5",
    sapXep: { truong: "thuTu", chieu: "asc" },
    cot: [cot("anh", "Ảnh", "anh"), cot("chuThich", "Chú thích"), cot("khoAnh", "Khổ"), cot("thuTu", "Thứ tự"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "anh", nhan: "Ảnh", kieu: "anh", batBuoc: true, thuMuc: "thu-vien" },
      { ten: "chuThich", nhan: "Chú thích", kieu: "text", batBuoc: true, goiY: "Không hiện dưới ảnh, chỉ hiện khi bấm vào xem bản đầy đủ." },
      { ten: "nguon", nhan: "Nguồn ảnh", kieu: "text", goiY: "Để trống nếu là ảnh Nhà hát tự chụp." },
      { ten: "khoAnh", nhan: "Khổ trong lưới", kieu: "chon", macDinh: "thuong",
        chon: [{ gia: "thuong", nhan: "Thường (1 ô)" }, { gia: "cao", nhan: "Cao (2 hàng)" }, { gia: "rong", nhan: "Rộng (2 cột)" }] },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  "vo-dien": {
    nhan: "Vở diễn",
    moTa: "Danh mục vở trong kịch mục của Nhà hát.",
    bieuTuong: "M5 4h14v16l-7-4-7 4z",
    sapXep: { truong: "ten", chieu: "asc" },
    cot: [cot("anh", "Ảnh", "anh"), cot("ten", "Tên vở"), cot("nhom", "Nhóm"), cot("nam", "Năm"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "ten", nhan: "Tên vở", kieu: "text", batBuoc: true },
      { ten: "nhom", nhan: "Nhóm", kieu: "chon", batBuoc: true,
        chon: [{ gia: "cheo-co", nhan: "Chèo cổ" }, { gia: "nguoi-linh", nhan: "Đề tài người lính" }, { gia: "danh-nhan", nhan: "Danh nhân - lịch sử" }] },
      { ten: "tomTat", nhan: "Tóm tắt", kieu: "dai" },
      { ten: "nam", nhan: "Năm dàn dựng", kieu: "text" },
      { ten: "giaiThuong", nhan: "Giải thưởng", kieu: "dai", goiY: "Mỗi giải một dòng." },
      { ten: "anh", nhan: "Ảnh", kieu: "anh", thuMuc: "vo-dien" },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  "nghe-si": {
    nhan: "Nghệ sĩ",
    moTa: "Bảng vàng danh hiệu NSND và NSƯT ở trang Lịch sử.",
    bieuTuong: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-4 4-6 8-6s8 2 8 6",
    sapXep: { truong: "thuTu", chieu: "asc" },
    cot: [cot("anh", "Ảnh", "anh"), cot("hoTen", "Họ tên"), cot("danhHieu", "Danh hiệu"), cot("namNSND", "Năm"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "hoTen", nhan: "Họ và tên", kieu: "text", batBuoc: true, goiY: "Không cần gõ tiền tố NSND/NSƯT, hệ thống tự ghép." },
      { ten: "danhHieu", nhan: "Danh hiệu", kieu: "chon", batBuoc: true,
        chon: [{ gia: "NSND", nhan: "Nghệ sĩ Nhân dân" }, { gia: "NSƯT", nhan: "Nghệ sĩ Ưu tú" }] },
      { ten: "namNSND", nhan: "Năm phong NSND", kieu: "text" },
      { ten: "namNSUT", nhan: "Năm phong NSƯT", kieu: "text" },
      { ten: "anh", nhan: "Ảnh chân dung", kieu: "anh", thuMuc: "nghe-si" },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  "lanh-dao": {
    nhan: "Lãnh đạo",
    moTa: "Danh sách lãnh đạo qua các thời kỳ ở trang Lịch sử.",
    bieuTuong: "M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z",
    sapXep: { truong: "thuTu", chieu: "asc" },
    cot: [cot("anh", "Ảnh", "anh"), cot("hoTen", "Họ tên"), cot("nhom", "Nhóm"), cot("nhiemKy", "Nhiệm kỳ"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "hoTen", nhan: "Họ và tên", kieu: "text", batBuoc: true, goiY: "Gồm cả quân hàm và danh hiệu, ví dụ: Đại tá, Đạo diễn, NSND Vũ Tự Long" },
      { ten: "nhom", nhan: "Nhóm", kieu: "chon", batBuoc: true,
        chon: [{ gia: "doan-truong", nhan: "Đoàn trưởng" }, { gia: "giam-doc", nhan: "Giám đốc Nhà hát" }, { gia: "chinh-tri-vien", nhan: "Chính trị viên - Bí thư Đảng ủy" }, { gia: "cap-pho", nhan: "Phó Đoàn trưởng - Phó Giám đốc" }] },
      { ten: "nhiemKy", nhan: "Nhiệm kỳ", kieu: "text", batBuoc: true, goiY: "Ví dụ: 9/2014 - 12/2024, hoặc: từ 12/2024, hoặc: chưa rõ" },
      { ten: "chucDanh", nhan: "Chức danh chi tiết", kieu: "text", goiY: "Chỉ điền khi một người giữ nhiều chức, ví dụ: Phó Đoàn trưởng (2002 - 2009) · Phó Giám đốc (2010 - 2011)" },
      { ten: "anh", nhan: "Ảnh chân dung", kieu: "anh", thuMuc: "lanh-dao" },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  "dat-cho": {
    nhan: "Đơn đặt chỗ",
    moTa: "Đơn giữ chỗ người xem gửi từ trang web. Đặt chỗ miễn phí, không thu tiền.",
    bieuTuong: "M4 7h16v10H4zM8 7v10M4 11h16",
    sapXep: { truong: "taoLuc", chieu: "desc" },
    /* Không cho tạo mới bằng tay: đơn phải đến từ trang web, gõ tay vào đây
       sẽ đẻ ra đơn không có mã và không khớp với chỗ ngồi đã giữ. */
    chiDoc: true,
    cot: [cot("ma", "Mã"), cot("hoTen", "Người đặt"), cot("dienThoai", "Điện thoại"), cot("tenVo", "Suất diễn"), cot("soGhe", "Số chỗ"), cot("trangThai", "Trạng thái")],
    truong: [
      { ten: "trangThai", nhan: "Trạng thái", kieu: "chon", batBuoc: true,
        chon: [{ gia: "moi", nhan: "Mới" }, { gia: "da-goi", nhan: "Đã liên hệ" }, { gia: "da-xac-nhan", nhan: "Đã xác nhận" }, { gia: "da-huy", nhan: "Đã huỷ" }] },
      { ten: "ghiChuNoiBo", nhan: "Ghi chú nội bộ", kieu: "dai", goiY: "Người xem không thấy phần này." }
    ],
    /* Thông tin người đặt chỉ để đọc, không sửa được — sửa đi thì không còn
       khớp với thứ người ta đã gửi lên. */
    chiXem: [
      { ten: "ma", nhan: "Mã đặt chỗ" },
      { ten: "hoTen", nhan: "Họ tên" },
      { ten: "dienThoai", nhan: "Điện thoại" },
      { ten: "email", nhan: "Email" },
      { ten: "donVi", nhan: "Đơn vị" },
      { ten: "tenVo", nhan: "Vở diễn" },
      { ten: "suatDien", nhan: "Suất diễn" },
      { ten: "gheNgoi", nhan: "Chỗ ngồi" },
      { ten: "soGhe", nhan: "Số chỗ" },
      { ten: "ghiChu", nhan: "Ghi chú của người đặt" }
    ]
  }
};

export const DANH_MUC = Object.keys(LUOC_DO);
