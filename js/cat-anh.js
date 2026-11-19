/* ==========================================================
   CẮT ẢNH THEO KHUNG CỐ ĐỊNH (T10)

   Vì sao: ảnh nghệ sĩ/lãnh đạo trên web hiện trong khung dọc 5:6
   (trang Nghệ sĩ) và khung tròn (trang chủ). Ảnh tải lên nguyên bản
   thì mỗi tấm một tỉ lệ — ảnh sân khấu khung ngang, ảnh có dải chú
   thích in sẵn — nên trên web tấm thì hở, tấm thì mất mặt. Cắt ngay
   lúc tải lên thì người nhập THẤY ĐÚNG cái sẽ hiện trên web.

   Tự viết thay vì dùng Cropper.js: chỉ cần kéo + phóng to trong một
   khung cố định, chừng trăm dòng; khỏi nạp thêm thư viện ngoài.

   Dùng:  const tep = await catAnh(blobHoacFile, { tiLe: 5 / 6, tron: true });
          tep === null  → người dùng bấm Huỷ.
   ========================================================== */

const RONG_RA = 1000;           // bề ngang ảnh xuất ra (px) — đủ nét cho màn hình 2x
const CHAT_LUONG = 0.88;

/* Khung tròn trên trang chủ cắt một hình vuông từ ảnh 5:6, lệch lên trên
   (object-position 50% 25% trong styles.css của web) để giữ phần mặt. */
const LECH_TRON = 0.25;

function taiAnh(blob) {
  return new Promise((ok, hong) => {
    const url = URL.createObjectURL(blob);
    const im = new Image();
    im.onload = () => ok({ im, url });
    im.onerror = () => { URL.revokeObjectURL(url); hong(new Error("Không đọc được tệp ảnh này.")); };
    im.src = url;
  });
}

