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
    locNhanh: [
      { nhan: "30 ngày qua", dat: { "tu:ngay": "@30NgayTruoc" } },
      { nhan: "Đang ẩn", dat: { "co:hienThi": "0" } }
    ],
    /* Bật nút "Lấy từ link báo" cho mục này. Chỉ có ý nghĩa ở nơi mà các
       trường trùng với thứ đọc được từ một bài báo (tiêu đề, tóm tắt, ảnh,
       nguồn) — mấy mục như Nghệ sĩ hay Lịch diễn thì không. */
    layTuBao: true,
    /* Mục này soạn ở trang riêng (soan-bai.html) chứ không phải hộp thoại:
       bài báo dài, cần cả màn hình và một thanh công cụ định dạng. */
    trangSoan: "./soan-bai.html",
    cot: [cot("anh", "Ảnh", "anh"), cot("tieuDe", "Tiêu đề"), cot("ngay", "Ngày", "ngay"), cot("chuDe", "Chủ đề"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "tieuDe", nhan: "Tiêu đề", kieu: "text", batBuoc: true },
      { ten: "ngay", nhan: "Ngày đăng", kieu: "ngay", batBuoc: true },
      { ten: "chuDe", nhan: "Chủ đề", kieu: "chon", batBuoc: true,
        chon: [{ gia: "hoat-dong", nhan: "Hoạt động" }, { gia: "su-kien", nhan: "Sự kiện" }] },
      { ten: "tomTat", nhan: "Tóm tắt", kieu: "dai", batBuoc: true },
      { ten: "noiDung", nhan: "Nội dung bài", kieu: "bai" },
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
    /* Hai câu hỏi thường trực với lịch diễn: sắp tới diễn gì, và tháng trước
       đã diễn những gì. Mốc ngày tính lúc bấm nên qua nửa đêm vẫn đúng. */
    locNhanh: [
      { nhan: "Sắp diễn", dat: { "tu:ngay": "@homNay" } },
      { nhan: "Đã qua", dat: { "den:ngay": "@homQua" } }
    ],
    // xếp lịch cả tháng thì nhìn theo lưới kẻ ô dễ dò hơn danh sách thưa;
    // bảng kẻ ô, cột chia đều, hàng tiêu đề dính khi cuộn
    bangTinh: true,
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
      { ten: "tongGhe", nhan: "Tổng số chỗ", kieu: "so", macDinh: 120 },
      { ten: "daDat", nhan: "Số chỗ đã nhận", kieu: "so", macDinh: 0 },
      { ten: "hienThi", nhan: "Nhận đặt chỗ", kieu: "cong-tac", macDinh: true }
    ]
  },

  "thu-vien-anh": {
    nhan: "Thư viện ảnh",
    moTa: "Mảng ảnh ở trang Tin tức. Bấm vào ảnh trên web sẽ mở bản đầy đủ.",
    bieuTuong: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5",
    sapXep: { truong: "thuTu", chieu: "asc" },
    locNhanh: [
      { nhan: "Thư viện (Tin tức)", dat: { "chon:khu": "thu-vien" } },
      { nhan: "Tư liệu (Lịch sử)", dat: { "chon:khu": "tu-lieu" } }
    ],
    cot: [cot("anh", "Ảnh", "anh"), cot("chuThich", "Chú thích"), cot("khu", "Khu vực"), cot("khoAnh", "Khổ"), cot("thuTu", "Thứ tự"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "anh", nhan: "Ảnh", kieu: "anh", batBuoc: true, thuMuc: "thu-vien" },
      /* Một mục chứa hai mảng ảnh khác hẳn nhau: ảnh hoạt động (trang Tin
         tức) và ảnh tư liệu lịch sử (trang Lịch sử). Gộp một chỗ vì cách
         nhập y hệt nhau, phân biệt bằng ô này. */
      { ten: "khu", nhan: "Khu vực", kieu: "chon", batBuoc: true, macDinh: "thu-vien",
        chon: [{ gia: "thu-vien", nhan: "Trang Tin tức · Thư viện ảnh" },
               { gia: "tu-lieu", nhan: "Trang Lịch sử · Tư liệu & hình ảnh" }] },
      { ten: "chuThich", nhan: "Chú thích", kieu: "text", batBuoc: true },
      { ten: "nguon", nhan: "Nguồn ảnh", kieu: "text" },
      { ten: "khoAnh", nhan: "Khổ trong lưới", kieu: "chon", macDinh: "thuong",
        chon: [{ gia: "thuong", nhan: "Thường (1 ô)" }, { gia: "cao", nhan: "Cao (2 hàng)" }, { gia: "rong", nhan: "Rộng (2 cột)" }] },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  "vo-dien": {
    nhan: "Vở diễn",
    moTa: "Danh mục vở ở trang Vở diễn, ba mục: Chèo cổ, Đề tài người lính, Danh nhân.",
    bieuTuong: "M5 4h14v16l-7-4-7 4z",
    /* Trang web xếp theo đúng thứ tự này chứ không theo bảng chữ cái: trong
       mỗi nhóm phụ, vở có năm dàn dựng đứng trước và xếp theo năm, vở chưa
       rõ năm xuống cuối. Sắp bảng theo thuTu để nhìn trong CMS giống hệt
       thứ tự ngoài trang. */
    sapXep: { truong: "thuTu", chieu: "asc" },
    locNhanh: [
      { nhan: "Thẻ lớn đầu mục", dat: { "co:noiBat": "1" } },
      { nhan: "Đang ẩn", dat: { "co:hienThi": "0" } }
    ],
    cot: [cot("anh", "Ảnh", "anh"), cot("ten", "Tên vở"), cot("nhom", "Nhóm"), cot("nhomPhu", "Nhóm phụ"), cot("nam", "Năm"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "ten", nhan: "Tên vở", kieu: "text", batBuoc: true },
      { ten: "nhom", nhan: "Nhóm", kieu: "chon", batBuoc: true,
        chon: [{ gia: "cheo-co", nhan: "Chèo cổ" }, { gia: "nguoi-linh", nhan: "Đề tài người lính" }, { gia: "danh-nhan", nhan: "Danh nhân - lịch sử" }] },
      { ten: "nhomPhu", nhan: "Nhóm phụ", kieu: "text",
        goiY: "Ví dụ: Kháng chiến chống Pháp và chống Mỹ — gõ giống hệt nhau cho các vở cùng nhóm." },
      { ten: "noiBat", nhan: "Thẻ lớn đầu mục", kieu: "cong-tac" },
      { ten: "nhanThe", nhan: "Nhãn trên thẻ lớn", kieu: "text",
        goiY: "Ví dụ: Kháng chiến chống Pháp" },
      { ten: "tomTat", nhan: "Tóm tắt", kieu: "dai" },
      { ten: "nam", nhan: "Năm dàn dựng", kieu: "text" },
      { ten: "trichDoan", nhan: "Là trích đoạn", kieu: "cong-tac" },
      { ten: "giaiDoan", nhan: "Chặng đường", kieu: "text",
        goiY: "Ví dụ: Giai đoạn 1986 - 2010 — gõ giống hệt nhau cho các vở cùng chặng" },
      { ten: "giaiThuong", nhan: "Giải thưởng", kieu: "dai", goiY: "Mỗi giải một dòng" },
      { ten: "anh", nhan: "Ảnh", kieu: "anh", thuMuc: "vo-dien" },
      { ten: "anhMoTa", nhan: "Mô tả ảnh", kieu: "text", goiY: "Ví dụ: Cảnh trong vở Đêm trắng" },
      { ten: "anhNguon", nhan: "Ghi chú dưới ảnh", kieu: "text", goiY: "Ví dụ: Ảnh: bìa đĩa VCD…" },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 500 },
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
      { ten: "hoTen", nhan: "Họ và tên", kieu: "text", batBuoc: true },
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
      { ten: "hoTen", nhan: "Họ và tên", kieu: "text", batBuoc: true, goiY: "Ví dụ: Đại tá, Đạo diễn, NSND Vũ Tự Long" },
      { ten: "nhom", nhan: "Nhóm", kieu: "chon", batBuoc: true,
        chon: [{ gia: "doan-truong", nhan: "Đoàn trưởng" }, { gia: "giam-doc", nhan: "Giám đốc Nhà hát" }, { gia: "chinh-tri-vien", nhan: "Chính trị viên - Bí thư Đảng ủy" }, { gia: "cap-pho", nhan: "Phó Đoàn trưởng - Phó Giám đốc" }] },
      { ten: "nhiemKy", nhan: "Nhiệm kỳ", kieu: "text", batBuoc: true, goiY: "Ví dụ: 9/2014 - 12/2024 · từ 12/2024 · chưa rõ" },
      { ten: "chucDanh", nhan: "Chức danh chi tiết", kieu: "text", goiY: "Ví dụ: Phó Đoàn trưởng (2002 - 2009) · Phó Giám đốc (2010 - 2011)" },
      { ten: "anh", nhan: "Ảnh chân dung", kieu: "anh", thuMuc: "lanh-dao" },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  /* ---------- Ảnh bìa chạy ở đầu trang chủ ---------- */
  "anh-bia": {
    nhan: "Ảnh bìa trang chủ",
    moTa: "Những tấm chạy luân phiên ở đầu trang chủ. Xoá hết thì trang chủ dùng lại ba tấm viết sẵn.",
    bieuTuong: "M4 6h16v12H4zM4 14l4-4 4 4 3-3 5 5",
    xemTrenWeb: "/#hero",
    sapXep: { truong: "thuTu", chieu: "asc" },
    locNhanh: [{ nhan: "Đang ẩn", dat: { "co:hienThi": "0" } }],
    cot: [cot("anh", "Ảnh", "anh"), cot("tieuDe", "Tiêu đề"), cot("nhan", "Nhãn nhỏ"), cot("thuTu", "Thứ tự"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "anh", nhan: "Ảnh bìa", kieu: "anh", thuMuc: "anh-bia", batBuoc: true },
      { ten: "nhan", nhan: "Nhãn nhỏ phía trên", kieu: "text", goiY: "Ví dụ: Mùa diễn 2026" },
      { ten: "tieuDe", nhan: "Tiêu đề", kieu: "text", batBuoc: true, goiY: "Ví dụ: Hồn chèo" },
      { ten: "tieuDeVang", nhan: "Phần tiêu đề tô vàng", kieu: "text", goiY: "Ví dụ: giữa lòng người lính" },
      { ten: "moTa", nhan: "Mô tả", kieu: "dai" },
      { ten: "nut1Chu", nhan: "Nút 1 — chữ", kieu: "text", goiY: "Ví dụ: Lịch biểu diễn" },
      { ten: "nut1Link", nhan: "Nút 1 — đường dẫn", kieu: "text", goiY: "Ví dụ: #lich-dien hoặc ./vo-dien.html" },
      { ten: "nut2Chu", nhan: "Nút 2 — chữ", kieu: "text" },
      { ten: "nut2Link", nhan: "Nút 2 — đường dẫn", kieu: "text" },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  /* ---------- Dấu mốc lịch sử ---------- */
  "dau-moc": {
    nhan: "Dấu mốc",
    moTa: "Mục Dấu mốc nổi bật ở trang Lịch sử.",
    bieuTuong: "M12 3v18M6 7h12M8 12h8M9 17h6",
    xemTrenWeb: "/lich-su.html#dau-moc",
    sapXep: { truong: "thuTu", chieu: "asc" },
    locNhanh: [{ nhan: "Đang ẩn", dat: { "co:hienThi": "0" } }],
    cot: [cot("anh", "Ảnh", "anh"), cot("moc", "Mốc"), cot("tieuDe", "Tiêu đề"), cot("thuTu", "Thứ tự"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "moc", nhan: "Mốc thời gian", kieu: "text", batBuoc: true, goiY: "Ví dụ: 01/10/1954" },
      { ten: "tieuDe", nhan: "Tiêu đề", kieu: "text", batBuoc: true },
      { ten: "moTa", nhan: "Nội dung", kieu: "dai" },
      { ten: "anh", nhan: "Ảnh tư liệu", kieu: "anh", thuMuc: "dau-moc" },
      { ten: "anhMoTa", nhan: "Mô tả ảnh", kieu: "text", goiY: "Ví dụ: Đội Văn công trong những năm đầu thành lập" },
      { ten: "thuTu", nhan: "Thứ tự", kieu: "so", macDinh: 10 },
      { ten: "hienThi", nhan: "Hiện trên web", kieu: "cong-tac", macDinh: true }
    ]
  },

  /* ---------- Thông tin chung: dải trên cùng, chân trang, mục Liên hệ ----------
     motBanGhi: mục này chỉ có đúng một bản ghi. Có rồi thì CMS giấu nút
     "Thêm mới" và nút xoá — hai bản ghi thì trang web biết lấy bản nào. */
  "thong-tin": {
    nhan: "Thông tin chung",
    moTa: "Địa chỉ, điện thoại, email, mạng xã hội. Hiện ở dải trên cùng và chân trang của mọi trang, và ở mục Liên hệ ngoài trang chủ.",
    bieuTuong: "M12 21.2s6.8-6.2 6.8-11.3a6.8 6.8 0 1 0-13.6 0c0 5.1 6.8 11.3 6.8 11.3ZM12 7.1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5",
    xemTrenWeb: "/#lien-he",
    motBanGhi: true,
    cot: [cot("diaChi", "Địa chỉ"), cot("dienThoai", "Điện thoại"), cot("email", "Email")],
    truong: [
      { ten: "diaChi", nhan: "Địa chỉ", kieu: "text" },
      { ten: "dienThoai", nhan: "Điện thoại", kieu: "text", goiY: "Ví dụ: 024 3845 7583" },
      { ten: "email", nhan: "Email chung", kieu: "text" },
      { ten: "emailTruyenThong", nhan: "Email truyền thông", kieu: "text" },
      { ten: "gioDonTiep", nhan: "Giờ quầy đón tiếp", kieu: "text", goiY: "Ví dụ: 8:00 - 21:00 hằng ngày" },
      { ten: "gioHanhChinh", nhan: "Giờ hành chính", kieu: "text", goiY: "Ví dụ: 8:00 - 17:00 các ngày trong tuần" },
      { ten: "gioiThieu", nhan: "Giới thiệu ngắn ở chân trang", kieu: "dai" },
      { ten: "facebook", nhan: "Facebook", kieu: "url" },
      { ten: "youtube", nhan: "YouTube", kieu: "url" },
      { ten: "tiktok", nhan: "TikTok", kieu: "url" }
    ]
  },

  /* ---------- Khối nội dung rải trên các trang ----------
     Chín vùng khác nhau nhưng cùng một khuôn: một dòng nhỏ, một tiêu đề,
     một đoạn mô tả. Gộp vào MỘT mục chứ không tách chín mục — chín dòng
     menu cho vài chục thẻ thì tìm còn lâu hơn là sửa. Phân biệt bằng ô
     "Khu vực", và có nút lọc nhanh cho từng vùng. */
  "khoi-trang": {
    nhan: "Khối nội dung",
    moTa: "Các thẻ ngắn rải trên những trang khác: nhiệm vụ, giá trị, phần thưởng, liệt sĩ, hướng dẫn đặt chỗ…",
    bieuTuong: "M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z",
    xemTrenWeb: "/gioi-thieu.html#su-menh",
    sapXep: { truong: "thuTu", chieu: "asc" },
    locNhanh: [
      { nhan: "Giới thiệu", dat: { "tim": "gioi-thieu" } },
      { nhan: "Đang ẩn", dat: { "co:hienThi": "0" } }
    ],
    cot: [cot("khu", "Khu vực"), cot("nhan", "Dòng nhỏ"), cot("tieuDe", "Tiêu đề"), cot("thuTu", "Thứ tự"), cot("hienThi", "Hiện", "cong-tac")],
    truong: [
      { ten: "khu", nhan: "Khu vực", kieu: "chon", batBuoc: true,
        chon: [
          { gia: "nhanh", nhan: "Trang chủ · Thông tin nhanh" },
          { gia: "gioi-thieu-doi-net", nhan: "Giới thiệu · Đôi nét (đoạn văn)" },
          { gia: "gioi-thieu-su-menh", nhan: "Giới thiệu · Bốn nhiệm vụ" },
          { gia: "gioi-thieu-tam-nhin", nhan: "Giới thiệu · Tầm nhìn" },
          { gia: "gioi-thieu-gia-tri", nhan: "Giới thiệu · Ba thành tố" },
          { gia: "gioi-thieu-chuc-nang", nhan: "Giới thiệu · Chức năng & Năng lực" },
          { gia: "phan-thuong", nhan: "Lịch sử · Phần thưởng cao quý" },
          { gia: "liet-si", nhan: "Nghệ sĩ · Tưởng nhớ liệt sĩ" },
          { gia: "huong-dan", nhan: "Đặt chỗ · Hướng dẫn đặt chỗ" }
        ] },
      { ten: "nhan", nhan: "Dòng nhỏ phía trên", kieu: "text",
        goiY: "Năm với phần thưởng, chức vụ với liệt sĩ. Mấy khu khác để trống." },
      { ten: "tieuDe", nhan: "Tiêu đề", kieu: "text",
        goiY: "Khu Đôi nét và Tầm nhìn để trống, chỉ cần ô Nội dung." },
      { ten: "moTa", nhan: "Nội dung", kieu: "dai" },
      { ten: "ghiChu", nhan: "Dòng nhỏ phía dưới", kieu: "text",
        goiY: 'Ví dụ: Tác giả ca khúc "Trước ngày hội bắn"' },
      { ten: "noiBat", nhan: "Thẻ lớn nổi bật", kieu: "cong-tac",
        goiY: "Chỉ dùng cho Phần thưởng — thẻ chiếm trọn hàng, nền xanh đậm." },
      { ten: "bieuTuong", nhan: "Biểu tượng", kieu: "chon", macDinh: "",
        goiY: "Chỉ dùng cho Thông tin nhanh ở trang chủ.",
        chon: [{ gia: "", nhan: "— không —" }, { gia: "ve", nhan: "Tấm vé" },
               { gia: "gio", nhan: "Đồng hồ" }, { gia: "xe", nhan: "Xe lưu diễn" },
               { gia: "hoc", nhan: "Mũ tốt nghiệp" }, { gia: "sao", nhan: "Ngôi sao" }] },
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
    /* Lọc theo ngày gửi đơn. Phải khai riêng vì taoLuc do Firestore tự ghi,
       không nằm trong truong[] như mấy trường người nhập. */
    locNgay: { truong: "taoLuc", nhan: "Ngày gửi" },
    locNhanh: [
      { nhan: "Đơn mới", dat: { "chon:trangThai": "moi" } },
      { nhan: "Đã xác nhận", dat: { "chon:trangThai": "da-xac-nhan" } }
    ],
    cot: [cot("ma", "Mã"), cot("hoTen", "Người đặt"), cot("dienThoai", "Điện thoại"), cot("tenVo", "Suất diễn"), cot("soGhe", "Số chỗ"), cot("trangThai", "Trạng thái")],
    truong: [
      { ten: "trangThai", nhan: "Trạng thái", kieu: "chon", batBuoc: true,
        chon: [{ gia: "moi", nhan: "Mới" }, { gia: "da-goi", nhan: "Đã liên hệ" }, { gia: "da-xac-nhan", nhan: "Đã xác nhận" }, { gia: "da-huy", nhan: "Đã huỷ" }] },
      { ten: "ghiChuNoiBo", nhan: "Ghi chú nội bộ", kieu: "dai" }
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
