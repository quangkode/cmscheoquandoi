# CMS Nhà hát Chèo Quân đội

Phần mềm quản lý nội dung cho trang web Nhà hát Chèo Quân đội.
Sửa ở đây xong, trang web đổi ngay — không cần đăng lại mã, không cần chờ build.

Không dùng npm, không cần cài gì. Toàn bộ là HTML/CSS/JS thuần, giống hệt
cách trang web chính đang chạy.

---

## Dựng lần đầu — làm theo đúng thứ tự

### 1. Tạo dự án Firebase

1. Vào <https://console.firebase.google.com> → **Add project** → đặt tên, ví dụ `nha-hat-cheo-quan-doi`.
2. Tắt Google Analytics nếu không cần, bấm **Create project**.

### 2. Bật ba dịch vụ

Trong dự án vừa tạo, bật lần lượt:

| Dịch vụ | Đường đi | Lưu ý |
|---|---|---|
| **Authentication** | Build → Authentication → Get started → tab **Sign-in method** → bật **Email/Password** | Chỉ bật Email/Password, không cần Google/Facebook |
| **Firestore Database** | Build → Firestore Database → Create database → chọn **production mode** | Vùng nên chọn `asia-southeast1` (Singapore) cho gần Việt Nam |
| **Storage** | Build → Storage → Get started → **production mode** | Nơi chứa ảnh tải lên |

> Chọn **production mode** chứ không phải test mode. Test mode mở toang dữ liệu
> cho cả Internet và tự khoá sau 30 ngày — đúng hai điều không nên có.

### 3. Lấy cấu hình, dán vào `cau-hinh.js`

Bánh răng ⚙ → **Project settings** → kéo xuống **Your apps** → bấm biểu tượng
web `</>` → đặt nickname bất kỳ → **Register app**. Màn hình hiện khối
`firebaseConfig` — chép rồi dán đè vào phần tương ứng trong `cau-hinh.js`.

Mấy khoá đó **không phải mật khẩu**. Firebase thiết kế để chúng nằm công khai
trong mã trang web. Cái thực sự bảo vệ dữ liệu là hai file luật ở bước sau —
**đừng bỏ qua bước 4**.

### 4. Đăng luật bảo mật (bắt buộc)

- **Firestore Database → tab Rules** → dán toàn bộ `firestore.rules` đè lên → **Publish**
- **Storage → tab Rules** → dán toàn bộ `storage.rules` đè lên → **Publish**

Bỏ qua bước này thì bất kỳ ai trên Internet cũng đọc được số điện thoại của
người đặt chỗ và xoá sạch nội dung Nhà hát.

### 5. Tạo tài khoản quản trị

1. **Authentication → tab Users → Add user** → nhập email và mật khẩu cho người quản lý.
2. Bấm vào user vừa tạo, **chép chuỗi User UID**.
3. **Firestore Database → Start collection** → Collection ID gõ đúng `quan-tri`.
4. Document ID: **dán UID vừa chép**. Thêm một trường bất kỳ để lưu được, ví dụ
   `ten` (string) = tên người đó. → **Save**.

Đăng nhập được **chưa đủ** để sửa nội dung. Phải có document trong `quan-tri`
mang đúng UID thì luật mới cho ghi. Nhờ vậy người lạ tự đăng ký tài khoản cũng
không đụng được vào dữ liệu.

Muốn thêm người quản lý: lặp lại bước 5. Muốn thu hồi quyền: xoá document trong
`quan-tri` (không cần xoá tài khoản).

### 6. Chạy thử tại máy

Mở thư mục này bằng một máy chủ tĩnh bất kỳ. Không mở trực tiếp bằng
`file://` — trình duyệt chặn ES module khi chạy kiểu đó.

```
npx serve .
```

Rồi mở địa chỉ hiện ra, đăng nhập bằng tài khoản ở bước 5.

### 7. Nạp dữ liệu ban đầu

Mở `nap-du-lieu.html`, bấm **Nạp tất cả mục đang trống**. Toàn bộ nội dung đang
có trên trang web (tin tức, lịch diễn, thư viện ảnh, nghệ sĩ, lãnh đạo, vở diễn)
sẽ được đưa vào Firestore, khỏi phải gõ lại tay.

