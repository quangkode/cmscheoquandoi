/* ==========================================================
   DỮ LIỆU GỐC — rút tự động từ các trang HTML đang chạy.

   Đây là BẢN ĐỐI CHIẾU: nội dung trong này phải khớp đúng thứ trang web
   hiển thị. Trang nap-du-lieu.html dùng nó theo hai cách —
     • "Nạp"  : đổ vào Firestore lần đầu, khi mục còn trống.
     • "Đối chiếu": so từng trường với bản ghi đang có trong Firestore rồi
       điền nốt chỗ thiếu. Dùng khi thêm trường mới vào lược đồ, hoặc khi
       ảnh trong CMS bị rỗng mà trang web thì đang có.

   Ảnh để dạng đường dẫn tương đối theo trang web (/anh/...) chứ chưa nằm
   trong Firebase Storage. Trang web hiện đúng ngay; muốn ảnh về hẳn kho
   Firebase thì vào CMS tải lại từng ảnh.
   ========================================================== */
export const DU_LIEU_GOC = {
  /* KHÔNG có "tinTuc" ở đây. Năm bài đầu tiên vốn là tin lấy theo đường
     dẫn báo chí, đưa vào cho trang đỡ trống lúc mới dựng. Nay tin bài chỉ
     đến từ CMS: viết trong mục Tin tức là hiện ra trang, xoá trong đó là
     mất hẳn. Để lại dữ liệu gốc thì bấm "Nạp" một cái là năm bài vừa xoá
     sống dậy. */
  "lichDien": [
    {
      "tenVo": "Quan Âm Thị Kính",
      "ngay": "2026-08-08",
      "gio": "20:00",
      "theLoai": "Chèo cổ",
      "diaDiem": "Rạp Nhà hát Chèo Quân đội",
      "diaChi": "45 Ng. 126 Đ. Xuân Đỉnh, Xuân Đỉnh, Hà Nội",
      "thoiLuong": "120 phút",
      "tongGhe": 120,
      "hienThi": true,
      "maCu": "nhc-0808"
    },
    {
      "tenVo": "Đất liền và biển cả",
      "ngay": "2026-08-15",
      "gio": "20:00",
      "theLoai": "Chèo hiện đại",
      "diaDiem": "Rạp Nhà hát Chèo Quân đội",
      "diaChi": "45 Ng. 126 Đ. Xuân Đỉnh, Xuân Đỉnh, Hà Nội",
      "thoiLuong": "135 phút",
      "tongGhe": 120,
      "hienThi": true,
      "maCu": "nhc-1508"
    },
    {
      "tenVo": "Lưu Bình - Dương Lễ",
      "ngay": "2026-08-22",
      "gio": "20:00",
      "theLoai": "Chèo cổ",
      "diaDiem": "Nhà văn hóa Quân khu 3",
      "diaChi": "TP. Hải Phòng",
      "thoiLuong": "110 phút",
      "tongGhe": 120,
      "hienThi": true,
      "maCu": "nhc-2208"
    },
    {
      "tenVo": "Đêm nhạc: Điệu chèo người lính",
      "ngay": "2026-08-29",
      "gio": "19:30",
      "theLoai": "Chương trình nghệ thuật",
      "diaDiem": "Rạp Nhà hát Chèo Quân đội",
      "diaChi": "45 Ng. 126 Đ. Xuân Đỉnh, Xuân Đỉnh, Hà Nội",
      "thoiLuong": "100 phút",
      "tongGhe": 120,
      "hienThi": true,
      "maCu": "nhc-2908"
    }
  ],
  /* Cũng không có "thuVien". Sáu ảnh đầu tiên là ảnh mượn của báo, đưa
     vào cho mục Thư viện ảnh đỡ trống lúc mới dựng — cùng một loại nội
     dung thừa như mấy bài tin kia. Ảnh nay chỉ do người dùng tải lên
     trong CMS. */
  "ngheSi": [
    {
      "hoTen": "Đào Lê",
      "danhHieu": "NSND",
      "namNSND": "2015",
      "namNSUT": "1997",
      "anh": {
        "url": "/anh/lanh-dao/dao-van-le.jpg",
        "duongDan": null
      },
      "thuTu": 10,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Quốc Trượng",
      "danhHieu": "NSND",
      "namNSND": "2015",
      "namNSUT": "2001",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-quoc-truong.jpg",
        "duongDan": null
      },
      "thuTu": 20,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Thị Ngọc Viễn",
      "danhHieu": "NSND",
      "namNSND": "2015",
      "namNSUT": "2007",
      "anh": {
        "url": "/anh/nghe-si/ngoc-vien.jpg",
        "duongDan": null
      },
      "thuTu": 30,
      "hienThi": true
    },
    {
      "hoTen": "Trịnh Minh Tiến",
      "danhHieu": "NSND",
      "namNSND": "2015",
      "namNSUT": "2007",
      "anh": {
        "url": "/anh/nghe-si/trinh-minh-tien.jpg",
        "duongDan": null
      },
      "thuTu": 40,
      "hienThi": true
    },
    {
      "hoTen": "Vũ Tự Long",
      "danhHieu": "NSND",
      "namNSND": "2015",
      "namNSUT": "2012",
      "anh": {
        "url": "/anh/lanh-dao/vu-tu-long.jpg",
        "duongDan": null
      },
      "thuTu": 50,
      "hienThi": true
    },
    {
      "hoTen": "Đặng Xuân Theo",
      "danhHieu": "NSND",
      "namNSND": "2023",
      "namNSUT": "1998",
      "anh": {
        "url": "/anh/nghe-si/dang-xuan-theo.jpg",
        "duongDan": null
      },
      "thuTu": 60,
      "hienThi": true
    },
    {
      "hoTen": "Phạm Đình Óng",
      "danhHieu": "NSND",
      "namNSND": "2023",
      "namNSUT": "2015",
      "anh": {
        "url": "/anh/nghe-si/pham-dinh-ong.jpg",
        "duongDan": null
      },
      "thuTu": 70,
      "hienThi": true
    },
    {
      "hoTen": "Lương Thị Thùy Linh",
      "danhHieu": "NSND",
      "namNSND": "2023",
      "namNSUT": "2015",
      "anh": {
        "url": "/anh/nghe-si/luong-thuy-linh.jpg",
        "duongDan": null
      },
      "thuTu": 80,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Thị Thu Hòa",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "1993",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 90,
      "hienThi": true
    },
    {
      "hoTen": "Phạm Thanh Hải",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "1997",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 100,
      "hienThi": true
    },
    {
      "hoTen": "Đỗ Tùng",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "1997",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 110,
      "hienThi": true
    },
    {
      "hoTen": "Đồng Bảo Quý",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2001",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 120,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Thế Phiệt",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2007",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 130,
      "hienThi": true
    },
    {
      "hoTen": "Trần Trung Sinh",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2007",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 140,
      "hienThi": true
    },
    {
      "hoTen": "Vũ Phương Thúy",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2007",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 150,
      "hienThi": true
    },
    {
      "hoTen": "Mai Tú Lệ",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2012",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 160,
      "hienThi": true
    },
    {
      "hoTen": "Vũ Duy Từ",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2012",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 170,
      "hienThi": true
    },
    {
      "hoTen": "Phạm Văn Chính",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 180,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Tiến Lợi",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 190,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Văn Minh",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 200,
      "hienThi": true
    },
    {
      "hoTen": "Hà Quang Hảo",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 210,
      "hienThi": true
    },
    {
      "hoTen": "Phạm Hữu Vương",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 220,
      "hienThi": true
    },
    {
      "hoTen": "Cấn Thị Lương",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 230,
      "hienThi": true
    },
    {
      "hoTen": "Thái Phương Ngọc",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2015",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 240,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Thị Thanh",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 250,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Đức Hải",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 260,
      "hienThi": true
    },
    {
      "hoTen": "Trần Thị Liên",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 270,
      "hienThi": true
    },
    {
      "hoTen": "Cao Ngọc Sơn",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 280,
      "hienThi": true
    },
    {
      "hoTen": "Ngô Thị Thu Hiền",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 290,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Xuân Hải",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 300,
      "hienThi": true
    },
    {
      "hoTen": "Trần Hồng Minh",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 310,
      "hienThi": true
    },
    {
      "hoTen": "Hoàng Tiến Dũng",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2019",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 320,
      "hienThi": true
    },
    {
      "hoTen": "Ngô Thanh Tuyết",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2023",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 330,
      "hienThi": true
    },
    {
      "hoTen": "Phạm Xuân Dương",
      "danhHieu": "NSƯT",
      "namNSND": "",
      "namNSUT": "2023",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 340,
      "hienThi": true
    }
  ],
  "lanhDao": [
    {
      "hoTen": "Bùi Công Kỳ",
      "nhom": "doan-truong",
      "nhiemKy": "1954",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/bui-cong-ky.jpg",
        "duongDan": null
      },
      "thuTu": 10,
      "hienThi": true
    },
    {
      "hoTen": "Chưa có tư liệu",
      "nhom": "doan-truong",
      "nhiemKy": "1954 - 1969",
      "chucDanh": "",
      "anh": {
        "url": null,
        "duongDan": null
      },
      "thuTu": 15,
      "hienThi": true
    },
    {
      "hoTen": "Nhạc sĩ Nguyễn Thành",
      "nhom": "doan-truong",
      "nhiemKy": "1969 - 1973",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-thanh.jpg",
        "duongDan": null
      },
      "thuTu": 20,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Văn Thơm",
      "nhom": "doan-truong",
      "nhiemKy": "1973 - 1975",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-van-thom.jpg",
        "duongDan": null
      },
      "thuTu": 30,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Văn Thuyên",
      "nhom": "doan-truong",
      "nhiemKy": "1975 - 1989",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-van-thuyen.jpg",
        "duongDan": null
      },
      "thuTu": 40,
      "hienThi": true
    },
    {
      "hoTen": "Nhạc sĩ, NSƯT Nguyễn Thế Phiệt",
      "nhom": "doan-truong",
      "nhiemKy": "1989 - 2005",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-the-phiet.jpg",
        "duongDan": null
      },
      "thuTu": 50,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, Đạo diễn, NSƯT Đào Văn Lê",
      "nhom": "doan-truong",
      "nhiemKy": "2005 - 2009",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/dao-van-le.jpg",
        "duongDan": null
      },
      "thuTu": 60,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, Đạo diễn, NSƯT Đào Văn Lê",
      "nhom": "giam-doc",
      "nhiemKy": "2010 - 7/2014",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/dao-van-le.jpg",
        "duongDan": null
      },
      "thuTu": 70,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, Đạo diễn, NSND Nguyễn Quốc Trượng",
      "nhom": "giam-doc",
      "nhiemKy": "9/2014 - 12/2024",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-quoc-truong.jpg",
        "duongDan": null
      },
      "thuTu": 80,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, Đạo diễn, NSND Vũ Tự Long",
      "nhom": "giam-doc",
      "nhiemKy": "từ 12/2024",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/vu-tu-long.jpg",
        "duongDan": null
      },
      "thuTu": 90,
      "hienThi": true
    },
    {
      "hoTen": "Lê Đình Lâm",
      "nhom": "chinh-tri-vien",
      "nhiemKy": "1954",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/le-dinh-lam.jpg",
        "duongDan": null
      },
      "thuTu": 100,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Hữu Tự",
      "nhom": "chinh-tri-vien",
      "nhiemKy": "chưa rõ",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-huu-tu.jpg",
        "duongDan": null
      },
      "thuTu": 110,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá Nguyễn Đức Thành",
      "nhom": "chinh-tri-vien",
      "nhiemKy": "2010 - 2012",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-duc-thanh.jpg",
        "duongDan": null
      },
      "thuTu": 120,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá Lê Danh Toàn",
      "nhom": "chinh-tri-vien",
      "nhiemKy": "2012 - 5/2022",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/le-danh-toan.jpg",
        "duongDan": null
      },
      "thuTu": 130,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, NSƯT Vũ Thị Phương Thúy",
      "nhom": "chinh-tri-vien",
      "nhiemKy": "từ 6/2022",
      "chucDanh": "",
      "anh": {
        "url": "/anh/lanh-dao/vu-thi-phuong-thuy.jpg",
        "duongDan": null
      },
      "thuTu": 140,
      "hienThi": true
    },
    {
      "hoTen": "NSƯT Đỗ Tùng",
      "nhom": "cap-pho",
      "nhiemKy": "1970 - 1985",
      "chucDanh": "Phó Đoàn trưởng",
      "anh": {
        "url": "/anh/lanh-dao/do-tung.jpg",
        "duongDan": null
      },
      "thuTu": 150,
      "hienThi": true
    },
    {
      "hoTen": "Nguyễn Văn Thắng",
      "nhom": "cap-pho",
      "nhiemKy": "1978 - 1982",
      "chucDanh": "Phó Đoàn trưởng",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-van-thang.jpg",
        "duongDan": null
      },
      "thuTu": 160,
      "hienThi": true
    },
    {
      "hoTen": "Phan Long",
      "nhom": "cap-pho",
      "nhiemKy": "1989 - 1991",
      "chucDanh": "Phó Đoàn trưởng",
      "anh": {
        "url": "/anh/lanh-dao/phan-long.jpg",
        "duongDan": null
      },
      "thuTu": 170,
      "hienThi": true
    },
    {
      "hoTen": "NSƯT Phạm Thanh Hải",
      "nhom": "cap-pho",
      "nhiemKy": "2002 - 2011",
      "chucDanh": "Phó Đoàn trưởng 2002 - 2009 · Phó Giám đốc 2010 - 2011",
      "anh": {
        "url": "/anh/lanh-dao/pham-thanh-hai.jpg",
        "duongDan": null
      },
      "thuTu": 180,
      "hienThi": true
    },
    {
      "hoTen": "Đạo diễn, NSƯT Nguyễn Quốc Trượng",
      "nhom": "cap-pho",
      "nhiemKy": "2007 - 2009",
      "chucDanh": "Phó Đoàn trưởng",
      "anh": {
        "url": "/anh/lanh-dao/nguyen-quoc-truong.jpg",
        "duongDan": null
      },
      "thuTu": 190,
      "hienThi": true
    },
    {
      "hoTen": "Trung tá, NSƯT Mai Tú Lệ",
      "nhom": "cap-pho",
      "nhiemKy": "3/2011 - 3/2014",
      "chucDanh": "Phó Giám đốc",
      "anh": {
        "url": "/anh/lanh-dao/mai-tu-le.jpg",
        "duongDan": null
      },
      "thuTu": 200,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, NSƯT Vũ Duy Từ",
      "nhom": "cap-pho",
      "nhiemKy": "9/2014 - 4/2023",
      "chucDanh": "Phó Giám đốc",
      "anh": {
        "url": "/anh/lanh-dao/vu-duy-tu.jpg",
        "duongDan": null
      },
      "thuTu": 210,
      "hienThi": true
    },
    {
      "hoTen": "Đại tá, Đạo diễn, NSND Vũ Tự Long",
      "nhom": "cap-pho",
      "nhiemKy": "9/2014 - 12/2024",
      "chucDanh": "Phó Giám đốc",
      "anh": {
        "url": "/anh/lanh-dao/vu-tu-long.jpg",
        "duongDan": null
      },
      "thuTu": 220,
      "hienThi": true
    },
    {
      "hoTen": "Ngọc Minh",
      "nhom": "cap-pho",
      "nhiemKy": "chưa rõ",
      "chucDanh": "Phó Đoàn trưởng",
      "anh": {
        "url": "/anh/lanh-dao/ngoc-minh.jpg",
        "duongDan": null
      },
      "thuTu": 230,
      "hienThi": true
    }
  ],
  "voDien": [
    {
      "ten": "Quan Âm Thị Kính",
      "nhom": "cheo-co",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "Một trong bảy vở chèo cổ kinh điển, kể chuyện nàng Thị Kính chịu oan khuất và tấm lòng từ bi.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Chèo cổ",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/quan-am.jpg",
        "duongDan": null
      },
      "anhMoTa": "Cảnh trong vở Quan Âm Thị Kính",
      "anhNguon": "",
      "thuTu": 10,
      "hienThi": true
    },
    {
      "ten": "Lưu Bình - Dương Lễ",
      "nhom": "cheo-co",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "Câu chuyện về tình bạn và nghĩa vợ chồng, một trong những vở chèo được yêu thích bậc nhất.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Chèo cổ",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/luu-binh.jpg",
        "duongDan": null
      },
      "anhMoTa": "Các nghệ sĩ trong vở Lưu Bình - Dương Lễ",
      "anhNguon": "",
      "thuTu": 20,
      "hienThi": true
    },
    {
      "ten": "Kim Nham",
      "nhom": "cheo-co",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "Vở chèo cổ kinh điển, nơi có lớp diễn Súy Vân giả dại — một trong những trích đoạn tiêu biểu nhất của sân khấu chèo.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Chèo cổ",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/kim-nham.jpg",
        "duongDan": null
      },
      "anhMoTa": "Hai nghệ sĩ trong vở Kim Nham",
      "anhNguon": "",
      "thuTu": 30,
      "hienThi": true
    },
    {
      "ten": "Trương Viên",
      "nhom": "cheo-co",
      "nhomPhu": "Các vở và trích đoạn khác",
      "nam": "",
      "tomTat": "Vở chèo cổ được cải biên.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 40,
      "hienThi": true
    },
    {
      "ten": "Thạch Sanh",
      "nhom": "cheo-co",
      "nhomPhu": "Các vở và trích đoạn khác",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 50,
      "hienThi": true
    },
    {
      "ten": "Chị Tấm anh Điền",
      "nhom": "cheo-co",
      "nhomPhu": "Các vở và trích đoạn khác",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 60,
      "hienThi": true
    },
    {
      "ten": "Vua Chỗm",
      "nhom": "cheo-co",
      "nhomPhu": "Các vở và trích đoạn khác",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 70,
      "hienThi": true
    },
    {
      "ten": "Thị Mầu lên chùa",
      "nhom": "cheo-co",
      "nhomPhu": "Các vở và trích đoạn khác",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": true,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 80,
      "hienThi": true
    },
    {
      "ten": "Súy Vân giả dại",
      "nhom": "cheo-co",
      "nhomPhu": "Các vở và trích đoạn khác",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": true,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 90,
      "hienThi": true
    },
    {
      "ten": "Bài ca giữ nước",
      "nhom": "nguoi-linh",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "Vở chèo lịch sử nổi tiếng của Tào Mạt.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Chèo lịch sử",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/bai-ca-giu-nuoc.jpg",
        "duongDan": null
      },
      "anhMoTa": "Bìa đĩa VCD vở Lý Thánh Tông tuyển hiền do Đoàn Chèo Tổng cục Hậu cần biểu diễn",
      "anhNguon": "Ảnh: bìa đĩa VCD Lý Thánh Tông tuyển hiền, Đoàn Chèo Tổng cục Hậu cần biểu diễn.",
      "thuTu": 100,
      "hienThi": true
    },
    {
      "ten": "Đêm trắng",
      "nhom": "nguoi-linh",
      "nhomPhu": "",
      "nam": "2008",
      "tomTat": "Hình tượng Bác Hồ trong cuộc đấu tranh chống tham nhũng trong quân đội thời kháng chiến chống Pháp.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Kháng chiến chống Pháp",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/dem-trang.jpg",
        "duongDan": null
      },
      "anhMoTa": "Cảnh trong vở Đêm trắng",
      "anhNguon": "",
      "thuTu": 110,
      "hienThi": true
    },
    {
      "ten": "Đất liền và biển cả",
      "nhom": "nguoi-linh",
      "nhomPhu": "",
      "nam": "2023",
      "tomTat": "Khắc họa hình ảnh người lính Hải quân bảo vệ chủ quyền biển đảo hiện nay.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Người lính thời bình",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/dat-lien-bien-ca.jpg",
        "duongDan": null
      },
      "anhMoTa": "Cảnh diễn của các chiến sĩ Hải quân trong vở Đất liền và biển cả",
      "anhNguon": "",
      "thuTu": 120,
      "hienThi": true
    },
    {
      "ten": "Người anh hùng áo vải",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "1999",
      "tomTat": "Khắc họa hình tượng Nguyễn Huệ.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 130,
      "hienThi": true
    },
    {
      "ten": "Hùng ca Bạch Đằng Giang",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "2009",
      "tomTat": "Tái hiện chiến thắng của Trần Hưng Đạo.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 140,
      "hienThi": true
    },
    {
      "ten": "Công lý không gục ngã",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "2017",
      "tomTat": "Về danh sĩ Ngô Thì Nhậm thời Trịnh Sâm.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 150,
      "hienThi": true
    },
    {
      "ten": "Bến nước Ngũ Bồ",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "2019",
      "tomTat": "Kể về thời kỳ đầu thế kỷ XV và Lê Lợi.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 160,
      "hienThi": true
    },
    {
      "ten": "Câu Kiều ru một đời người",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "2019",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 170,
      "hienThi": true
    },
    {
      "ten": "Sóng dựng Lô Giang",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "2022",
      "tomTat": "Về danh tướng Trần Nguyên Hãn.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 180,
      "hienThi": true
    },
    {
      "ten": "Mật chỉ giữa hoàng cung",
      "nhom": "nguoi-linh",
      "nhomPhu": "Người lính thời phong kiến và lịch sử",
      "nam": "2022",
      "tomTat": "Về vua Lê Thánh Tông.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 190,
      "hienThi": true
    },
    {
      "ten": "Ánh sao đầu núi",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "2004",
      "tomTat": "Về những người nông dân tham gia chiến dịch Đông Xuân và Điện Biên Phủ. Dàn dựng lại năm 2016.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 200,
      "hienThi": true
    },
    {
      "ten": "Biển vẫn con đường mòn",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "2021",
      "tomTat": "Về những chiến sĩ trên Đoàn tàu không số và đường Hồ Chí Minh trên biển.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 210,
      "hienThi": true
    },
    {
      "ten": "Nguyễn Viết Xuân",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 220,
      "hienThi": true
    },
    {
      "ten": "Đường về trận địa",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 230,
      "hienThi": true
    },
    {
      "ten": "Lá thư tiền tuyến",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 240,
      "hienThi": true
    },
    {
      "ten": "Chị Trầm",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 250,
      "hienThi": true
    },
    {
      "ten": "Máu chúng ta đã chảy",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 260,
      "hienThi": true
    },
    {
      "ten": "Sợi tơ vàng",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 270,
      "hienThi": true
    },
    {
      "ten": "Tầm vóc đại hồng",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 280,
      "hienThi": true
    },
    {
      "ten": "Anh lái xe và cô chống lầy",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 290,
      "hienThi": true
    },
    {
      "ten": "Cô gái sông Lam",
      "nhom": "nguoi-linh",
      "nhomPhu": "Kháng chiến chống Pháp và chống Mỹ",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 300,
      "hienThi": true
    },
    {
      "ten": "Bến nước đời người",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "2010",
      "tomTat": "Bi kịch và nỗi đau của người lính trở về bị nhiễm chất độc da cam.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 310,
      "hienThi": true
    },
    {
      "ten": "Những người mẹ",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "2018",
      "tomTat": "Câu chuyện về sự bao dung và hy sinh của người mẹ hậu chiến.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 320,
      "hienThi": true
    },
    {
      "ten": "Ngày trở về",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "2020",
      "tomTat": "Hành trình tìm lại chính mình của một chiến sĩ tình báo sau chiến tranh.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 330,
      "hienThi": true
    },
    {
      "ten": "20 năm thù hận",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "2020",
      "tomTat": "Cuộc đấu tranh chống tội phạm ma túy của các chiến sĩ công an.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 340,
      "hienThi": true
    },
    {
      "ten": "Đại đội trưởng của tôi",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "2023",
      "tomTat": "Áp lực và sự trưởng thành của người chỉ huy trẻ thời hiện đại.",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 350,
      "hienThi": true
    },
    {
      "ten": "Điều đọng lại sau chiến tranh",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 360,
      "hienThi": true
    },
    {
      "ten": "Người chiến sĩ năm xưa",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 370,
      "hienThi": true
    },
    {
      "ten": "Lời thề sắt son",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 380,
      "hienThi": true
    },
    {
      "ten": "Tổ quốc gọi tên mình",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 390,
      "hienThi": true
    },
    {
      "ten": "Những người lính canh trời",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 400,
      "hienThi": true
    },
    {
      "ten": "Tổ quốc nơi đầu sóng",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 410,
      "hienThi": true
    },
    {
      "ten": "Người lính thời bình",
      "nhom": "nguoi-linh",
      "nhomPhu": "Hậu chiến và người lính thời bình",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": false,
      "nhanThe": "",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 420,
      "hienThi": true
    },
    {
      "ten": "Tuổi trẻ chí lớn",
      "nhom": "danh-nhan",
      "nhomPhu": "",
      "nam": "2021",
      "tomTat": "Vở diễn về đồng chí Nguyễn Văn Cừ.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Danh nhân",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/tuoi-tre-chi-lon.jpg",
        "duongDan": null
      },
      "anhMoTa": "Các nghệ sĩ trong vở Tuổi trẻ chí lớn",
      "anhNguon": "",
      "thuTu": 430,
      "hienThi": true
    },
    {
      "ten": "Nguyễn Chí Thanh - Sáng trong như ngọc một con người",
      "nhom": "danh-nhan",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "Vở diễn về Đại tướng Nguyễn Chí Thanh.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Danh nhân",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/nguyen-chi-thanh.jpg",
        "duongDan": null
      },
      "anhMoTa": "Cảnh trong vở Nguyễn Chí Thanh - Sáng trong như ngọc một con người",
      "anhNguon": "",
      "thuTu": 440,
      "hienThi": true
    },
    {
      "ten": "Chu Văn An - Người thầy của muôn đời",
      "nhom": "danh-nhan",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "Vở diễn về nhà giáo Chu Văn An.",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Danh nhân",
      "trichDoan": false,
      "anh": {
        "url": "/anh/vo-dien/chu-van-an.jpg",
        "duongDan": null
      },
      "anhMoTa": "Các nghệ sĩ trong vở Chu Văn An - Người thầy của muôn đời",
      "anhNguon": "",
      "thuTu": 450,
      "hienThi": true
    },
    {
      "ten": "Huyền nữ Phạm Thị Thành",
      "nhom": "danh-nhan",
      "nhomPhu": "",
      "nam": "",
      "tomTat": "",
      "giaiThuong": "",
      "noiBat": true,
      "nhanThe": "Danh nhân",
      "trichDoan": false,
      "anh": {
        "url": null,
        "duongDan": null
      },
      "anhMoTa": "",
      "anhNguon": "",
      "thuTu": 460,
      "hienThi": true
    }
  ]
};
