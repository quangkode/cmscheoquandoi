/* ==========================================================
   Lớp kết nối Firebase dùng chung cho toàn bộ CMS.
   Không dùng npm/bundler — nạp thẳng SDK dạng module từ CDN của
   Google, đúng kiểu "không cần build" như trang web chính.
   ========================================================== */
import { cauHinhFirebase, PHIEN_BAN_SDK, daCauHinh } from "../cau-hinh.js";

const CDN = `https://www.gstatic.com/firebasejs/${PHIEN_BAN_SDK}`;

const [{ initializeApp }, authMod, dbMod, stMod] = await Promise.all([
  import(`${CDN}/firebase-app.js`),
  import(`${CDN}/firebase-auth.js`),
  import(`${CDN}/firebase-firestore.js`),
  import(`${CDN}/firebase-storage.js`)
]);

const app = initializeApp(cauHinhFirebase);
export const auth = authMod.getAuth(app);
export const db = dbMod.getFirestore(app);
export const kho = stMod.getStorage(app);
export { daCauHinh };

/* --- Đăng nhập --- */
export const dangNhap = (email, matKhau) =>
  authMod.signInWithEmailAndPassword(auth, email, matKhau);
export const dangXuat = () => authMod.signOut(auth);
export const doiMatKhau = (email) => authMod.sendPasswordResetEmail(auth, email);
export const theoDoiPhien = (cb) => authMod.onAuthStateChanged(auth, cb);

/* Đợi Firebase xác định xong trạng thái đăng nhập rồi mới trả lời.
   Đọc auth.currentUser ngay lúc trang vừa tải luôn ra null vì SDK còn
   đang khôi phục phiên từ IndexedDB — cứ tin vào đó là mọi trang đều
   đá người dùng về màn đăng nhập dù họ vẫn đang đăng nhập. */
export function nguoiDungHienTai() {
  return new Promise((resolve) => {
    const thoi = authMod.onAuthStateChanged(auth, (u) => { thoi(); resolve(u); });
  });
}

/* --- Firestore --- */
const {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, where
} = dbMod;

export const nay = () => serverTimestamp();

export async function layDanhSach(ten, sapXep) {
  const q = sapXep
    ? query(collection(db, ten), orderBy(sapXep.truong, sapXep.chieu || "desc"))
    : collection(db, ten);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function ngheDanhSach(ten, sapXep, cb, loi) {
  const q = sapXep
    ? query(collection(db, ten), orderBy(sapXep.truong, sapXep.chieu || "desc"))
    : collection(db, ten);
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), loi);
}

export const layMot = async (ten, id) => {
  const d = await getDoc(doc(db, ten, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};
export const themMoi = (ten, duLieu) =>
  addDoc(collection(db, ten), { ...duLieu, taoLuc: serverTimestamp(), suaLuc: serverTimestamp() });
export const capNhat = (ten, id, duLieu) =>
  updateDoc(doc(db, ten, id), { ...duLieu, suaLuc: serverTimestamp() });
export const xoaBo = (ten, id) => deleteDoc(doc(db, ten, id));
export const laQuanTri = async (uid) => (await getDoc(doc(db, "quan-tri", uid))).exists();

/* --- Kho ảnh --- */
export async function taiAnhLen(tep, thuMuc) {
  const ten = `${thuMuc}/${Date.now()}-${tep.name.replace(/[^\w.\-]/g, "_")}`;
  const ref = stMod.ref(kho, ten);
  await stMod.uploadBytes(ref, tep);
  return { url: await stMod.getDownloadURL(ref), duongDan: ten };
}
export async function xoaAnh(duongDan) {
  if (!duongDan) return;
  // ảnh có thể đã bị xoá tay trên console; xoá hụt không nên chặn việc xoá bản ghi
  try { await stMod.deleteObject(stMod.ref(kho, duongDan)); } catch (e) { console.warn("Không xoá được ảnh:", e.code); }
}