Chỉ chạy **một lần**. Bấm lại là dữ liệu nhân đôi.

### 8. Đưa CMS lên mạng

CMS là trang tĩnh nên đẩy lên Vercel như trang web chính là xong. Nên đặt ở
tên miền riêng, ví dụ `quanly.tenmiennhahat.vn`.

Trang đã gắn `noindex, nofollow` nên Google không đưa vào kết quả tìm kiếm.
Bảo mật thật vẫn nằm ở đăng nhập và luật Firestore, không nằm ở việc giấu địa chỉ.

---

## Cách dùng hằng ngày

| Việc | Làm ở đâu |
|---|---|
| Đăng tin mới | Tin tức → Thêm mới |
| Đổi lịch diễn | Lịch diễn → sửa hoặc thêm suất |
| Thêm ảnh vào thư viện | Thư viện ảnh → Thêm mới → Chọn ảnh |
| Xem ai đã giữ chỗ | Đơn đặt chỗ |
| Tạm ẩn một mục | Mở mục đó, tắt **Hiện trên web**, lưu |

**Tắt "Hiện trên web" thay vì xoá.** Xoá là mất hẳn, không lấy lại được.
Tắt thì web không hiện nhưng dữ liệu còn nguyên, cần thì bật lại.

Đơn đặt chỗ **không tạo tay được** — chỉ đến từ trang web. Trong CMS chỉ đổi
được trạng thái và ghi chú nội bộ, thông tin người đặt để nguyên cho khớp với
thứ người ta đã gửi.

---

## Cấu trúc mã

```
cau-hinh.js          khoá Firebase + phiên bản SDK — file duy nhất phải sửa khi dựng
firestore.rules      luật bảo vệ dữ liệu (đăng lên Console)
storage.rules        luật bảo vệ kho ảnh (đăng lên Console)
index.html           đăng nhập
app.html             màn quản lý chính
nap-du-lieu.html     nạp dữ liệu ban đầu, chạy một lần
cms.css              giao diện
js/firebase.js       lớp nối Firebase (auth, Firestore, Storage)
js/luoc-do.js        mô tả các mục và các trường  ← sửa ở đây để thêm trường mới
js/app.js            bộ dựng giao diện từ lược đồ
js/dang-nhap.js      màn đăng nhập
js/nap-du-lieu.js    nạp dữ liệu ban đầu
js/du-lieu-goc.js    dữ liệu rút từ web, chỉ dùng cho bước nạp
```

**Thêm một trường mới** (ví dụ thêm "Đạo diễn" cho vở diễn): mở `js/luoc-do.js`,
thêm một dòng vào mảng `truong` của mục đó. Giao diện tự có ô nhập, bảng tự có
cột — không phải viết thêm màn hình nào.

---

## Hỏng thì xem ở đây

**"Chưa nối Firebase"** — chưa dán `firebaseConfig` vào `cau-hinh.js`.

**"Tài khoản này chưa được cấp quyền quản trị"** — thiếu document trong collection
`quan-tri`. Làm lại bước 5, chú ý Document ID phải đúng UID, không phải email.

**"Luật Firestore chặn thao tác này"** — chưa **Publish** `firestore.rules`, hoặc
UID trong `quan-tri` gõ sai.

**Tải ảnh báo lỗi** — chưa bật Storage, hoặc chưa Publish `storage.rules`, hoặc
ảnh nặng quá 5 MB.

**Trang trắng, F12 báo lỗi CORS hoặc module** — đang mở bằng `file://`. Phải chạy
qua máy chủ tĩnh (bước 6).

---

## Chi phí

Mức dùng của một nhà hát nằm gọn trong gói miễn phí Spark của Firebase
(1 GiB Firestore, 5 GB Storage, 50k lượt đọc/ngày). Nếu muốn chắc chắn không
bao giờ phát sinh tiền thì cứ để nguyên gói Spark — hết hạn mức thì dịch vụ
tạm dừng chứ không tự trừ tiền.