export async function catAnh(blob, { tiLe = 5 / 6, tron = false, tieuDe = "Cắt ảnh cho vừa khung" } = {}) {
  const { im, url } = await taiAnh(blob);
  const W0 = im.naturalWidth, H0 = im.naturalHeight;

  const phu = document.createElement("div");
  phu.className = "cat-anh";
  phu.innerHTML = `
    <div class="cat-anh__hop" role="dialog" aria-modal="true" aria-label="${tieuDe}">
      <h2>${tieuDe}</h2>
      <p class="cat-anh__huong-dan">Kéo ảnh để chỉnh vị trí, kéo thanh trượt (hoặc lăn chuột) để phóng to. Phần trong khung là phần hiện trên web.</p>
      <div class="cat-anh__than">
        <div class="cat-anh__khung" tabindex="0" aria-label="Khung cắt ảnh. Dùng phím mũi tên để dịch, phím + và - để phóng to thu nhỏ.">
          <img alt="" draggable="false" />
        </div>
        <div class="cat-anh__ben">
          <div class="cat-anh__xem">
            <span>Trang Nghệ sĩ</span>
            <canvas data-xem="khung"></canvas>
          </div>
          ${tron ? `<div class="cat-anh__xem">
            <span>Trang chủ</span>
            <canvas data-xem="tron" class="cat-anh__tron"></canvas>
          </div>` : ""}
        </div>
      </div>
      <label class="cat-anh__phong">
        <span>Thu nhỏ</span>
        <input type="range" min="1" max="4" step="0.01" value="1" aria-label="Phóng to" />
        <span>Phóng to</span>
      </label>
      <div class="cat-anh__chan">
        <button type="button" class="nut" data-huy>Huỷ</button>
        <button type="button" class="nut" data-dat-lai>Đặt lại</button>
        <button type="button" class="nut nut--chinh" data-ok>Cắt &amp; dùng ảnh này</button>
      </div>
    </div>`;
  document.body.appendChild(phu);

  const khung = phu.querySelector(".cat-anh__khung");
  const anh = khung.querySelector("img");
  const truot = phu.querySelector('input[type="range"]');
  const xemKhung = phu.querySelector('[data-xem="khung"]');
  const xemTron = phu.querySelector('[data-xem="tron"]');
  anh.src = url;

  // Kích thước khung đo sau khi gắn vào trang (CSS quyết định theo màn hình)
  let KW = 0, KH = 0;
  let phong = 1;                 // hệ số phóng so với mức "vừa phủ kín khung"
  let x = 0, y = 0;              // vị trí góc trên-trái của ảnh trong khung (px)
  const tiLePhu = () => Math.max(KW / W0, KH / H0) * phong;   // px màn hình / px ảnh gốc

  function gioiHan() {
    const s = tiLePhu();
    x = Math.min(0, Math.max(KW - W0 * s, x));
    y = Math.min(0, Math.max(KH - H0 * s, y));
  }
  function ve() {
    const s = tiLePhu();
    anh.style.width = W0 * s + "px";
    anh.style.height = H0 * s + "px";
    anh.style.transform = `translate(${x}px, ${y}px)`;
    veXem();
  }
  // vùng cắt tính bằng px ảnh gốc
  function vung() {
    const s = tiLePhu();
    return { sx: -x / s, sy: -y / s, sw: KW / s, sh: KH / s };
  }
  function veXem() {
    const v = vung();
    const g1 = xemKhung.getContext("2d");
    g1.clearRect(0, 0, xemKhung.width, xemKhung.height);
    g1.drawImage(im, v.sx, v.sy, v.sw, v.sh, 0, 0, xemKhung.width, xemKhung.height);
    if (xemTron) {
      const g2 = xemTron.getContext("2d");
      const canh = v.sw;                               // hình vuông rộng bằng bề ngang khung
      const lech = (v.sh - canh) * LECH_TRON;
      g2.clearRect(0, 0, xemTron.width, xemTron.height);
      g2.drawImage(im, v.sx, v.sy + lech, canh, canh, 0, 0, xemTron.width, xemTron.height);
    }
  }
  function datLai() {
    phong = 1; truot.value = "1";
    const s = tiLePhu();
    x = (KW - W0 * s) / 2;
    y = Math.min(0, (KH - H0 * s) * 0.2);              // ảnh dọc: ưu tiên giữ phần đầu
    gioiHan(); ve();
  }
  function doiPhong(moi, tamX = KW / 2, tamY = KH / 2) {
    moi = Math.min(4, Math.max(1, moi));
    const s0 = tiLePhu();
    // giữ nguyên điểm ảnh đang nằm dưới tâm phóng
    const ax = (tamX - x) / s0, ay = (tamY - y) / s0;
    phong = moi; truot.value = String(moi);
    const s1 = tiLePhu();
    x = tamX - ax * s1; y = tamY - ay * s1;
    gioiHan(); ve();
  }

  function doKhung() {
    const r = khung.getBoundingClientRect();
    KW = r.width; KH = r.height;
    xemKhung.width = 100; xemKhung.height = Math.round(100 / tiLe);
    if (xemTron) { xemTron.width = 100; xemTron.height = 100; }
  }
  doKhung(); datLai();

  // ---- kéo bằng chuột / ngón tay, chụm hai ngón để phóng ----
  const diem = new Map();
  let keo = null, chum = null;
  khung.addEventListener("pointerdown", (e) => {
    khung.setPointerCapture(e.pointerId);
    diem.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (diem.size === 1) keo = { x: e.clientX - x, y: e.clientY - y };
    if (diem.size === 2) {
      const [a, b] = [...diem.values()];
      chum = { d: Math.hypot(a.x - b.x, a.y - b.y), phong };
    }
  });
  khung.addEventListener("pointermove", (e) => {
    if (!diem.has(e.pointerId)) return;
    diem.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (diem.size === 2 && chum) {
      const [a, b] = [...diem.values()];
      const r = khung.getBoundingClientRect();
      doiPhong(chum.phong * Math.hypot(a.x - b.x, a.y - b.y) / chum.d,
               (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    } else if (keo) {
      x = e.clientX - keo.x; y = e.clientY - keo.y; gioiHan(); ve();
    }
  });
  const nha = (e) => {
    diem.delete(e.pointerId);
    chum = null;
    const con = [...diem.values()][0];
    keo = con ? { x: con.x - x, y: con.y - y } : null;
  };
  khung.addEventListener("pointerup", nha);
  khung.addEventListener("pointercancel", nha);
  khung.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = khung.getBoundingClientRect();
    doiPhong(phong * (e.deltaY < 0 ? 1.08 : 1 / 1.08), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  truot.addEventListener("input", () => doiPhong(parseFloat(truot.value)));
  khung.addEventListener("keydown", (e) => {
    const b = e.shiftKey ? 20 : 5;
    const map = { ArrowLeft: [b, 0], ArrowRight: [-b, 0], ArrowUp: [0, b], ArrowDown: [0, -b] };
    if (map[e.key]) { e.preventDefault(); x += map[e.key][0]; y += map[e.key][1]; gioiHan(); ve(); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); doiPhong(phong * 1.08); }
    else if (e.key === "-") { e.preventDefault(); doiPhong(phong / 1.08); }
  });
  const coGian = () => {
    const v = vung(); doKhung();
    const s = tiLePhu(); x = -v.sx * s; y = -v.sy * s; gioiHan(); ve();
  };
  window.addEventListener("resize", coGian);

  requestAnimationFrame(() => phu.classList.add("dang-mo"));
  khung.focus();

  return new Promise((xong) => {
    const dong = (kq) => {
      window.removeEventListener("keydown", phim, true);
      window.removeEventListener("resize", coGian);
      URL.revokeObjectURL(url);
      phu.remove();
      xong(kq);
    };
    // Bắt Escape ở pha capture và chặn lan ra: hộp thoại sửa phía dưới
    // cũng nghe Escape, không chặn thì một phím đóng mất cả hai.
    const phim = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); dong(null); } };
    window.addEventListener("keydown", phim, true);

    phu.querySelector("[data-huy]").addEventListener("click", () => dong(null));
    phu.querySelector("[data-dat-lai]").addEventListener("click", datLai);
    phu.querySelector("[data-ok]").addEventListener("click", async (e) => {
      e.currentTarget.disabled = true;
      const v = vung();
      // không phóng ảnh nhỏ lên quá cỡ gốc — chỉ làm ảnh mờ mà nặng thêm
      const rong = Math.round(Math.min(RONG_RA, v.sw));
      const cao = Math.round(rong / tiLe);
      const c = document.createElement("canvas");
      c.width = rong; c.height = cao;
      const g = c.getContext("2d");
      g.imageSmoothingQuality = "high";
      g.drawImage(im, v.sx, v.sy, v.sw, v.sh, 0, 0, rong, cao);
      const xuat = (kieu) => new Promise((ok) => c.toBlob(ok, kieu, CHAT_LUONG));
      let ra = await xuat("image/webp");
      if (!ra || ra.type !== "image/webp") ra = await xuat("image/jpeg");   // Safari cũ không xuất được webp
      const duoi = ra.type === "image/webp" ? "webp" : "jpg";
      const goc = (blob.name || "anh").replace(/\.[^.]+$/, "");
      dong(new File([ra], `${goc}-cat.${duoi}`, { type: ra.type }));
    });
  });
}
