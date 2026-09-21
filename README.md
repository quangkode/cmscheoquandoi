# CMS Nhà hát Chèo Quân đội

Phần mềm quản lý nội dung cho trang web Nhà hát Chèo Quân đội.
Sửa ở đây xong, trang web đổi ngay — không cần đăng lại mã, không cần chờ build.

Không dùng npm, không cần cài gì. Toàn bộ là HTML/CSS/JS thuần, giống hệt
cách trang web chính đang chạy.

> **Đọc bằng trình duyệt cho dễ:** mở `huong-dan.html` — cùng nội dung file này
> nhưng có mục lục, chia thành từng bước và in ra giấy được. File `.md` này giữ
> lại để GitHub hiển thị ở trang đầu kho mã.

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
| **Storage** | Build → Storage → Get started → **production mode** | Nơi chứa ảnh tải lên. Firebase sẽ bắt nâng lên gói **Blaze** ở bước này — bắt buộc, xem mục [Chi phí](#chi-phí) |

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

Cuối trang đó còn khối **Đối chiếu với bản gốc** — dùng về sau, xem mục
[CMS và trang web ăn khớp nhau](#cms-và-trang-web-ăn-khớp-nhau).

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

## Ba mục thêm sau, theo phản hồi

| Mục | Đổ ra đâu trên web |
|---|---|
| **Ảnh bìa trang chủ** | dải ảnh chạy ở đầu trang chủ |
| **Dấu mốc** | mục *Dấu mốc nổi bật* trang Lịch sử |
| **Thông tin chung** | dải trên cùng, chân trang và mục Liên hệ của **mọi trang** |

> **Phải đăng lại `firestore.rules` thì ba mục này mới chạy.** Firebase Console
> → Firestore Database → tab Rules → dán đè cả file → Publish. Chưa đăng thì
> CMS không ghi được và trang web nhận 403 khi đọc ba collection mới (trang vẫn
> hiện bình thường bằng HTML viết sẵn, chỉ là chưa lấy được bản từ CMS).

Mỗi mục có nút **Xem trên web ↗** ở góc phải tiêu đề, bấm là mở đúng chỗ nội
dung đó hiện ra — khai ở `xemTrenWeb` trong `luoc-do.js`, địa chỉ gốc để ở
`TRANG_WEB` trong `cau-hinh.js`.

**Thông tin chung** khai `motBanGhi: true`: có bản ghi rồi thì CMS giấu nút
*Thêm mới*, nút *Nhập bảng tính* và nút *Xoá*. Hai bản ghi thì trang web không
biết lấy bản nào, mà người dùng cũng không thấy vì sao sửa một bên lại không ăn.

## Soạn bài viết

Mục Tin tức soạn ở trang riêng (`soan-bai.html`), mở ra hỏi ngay làm theo cách nào:

| Lối | Có gì | Dùng khi |
|---|---|---|
| **Tự soạn thảo** | Ảnh bìa, ghi công ảnh, đủ công cụ định dạng. *Không có ô ghi nguồn.* | Bài Nhà hát tự viết |
| **Chép link rồi biên soạn** | Thêm thanh dán link + ô Tên nguồn, Đường dẫn bài gốc | Lấy bài báo về biên tập lại |

Ghi vào địa chỉ `?che=tu` / `?che=bao` chứ không giữ trong biến, để tải lại trang
vẫn đúng lối. Sửa bài cũ thì suy ra từ chỗ bài đó có ghi nguồn hay không. Đổi lối
giữa chừng được, bài đang viết dở giữ nguyên.

Lưu ở lối tự soạn là hai ô nguồn bị xoá hẳn — bài mình viết thì không dẫn nguồn ai,
để trống lửng chỉ tổ có người điền bừa.

### Cỡ chữ, phông, màu

Khai một chỗ duy nhất ở `js/kieu-chu.js`: cỡ 8-14pt (đúng như Word), ba phông của
trang web, bảng màu Nhà hát, bốn kiểu căn lề. Hàm `cssKieu()` sinh thẳng CSS từ đó
cho ô soạn và cửa sổ xem thử, khỏi viết tay hai bản rồi lệch nhau.

**Vì sao không dùng `style=""`:** bài đi qua hai bộ lọc danh sách trắng —
`locHtml()` bên này và `quet()` trong `tin-bai.js` bên kho web — cả hai đều vứt
sạch `style`. Định dạng đi bằng **lớp CSS cố định**, hai bộ lọc cùng tra vào danh
sách `LOP_CHO_PHEP` mà giữ lại. Lớp nào không có tên trong danh sách thì rụng, nên
dán HTML từ trang lạ vào cũng không lôi được CSS của họ sang.

`js/kieu-chu.js` **có bản sao viết tay** bên kho web (hằng `LOP_CHO_PHEP` trong
`tin-bai.js`, quy tắc CSS ở cuối `styles.css`). Hai kho riêng, trang công khai lại
nạp bằng `<script>` thường nên không import module qua được. **Thêm lớp mới bên này
thì phải thêm cả bên kia**, không thì lớp ấy qua được CMS mà rụng lúc bài lên trang.

### Hoàn tác

Tự dựng chồng hoàn tác (chụp `innerHTML` + vị trí con trỏ, giữ 60 mốc) chứ không
nhờ `execCommand("undo")`: mấy lệnh cỡ chữ/phông/màu đều sửa thẳng cây DOM sau khi
execCommand chạy xong, nên chồng sẵn có của trình duyệt không biết gì về chúng.

### Tự giữ nháp

Cứ ngừng gõ 1,5 giây là bài được ghi vào `localStorage` (khoá `nhap-bai:<id>`).
Mở lại mà thấy nháp mới hơn lần sửa trên máy chủ thì hiện dải hỏi khôi phục. Lưu
thành công là xoá. Chỉ nằm trong máy người soạn, không lên mạng.

## CMS và trang web ăn khớp nhau

Cả sáu mục nội dung đều nối hai chiều — sửa trong CMS là trang web đổi theo:

| Mục trong CMS | Hiện ở đâu trên web |
|---|---|
| Tin tức | Trang chủ (khối tin mới) và trang Tin tức |
| Lịch diễn | Trang chủ và danh sách suất khi đặt chỗ |
| Thư viện ảnh | Trang Tin tức, mục Thư viện ảnh |
| Nghệ sĩ | Trang Nghệ sĩ, hai mục NSND và NSƯT |
| Lãnh đạo | Trang Nghệ sĩ, mục Ban lãnh đạo qua các thời kỳ |
| Vở diễn | Trang Vở diễn, ba mục Chèo cổ · Người lính · Danh nhân |

**Trang web không bao giờ để CMS làm nó nghèo đi.** Mỗi khối vẫn giữ bản HTML
viết tay; `noi-cms.js` chỉ thay bằng bản từ CMS khi bản đó *không ít thẻ và ít
ảnh hơn* bản đang hiện. Thiếu thì giữ nguyên bản cũ rồi ghi cảnh báo ra Console
(F12). Nhờ vậy một bản ghi bỏ trống ô ảnh không thể xoá sạch hàng ảnh chân dung.

### Đối chiếu với bản gốc

Ở cuối `nap-du-lieu.html`. So từng trường giữa Firestore và `js/du-lieu-goc.js`
rồi **chỉ điền vào chỗ trống**. Dùng khi:

- lược đồ vừa thêm trường mới, bản ghi cũ chưa có trường đó;
- ô ảnh trong CMS còn trống mà trang web đã có ảnh sẵn trong kho mã.

Bấm **Xem** để đọc trước đúng những gì nó sắp sửa. Chỗ đã nhập và bản ghi tự thêm
đều không bị đụng tới; không xoá gì cả.

**Tin tức không có trong dữ liệu gốc.** Tin bài chỉ do bạn viết trong CMS: đăng
trong mục Tin tức là hiện ra trang web, xoá trong đó là mất hẳn. Không có gì để
nạp, cũng không có gì dựng bài đã xoá sống lại.

**Lịch diễn chỉ so trường, không thêm lại bản ghi** (`khongThem: true`). Mục này
gắn với thời gian — suất diễn qua rồi xoá đi là chuyện bình thường; dữ liệu gốc là
ảnh chụp trang web hồi 2024, thêm lại theo nó là dựng dậy đúng mấy suất vừa cố ý xoá.

Nút **Ghi đè cả chỗ khác bản gốc** kéo bản ghi về đúng bản gốc, kể cả chỗ đã sửa.
Ảnh đã tải lên Firebase Storage thì kể cả ghi đè cũng chừa ra: xoá đường dẫn đi là
tệp nằm lại trong kho vĩnh viễn, không còn cách nào tìm ra để dọn.

### Hai chỗ vẫn phải sửa trong mã

Trang Vở diễn còn hai mục cuối chưa nối CMS: **Theo giai đoạn phát triển** và
**Vở diễn đoạt giải**. Mục giải thưởng cần tách riêng loại huy chương, tên hội diễn
và năm cho từng giải, mà lược đồ mới có một ô "Giải thưởng" dạng chữ tự do — đổ ra
trang là mất hết cách trình bày. Sửa hai mục đó vẫn phải vào `vo-dien.html` bên
kho mã trang web.

## Cấu trúc mã

```
cau-hinh.js          khoá Firebase + phiên bản SDK — file duy nhất phải sửa khi dựng
firestore.rules      luật bảo vệ dữ liệu (đăng lên Console)
storage.rules        luật bảo vệ kho ảnh (đăng lên Console)
index.html           đăng nhập
app.html             màn quản lý chính
nap-du-lieu.html     nạp dữ liệu ban đầu, chạy một lần
huong-dan.html       bản HTML của file README này
cms.css              giao diện
js/firebase.js       lớp nối Firebase (auth, Firestore, Storage)
js/luoc-do.js        mô tả các mục và các trường  ← sửa ở đây để thêm trường mới
js/app.js            bộ dựng giao diện từ lược đồ
js/dang-nhap.js      màn đăng nhập
js/nap-du-lieu.js    nạp dữ liệu ban đầu
js/doi-chieu.js      so CMS với bản gốc, điền nốt chỗ trống
js/du-lieu-goc.js    dữ liệu rút từ web — bản đối chiếu, phải khớp thứ web đang hiện
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

Dự án đang ở gói **Blaze — trả theo mức dùng**. Không phải chọn cho sang: Firebase
bắt buộc Blaze mới bật được Storage, không có đường nào vừa ở Spark vừa có kho ảnh.

Blaze **vẫn giữ nguyên hạn mức miễn phí hằng tháng** (1 GiB Firestore, 5 GB
Storage, 50k lượt đọc/ngày). Mức dùng của một nhà hát nằm gọn trong đó, nên hoá
đơn gần như chắc chắn là 0 đồng. Khác nhau ở chỗ khi vượt hạn mức: Spark thì
dịch vụ tạm dừng, Blaze thì tính tiền phần vượt.

Đặt cảnh báo ngân sách cho yên tâm: ⚙ → **Usage and billing** → **Budgets &
alerts** → ngưỡng vài đô la.

> **Cảnh báo ngân sách chỉ gửi email, không tự chặn chi tiêu.** Google không có
> nút khoá cứng ở mức hạn mức. Ở quy mô này thì cảnh báo là đủ — có email báo
> nghĩa là có gì đó bất thường, còn hơn cuối tháng mới biết.
