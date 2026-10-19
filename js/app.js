/* Legal Hub - Frontend (GitHub Pages). Backend: Google Apps Script REST API (lihat js/config.js) */
/* ==================================================================
   Legal Hub - Frontend
   Aturan: tanpa template literal, string concatenation klasik,
   semua nilai dari DOM diubah ke tipe primitif sebelum dikirim ke server.
   ================================================================== */
var PAGE = 12;
var S = {
  token: null, user: null, lang: 'id', view: 'home', stats: null, hub: null, credit: null, io: null,
  regRole: 'Client', pendingQ: '', photos: {}, photoReq: {}, scr: {}, exp: '', rf: null, moreViews: [], hubQ: null, statsQ: null, creditBusy: false,
  cfg: {
    fx: { IDR: 1, USD: 16000, EUR: 17500, SGD: 12000, MYR: 3800, JPY: 105 }, taxRate: 0.005, commission: 0.15,
    kategori: ['Hak Cipta & HKI', 'Kontrak & Bisnis', 'Pajak', 'Ketenagakerjaan', 'Perdata & Keluarga', 'Pidana', 'Lainnya'],
    services: { konsultasi: { label: 'Konsultasi 30 menit', price: 250000 }, review: { label: 'Review dokumen', price: 500000 }, draf: { label: 'Penyusunan draf kontrak', price: 1000000 } },
    cost: { contract: 50, question: 25 },
    topup: { poin: { poin: 1000, label: '1000 Poin', price: 45000 }, subs: { quota: 50, plan: 'Pro Monthly', label: 'Pro Monthly', price: 99000 } },
    org: ['PERADI', 'KAI (Kongres Advokat Indonesia)', 'IKADIN', 'INI (Ikatan Notaris Indonesia)', 'IKPI (Ikatan Konsultan Pajak Indonesia)', 'AKHKI (Konsultan HKI)', 'Lainnya'],
    rtags: ['Penjelasan jelas', 'Responsif', 'Tepat waktu', 'Solusi praktis', 'Ramah', 'Profesional'], reviewDays: 7,
    checks: [['Identitas dan nama sesuai dengan dokumen', 'Identity and name match the documents'], ['Nomor izin praktik / KTA valid di organisasi profesi', 'Practice licence / membership number is valid'], ['Ijazah dan pendidikan hukum terverifikasi', 'Law degree and education verified'], ['Pengalaman kerja sesuai klaim', 'Work experience matches the claim'], ['Tidak ada catatan pelanggaran etik atau disiplin', 'No record of ethics or disciplinary violations']]
  }
};
var L = {};
var STATUS = {
  contracts: ['Menunggu Verifikasi', 'Terverifikasi', 'Ditolak'],
  copyrights: ['Dilaporkan', 'Dalam Proses', 'Selesai', 'Ditolak'],
  bookings: ['Menunggu', 'Diterima', 'Selesai', 'Ditolak'],
  verify: ['Menunggu', 'Dalam Screening', 'Perlu Revisi', 'Disetujui', 'Ditolak'],
  ask: ['Terbuka', 'Terjawab'],
  reviews: ['Perlu Tinjau', 'Tampil', 'Disembunyikan']
};
var ST_EN = { 'Menunggu Verifikasi': 'Pending review', 'Terverifikasi': 'Verified', 'Ditolak': 'Rejected', 'Dilaporkan': 'Reported', 'Dalam Proses': 'In progress', 'Selesai': 'Completed', 'Menunggu': 'Pending', 'Diterima': 'Accepted', 'Terbuka': 'Open', 'Terjawab': 'Answered', 'Aktif': 'Active', 'Dalam Screening': 'In screening', 'Perlu Revisi': 'Needs revision', 'Disetujui': 'Approved', 'Perlu Tinjau': 'Needs review', 'Tampil': 'Visible', 'Disembunyikan': 'Hidden' };
var CREATE_FN = { contracts: 'apiCreateContract', copyrights: 'apiCreateCopyright', taxes: 'apiCreateTax' };
var MONTHS = { id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };

// Kamus bahasa untuk teks statis halaman masuk (elemen bertanda data-i18n)
var I18N = {
  id: {
    welcomeTitle: 'Selamat datang kembali', welcomeSub: 'Masuk untuk melanjutkan ke Legal Hub',
    labelId: 'Email atau username', labelPass: 'Password', phPass: 'Masukkan password', phNewPass: 'Minimal 6 karakter',
    remember: 'Ingat saya', forgot: 'Lupa password?', btnLogin: 'Masuk', noAccount: 'Belum punya akun?', signUp: 'Daftar',
    regTitle: 'Buat akun', regSub: 'Bergabung sebagai client atau pakar hukum', regAs: 'Daftar sebagai',
    roleClient: 'Client', roleExpert: 'Pakar hukum', labelName: 'Nama lengkap', labelUser: 'Username', labelEmail: 'Email',
    labelField: 'Bidang keahlian', hintUser: '3-20 karakter: huruf, angka, underscore.', btnReg: 'Buat akun',
    haveAccount: 'Sudah punya akun?', signIn: 'Masuk', privacy: 'Privasi', terms: 'Ketentuan', btnLogout: 'Keluar', demo: 'Akun uji',
    expertNote: 'Akun pakar aktif setelah admin menyelesaikan screening latar belakang Anda.', labelIzin: 'No. izin praktik / KTA', labelOrg: 'Organisasi profesi',
    labelEdu: 'Pendidikan terakhir', phEdu: 'mis. S2 Hukum - Universitas Indonesia', labelExp: 'Pengalaman (tahun)', labelDoc: 'Link dokumen pendukung',
    hintDoc: 'Folder berisi scan KTA/izin praktik, ijazah, dan CV. Pastikan admin bisa membukanya.', labelBg: 'Ringkasan latar belakang',
    phBg: 'Pengalaman, spesialisasi, dan kasus yang pernah ditangani (minimal 30 karakter)', agree: 'Saya menyatakan data di atas benar dan bersedia diverifikasi oleh admin.'
  },
  en: {
    welcomeTitle: 'Welcome back', welcomeSub: 'Sign in to continue to Legal Hub',
    labelId: 'Email or username', labelPass: 'Password', phPass: 'Enter your password', phNewPass: 'At least 6 characters',
    remember: 'Remember me', forgot: 'Forgot password?', btnLogin: 'Sign in', noAccount: "Don't have an account?", signUp: 'Sign up',
    regTitle: 'Create account', regSub: 'Join as a client or a legal expert', regAs: 'Sign up as',
    roleClient: 'Client', roleExpert: 'Legal expert', labelName: 'Full name', labelUser: 'Username', labelEmail: 'Email',
    labelField: 'Area of expertise', hintUser: '3-20 characters: letters, numbers, underscores.', btnReg: 'Create account',
    haveAccount: 'Already have an account?', signIn: 'Sign in', privacy: 'Privacy', terms: 'Terms', btnLogout: 'Sign out', demo: 'Demo accounts',
    expertNote: 'Expert accounts are activated once an admin completes your background screening.', labelIzin: 'Practice licence / membership no.', labelOrg: 'Professional body',
    labelEdu: 'Highest education', phEdu: 'e.g. LLM - Universitas Indonesia', labelExp: 'Experience (years)', labelDoc: 'Supporting documents link',
    hintDoc: 'A folder with your licence/membership card, degree and CV. Make sure the admin can open it.', labelBg: 'Background summary',
    phBg: 'Experience, specialisation and notable cases (at least 30 characters)', agree: 'I confirm the information above is true and agree to be verified by the admin.'
  }
};

var PATHS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  feed: 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5',
  ask: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM9 10h6M9 14h4',
  experts: 'M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .6 3.3 2.4 3.5 5.2M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h12M16 14h3',
  shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM9 12l2 2 4-4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  heart: 'M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z',
  doc: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h7M9 17h7',
  db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  copyright: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM14.8 9.6a3.4 3.4 0 1 0 0 4.8',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.4-.5-3-1.5M12 6v2m0 8v2',
  users: 'M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .6 3.3 2.4 3.5 5.2',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  refresh: 'M21 12a9 9 0 0 1-15.5 6.3M3 12A9 9 0 0 1 18.5 5.7M18 2v4h-4M6 22v-4h4',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  grid: 'M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
  user: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c.7-4 4-6 8-6s7.3 2 8 6',
  logout: 'M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H10',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  pen: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevL: 'M15 18l-6-6 6-6',
  chevR: 'M9 18l6-6-6-6',
  arrowL: 'M19 12H5M11 6l-6 6 6 6'
};

/* ============ Util ============ */
function el(id) { return document.getElementById(id); }
// Selalu ambil nilai primitif (string) dari DOM; elemen DOM tidak pernah dikirim ke backend
function val(id) { var e = el(id); return e ? String(e.value).trim() : ''; }
function tr(id, en) { return S.lang === 'en' ? en : id; }
function role() { return S.user ? S.user.role : ''; }
function isAdmin() { return role() === 'Admin'; }
function isVerifiedExpert() { return role() === 'Expert' && S.user.ver === 'Terverifikasi'; }
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escBr(s) { return esc(s).replace(/\n/g, '<br>'); }
function nf(n) { return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(n) || 0); }
function rp(n) { return 'Rp ' + nf(Math.round(Number(n) || 0)); }
function ic(name) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + PATHS[name] + '"/></svg>'; }
// Inisial avatar: gelar di belakang koma dan sebutan di depan (Dr., Prof., Ir., dll.) diabaikan
function initials(n) {
  var s = String(n || '?').replace(/,.*$/, '').replace(/^((dr|prof|ir|drs|dra|hj?)\.?\s+)+/i, '').trim();
  var p = (s || '?').split(/\s+/);
  return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[1].charAt(0) : '')).toUpperCase();
}
// Avatar: tampilkan foto bila sudah diketahui, selain itu inisial. data-u dipakai untuk memuat foto belakangan.
function avatar(u, name, cls) {
  var f = S.photos[u];
  return '<span class="avatar' + (cls ? ' ' + cls : '') + '" data-u="' + esc(u) + '" data-n="' + esc(name) + '">' + (f ? '<img src="' + esc(f) + '" alt="">' : esc(initials(name))) + '</span>';
}
function paintAvatars(root) {
  var nodes = (root || document).querySelectorAll('.avatar[data-u]');
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i], f = S.photos[n.getAttribute('data-u')];
    var img = n.querySelector('img');
    if (f) { if (img) { if (img.getAttribute('src') !== f) img.setAttribute('src', f); } else n.innerHTML = '<img src="' + esc(f) + '" alt="">'; }
    else if (f === '' && img) n.textContent = initials(n.getAttribute('data-n'));
  }
}
// Minta foto hanya untuk avatar yang tampil di layar dan belum diketahui (maks 60 per panggilan)
function ensurePhotos(root) {
  if (!S.token || !root) return;
  var nodes = root.querySelectorAll('.avatar[data-u]'), need = [];
  for (var i = 0; i < nodes.length && need.length < 60; i++) {
    var u = nodes[i].getAttribute('data-u');
    if (!(u in S.photos) && !S.photoReq[u]) { S.photoReq[u] = 1; need.push(u); }
  }
  if (!need.length) return;
  api('apiPhotos', [S.token, need], function (res) {
    for (var k = 0; k < need.length; k++) delete S.photoReq[need[k]];
    if (!res.ok || !res.photos) return;
    for (var key in res.photos) S.photos[key] = res.photos[key];
    paintAvatars(document);
  }, function () { for (var k = 0; k < need.length; k++) delete S.photoReq[need[k]]; });
}

function fmtDate(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?/.exec(String(s || ''));
  if (!m) return String(s || '');
  return parseInt(m[3], 10) + ' ' + MONTHS[S.lang][parseInt(m[2], 10) - 1] + ' ' + m[1] + (m[4] ? ', ' + m[4] + ':' + m[5] : '');
}
function nowStamp() {
  var d = new Date();
  function p(x) { return ('0' + x).slice(-2); }
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function shortTxt(s, n) { s = String(s || ''); return s.length > n ? s.substring(0, n) + '...' : s; }
function stLabel(st) { return S.lang === 'en' && ST_EN[st] ? ST_EN[st] : st; }
function toneOf(st) {
  if (/Terverifikasi|Selesai|Terjawab|Aktif|Disetujui/.test(st)) return 'b-ok';
  if (/Ditolak|Disembunyikan/.test(st)) return 'b-bad';
  if (/Tampil/.test(st)) return 'b-ok';
  if (/Proses|Diterima|Screening/.test(st)) return 'b-info';
  return 'b-warn';
}
/* ----- Rating: bintang, ringkasan, label ----- */
var RATE_LBL = { id: ['Sangat buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat baik'], en: ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'] };
function nf1(n) { return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number(n) || 0); }
function stars(v, cls) {
  var n = Math.max(0, Math.min(5, Number(v) || 0));
  return '<span class="stars' + (cls ? ' ' + cls : '') + '" style="--v:' + (n * 20) + '%" role="img" aria-label="' + nf1(n) + ' ' + tr('dari 5 bintang', 'out of 5 stars') + '"></span>';
}
// Label rating ringkas: "★ 4,8 (32 ulasan)" + badge Baru / Pakar Teladan
function rateChip(avg, n, teladan) {
  n = Number(n) || 0;
  if (!n) return '<span class="rate none">' + tr('Belum ada ulasan', 'No reviews yet') + '</span>';
  var h = '<span class="rate"><b>&#9733; ' + nf1(avg) + '</b> <span>(' + nf(n) + ' ' + tr('ulasan', n > 1 ? 'reviews' : 'review') + ')</span></span>';
  if (n < 3) h += '<span class="badge b-info">' + tr('Baru', 'New') + '</span>';
  if (teladan === true || teladan === '1') h += '<span class="badge teladan">' + tr('Pakar Teladan', 'Top Expert') + '</span>';
  return h;
}
function badge(st) { return '<span class="badge ' + toneOf(st) + '">' + esc(stLabel(st)) + '</span>'; }
function verMark(v) {
  return v === '1' ? '<span class="vf" title="' + tr('Terverifikasi', 'Verified') + '"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span>' : '';
}
// opts(list, terpilih, pakaiLabelStatus): value tetap teks asli (Bahasa Indonesia) agar cocok dengan database
function opts(list, sel, isStatus) {
  var h = '';
  for (var i = 0; i < list.length; i++) {
    h += '<option value="' + esc(list[i]) + '"' + (list[i] === sel ? ' selected' : '') + '>' + esc(isStatus ? stLabel(list[i]) : list[i]) + '</option>';
  }
  return h;
}
function cssBrand() {
  var v = getComputedStyle(document.body).getPropertyValue('--brand');
  return String(v || '').trim() || '#0A62C9';
}
function toast(msg, type) {
  var t = document.createElement('div');
  t.className = 'toast ' + (type || '');
  t.setAttribute('role', 'status');
  t.textContent = msg;
  el('toasts').appendChild(t);
  setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, 3400);
}
function busyEl(b, on) {
  if (!b) return;
  if (on) { b.classList.add('loading'); b.disabled = true; } else { b.classList.remove('loading'); b.disabled = false; }
}
function busy(id, on) { busyEl(el(id), on); }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
function ssSet(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
function htmlToNode(html) { var t = document.createElement('div'); t.innerHTML = html; return t.firstElementChild; }
function htmlToRow(html) { var t = document.createElement('tbody'); t.innerHTML = html; return t.firstElementChild; }

/* ============ API bridge (aman di Gemini Canvas / preview) ============ */
/* ============ Koneksi ke backend (REST: fetch ke Google Apps Script /exec) ============ */
// Aksi baca boleh diulang otomatis; aksi tulis membawa reqId agar aman diulang tanpa data ganda.
var READ_FN = /^api(Login|Me|List|Stats|Recap|GetCredit|Spotlight|Feed|Questions|Answers|Experts|Bookings|Earnings|HubStats|ExpertRecap|Photos|MyScreening|Screenings|ReviewTargets|Reviews|ExpertProfile|Landing|ImportScan)$/;
var Perf = {
  rows: [],
  add: function (fn, total, server) {
    this.rows.push({ action: fn, total: total, server: server == null ? null : server, net: server == null ? null : total - server });
    if (this.rows.length > 200) this.rows.shift();
  },
  table: function () { if (window.console && console.table) console.table(this.rows.slice(-30)); } // ketik Perf.table() di Console
};
function hasBackend() { return typeof GAS_URL === 'string' && GAS_URL.indexOf('GANTI_') < 0 && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(GAS_URL); }
function newReqId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now() + '-' + Math.random().toString(36).slice(2);
}
function apiOnce(fn, args, timeout, reqId) {
  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeout);
  var t0 = Date.now(), status = 0;
  return fetch(GAS_URL, {
    method: 'POST', redirect: 'follow', cache: 'no-store', signal: ctrl ? ctrl.signal : undefined,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain: tanpa CORS preflight
    body: JSON.stringify({ action: fn, args: args || [], reqId: reqId })
  }).then(function (r) { status = r.status; return r.text(); }).then(function (txt) {
    clearTimeout(timer);
    try { var j = JSON.parse(txt); Perf.add(fn, Date.now() - t0, j.ms); return j; }
    catch (e) { return { ok: false, network: true, retryable: status >= 500 || status === 429 || status === 0, msg: tr('Server membalas tidak wajar (HTTP ', 'Unexpected server reply (HTTP ') + status + ').' }; }
  }, function (err) {
    clearTimeout(timer);
    return { ok: false, network: true, retryable: true, msg: err && err.name === 'AbortError' ? tr('Server terlalu lama merespons.', 'The server took too long to respond.') : tr('Koneksi terputus. Periksa internet Anda.', 'Connection lost. Check your internet.') };
  });
}
function waitOnline(ms) {
  return new Promise(function (resolve) {
    if (navigator.onLine !== false) { resolve(); return; }
    var t = setTimeout(done, ms);
    function done() { clearTimeout(t); window.removeEventListener('online', done); resolve(); }
    window.addEventListener('online', done);
  });
}
function api(fn, args, onOk, onFail) {
  if (!hasBackend()) { setTimeout(function () { onOk(mock_(fn, args)); }, 250); return; } // mode pratinjau tanpa backend
  var isRead = READ_FN.test(fn), reqId = isRead ? '' : newReqId(), tries = isRead ? 3 : 2, i = 0;
  function attempt() {
    var wait = i ? new Promise(function (r) { setTimeout(r, 1200 * i); }).then(function () { return waitOnline(15000); }) : Promise.resolve();
    wait.then(function () { return apiOnce(fn, args, isRead ? (i ? 40000 : 25000) : 90000, reqId); }).then(function (res) {
      i++;
      if (!res.ok && res.retryable && i < tries) { attempt(); return; }
      if (res.network) { onFail(res.msg); return; }
      if (res.ok === false && res.expired) { forceLogout(); toast(tr('Sesi berakhir, silakan masuk lagi.', 'Session expired, please sign in again.'), 'err'); return; }
      onOk(res);
    });
  }
  attempt();
}
// Data publik (halaman depan, pakar pilihan): tampil seketika dari cache perangkat, lalu disegarkan di latar.
var LS_API = 'lh:v1:';
function apiCached(fn, args, key, onOk) {
  var c = null;
  try { c = JSON.parse(localStorage.getItem(LS_API + key) || 'null'); } catch (e) { c = null; }
  if (c && c.data) onOk(c.data, true);
  api(fn, args, function (res) {
    if (!res || !res.ok) { if (!c) onOk(res, false); return; }
    delete res.ms;
    var s = JSON.stringify(res);
    if (c && c.s === s) return; // tidak berubah: tidak perlu render ulang
    try { localStorage.setItem(LS_API + key, JSON.stringify({ s: s, data: res })); } catch (e) {}
    onOk(res, false);
  }, function () { if (!c) onOk({ ok: false }, false); });
}
// Bangunkan server saat app dibuka & saat kembali dari latar belakang lebih dari 2 menit
var WARM_AT = 0;
function warmUpServer() {
  if (!hasBackend()) return;
  WARM_AT = Date.now();
  try { fetch(GAS_URL + '?ping=' + WARM_AT, { mode: 'no-cors', cache: 'no-store' }).catch(function () {}); } catch (e) {}
}
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && Date.now() - WARM_AT > 120000) warmUpServer(); });
// Mode pratinjau (GAS_URL belum diisi): hanya UI tanpa data. Data dummy hanya ada di setup.gs.
function mock_(fn, a) {
  if (fn === 'apiLogin') return { ok: true, token: 'demo', user: { username: 'demo', role: 'Client', nama: 'Demo', email: '', bidang: '', bio: '', ver: 'Aktif' }, cfg: S.cfg };
  if (fn === 'apiSpotlight') return { ok: true, spot: null, month: '' };
  if (fn === 'apiLanding') return { ok: true, stats: null, experts: [], testi: [], images: [], price: null };
  if (fn === 'apiStats') return { ok: true, stats: { contracts: { total: 0, pending: 0, verified: 0, value: 0 }, copyrights: { total: 0, open: 0, done: 0 }, taxes: { count: 0, income: 0, tax: 0 }, creators: 0 } };
  if (fn === 'apiHubStats') return { ok: true, stats: {} };
  if (fn === 'apiGetCredit' || fn === 'apiTopUp') return { ok: true, poin: 0, quota: 0, plan: 'Free Plan' };
  if (fn === 'apiAnswers') return { ok: true, rows: [] };
  if (fn === 'apiMyScreening') return { ok: true, scr: null, ver: '' };
  if (fn === 'apiReviewTargets') return { ok: true, rows: [] };
  if (fn === 'apiExpertProfile') return { ok: false, msg: tr('Pratinjau tanpa data.', 'Preview without data.') };
  if (fn === 'apiPhotos') return { ok: true, photos: {} };
  if (fn === 'apiSetPhoto') return { ok: true, foto: a[1] };
  if (fn === 'apiRemovePhoto') return { ok: true, foto: '' };
  if (/^api(List|Recap|Feed|Questions|Experts|Bookings|Earnings|Screenings|ExpertRecap|Reviews)$/.test(fn)) return { ok: true, rows: [], total: 0, nextOffset: 0, hasMore: false };
  return { ok: true, row: null };
}

/* ============ Bahasa & tema ============ */
function setLang(lang) {
  S.lang = lang === 'en' ? 'en' : 'id';
  ssSet('lh_lang', S.lang);
  document.documentElement.setAttribute('lang', S.lang);
  el('lang-btn-id').className = S.lang === 'id' ? 'on' : '';
  el('lang-btn-en').className = S.lang === 'en' ? 'on' : '';
  var dict = I18N[S.lang];
  var nodes = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < nodes.length; i++) {
    var k = nodes[i].getAttribute('data-i18n');
    if (dict[k]) nodes[i].textContent = dict[k];
  }
  var ph = document.querySelectorAll('[data-i18n-ph]');
  for (var j = 0; j < ph.length; j++) {
    var kp = ph[j].getAttribute('data-i18n-ph');
    if (dict[kp]) ph[j].setAttribute('placeholder', dict[kp]);
  }
  var demo = [['Admin', 'admin', 'admin123'], [tr('Pakar', 'Expert'), 'alex_hervin', 'pakar123'], ['Client', 'kreator1', 'kreator123']];
  var dh = '<b>' + esc(dict.demo) + '</b> <span class="demo-hint">' + tr('klik untuk mengisi otomatis', 'click to autofill') + '</span>';
  for (var d = 0; d < demo.length; d++) {
    dh += '<button type="button" class="demo-acc" data-action="demo-fill" data-u="' + esc(demo[d][1]) + '" data-p="' + esc(demo[d][2]) + '" title="' + tr('Isi otomatis akun ', 'Autofill account ') + esc(demo[d][1]) + '"><span class="da-role">' + esc(demo[d][0]) + '</span><span class="da-cred">' + esc(demo[d][1]) + ' / ' + esc(demo[d][2]) + '</span><span class="da-go">' + tr('Gunakan', 'Use') + ' &rarr;</span></button>';
  }
  el('demo-box').innerHTML = dh;
  el('r-bidang').innerHTML = '<option value="">' + tr('Pilih bidang...', 'Choose an area...') + '</option>' + opts(S.cfg.kategori);
  el('r-org').innerHTML = '<option value="">' + tr('Pilih organisasi...', 'Choose a body...') + '</option>' + opts(S.cfg.org);
  el('lamp').title = tr('Tarik tali untuk ganti tema (gelap/terang)', 'Pull the cord to switch theme (dark/light)');
  if (el('auth-back-t')) el('auth-back-t').textContent = tr('Beranda', 'Home');
  if (S.user) { buildShell(); go(S.view); } else { loadSpot(); if (!el('landing').hidden) renderLanding(); }
}

// Sakelar tali lampu: tema gelap/terang, berlaku di halaman masuk dan di dalam aplikasi
function applyTheme(dark) {
  document.body.classList.toggle('theme-dark', dark);
  el('auth').classList.toggle('dark-theme', dark);
}
function toggleLampTheme() {
  var dark = !document.body.classList.contains('theme-dark');
  applyTheme(dark);
  lsSet('lh_theme', dark ? 'dark' : null);
  if (navigator.vibrate) { try { navigator.vibrate(40); } catch (e) {} }
  toast(dark ? tr('Tema gelap aktif', 'Dark theme on') : tr('Tema terang aktif', 'Light theme on'), 'info');
}

/* ============ Warna tema (palet) - per pengguna, disimpan di perangkat ============ */
var PALETTES = [
  ['blue', 'Biru Legal Hub', 'Legal Hub Blue', '#0A62C9'], ['sky', 'Biru Langit', 'Sky Blue', '#0284C7'], ['navy', 'Navy', 'Navy', '#1E3A8A'],
  ['emerald', 'Hijau Zamrud', 'Emerald', '#047857'], ['leaf', 'Hijau Daun', 'Leaf Green', '#3F8F29'], ['teal', 'Toska', 'Teal', '#0F766E'],
  ['pink', 'Pink', 'Pink', '#DB2777'], ['rose', 'Rose', 'Rose', '#E11D48'], ['magenta', 'Magenta', 'Magenta', '#C026D3'],
  ['violet', 'Ungu', 'Violet', '#7C3AED'], ['lavender', 'Lavender', 'Lavender', '#6D5BD0'], ['maroon', 'Merah Marun', 'Maroon', '#9F1239'],
  ['coral', 'Coral', 'Coral', '#E4572E'], ['orange', 'Oranye', 'Orange', '#EA580C'], ['coffee', 'Cokelat Kopi', 'Coffee Brown', '#8B5E3C'],
  ['graphite', 'Grafit', 'Graphite', '#374151']
];
var PAL = { cur: 'blue', preview: false };
function hexRgb(h) {
  h = String(h || '').replace('#', '');
  if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
  var n = parseInt(h, 16);
  return isNaN(n) || h.length !== 6 ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbHex(c) {
  var s = '#';
  for (var i = 0; i < 3; i++) { var v = Math.max(0, Math.min(255, Math.round(c[i]))).toString(16); s += (v.length < 2 ? '0' : '') + v; }
  return s.toUpperCase();
}
function mixHex(a, b, w) {
  var x = hexRgb(a), y = hexRgb(b);
  return rgbHex([x[0] + (y[0] - x[0]) * w, x[1] + (y[1] - x[1]) * w, x[2] + (y[2] - x[2]) * w]);
}
function lumHex(h) {
  var c = hexRgb(h), r = [];
  for (var i = 0; i < 3; i++) { var v = c[i] / 255; r.push(v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); }
  return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
}
function contrastHex(a, b) {
  var x = lumHex(a), y = lumHex(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
// Geser warna ke arah 'to' sampai kontras terhadap 'bg' mencapai target
function fitContrast(base, to, bg, target, minW) {
  var w = minW || 0, c = mixHex(base, to, w);
  while (contrastHex(c, bg) < target && w < 1) { w += 0.04; c = mixHex(base, to, Math.min(w, 1)); }
  return c;
}
function palFind(k) {
  for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i][0] === k) return PALETTES[i];
  return null;
}
function palHex(key) {
  if (String(key).indexOf('custom:') === 0) return hexRgb(key.slice(7)) ? key.slice(7).toUpperCase() : '#0A62C9';
  var p = palFind(key);
  return p ? p[3] : '#0A62C9';
}
function palName(key) {
  if (String(key).indexOf('custom:') === 0) return tr('Warna sendiri', 'Custom color') + ' ' + palHex(key);
  var p = palFind(key) || PALETTES[0];
  return S.lang === 'en' ? p[2] : p[1];
}
function buildPaletteCss(base) {
  var W = '#FFFFFF', K = '#000000', D = '#1B1F23';
  var b = fitContrast(base, K, W, 4.6, 0);             // brand terang: kontras >= 4.5 terhadap putih
  var b2 = mixHex(b, K, 0.18), soft = mixHex(b, W, 0.9);
  var L = {
    '--brand': b, '--brand-2': b2, '--brand-soft': soft, '--teal': b, '--badge': b, '--info': b,
    '--info-bg': soft, '--info-fg': mixHex(b, K, 0.3), '--note-bg': soft, '--note-fg': mixHex(b, K, 0.45), '--search': mixHex(b, W, 0.93),
    '--cover': 'linear-gradient(120deg,' + mixHex(base, W, 0.6) + ' 0%,' + mixHex(base, W, 0.8) + ' 48%,#E9D9C3 100%)',
    '--av-bg': 'linear-gradient(145deg,' + mixHex(base, W, 0.25) + ',' + b + ')',
    '--pl': b, '--pl2': mixHex(base, W, 0.25), '--pls': soft, '--plt': mixHex(base, W, 0.6),
    '--hero1': mixHex(base, K, 0.6), '--hero2': mixHex(base, K, 0.25), '--glow': mixHex(base, W, 0.3),
    '--logo1': b, '--logo2': mixHex(base, W, 0.2)
  };
  var db = fitContrast(base, W, D, 4.8, 0.15);         // brand gelap: dicerahkan agar terbaca di latar gelap
  var dsoft = mixHex(base, D, 0.78);
  var G = {
    '--brand': db, '--brand-2': mixHex(db, W, 0.3), '--brand-soft': dsoft, '--on-brand': mixHex(base, K, 0.82), '--teal': db, '--badge': db, '--info': db,
    '--info-bg': dsoft, '--info-fg': mixHex(db, W, 0.35), '--note-bg': dsoft, '--note-fg': mixHex(db, W, 0.6),
    '--cover': 'linear-gradient(120deg,' + mixHex(base, D, 0.6) + ' 0%,' + mixHex(base, D, 0.72) + ' 50%,#3A3328 100%)',
    '--av-bg': 'linear-gradient(145deg,' + mixHex(base, D, 0.2) + ',' + mixHex(base, D, 0.45) + ')',
    '--logo1': db, '--logo2': mixHex(db, W, 0.35)
  };
  var out = ':root{', k;
  for (k in L) out += k + ':' + L[k] + ';';
  out += '}body.theme-dark{';
  for (k in G) out += k + ':' + G[k] + ';';
  return out + '}';
}
function paintPalette(key) {
  var st = el('palette-style');
  if (!key || key === 'blue') { if (st) st.remove(); return; }
  if (!st) { st = document.createElement('style'); st.id = 'palette-style'; }
  st.textContent = buildPaletteCss(palHex(key));
  document.body.appendChild(st);                     // selalu paling akhir agar menimpa css.html
}
function applyPalette(key, save) {
  if (!key || (String(key).indexOf('custom:') !== 0 && !palFind(key))) key = 'blue';
  paintPalette(key);
  if (save) { PAL.cur = key; lsSet('lh_pal', key === 'blue' ? null : key); refreshPalUi(); refreshThemeColors(); }
}
function refreshThemeColors() {
  var m = document.querySelector('meta[name=theme-color]');
  if (m) m.setAttribute('content', palHex(PAL.cur));
  var ch = window.taxChartInstance;
  if (ch && ch.data && ch.data.datasets[0]) { try { ch.data.datasets[0].backgroundColor[0] = cssBrand(); ch.update(); } catch (e) {} }
}
function paletteGridHtml() {
  var cust = PAL.cur.indexOf('custom:') === 0, h = '<div class="pal-grid" role="radiogroup" aria-label="' + tr('Warna tema', 'Theme color') + '">';
  for (var i = 0; i < PALETTES.length; i++) {
    var p = PALETTES[i], on = PAL.cur === p[0], nm = S.lang === 'en' ? p[2] : p[1];
    h += '<button type="button" class="pal-c' + (on ? ' on' : '') + '" style="--c:' + p[3] + '" data-action="pal" data-k="' + p[0] + '" role="radio" aria-checked="' + (on ? 'true' : 'false') + '" title="' + esc(nm) + '" aria-label="' + esc(nm) + '"></button>';
  }
  h += '<label class="pal-c custom' + (cust ? ' on' : '') + '" style="--c:' + palHex(PAL.cur) + '" data-k="custom" title="' + tr('Warna sendiri', 'Custom color') + '"><input type="color" data-live="pal-custom" value="' + palHex(PAL.cur).toLowerCase() + '" aria-label="' + tr('Pilih warna sendiri', 'Pick a custom color') + '"></label>';
  h += '</div><div class="pal-name"><span>' + tr('Aktif', 'Active') + ': <b class="pal-cur">' + esc(palName(PAL.cur)) + '</b></span>';
  h += '<button type="button" data-action="pal" data-k="blue"' + (PAL.cur === 'blue' ? ' hidden' : '') + '>' + tr('Reset', 'Reset') + '</button></div>';
  return h;
}
function refreshPalUi() {
  var cs = document.querySelectorAll('.pal-c'), cust = PAL.cur.indexOf('custom:') === 0;
  for (var i = 0; i < cs.length; i++) {
    var k = cs[i].getAttribute('data-k'), on = k === 'custom' ? cust : k === PAL.cur;
    cs[i].classList.toggle('on', on);
    if (k !== 'custom') cs[i].setAttribute('aria-checked', on ? 'true' : 'false');
    else cs[i].style.setProperty('--c', palHex(PAL.cur));
  }
  var ns = document.querySelectorAll('.pal-cur');
  for (var j = 0; j < ns.length; j++) ns[j].textContent = palName(PAL.cur);
  var rs = document.querySelectorAll('.pal-name button');
  for (var r = 0; r < rs.length; r++) rs[r].hidden = PAL.cur === 'blue';
}
function pickPalette(key) {
  PAL.preview = false;
  applyPalette(key, true);
  toast(tr('Warna tema: ', 'Theme color: ') + palName(key), 'info');
}
function previewPalette(key) { PAL.preview = true; paintPalette(key); }
function endPreview() { if (PAL.preview) { PAL.preview = false; paintPalette(PAL.cur); } }
function customPalette(hex, save) {
  if (!hexRgb(hex)) return;
  hex = String(hex).toUpperCase();
  if (!save) { previewPalette('custom:' + hex); return; }
  PAL.preview = false;
  applyPalette('custom:' + hex, true);
  if (contrastHex(hex, '#FFFFFF') < 4.5) toast(tr('Warna terlalu terang untuk teks, otomatis digelapkan sedikit agar tetap terbaca.', 'That color is too light for text, so it was darkened slightly to stay readable.'), 'info');
  else toast(tr('Warna tema: ', 'Theme color: ') + palName(PAL.cur), 'info');
}
function closePalPop() { var p = el('palPop'); if (p && !p.hidden) { p.hidden = true; endPreview(); } }
function togglePalPop(btn) {
  var p = el('palPop');
  if (!p) return;
  if (!p.hidden) { closePalPop(); return; }
  closeDrops();
  p.innerHTML = '<h5>' + tr('Warna tema', 'Theme color') + '</h5>' + paletteGridHtml();
  p.hidden = false;
  var r = btn.getBoundingClientRect(), w = p.offsetWidth, vw = window.innerWidth;
  var left = Math.min(Math.max(12, r.right - w), vw - w - 12);
  p.style.left = left + 'px';
  p.style.top = (r.bottom + 8) + 'px';
}
document.addEventListener('mouseover', function (e) {
  if (!window.matchMedia || !window.matchMedia('(hover:hover)').matches) return;
  var c = e.target.closest ? e.target.closest('.pal-c[data-action=pal]') : null;
  if (c) previewPalette(c.getAttribute('data-k'));
});
document.addEventListener('mouseout', function (e) {
  var g = e.target.closest ? e.target.closest('.pal-grid') : null;
  if (g && !(e.relatedTarget && g.contains(e.relatedTarget))) endPreview();
});
window.addEventListener('resize', closePalPop);

/* ============ Auth ============ */
function initAuth() {
  el('yr').textContent = String(new Date().getFullYear());
  var saved = lsGet('lh_id');
  if (saved) { el('l-user').value = saved; el('l-rem').checked = true; }
  if (lsGet('lh_theme') === 'dark') applyTheme(true);
  PAL.cur = lsGet('lh_pal') || 'blue';
  applyPalette(PAL.cur, false);
  if (PAL.cur !== 'blue' && !document.getElementById('palette-style')) PAL.cur = 'blue';
  setLang(ssGet('lh_lang') || 'id');
}
function loadSpot() {
  apiCached('apiSpotlight', [], 'spot', function (res) {
    var box = el('spot');
    if (!res.ok || !res.spot) { box.hidden = true; return; }
    box.hidden = false;
    var sp = res.spot;
    var h = '<h2>' + tr('Pakar Pilihan', 'Expert Spotlight') + '</h2>';
    h += sp.foto ? '<div class="sp-photo"><img src="' + esc(sp.foto) + '" alt="' + esc(tr('Foto ', 'Photo of ') + sp.nama) + '"></div>' : '<div class="sp-photo" aria-hidden="true">' + esc(initials(sp.nama)) + '</div>';
    h += '<span class="pill">' + tr('Pakar Bulan Ini', 'Expert of the Month') + ' &bull; ' + esc(res.month) + '</span>';
    h += '<h3>' + esc(sp.nama) + '</h3>';
    h += '<p class="sp-meta">' + esc(sp.bidang) + ' &bull; ' + nf(sp.answers) + ' ' + tr('jawaban', 'answers') + '</p>';
    h += '<div class="quote"><b>&ldquo;</b><span>' + esc(sp.bio || tr('Siap membantu Anda memahami hak dan kewajiban hukum.', 'Here to help you understand your legal rights and duties.')) + '</span></div>';
    h += '<div class="chips">';
    h += sp.n ? '<div class="chip">' + ic('star') + '<span>&#9733; ' + nf1(sp.avg) + '<br>' + nf(sp.n) + ' ' + tr('ulasan', 'reviews') + '</span></div>' : '<div class="chip">' + ic('shield') + '<span>' + tr('Pakar<br>Terverifikasi', 'Verified<br>Expert') + '</span></div>';
    h += '<div class="chip">' + ic('ask') + '<span>' + nf(sp.answers) + '<br>' + tr('Jawaban', 'Answers') + '</span></div>';
    h += '<div class="chip">' + ic('calendar') + '<span>' + nf(sp.done) + '<br>' + tr('Konsultasi', 'Consultations') + '</span></div>';
    h += '</div>';
    h += '<button class="lnk" type="button" data-action="discover">' + tr('Temukan pakar lainnya', 'Discover more experts') + ' &rarr;</button>';
    box.innerHTML = h;
  });
}
// Akun uji: klik untuk mengisi username & password, tinggal tekan Masuk
function fillDemo(btn) {
  var u = el('l-user'), p = el('l-pass');
  u.value = String(btn.getAttribute('data-u'));
  p.value = String(btn.getAttribute('data-p'));
  var all = document.querySelectorAll('.demo-acc');
  for (var i = 0; i < all.length; i++) all[i].classList.toggle('on', all[i] === btn);
  u.classList.remove('filled'); p.classList.remove('filled');
  void u.offsetWidth;
  u.classList.add('filled'); p.classList.add('filled');
  el('btn-login').focus();
}
function doLogin() {
  var id = val('l-user'), pw = String(el('l-pass').value);
  if (!id || !pw) { toast(tr('Isi email/username dan password.', 'Enter your email/username and password.'), 'err'); return; }
  busy('btn-login', true);
  api('apiLogin', [id, pw], function (res) {
    busy('btn-login', false);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    lsSet('lh_id', el('l-rem').checked ? id : null);
    startSession(res);
  }, function (m) { busy('btn-login', false); toast(m, 'err'); });
}
function doRegister() {
  var p = {
    nama: val('r-nama'), username: val('r-user'), email: val('r-email'),
    password: String(el('r-pass').value), role: String(S.regRole), bidang: val('r-bidang')
  };
  if (!p.nama || !p.username || !p.email || !p.password) { toast(tr('Lengkapi semua kolom.', 'Please fill in every field.'), 'err'); return; }
  if (p.role === 'Expert') {
    p.noIzin = val('r-izin'); p.organisasi = val('r-org'); p.pendidikan = val('r-pend'); p.pengalaman = val('r-exp');
    p.link = val('r-link'); p.ringkasan = val('r-ring'); p.setuju = el('r-agree').checked === true;
    if (!p.bidang || !p.noIzin || !p.organisasi || !p.pendidikan || p.pengalaman === '' || !p.link || !p.ringkasan) { toast(tr('Lengkapi data latar belakang pakar.', 'Please complete your expert background.'), 'err'); return; }
    if (!p.setuju) { toast(tr('Centang pernyataan kebenaran data.', 'Please confirm your information is true.'), 'err'); return; }
  }
  busy('btn-reg', true);
  api('apiRegister', [p], function (res) {
    busy('btn-reg', false);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    toast(p.role === 'Expert' ? tr('Pendaftaran terkirim. Admin akan melakukan screening latar belakang Anda. Anda bisa masuk untuk memantau statusnya.', 'Application sent. The admin will screen your background. Sign in to track its status.') : tr('Akun dibuat. Silakan masuk.', 'Account created. Please sign in.'), 'ok');
    if (p.role === 'Expert') { var ids = ['r-izin', 'r-pend', 'r-exp', 'r-link', 'r-ring']; for (var i = 0; i < ids.length; i++) el(ids[i]).value = ''; el('r-agree').checked = false; }
    el('l-user').value = p.username; el('l-pass').value = '';
    switchPane('login');
  }, function (m) { busy('btn-reg', false); toast(m, 'err'); });
}
function switchPane(t) {
  el('pane-login').hidden = t !== 'login';
  el('pane-reg').hidden = t !== 'reg';
}
function setRole(r) {
  S.regRole = r === 'Expert' ? 'Expert' : 'Client';
  el('role-Client').className = S.regRole === 'Client' ? 'on' : '';
  el('role-Expert').className = S.regRole === 'Expert' ? 'on' : '';
  el('r-expert-box').hidden = S.regRole !== 'Expert';
}
function togglePw(id) { var i = el(id); if (i) i.type = i.type === 'password' ? 'text' : 'password'; }
function startSession(res) {
  S.token = res.token; S.user = res.user; S.stats = null; S.hub = null; S.credit = null; S.hubQ = null; S.statsQ = null; S.creditBusy = false;
  S.photos = {}; S.photoReq = {};
  S.photos[res.user.username] = res.user.foto || '';
  if (res.cfg) S.cfg = res.cfg;
  ssSet('lh_t', res.token);
  lpStop();
  el('landing').hidden = true; el('auth').hidden = true; el('app').hidden = false;
  buildShell();
  go('home');
}
function doLogout() {
  if (S.token) api('apiLogout', [S.token], function () {}, function () {});
  forceLogout();
}
function forceLogout() {
  S.token = null; S.user = null; S.stats = null; S.hub = null; S.credit = null; S.hubQ = null; S.statsQ = null; S.creditBusy = false; S.photos = {}; S.photoReq = {}; ssSet('lh_t', null);
  closeDrops();
  if (S.io) { S.io.disconnect(); S.io = null; }
  closeModal();
  el('app').hidden = true; el('auth').hidden = false;
  el('l-pass').value = '';
  loadSpot();
}
function navItems() {
  var r = role();
  if (r === 'Admin') return [['home', tr('Beranda', 'Home'), 'home'], ['verify', tr('Screening Pakar', 'Expert Screening'), 'shield'], ['contracts', tr('Kontrak', 'Contracts'), 'doc'], ['copyrights', tr('Hak Cipta', 'Copyright'), 'copyright'], ['bookings', 'Booking', 'calendar'], ['recap', tr('Rekap Kreator', 'Creators'), 'users'], ['xrecap', tr('Rekap Pakar', 'Experts'), 'chart'], ['feed', 'Feed', 'feed'], ['reviews', tr('Moderasi Ulasan', 'Review Moderation'), 'star'], ['import', tr('Impor Data', 'Import Data'), 'db']];
  if (r === 'Expert') return [['home', tr('Beranda', 'Home'), 'home'], ['screening', 'Screening', 'shield'], ['feed', 'Feed', 'feed'], ['ask', tr('Tanya Pakar', 'Q&A'), 'ask'], ['bookings', 'Booking', 'calendar'], ['earnings', tr('Pendapatan', 'Earnings'), 'wallet'], ['myreviews', tr('Ulasan Saya', 'My Reviews'), 'star']];
  return [['home', tr('Beranda', 'Home'), 'home'], ['feed', 'Feed', 'feed'], ['ask', tr('Tanya Pakar', 'Q&A'), 'ask'], ['experts', tr('Pakar', 'Experts'), 'experts'], ['bookings', 'Booking', 'calendar'], ['contracts', tr('Kontrak', 'Contracts'), 'doc'], ['copyrights', tr('Hak Cipta', 'Copyright'), 'copyright'], ['taxes', tr('Pajak', 'Tax'), 'coin']];
}
// Navigasi atas: maksimal 5 menu utama, sisanya masuk panel "Lainnya"
var NAV_MAX = 5;
function buildShell() {
  var items = navItems();
  var prim = items.length <= 6 ? items : items.slice(0, NAV_MAX);
  var more = items.length <= 6 ? [] : items.slice(NAV_MAX);
  S.moreViews = [];
  var h = '';
  for (var i = 0; i < prim.length; i++) {
    h += '<button class="nav-btn" data-action="nav" data-view="' + prim[i][0] + '" title="' + esc(prim[i][1]) + '">' + ic(prim[i][2]) + '<span class="lbl">' + esc(prim[i][1]) + '</span></button>';
  }
  if (more.length) {
    h += '<div class="nav-more"><button class="nav-btn" id="btn-more" data-action="more-menu" aria-haspopup="true" title="' + tr('Lainnya', 'More') + '">' + ic('grid') + '<span class="lbl">' + tr('Lainnya', 'More') + ' &#9662;</span></button>';
    h += '<div class="more-dd" id="moreDd"><h5>' + tr('Alat lainnya', 'More tools') + '</h5><div class="more-grid">';
    for (var k = 0; k < more.length; k++) {
      S.moreViews.push(more[k][0]);
      h += '<button class="more-item" data-action="nav" data-view="' + more[k][0] + '">' + ic(more[k][2]) + '<span>' + esc(more[k][1]) + '</span></button>';
    }
    h += '</div></div></div>';
  }
  el('nav').innerHTML = h;
  var r = role();
  el('g-search').placeholder = r === 'Admin' ? tr('Cari kontrak, kreator, ID...', 'Search contracts, creators, IDs...') : (r === 'Expert' ? tr('Cari pertanyaan atau topik...', 'Search questions or topics...') : tr('Cari pakar atau bidang hukum...', 'Search experts or legal areas...'));
  el('g-search').setAttribute('aria-label', tr('Pencarian', 'Search'));
  el('lbl-notif').textContent = tr('Notifikasi', 'Notifications');
  el('lbl-notif-h').textContent = tr('Notifikasi', 'Notifications');
  el('lbl-notif-read').textContent = tr('Tandai dibaca', 'Mark all read');
  el('btn-notif').setAttribute('aria-label', tr('Notifikasi', 'Notifications'));
  el('lbl-me').textContent = tr('Saya', 'Me');
  renderMeMenu();
  renderLeft();
  renderRight();
  paintMe();
  refreshSide();
}
function roleLabel() {
  var r = role();
  return r === 'Admin' ? tr('Admin / Tim Legal', 'Admin / Legal team') : (r === 'Expert' ? tr('Pakar hukum', 'Legal expert') : tr('Kreator / Client', 'Creator / Client'));
}
function roleLine() {
  var u = S.user, s = roleLabel();
  if (u.role === 'Expert' && u.bidang) s += ' • ' + u.bidang;
  return s;
}
function paintMe() {
  var u = S.user;
  if (!u) return;
  var f = S.photos[u.username];
  var inner = f ? '<img src="' + esc(f) + '" alt="">' : esc(initials(u.nama || u.username));
  var ids = ['av', 'av-l', 'av-me'];
  for (var i = 0; i < ids.length; i++) { var n = el(ids[i]); if (n) n.innerHTML = inner; }
  if (el('who-n')) el('who-n').innerHTML = esc(u.nama || u.username) + (isVerifiedExpert() ? verMark('1') : '');
  if (el('who-r')) el('who-r').textContent = roleLine();
}
function closeDrops() {
  var ids = ['clhDropdown', 'meDd', 'moreDd'];
  for (var i = 0; i < ids.length; i++) { var d = el(ids[i]); if (d) d.classList.remove('show'); }
  closePalPop();
}
function toggleDrop(id) {
  var d = el(id);
  if (!d) return;
  var on = !d.classList.contains('show');
  closeDrops();
  d.classList.toggle('show', on);
}

/* ----- Menu "Saya" ----- */
function renderMeMenu() {
  var u = S.user;
  var h = '<div class="me-head"><span class="avatar" id="av-me"></span><div style="min-width:0"><b>' + esc(u.nama || u.username) + (isVerifiedExpert() ? verMark('1') : '') + '</b><small>' + esc(roleLine()) + '</small></div></div>';
  h += '<button class="btn ghost sm block" data-action="nav" data-view="profile">' + tr('Lihat profil', 'View profile') + '</button>';
  h += '<div class="me-sec"><h5>' + tr('Akun', 'Account') + '</h5>';
  h += '<button class="me-item" data-action="lamp"><span>' + tr('Mode gelap', 'Dark mode') + '</span><span class="sw" aria-hidden="true"></span></button>';
  h += '<button class="me-item" data-action="lang" data-l="' + (S.lang === 'id' ? 'en' : 'id') + '"><span>' + tr('Bahasa', 'Language') + '</span><span class="lang-mini"><b class="' + (S.lang === 'id' ? 'on' : '') + '">ID</b><b class="' + (S.lang === 'en' ? 'on' : '') + '">EN</b></span></button>';
  h += '</div><div class="me-sec"><h5>' + tr('Warna tema', 'Theme color') + '</h5><div class="me-pal">' + paletteGridHtml() + '</div>';
  if (u.role === 'Client') h += '<button class="me-item" data-action="topup"><span>' + tr('Top-up & langganan', 'Top up & subscribe') + '</span>' + ic('bolt') + '</button>';
  h += '</div><div class="me-sec"><button class="me-item" data-action="logout"><span>' + tr('Keluar', 'Sign out') + '</span>' + ic('logout') + '</button></div>';
  el('meDd').innerHTML = h;
}

/* ----- Kolom kiri: kartu profil + pintasan ----- */
function renderLeft() {
  var h = '<div class="card pcard"><div class="pc-cover"></div>';
  h += '<button class="pc-av" data-action="nav" data-view="profile" aria-label="' + tr('Profil saya', 'My profile') + '"><span class="avatar" id="av-l"></span></button>';
  h += '<div class="pc-body"><button class="pc-name" id="who-n" data-action="nav" data-view="profile"></button><p class="pc-role" id="who-r"></p></div>';
  h += '<div class="pc-stats" id="pc-stats"></div>';
  h += '<button class="pc-foot" data-action="nav" data-view="profile">' + ic('user') + '<span>' + tr('Lihat profil saya', 'View my profile') + '</span></button></div>';
  var items = navItems();
  h += '<div class="card scard"><h4>' + tr('Pintasan', 'Shortcuts') + '</h4>';
  for (var i = 1; i < items.length; i++) h += '<button class="sc-item" data-action="nav" data-view="' + items[i][0] + '">' + ic(items[i][2]) + '<span>' + esc(items[i][1]) + '</span></button>';
  h += '</div>';
  el('col-left').innerHTML = h;
  paintLeftStats();
}
function paintLeftStats() {
  var box = el('pc-stats');
  if (!box || !S.user) return;
  var r = role(), hub = S.hub || {}, st = S.stats, c = S.credit, rows = [];
  var v = function (x, suf) { return x == null ? '-' : nf(x) + (suf || ''); };
  if (r === 'Client') {
    rows.push(['topup', '', tr('Saldo poin', 'Points'), c ? v(c.poin) : '-']);
    rows.push(['topup', '', tr('Kuota bulanan', 'Monthly quota'), c ? v(c.quota, 'x') : '-']);
    rows.push(['nav', 'bookings', tr('Booking menunggu', 'Pending bookings'), v(hub.pending)]);
  } else if (r === 'Expert') {
    rows.push(['nav', 'myreviews', tr('Rating', 'Rating'), hub.reviews ? '&#9733; ' + nf1(hub.rating) + ' (' + nf(hub.reviews) + ')' : (hub.reviews === 0 ? tr('Belum ada', 'None yet') : '-')]);
    rows.push(['nav', 'ask', tr('Jawaban', 'Answers'), v(hub.answers)]);
    rows.push(['nav', 'feed', tr('Postingan', 'Posts'), v(hub.posts)]);
    rows.push(['nav', 'bookings', tr('Konsultasi selesai', 'Completed sessions'), v(hub.done)]);
  } else {
    rows.push(['nav', 'verify', tr('Menunggu screening', 'Awaiting screening'), v(hub.pendingVerif)]);
    rows.push(['nav', 'contracts', tr('Kontrak menunggu', 'Contracts pending'), st ? v(st.contracts.pending) : '-']);
    rows.push(['nav', 'xrecap', tr('Pakar terverifikasi', 'Verified experts'), v(hub.experts)]);
  }
  var h = '';
  for (var i = 0; i < rows.length; i++) h += '<button class="pc-row" data-action="' + rows[i][0] + '" data-view="' + rows[i][1] + '"><span>' + esc(rows[i][2]) + '</span><b>' + rows[i][3] + '</b></button>';
  box.innerHTML = h;
}
// Isi kolom kiri & notifikasi dari data server (satu kali per sesi, dipakai bersama halaman Beranda)
function refreshSide() {
  var r = role();
  if (r === 'Client') renderCreditWidget();
  fetchHub(function (hub) {
    paintLeftStats();
    if (r === 'Expert') { buildNotif(null, hub); return; }
    fetchStats(function (st) { paintLeftStats(); buildNotif(st, hub); });
  });
}

/* ----- Kolom kanan: Pakar Pilihan + rekomendasi sesuai peran ----- */
function renderRight() {
  var r = role();
  var t = r === 'Client' ? tr('Pakar untuk Anda', 'Experts for you') : (r === 'Expert' ? tr('Pertanyaan menunggu jawaban', 'Questions awaiting answers') : tr('Menunggu screening', 'Awaiting screening'));
  var v = r === 'Client' ? 'experts' : (r === 'Expert' ? 'ask' : 'verify');
  var sk = '<div class="skel" style="min-height:56px;margin:0 16px 8px"></div>';
  var h = '<div class="card rcard"><h4><span>' + tr('Pakar Pilihan', 'Expert Spotlight') + '</span>' + ic('star') + '</h4><div id="r-spot">' + sk + '</div></div>';
  h += '<div class="card rcard"><h4><span>' + esc(t) + '</span></h4><div id="r-list">' + sk + sk + '</div><button class="more-link" data-action="nav" data-view="' + v + '">' + tr('Lihat semua', 'See all') + ' ' + ic('arrow') + '</button></div>';
  h += '<div class="rfoot"><span>' + tr('Privasi', 'Privacy') + '</span> &middot; <span>' + tr('Ketentuan', 'Terms') + '</span> &middot; ' + tr('Bahasa', 'Language') + ': <button data-action="lang" data-l="id" class="' + (S.lang === 'id' ? 'on' : '') + '">ID</button><button data-action="lang" data-l="en" class="' + (S.lang === 'en' ? 'on' : '') + '">EN</button>';
  h += '<div class="brandline"><svg aria-hidden="true"><use href="#logo"/></svg><span>Legal Hub &copy; ' + new Date().getFullYear() + '</span></div></div>';
  el('col-right').innerHTML = h;
  loadRight();
}
function loadRight() {
  var r = role();
  api('apiSpotlight', [], function (res) {
    var box = el('r-spot');
    if (!box) return;
    if (!res.ok || !res.spot) { box.innerHTML = '<p class="r-empty">' + tr('Belum ada pakar pilihan bulan ini.', 'No spotlight this month yet.') + '</p>'; return; }
    var sp = res.spot;
    if (sp.foto != null && sp.username) S.photos[sp.username] = sp.foto;
    var x = '<div class="' + (r === 'Client' ? 'item rx' : 'rx') + '" data-user="' + esc(sp.username) + '" data-nama="' + esc(sp.nama) + '">' + avatar(sp.username, sp.nama, 'lg') + '<div class="grow"><b><button class="nm-link" data-action="expert-open" data-user="' + esc(sp.username) + '">' + esc(sp.nama) + '</button>' + verMark('1') + '</b>';
    x += '<small>' + esc(sp.bidang) + ' &bull; ' + nf(sp.answers) + ' ' + tr('jawaban', 'answers') + ' &bull; ' + nf(sp.done) + ' ' + tr('konsultasi', 'sessions') + '</small>';
    if (sp.n) x += '<small class="rx-rate">&#9733; ' + nf1(sp.avg) + ' (' + nf(sp.n) + ' ' + tr('ulasan', 'reviews') + ')</small>';
    x += '<small>' + tr('Pakar Bulan Ini', 'Expert of the Month') + ' &bull; ' + esc(res.month) + '</small>';
    if (r === 'Client') x += '<button class="btn ghost sm" data-action="book">+ Booking</button>';
    box.innerHTML = x + '</div></div>';
  }, function () {});
  var o = { offset: 0, limit: 3, q: '', f: '', status: '' };
  var fill = function (h) { var box = el('r-list'); if (!box) return; box.innerHTML = h || '<p class="r-empty">' + tr('Belum ada data.', 'Nothing here yet.') + '</p>'; ensurePhotos(box); };
  var fail = function () { fill(''); };
  if (r === 'Client') {
    api('apiExperts', [S.token, o], function (res) {
      if (!res.ok) { fill(''); return; }
      var h = '';
      for (var i = 0; i < res.rows.length; i++) {
        var e = res.rows[i];
        h += '<div class="item rx" data-user="' + esc(e[0]) + '" data-nama="' + esc(e[1]) + '">' + avatar(e[0], e[1], 'lg') + '<div class="grow"><b><button class="nm-link" data-action="expert-open" data-user="' + esc(e[0]) + '">' + esc(e[1]) + '</button>' + verMark('1') + '</b><small>' + esc(e[2]) + '</small><small class="rx-rate">' + (Number(e[7]) ? '&#9733; ' + nf1(e[6]) + ' (' + nf(e[7]) + ' ' + tr('ulasan', 'reviews') + ')' : tr('Belum ada ulasan', 'No reviews yet')) + '</small><button class="btn ghost sm" data-action="book">+ Booking</button></div></div>';
      }
      fill(h);
    }, fail);
  } else if (r === 'Expert') {
    o.f = 'Terbuka'; o.status = 'Terbuka';
    api('apiQuestions', [S.token, o], function (res) {
      if (!res.ok) { fill(''); return; }
      var h = '';
      for (var i = 0; i < res.rows.length; i++) {
        var q = res.rows[i];
        h += '<div class="rx rx-q" data-action="nav" data-view="ask" tabindex="0"><div class="grow"><span class="tagc">' + esc(q[3]) + '</span><p>' + esc(shortTxt(q[4], 90)) + '</p><small>' + esc(q[7]) + ' &bull; ' + esc(fmtDate(q[1])) + '</small></div></div>';
      }
      fill(h);
    }, fail);
  } else {
    o.f = 'Menunggu'; o.status = 'Menunggu';
    api('apiScreenings', [S.token, o], function (res) {
      if (!res.ok) { fill(''); return; }
      var h = '';
      for (var i = 0; i < res.rows.length; i++) {
        var s = res.rows[i], key = s[0] + '|' + s[1];
        S.scr[key] = s;
        h += '<div class="rx">' + avatar(s[2], s[3], 'lg') + '<div class="grow"><b>' + esc(s[3]) + '</b><small>' + esc(s[4]) + ' &bull; ' + esc(s[6]) + '</small><button class="btn ghost sm" data-action="review" data-key="' + esc(key) + '">' + tr('Tinjau', 'Review') + '</button></div></div>';
      }
      fill(h);
    }, fail);
  }
}

/* ============ Router ============ */
var VIEWS = {};
// Tampilan sosial memakai 3 kolom; alat & tabel memakai kolom kiri + area lebar
var VIEW_LAYOUT = { home: 'three', feed: 'three', ask: 'three', experts: 'three', screening: 'three', expert: 'three', myreviews: 'three' };
function go(view) {
  if (!VIEWS[view]) view = 'home';
  S.view = view;
  if (S.io) { S.io.disconnect(); S.io = null; }
  closeDrops();
  if (el('layout')) el('layout').className = 'layout ' + (VIEW_LAYOUT[view] || 'wide');
  var btns = document.querySelectorAll('.nav-btn[data-view], .sc-item, .more-item');
  var navView = view === 'expert' ? (role() === 'Expert' && S.exp === S.user.username ? 'myreviews' : 'experts') : view;
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('on', btns[i].getAttribute('data-view') === navView);
  if (el('btn-more')) el('btn-more').classList.toggle('on', S.moreViews.indexOf(navView) >= 0);
  window.scrollTo(0, 0);
  VIEWS[view]();
}
function head(eyebrow, title, sub) {
  return '<div class="page-head"><p class="eyebrow">' + esc(eyebrow) + '</p><h1>' + esc(title) + '</h1><p class="sub">' + esc(sub) + '</p></div>';
}
function statCard(label, value, sub, tone) {
  return '<div class="stat" style="--tone:' + (tone || 'var(--brand)') + '"><small>' + esc(label) + '</small><b>' + value + '</b><span>' + esc(sub) + '</span></div>';
}
function qa(icon, t, s, view) {
  return '<button class="qa" data-action="nav" data-view="' + view + '">' + ic(icon) + '<div><b>' + esc(t) + '</b><span>' + esc(s) + '</span></div></button>';
}
// Permintaan yang sama digabung: beberapa pemanggil menunggu satu respons server
function fetchStats(cb) {
  if (S.stats) { cb(S.stats); return; }
  if (S.statsQ) { S.statsQ.push(cb); return; }
  S.statsQ = [cb];
  api('apiStats', [S.token], function (res) {
    var q = S.statsQ || []; S.statsQ = null;
    if (!res.ok) { toast(res.msg, 'err'); return; }
    S.stats = res.stats;
    for (var i = 0; i < q.length; i++) q[i](S.stats);
  }, function (m) { S.statsQ = null; toast(m, 'err'); });
}
function fetchHub(cb) {
  if (S.hub) { cb(S.hub); return; }
  if (S.hubQ) { S.hubQ.push(cb); return; }
  S.hubQ = [cb];
  api('apiHubStats', [S.token], function (res) {
    var q = S.hubQ || []; S.hubQ = null;
    if (!res.ok) { toast(res.msg, 'err'); return; }
    S.hub = res.stats;
    for (var i = 0; i < q.length; i++) q[i](S.hub);
  }, function (m) { S.hubQ = null; toast(m, 'err'); });
}
function resetStats() { S.stats = null; S.hub = null; }

/* ============ Pencarian global & notifikasi (di navigasi atas) ============ */
function globalSearch(q) {
  if (!q) return;
  S.pendingQ = q;
  var r = role();
  go(r === 'Admin' ? 'contracts' : (r === 'Expert' ? 'ask' : 'experts'));
}
// Notifikasi dibangun dari data nyata (statistik server), bukan data dummy
function buildNotif(st, hub) {
  var r = role(), items = [];
  if (r === 'Client') {
    if (hub.pending) items.push([nf(hub.pending) + ' ' + tr('booking menunggu konfirmasi pakar', 'bookings awaiting expert confirmation'), 'bookings']);
    if (hub.open) items.push([nf(hub.open) + ' ' + tr('pertanyaan Anda belum terjawab', 'of your questions are unanswered'), 'ask']);
    if (st && st.contracts.pending) items.push([nf(st.contracts.pending) + ' ' + tr('kontrak menunggu verifikasi', 'contracts pending review'), 'contracts']);
    if (st && st.copyrights.open) items.push([nf(st.copyrights.open) + ' ' + tr('kasus hak cipta masih berjalan', 'copyright cases in progress'), 'copyrights']);
    if (hub.toReview) items.push([nf(hub.toReview) + ' ' + tr('konsultasi selesai menunggu ulasan Anda', 'completed consultations awaiting your review'), 'bookings']);
    if (S.credit && S.credit.quota <= 0 && S.credit.poin < S.cfg.cost.contract) items.push([tr('Kredit Anda hampir habis. Lakukan top-up.', 'Your credit is running low. Top up now.'), 'home']);
  } else if (r === 'Expert') {
    if (!isVerifiedExpert()) items.push([tr('Pendaftaran Anda sedang dalam proses screening admin', 'Your application is being screened by the admin'), 'screening']);
    if (hub.incoming) items.push([nf(hub.incoming) + ' ' + tr('permintaan konsultasi baru', 'new consultation requests'), 'bookings']);
    if (hub.unreplied) items.push([nf(hub.unreplied) + ' ' + tr('ulasan belum Anda balas', 'reviews awaiting your reply'), 'myreviews']);
  } else {
    if (hub.pendingVerif) items.push([nf(hub.pendingVerif) + ' ' + tr('pendaftar pakar menunggu screening', 'expert applicants awaiting screening'), 'verify']);
    if (st && st.contracts.pending) items.push([nf(st.contracts.pending) + ' ' + tr('kontrak menunggu verifikasi', 'contracts pending review'), 'contracts']);
    if (st && st.copyrights.open) items.push([nf(st.copyrights.open) + ' ' + tr('kasus hak cipta aktif', 'active copyright cases'), 'copyrights']);
    if (hub.pending) items.push([nf(hub.pending) + ' ' + tr('booking menunggu', 'bookings pending'), 'bookings']);
    if (hub.reviewsFlag) items.push([nf(hub.reviewsFlag) + ' ' + tr('ulasan bintang rendah perlu ditinjau', 'low-star reviews need review'), 'reviews']);
  }
  var list = el('clhList'), b = el('clhBadge');
  if (!list) return;
  var h = '';
  for (var i = 0; i < items.length; i++) h += '<li class="clh-notif-item unread" data-action="nav" data-view="' + items[i][1] + '" tabindex="0">' + esc(items[i][0]) + '</li>';
  list.innerHTML = h || '<li class="clh-notif-empty">' + tr('Tidak ada notifikasi baru.', 'No new notifications.') + '</li>';
  b.textContent = String(items.length);
  b.hidden = items.length === 0 || ssGet('lh_notif_read') === String(items.length);
}
function toggleNotif() { toggleDrop('clhDropdown'); }
function markNotifRead() {
  var it = document.querySelectorAll('.clh-notif-item.unread');
  for (var i = 0; i < it.length; i++) it[i].classList.remove('unread');
  var b = el('clhBadge');
  if (b) { ssSet('lh_notif_read', b.textContent); b.hidden = true; }
}

/* ============ Kredit & top-up ============ */
function renderCreditWidget() {
  if (S.credit) paintCredit();
  if (S.creditBusy) return;
  S.creditBusy = true;
  api('apiGetCredit', [S.token], function (res) {
    S.creditBusy = false;
    if (!res.ok) return;
    S.credit = { poin: res.poin, quota: res.quota, plan: res.plan };
    paintCredit();
  }, function () { S.creditBusy = false; });
}
function paintCredit() {
  paintLeftStats();
  var w = el('credit-widget-box');
  if (!w || !S.credit) return;
  var c = S.credit;
  w.innerHTML = '<div class="credit-widget">' +
    '<div class="credit-box">' +
      '<div class="credit-item"><small>' + tr('Saldo Poin', 'Points') + '</small><b>' + ic('bolt') + nf(c.poin) + ' Pts</b></div>' +
      '<div class="credit-item q"><small>' + tr('Kuota Bulanan', 'Monthly quota') + '</small><b>' + ic('refresh') + nf(c.quota) + 'x ' + tr('aksi', 'actions') + '</b></div>' +
      '<div class="credit-item p"><small>' + tr('Paket', 'Plan') + '</small><b>' + ic('star') + esc(c.plan) + '</b></div>' +
    '</div>' +
    '<button class="btn sm" data-action="topup">+ ' + tr('Top-Up / Langganan', 'Top up / Subscribe') + '</button>' +
  '</div>';
}
function applyCreditInfo(ci) {
  if (!ci) return;
  S.credit = { poin: ci.remainingPoin, quota: ci.remainingQuota, plan: ci.plan };
  paintCredit();
}
function openTopUp() {
  var t = S.cfg.topup;
  var h = '<h3>' + tr('Top-Up & Langganan', 'Top up & Subscribe') + '</h3><p class="muted sm">' + tr('Pilih paket untuk menambah kredit Anda.', 'Choose a package to add credit.') + '</p>';
  h += '<div class="plans">';
  h += '<button class="plan" data-action="do-topup" data-type="poin"><div><b>' + esc(t.poin.label) + '</b><span>' + tr('Poin dipakai saat kuota bulanan habis', 'Points are used once the monthly quota runs out') + '</span></div><strong>' + rp(t.poin.price) + '</strong></button>';
  h += '<button class="plan" data-action="do-topup" data-type="subs"><div><b>' + esc(t.subs.label) + '</b><span>' + tr('Kuota bulanan menjadi ', 'Monthly quota becomes ') + nf(t.subs.quota) + 'x ' + tr('aksi', 'actions') + '</span></div><strong>' + rp(t.subs.price) + tr('/bln', '/mo') + '</strong></button>';
  h += '</div><p class="muted sm" style="margin-bottom:14px">' + tr('Pembayaran disimulasikan pada versi prototipe ini.', 'Payment is simulated in this prototype.') + '</p>';
  h += '<button class="btn ghost block" data-action="close-x">' + tr('Tutup', 'Close') + '</button>';
  openModal(h);
}
function doTopUp(btn) {
  var type = String(btn.getAttribute('data-type'));
  busyEl(btn, true);
  api('apiTopUp', [S.token, type], function (res) {
    busyEl(btn, false);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    S.credit = { poin: res.poin, quota: res.quota, plan: res.plan };
    paintCredit();
    closeModal();
    toast(type === 'poin' ? tr('Top-up poin berhasil!', 'Points topped up!') : tr('Langganan Pro Monthly aktif!', 'Pro Monthly is now active!'), 'ok');
  }, function (m) { busyEl(btn, false); toast(m, 'err'); });
}
function costHint() {
  var c = S.cfg.cost;
  return '<p class="cost">' + tr('Biaya: 1 kuota bulanan, atau ', 'Cost: 1 monthly quota, or ') + nf(c.contract) + tr(' poin bila kuota habis.', ' points once the quota runs out.') + '</p>';
}
// Bila server menolak karena kredit habis, langsung tawarkan top-up
function maybeTopUp(msg) { if (/Top-Up/i.test(String(msg))) setTimeout(openTopUp, 400); }

/* ============ List engine: server-side pagination + infinite scroll + filter backend ============ */
var LC = {
  contracts: { fn: 'apiList', tag: 'tbody', args: function (o) { return [S.token, 'contracts', o]; }, render: function (r, p) { return legacyRow('contracts', r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  copyrights: { fn: 'apiList', tag: 'tbody', args: function (o) { return [S.token, 'copyrights', o]; }, render: function (r, p) { return legacyRow('copyrights', r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  taxes: { fn: 'apiList', tag: 'tbody', args: function (o) { return [S.token, 'taxes', o]; }, render: function (r, p) { return legacyRow('taxes', r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  recap: { fn: 'apiRecap', tag: 'tbody', render: function (r) { return legacyRow('recap', r, false); }, key: function (r) { return r[0]; } },
  feed: { fn: 'apiFeed', tag: 'div', render: function (r, p) { return postHtml(r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  ask: { fn: 'apiQuestions', tag: 'div', render: function (r, p) { return questionHtml(r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  experts: { fn: 'apiExperts', tag: 'div', render: function (r) { return expertHtml(r); }, key: function (r) { return r[0]; } },
  bookings: { fn: 'apiBookings', tag: 'tbody', render: function (r, p) { return bookingRow(r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  earnings: { fn: 'apiEarnings', tag: 'tbody', render: function (r) { return earningRow(r); }, key: function (r) { return r[0] + '|' + r[1]; } },
  reviews: { fn: 'apiReviews', tag: 'div', args: function (o) { o.expert = String(S.exp || ''); return [S.token, o]; }, render: function (r, p) { return reviewHtml(r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  verify: { fn: 'apiScreenings', tag: 'div', render: function (r, p) { return screeningCard(r, p); }, key: function (r) { return r[0] + '|' + r[1]; } },
  xrecap: { fn: 'apiExpertRecap', tag: 'tbody', render: function (r) { return xrecapRow(r); }, key: function (r) { return r[0]; } }
};
// o: { title, heads, filter, filterLabel, filterIsStatus }
function listShell(key, o) {
  var q0 = S.pendingQ || '';
  L[key] = { offset: 0, hasMore: true, loading: false, q: q0, f: '', keys: {}, total: 0, rid: 0, timer: null };
  var tools = '<div class="tools"><input class="inp" type="search" data-live="search" data-key="' + key + '" value="' + esc(q0) + '" placeholder="' + tr('Cari...', 'Search...') + '" aria-label="' + tr('Cari', 'Search') + '">';
  if (o.filter || o.filterHtml) tools += '<select class="sel" data-live="filter" data-key="' + key + '" id="flt-' + key + '" aria-label="Filter"><option value="">' + esc(o.filterLabel) + '</option>' + (o.filterHtml || opts(o.filter, '', o.filterIsStatus)) + '</select>';
  tools += '</div>';
  var cnt = '<p class="muted sm" id="cnt-' + key + '">' + tr('Memuat...', 'Loading...') + '</p>';
  var foot = '<div class="empty" id="em-' + key + '" hidden><b>' + tr('Belum ada data', 'No data yet') + '</b>' + tr('Data yang cocok akan muncul di sini.', 'Matching records will appear here.') + '</div>';
  foot += '<div class="loader" id="ld-' + key + '" hidden><span class="spin"></span> ' + tr('Memuat data...', 'Loading data...') + '</div>';
  foot += '<div class="sentinel" id="sn-' + key + '"></div>';
  foot += '<button class="btn ghost sm more" id="more-' + key + '" data-action="more" data-key="' + key + '" hidden>' + tr('Muat lebih banyak', 'Load more') + '</button>';
  if (LC[key].tag === 'tbody') {
    var th = '';
    for (var i = 0; i < o.heads.length; i++) th += '<th>' + esc(o.heads[i]) + '</th>';
    return '<div class="card"><div class="card-top"><div><h3>' + esc(o.title) + '</h3>' + cnt + '</div>' + tools + '</div>' +
      '<div class="tbl-wrap"><table class="tbl" data-key="' + key + '"><thead><tr>' + th + '</tr></thead><tbody id="box-' + key + '"></tbody></table></div>' + foot + '</div>';
  }
  return '<div class="list-tools">' + tools + '</div><div style="margin-bottom:10px">' + cnt + '</div><div class="list" id="box-' + key + '"></div>' + foot;
}
function refreshMeta(key) {
  var st = L[key];
  if (!st || !el('cnt-' + key)) return;
  el('cnt-' + key).textContent = nf(st.total) + ' ' + tr('data', 'records') + ((st.q || st.f) ? ' ' + tr('(terfilter)', '(filtered)') : '');
  el('em-' + key).hidden = !(st.total <= 0 && !st.loading);
  el('ld-' + key).hidden = !st.loading;
  el('more-' + key).hidden = !(st.hasMore && !st.loading && st.total > 0);
}
function initList(key) {
  S.pendingQ = '';
  loadMore(key, true);
  if (S.io) { S.io.disconnect(); S.io = null; }
  var sn = el('sn-' + key);
  if (!sn || !('IntersectionObserver' in window)) return;
  S.io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) loadMore(key, false);
  }, { rootMargin: '260px' });
  S.io.observe(sn);
}
function loadMore(key, reset) {
  var st = L[key], cfg = LC[key];
  if (!st || !el('box-' + key)) return;
  if (reset) {
    st.offset = 0; st.hasMore = true; st.keys = {}; st.total = 0; st.loading = false;
    el('box-' + key).innerHTML = '';
  }
  if (st.loading || !st.hasMore) return;
  st.loading = true;
  var rid = ++st.rid;
  refreshMeta(key);
  var o = { offset: st.offset, limit: PAGE, q: st.q, f: st.f, status: st.f };
  var args = cfg.args ? cfg.args(o) : [S.token, o];
  api(cfg.fn, args, function (res) {
    if (rid !== st.rid || !el('box-' + key)) return;
    st.loading = false;
    if (!res.ok) { refreshMeta(key); toast(res.msg || tr('Gagal memuat data.', 'Failed to load data.'), 'err'); return; }
    var html = '';
    for (var i = 0; i < res.rows.length; i++) {
      var k = cfg.key(res.rows[i]);
      if (st.keys[k]) continue; // hindari duplikat akibat baris optimistik
      st.keys[k] = 1;
      html += cfg.render(res.rows[i], false);
    }
    el('box-' + key).insertAdjacentHTML('beforeend', html);
    ensurePhotos(el('box-' + key));
    st.offset = res.nextOffset; st.hasMore = res.hasMore; st.total = res.total;
    refreshMeta(key);
    if (S.io && el('sn-' + key)) { S.io.unobserve(el('sn-' + key)); S.io.observe(el('sn-' + key)); }
  }, function (m) {
    if (rid !== st.rid) return;
    st.loading = false; refreshMeta(key); toast(m, 'err');
  });
}
function prependRow(key, html) {
  var box = el('box-' + key);
  if (!box) return null;
  var node = LC[key].tag === 'tbody' ? htmlToRow(html) : htmlToNode(html);
  box.insertBefore(node, box.firstChild);
  L[key].total++; refreshMeta(key);
  return node;
}

/* ============ Renderer: alat legal (kontrak, hak cipta, pajak, rekap kreator) ============ */
function legacyHeads(key) {
  var a = isAdmin();
  if (key === 'contracts') return ['ID', tr('Tanggal', 'Date')].concat(a ? [tr('Kreator', 'Creator')] : [], ['Brand', tr('Nilai Kontrak', 'Contract value'), 'Status']);
  if (key === 'copyrights') return ['ID', tr('Tanggal', 'Date')].concat(a ? [tr('Kreator', 'Creator')] : [], [tr('Link Pelanggar', 'Infringing link'), tr('Deskripsi', 'Description'), 'Status']);
  if (key === 'taxes') return ['ID', tr('Tanggal', 'Date'), tr('Sumber', 'Source'), tr('Jumlah', 'Amount'), tr('Estimasi Pajak', 'Est. tax')];
  return [tr('Kreator', 'Creator'), tr('Kontrak', 'Contracts'), tr('Nilai Terverifikasi', 'Verified value'), tr('Kasus HC', 'Copyright cases'), tr('Belum Selesai', 'Open'), tr('Pendapatan', 'Revenue'), tr('Est. Pajak', 'Est. tax')];
}
function statusSelect(key, cur) {
  return '<select class="status-sel ' + toneOf(cur) + '" data-action="status" data-prev="' + esc(cur) + '" aria-label="Status">' + opts(STATUS[key], cur, true) + '</select>';
}
function legacyRow(key, r, pending) {
  var a = isAdmin();
  var h = '<tr class="' + (pending ? 'is-pending' : '') + '" data-id="' + esc(r[0]) + '" data-tgl="' + esc(r[1]) + '">';
  if (key === 'contracts') {
    h += '<td class="mono">' + esc(r[0]) + '</td><td class="num">' + esc(fmtDate(r[1])) + '</td>';
    if (a) h += '<td>' + esc(r[2]) + '</td>';
    h += '<td class="strong">' + esc(r[3]) + '</td><td class="num">' + rp(r[4]) + '</td>';
    h += '<td>' + (a && !pending ? statusSelect(key, r[5]) : badge(r[5])) + '</td>';
  } else if (key === 'copyrights') {
    h += '<td class="mono">' + esc(r[0]) + '</td><td class="num">' + esc(fmtDate(r[1])) + '</td>';
    if (a) h += '<td>' + esc(r[2]) + '</td>';
    h += '<td><a class="lnk" href="' + esc(r[3]) + '" target="_blank" rel="noopener noreferrer">' + esc(shortTxt(r[3], 38)) + '</a></td>';
    h += '<td class="desc">' + esc(shortTxt(r[4], 110)) + '</td>';
    h += '<td>' + (a && !pending ? statusSelect(key, r[5]) : badge(r[5])) + '</td>';
  } else if (key === 'taxes') {
    h += '<td class="mono">' + esc(r[0]) + '</td><td class="num">' + esc(fmtDate(r[1])) + '</td>';
    h += '<td class="strong">' + esc(r[3]) + '</td><td class="num">' + esc(r[4]) + ' ' + nf(r[5]) + '</td><td class="num">' + rp(r[6]) + '</td>';
  } else {
    h += '<td class="strong">' + esc(r[0]) + '</td><td class="num">' + nf(r[1]) + '</td><td class="num">' + rp(r[2]) + '</td>';
    h += '<td class="num">' + nf(r[3]) + '</td><td class="num">' + nf(r[4]) + '</td><td class="num">' + rp(r[5]) + '</td><td class="num">' + rp(r[6]) + '</td>';
  }
  return h + '</tr>';
}

/* ============ Renderer: sosial Legal Hub ============ */
function postHtml(r, pending) {
  // r: [id, tgl, author, kategori, isi, suka, liked, nama, bidang, verified]
  var h = '<article class="item' + (pending ? ' is-pending' : '') + '" data-id="' + esc(r[0]) + '" data-tgl="' + esc(r[1]) + '">';
  h += '<div class="ihead">' + avatar(r[2], r[7], 'lg') + '<div class="meta"><b>' + (r[9] === '1' ? '<button class="nm-link" data-action="expert-open" data-user="' + esc(r[2]) + '">' + esc(r[7]) + '</button>' : esc(r[7])) + verMark(r[9]) + '</b><small>' + esc(r[8]) + ' &bull; ' + esc(fmtDate(r[1])) + '</small></div></div>';
  h += '<span class="tagc">' + esc(r[3]) + '</span><p class="itext">' + escBr(r[4]) + '</p>';
  h += '<div class="ifoot act-row"><button class="act' + (r[6] === '1' ? ' liked' : '') + '" data-action="like" aria-label="' + tr('Suka', 'Like') + '">' + ic('heart') + '<span>' + tr('Suka', 'Like') + '</span><span class="cnt">' + nf(r[5]) + '</span></button>';
  h += '<button class="act" data-action="share-post" aria-label="' + tr('Bagikan', 'Share') + '">' + ic('share') + '<span>' + tr('Bagikan', 'Share') + '</span></button></div></article>';
  return h;
}
function questionHtml(r, pending) {
  // r: [id, tgl, client, kategori, teks, status, jumlahJawaban, namaClient]
  var h = '<article class="item' + (pending ? ' is-pending' : '') + '" data-id="' + esc(r[0]) + '" data-tgl="' + esc(r[1]) + '">';
  h += '<div class="ihead">' + avatar(r[2], r[7], 'lg') + '<div class="meta"><b>' + esc(r[7]) + '</b><small>' + esc(fmtDate(r[1])) + '</small></div><span class="st">' + badge(r[5]) + '</span></div>';
  h += '<span class="tagc">' + esc(r[3]) + '</span><p class="itext">' + escBr(r[4]) + '</p>';
  h += '<div class="ifoot act-row"><button class="act" data-action="toggle-ans">' + ic('ask') + '<span>' + tr('Jawaban', 'Answers') + ' (<span class="ac">' + nf(r[6]) + '</span>)</span></button>';
  if (isVerifiedExpert() && !pending) h += '<button class="act" data-action="open-reply">' + ic('pen') + '<span>' + tr('Jawab', 'Answer') + '</span></button>';
  h += '</div><div class="ans" hidden></div></article>';
  return h;
}
function answerHtml(a, pending) {
  // a: [id, tgl, expert, jawaban, nama, bidang, bintangDariPenanya, bisaDinilai]
  var h = '<div class="a-item' + (pending ? ' is-pending' : '') + '" data-id="' + esc(a[0]) + '" data-tgl="' + esc(a[1]) + '" data-xn="' + esc(a[4]) + '"><div class="ihead">' + avatar(a[2], a[4], '') + '<div class="meta"><b><button class="nm-link" data-action="expert-open" data-user="' + esc(a[2]) + '">' + esc(a[4]) + '</button>' + verMark('1') + '</b><small>' + esc(a[5]) + ' &bull; ' + esc(fmtDate(a[1])) + '</small></div></div><p class="itext">' + escBr(a[3]) + '</p>';
  h += '<div class="a-rate">' + answerRateHtml(a[6], a[7]) + '</div>';
  return h + '</div>';
}
function answerRateHtml(st, can) {
  if (st) return stars(st, 'sm') + '<small class="muted">' + tr('Dinilai penanya', 'Rated by the asker') + '</small>';
  if (can === '1') return '<button class="act" data-action="rate-answer">' + ic('star') + '<span>' + tr('Nilai jawaban ini', 'Rate this answer') + '</span></button>';
  return '';
}
function expertHtml(r) {
  // r: [username, nama, bidang, bio, jawaban, konsultasi]
  // r: [..., 6 rata-rata, 7 jumlah ulasan, 8 teladan, 9 % puas]
  var h = '<article class="item exp" data-user="' + esc(r[0]) + '" data-nama="' + esc(r[1]) + '">' + avatar(r[0], r[1], 'lg') + '<div class="grow">';
  h += '<b style="display:flex;align-items:center;gap:6px"><button class="nm-link" data-action="expert-open" data-user="' + esc(r[0]) + '">' + esc(r[1]) + '</button>' + verMark('1') + '</b><span class="tagc" style="margin-top:6px">' + esc(r[2]) + '</span>';
  h += '<div class="rate-line">' + rateChip(r[6], r[7], r[8]) + (Number(r[7]) ? '<span class="muted sm">' + nf(r[9]) + '% ' + tr('puas', 'satisfied') + '</span>' : '') + '</div>';
  h += '<p>' + esc(r[3] || tr('Pakar hukum terverifikasi.', 'Verified legal expert.')) + '</p>';
  h += '<div class="ifoot" style="margin-top:0"><span class="badge b-info">' + nf(r[4]) + ' ' + tr('jawaban', 'answers') + '</span><span class="badge b-ok">' + nf(r[5]) + ' ' + tr('konsultasi', 'consultations') + '</span>';
  h += '<button class="btn ghost sm" data-action="expert-open" data-user="' + esc(r[0]) + '" style="margin-left:auto">' + tr('Lihat ulasan', 'See reviews') + '</button>';
  if (role() === 'Client') h += '<button class="btn sm" data-action="book">Booking</button>';
  h += '</div></div></article>';
  return h;
}
function bookingSelect(cur) {
  var list;
  if (isAdmin()) list = STATUS.bookings;
  else if (cur === 'Menunggu') list = ['Menunggu', 'Diterima', 'Ditolak'];
  else if (cur === 'Diterima') list = ['Diterima', 'Selesai'];
  else return badge(cur);
  return '<select class="status-sel ' + toneOf(cur) + '" data-action="bk-status" data-prev="' + esc(cur) + '" aria-label="Status">' + opts(list, cur, true) + '</select>';
}
function bookingHeads() {
  var r = role();
  var h = ['ID', tr('Tanggal', 'Date'), r === 'Client' ? tr('Pakar', 'Expert') : (r === 'Expert' ? 'Client' : 'Client / ' + tr('Pakar', 'Expert')), tr('Layanan', 'Service'), tr('Harga', 'Price')];
  if (r !== 'Client') h.push(tr('Komisi', 'Fee'));
  h.push('Status');
  h.push(tr('Ulasan', 'Review'));
  return h;
}
function bookingRow(r, pending) {
  // r: [id, tgl, client, expert, layanan, harga, komisi, status, namaClient, namaExpert]
  var who = role() === 'Client' ? r[9] : (role() === 'Expert' ? r[8] : r[8] + ' / ' + r[9]);
  var h = '<tr class="' + (pending ? 'is-pending' : '') + '" data-id="' + esc(r[0]) + '" data-tgl="' + esc(r[1]) + '" data-xn="' + esc(r[9] || '') + '">';
  h += '<td class="mono">' + esc(r[0]) + '</td><td class="num">' + esc(fmtDate(r[1])) + '</td><td>' + esc(who) + '</td><td>' + esc(r[4]) + '</td>';
  h += '<td class="num">' + rp(r[5]) + '</td>';
  if (role() !== 'Client') h += '<td class="num">' + rp(r[6]) + '</td>';
  h += '<td>' + (role() !== 'Client' && !pending ? bookingSelect(r[7]) : badge(r[7])) + '</td>';
  h += '<td class="rv-cell">' + bookingRateCell(r[10], r[11]) + '</td></tr>';
  return h;
}
function bookingRateCell(st, can) {
  if (st) return stars(st, 'sm');
  if (can === '1') return '<button class="btn ghost sm" data-action="rate-booking">' + tr('Beri ulasan', 'Write review') + '</button>';
  return '<span class="muted">-</span>';
}
function earningRow(r) {
  // r: [id, tgl, namaClient, layanan, harga, komisi, neto]
  return '<tr><td class="mono">' + esc(r[0]) + '</td><td class="num">' + esc(fmtDate(r[1])) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td class="num">' + rp(r[4]) + '</td><td class="num">' + rp(r[5]) + '</td><td class="num strong">' + rp(r[6]) + '</td></tr>';
}
// r: [id, tgl, username, nama, bidang, noIzin, org, pendidikan, pengalaman, link, ringkasan, checklist, catatan, status, reviewer, tglReview, email]
function screeningCard(r, pending) {
  S.scr[r[0] + '|' + r[1]] = r;
  var done = String(r[11] || '').split('').filter(function (x) { return x === '1'; }).length;
  var h = '<article class="item scr' + (pending ? ' is-pending' : '') + '" data-key="' + esc(r[0] + '|' + r[1]) + '">';
  h += '<div class="ihead">' + avatar(r[2], r[3], 'lg') + '<div class="meta"><b>' + esc(r[3]) + '</b><small>' + esc(r[4]) + ' &bull; ' + esc(r[6]) + ' &bull; ' + nf(r[8]) + ' ' + tr('th pengalaman', 'yrs experience') + '</small></div><span class="st">' + badge(r[13]) + '</span></div>';
  h += '<p class="itext muted">' + esc(shortTxt(r[10], 170)) + '</p>';
  if (r[12] && r[13] !== 'Disetujui') h += '<p class="scr-note"><b>' + tr('Catatan admin', 'Admin note') + ':</b> ' + esc(r[12]) + '</p>';
  h += '<div class="ifoot"><span class="muted sm">' + esc(r[0]) + ' &bull; ' + tr('Diajukan ', 'Submitted ') + esc(fmtDate(r[1])) + ' &bull; ' + tr('Checklist ', 'Checklist ') + done + '/' + S.cfg.checks.length + '</span>';
  h += '<button class="btn sm" style="margin-left:auto" data-action="review" data-key="' + esc(r[0] + '|' + r[1]) + '"' + (pending ? ' disabled' : '') + '>' + tr('Tinjau', 'Review') + '</button></div></article>';
  return h;
}
function xrecapRow(r) {
  // r: [nama, bidang, post, jawaban, konsultasi, bruto, komisi]
  return '<tr><td class="strong">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="num">' + nf(r[2]) + '</td><td class="num">' + nf(r[3]) + '</td><td class="num">' + nf(r[4]) + '</td><td class="num">' + rp(r[5]) + '</td><td class="num">' + rp(r[6]) + '</td></tr>';
}

/* ============ Views ============ */
// Kotak "mulai posting" ala jejaring profesional
function composerHtml() {
  var u = S.user, r = role(), ve = isVerifiedExpert();
  var h = '<div class="card composer"><div class="cp-top">' + avatar(u.username, u.nama, 'lg');
  if (r === 'Expert') {
    h += ve ? '<button class="cp-pill" data-action="compose">' + tr('Bagikan wawasan hukum...', 'Share a legal insight...') + '</button>'
      : '<button class="cp-pill" data-action="nav" data-view="screening">' + tr('Posting aktif setelah akun Anda disetujui admin', 'Posting unlocks once the admin approves you') + '</button>';
  } else {
    h += '<button class="cp-pill" data-action="ask-go">' + tr('Ajukan pertanyaan hukum...', 'Ask a legal question...') + '</button>';
  }
  h += '</div>';
  if (ve) {
    h += '<div class="cp-form" id="cp-form" hidden><div class="fld"><select class="sel" id="p-kat" aria-label="' + tr('Kategori', 'Category') + '">' + opts(S.cfg.kategori, u.bidang) + '</select></div>';
    h += '<div class="fld"><textarea class="inp" id="p-isi" maxlength="800" placeholder="' + tr('Tulis tips atau analisis hukum singkat...', 'Write a short legal tip or analysis...') + '"></textarea></div>';
    h += '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn ghost sm" data-action="compose-x">' + tr('Batal', 'Cancel') + '</button><button class="btn sm" id="btn-post" data-action="post">' + tr('Posting', 'Post') + '</button></div></div>';
  }
  var acts = r === 'Expert'
    ? [[ve ? 'compose' : 'nav', 'feed', 'feed', tr('Postingan', 'Post'), 'c1'], ['nav', 'ask', 'ask', tr('Jawab', 'Answer'), 'c2'], ['nav', 'bookings', 'calendar', 'Booking', 'c3'], ['nav', 'earnings', 'wallet', tr('Pendapatan', 'Earnings'), 'c4']]
    : [['nav', 'ask', 'ask', tr('Tanya pakar', 'Ask'), 'c1'], ['nav', 'experts', 'experts', tr('Cari pakar', 'Experts'), 'c2'], ['nav', 'contracts', 'doc', tr('Kontrak', 'Contract'), 'c3'], ['nav', 'copyrights', 'copyright', tr('Hak cipta', 'Copyright'), 'c4']];
  h += '<div class="cp-acts">';
  for (var i = 0; i < acts.length; i++) h += '<button class="cp-act ' + acts[i][4] + '" data-action="' + acts[i][0] + '" data-view="' + acts[i][1] + '" title="' + esc(acts[i][3]) + '">' + ic(acts[i][2]) + '<span>' + esc(acts[i][3]) + '</span></button>';
  return h + '</div></div>';
}
function openComposer() {
  var f = el('cp-form');
  if (!f) { go('feed'); setTimeout(openComposer, 60); return; }
  f.hidden = false;
  if (el('p-isi')) el('p-isi').focus();
}
function sharePost(btn) {
  var item = btn.closest('.item');
  if (!item) return;
  var who = item.querySelector('.ihead b'), txt = item.querySelector('.itext');
  var s = (txt ? txt.innerText : '') + '\n\n- ' + (who ? who.textContent : '') + ' (Legal Hub)';
  var done = function () { toast(tr('Teks postingan disalin. Tempel di mana saja untuk membagikan.', 'Post text copied. Paste it anywhere to share.'), 'ok'); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, function () { fallbackCopy(s); done(); });
  else { fallbackCopy(s); done(); }
}

VIEWS.home = function () {
  var r = role();
  var h = '';
  if (r === 'Admin') {
    h += head(tr('Panel admin', 'Admin panel'), tr('Ringkasan platform', 'Platform overview'), tr('Pantau screening pakar, kontrak, kasus hak cipta, booking, dan pendapatan platform.', 'Track expert screening, contracts, copyright cases, bookings and platform revenue.'));
  } else {
    if (r === 'Expert') h += '<div id="scr-box"></div>';
    h += composerHtml();
    if (r === 'Client') h += '<div id="rv-pending"></div><div id="credit-widget-box"></div>';
  }
  h += '<div class="stats" id="stats"><div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';
  if (r === 'Admin') {
    h += '<div class="quick">';
    h += qa('shield', tr('Screening pakar', 'Expert screening'), tr('Tinjau latar belakang pendaftar', 'Review applicant backgrounds'), 'verify');
    h += qa('doc', tr('Verifikasi kontrak', 'Verify contracts'), tr('Tinjau kontrak yang masuk', 'Review incoming contracts'), 'contracts');
    h += qa('copyright', tr('Kasus hak cipta', 'Copyright cases'), tr('Perbarui status penyelesaian', 'Update resolution status'), 'copyrights');
    h += qa('calendar', 'Booking', tr('Pantau semua konsultasi', 'Monitor all consultations'), 'bookings');
    h += qa('users', tr('Rekap kreator', 'Creator recap'), tr('Kontrak, kasus, dan pajak', 'Contracts, cases and taxes'), 'recap');
    h += qa('chart', tr('Rekap pakar', 'Expert recap'), tr('Pendapatan dan komisi', 'Revenue and fees'), 'xrecap');
    h += '</div>';
  } else {
    h += '<div class="feed-sep">' + tr('Wawasan terbaru dari pakar', 'Latest insights from experts') + '</div>';
    h += listShell('feed', { filter: S.cfg.kategori, filterLabel: tr('Semua kategori', 'All categories') });
  }
  el('view').innerHTML = h;
  if (r === 'Client') { renderCreditWidget(); loadReviewTargets(); }
  if (r === 'Expert') loadMyScreening(function (scr) { renderScrSummary(scr); });
  if (r !== 'Admin') initList('feed');
  fetchHub(function (hub) {
    paintLeftStats();
    if (r === 'Expert') {
      if (el('stats')) el('stats').innerHTML = statCard(tr('Pendapatan bersih', 'Net earnings'), rp(hub.net), tr('estimasi pajak ', 'est. tax ') + rp(hub.tax), 'var(--ok)') + statCard(tr('Konsultasi selesai', 'Completed consultations'), nf(hub.done), nf(hub.incoming) + ' ' + tr('permintaan baru', 'new requests'), 'var(--brand)') + statCard(tr('Jawaban', 'Answers'), nf(hub.answers), tr('di Tanya Pakar', 'in Q&A'), 'var(--info)') + statCard(tr('Postingan', 'Posts'), nf(hub.posts), tr('di feed', 'in the feed'), 'var(--accent)');
      buildNotif(null, hub);
      return;
    }
    fetchStats(function (st) {
      paintLeftStats();
      var c = '';
      if (r === 'Admin') {
        c += statCard(tr('Pakar terverifikasi', 'Verified experts'), nf(hub.experts), nf(hub.pendingVerif) + ' ' + tr('menunggu screening', 'awaiting screening'), 'var(--brand)');
        c += statCard(tr('Kontrak menunggu', 'Contracts pending'), nf(st.contracts.pending), tr('dari ', 'of ') + nf(st.contracts.total) + ' ' + tr('kontrak', 'contracts'), 'var(--warn)');
        c += statCard(tr('Kasus hak cipta aktif', 'Active copyright cases'), nf(st.copyrights.open), nf(st.copyrights.done) + ' ' + tr('sudah ditutup', 'closed'), 'var(--info)');
        c += statCard(tr('Pendapatan platform', 'Platform revenue'), rp(hub.revenue), tr('dari transaksi ', 'from bookings worth ') + rp(hub.gmv), 'var(--ok)');
      } else {
        c += statCard(tr('Kontrak', 'Contracts'), nf(st.contracts.total), nf(st.contracts.verified) + ' ' + tr('terverifikasi', 'verified'), 'var(--brand)');
        c += statCard('Booking', nf(hub.bookings), nf(hub.pending) + ' ' + tr('menunggu', 'pending'), 'var(--ok)');
        c += statCard(tr('Pertanyaan', 'Questions'), nf(hub.questions), nf(hub.open) + ' ' + tr('belum terjawab', 'unanswered'), 'var(--info)');
        c += statCard(tr('Estimasi pajak', 'Estimated tax'), rp(st.taxes.tax), tr('dari ', 'on ') + rp(st.taxes.income), 'var(--accent)');
      }
      if (el('stats')) el('stats').innerHTML = c;
      buildNotif(st, hub);
    });
  });
};

/* ============ Rating & ulasan ============ */
// Kartu "Menunggu ulasan" di beranda client (seperti daftar pesanan yang belum diulas)
function loadReviewTargets() {
  api('apiReviewTargets', [S.token], function (res) {
    var box = el('rv-pending');
    if (!box || !res.ok) return;
    if (!res.rows.length) { box.innerHTML = ''; return; }
    var h = '<div class="card rv-wait"><div class="card-top" style="margin-bottom:6px"><div><h3>' + tr('Menunggu ulasan Anda', 'Waiting for your review') + '</h3><p class="muted sm">' + tr('Bantu client lain memilih pakar. Ulasan bisa diberikan sampai ', 'Help other clients choose. You can review up to ') + nf(S.cfg.reviewDays || 7) + tr(' hari setelah konsultasi selesai.', ' days after the session ends.') + '</p></div></div>';
    for (var i = 0; i < res.rows.length; i++) {
      var t = res.rows[i];
      h += '<div class="rx rv-target" data-id="' + esc(t[0]) + '" data-tgl="' + esc(t[1]) + '" data-xn="' + esc(t[3]) + '">' + avatar(t[2], t[3], 'lg') + '<div class="grow"><b>' + esc(t[3]) + '</b><small>' + esc(t[4]) + ' &bull; ' + esc(t[0]) + ' &bull; ' + esc(fmtDate(t[1])) + '</small></div><button class="btn sm" data-action="rate-target">' + tr('Beri ulasan', 'Write review') + '</button></div>';
    }
    box.innerHTML = h + '</div>';
    ensurePhotos(box);
  }, function () {});
}

// Form ulasan (modal). o: { jenis, refId, refTgl, nama, ok(row), opt(), undo() }
function openRateForm(o) {
  S.rf = { jenis: o.jenis, refId: o.refId, refTgl: o.refTgl, star: 0, tags: [], ok: o.ok, opt: o.opt, undo: o.undo };
  var tags = S.cfg.rtags || [];
  var h = '<h3>' + (o.jenis === 'Tanya Pakar' ? tr('Nilai jawaban', 'Rate this answer') : tr('Beri ulasan konsultasi', 'Review your consultation')) + '</h3>';
  h += '<p class="muted sm" style="margin-bottom:14px">' + tr('untuk ', 'for ') + '<b>' + esc(o.nama) + '</b></p>';
  h += '<div class="star-pick" id="rf-stars" role="radiogroup" aria-label="' + tr('Bintang', 'Stars') + '">';
  for (var i = 5; i >= 1; i--) h += '<button type="button" class="sp" data-action="rf-star" data-v="' + i + '" role="radio" aria-checked="false" aria-label="' + i + ' ' + tr('bintang', 'stars') + '">&#9733;</button>';
  h += '</div><p class="rf-lbl" id="rf-lbl">' + tr('Ketuk bintang untuk menilai', 'Tap a star to rate') + '</p>';
  h += '<div class="fld"><label>' + tr('Apa yang paling berkesan? (maks. 3)', 'What stood out? (max 3)') + '</label><div class="tag-pick">';
  for (var k = 0; k < tags.length; k++) h += '<button type="button" class="tg" data-action="rf-tag" data-t="' + esc(tags[k]) + '" aria-pressed="false">' + esc(tags[k]) + '</button>';
  h += '</div></div>';
  h += '<div class="fld"><label for="rf-text">' + tr('Ceritakan pengalaman Anda (opsional)', 'Tell us about your experience (optional)') + '</label><textarea class="inp" id="rf-text" maxlength="500" placeholder="' + tr('Contoh: penjelasannya mudah dipahami dan langsung bisa dipraktikkan.', 'e.g. clear explanation I could act on right away.') + '"></textarea>';
  h += '<span class="hint">' + tr('Jangan tulis detail kasus, nomor identitas, atau data pribadi.', 'Do not include case details, ID numbers or personal data.') + '</span></div>';
  h += '<label class="chk agree"><input type="checkbox" id="rf-anon"><span class="box"></span><span>' + tr('Tampilkan sebagai anonim (nama Anda disamarkan)', 'Post anonymously (your name is masked)') + '</span></label>';
  h += '<div style="display:flex;gap:10px"><button class="btn" id="rf-send" data-action="rf-send" style="flex:1" disabled>' + tr('Kirim ulasan', 'Submit review') + '</button><button class="btn ghost" data-action="close-x">' + tr('Batal', 'Cancel') + '</button></div>';
  openModal(h);
  if (o.star) pickStar(o.star);
}
function pickStar(v) {
  if (!S.rf) return;
  S.rf.star = v;
  var b = document.querySelectorAll('#rf-stars .sp');
  for (var i = 0; i < b.length; i++) {
    var n = parseInt(b[i].getAttribute('data-v'), 10);
    b[i].classList.toggle('on', n <= v);
    b[i].setAttribute('aria-checked', n === v ? 'true' : 'false');
  }
  el('rf-lbl').textContent = v + '/5 - ' + RATE_LBL[S.lang][v - 1];
  el('rf-send').disabled = false;
}
function toggleTag(btn) {
  if (!S.rf) return;
  var t = String(btn.getAttribute('data-t')), i = S.rf.tags.indexOf(t);
  if (i >= 0) S.rf.tags.splice(i, 1);
  else { if (S.rf.tags.length >= 3) { toast(tr('Pilih maksimal 3 tag.', 'Pick up to 3 tags.'), 'info'); return; } S.rf.tags.push(t); }
  btn.classList.toggle('on', i < 0);
  btn.setAttribute('aria-pressed', i < 0 ? 'true' : 'false');
}
// Optimistic UI: tampilan langsung berubah, dikembalikan bila server menolak
function submitRating() {
  var f = S.rf;
  if (!f || !f.star) { toast(tr('Pilih jumlah bintang dulu.', 'Pick a star rating first.'), 'err'); return; }
  var p = { jenis: String(f.jenis), refId: String(f.refId), refTgl: String(f.refTgl), bintang: String(f.star), tags: f.tags.join(','), komentar: val('rf-text'), anonim: el('rf-anon').checked === true };
  closeModal();
  S.rf = null;
  if (f.opt) f.opt(f.star);
  api('apiCreateReview', [S.token, p], function (res) {
    if (!res.ok) { if (f.undo) f.undo(); toast(res.msg, 'err'); return; }
    if (f.ok) f.ok(res.row);
    resetStats();
    if (el('r-list')) loadRight();
    toast(tr('Terima kasih! Ulasan Anda membantu client lain.', 'Thank you! Your review helps other clients.'), 'ok');
  }, function (m) { if (f.undo) f.undo(); toast(m, 'err'); });
}
function rateBooking(btn) {
  var tr0 = btn.closest('tr'), cell = btn.closest('td'), prev = cell.innerHTML;
  openRateForm({ jenis: 'Konsultasi', refId: tr0.getAttribute('data-id'), refTgl: tr0.getAttribute('data-tgl'), nama: tr0.getAttribute('data-xn'),
    opt: function (v) { cell.innerHTML = stars(v, 'sm'); },
    undo: function () { cell.innerHTML = prev; } });
}
function rateTarget(btn) {
  var row = btn.closest('.rv-target'), card = row.parentNode;
  openRateForm({ jenis: 'Konsultasi', refId: row.getAttribute('data-id'), refTgl: row.getAttribute('data-tgl'), nama: row.getAttribute('data-xn'),
    opt: function () { row.hidden = true; if (!card.querySelector('.rv-target:not([hidden])')) card.hidden = true; },
    undo: function () { row.hidden = false; card.hidden = false; } });
}
function rateAnswer(btn) {
  var it = btn.closest('.a-item'), box = btn.closest('.a-rate'), prev = box.innerHTML;
  openRateForm({ jenis: 'Tanya Pakar', refId: it.getAttribute('data-id'), refTgl: it.getAttribute('data-tgl'), nama: it.getAttribute('data-xn'),
    opt: function (v) { box.innerHTML = answerRateHtml(String(v), '0'); },
    undo: function () { box.innerHTML = prev; } });
}

// Kartu ulasan. r: [0 id, 1 tgl, 2 jenis, 3 refId, 4 refTgl, 5 nama, 6 username, 7 pakar, 8 namaPakar, 9 bintang, 10 tag, 11 komentar, 12 anonim, 13 balasan, 14 tglBalasan, 15 status]
function reviewHtml(r, pending) {
  var admin = isAdmin(), mineExpert = role() === 'Expert' && r[7] === S.user.username;
  var h = '<article class="item rv' + (pending ? ' is-pending' : '') + (r[15] === 'Disembunyikan' ? ' rv-hidden' : '') + '" data-id="' + esc(r[0]) + '" data-tgl="' + esc(r[1]) + '">';
  var who = r[6] ? avatar(r[6], r[5], '') : '<span class="avatar anon" aria-hidden="true">' + ic('user') + '</span>';
  h += '<div class="ihead">' + who + '<div class="meta"><b>' + esc(r[5]) + (r[12] === '1' ? ' <span class="muted sm">(' + tr('anonim', 'anonymous') + ')</span>' : '') + '</b><small>' + esc(fmtDate(r[1])) + '</small></div>';
  if (admin) h += '<span class="st">' + badge(r[15]) + '</span>';
  h += '</div>';
  h += '<div class="rv-top">' + stars(r[9]) + '<b class="rv-lbl">' + esc(RATE_LBL[S.lang][(Number(r[9]) || 1) - 1]) + '</b><span class="rv-src">' + (r[2] === 'Konsultasi' ? ic('shield') + tr('Konsultasi terverifikasi', 'Verified consultation') : ic('ask') + tr('Dari Tanya Pakar', 'From Q&A')) + '</span></div>';
  if (admin || S.exp === '') h += '<p class="muted sm" style="margin:-4px 0 8px">' + tr('Untuk ', 'For ') + '<button class="nm-link" data-action="expert-open" data-user="' + esc(r[7]) + '">' + esc(r[8]) + '</button></p>';
  if (r[10]) { var tg = String(r[10]).split(','); h += '<div class="rv-tags">'; for (var i = 0; i < tg.length; i++) if (tg[i].trim()) h += '<span class="tag-chip">' + esc(tg[i].trim()) + '</span>'; h += '</div>'; }
  if (r[11]) h += '<p class="itext">' + escBr(r[11]) + '</p>';
  if (r[13]) h += '<div class="rv-reply"><b>' + tr('Balasan pakar', 'Expert reply') + '</b><small class="muted"> &bull; ' + esc(fmtDate(r[14])) + '</small><p>' + escBr(r[13]) + '</p></div>';
  var acts = '';
  if (mineExpert && !r[13] && r[15] !== 'Disembunyikan' && !pending) acts += '<button class="act" data-action="rv-reply-open">' + ic('pen') + '<span>' + tr('Balas ulasan', 'Reply') + '</span></button>';
  if (admin && !pending) acts += r[15] === 'Disembunyikan' ? '<button class="act" data-action="rv-mod" data-m="show">' + tr('Tampilkan lagi', 'Show again') + '</button>' : '<button class="act" data-action="rv-mod" data-m="hide">' + tr('Sembunyikan', 'Hide') + '</button>' + (r[15] === 'Perlu Tinjau' ? '<button class="act" data-action="rv-mod" data-m="show">' + tr('Tandai aman', 'Mark as fine') + '</button>' : '');
  if (acts) h += '<div class="ifoot">' + acts + '</div>';
  return h + '</article>';
}
function openReviewReply(btn) {
  var it = btn.closest('.item');
  if (it.querySelector('.reply')) return;
  var d = document.createElement('div');
  d.className = 'reply';
  d.innerHTML = '<textarea class="inp" maxlength="500" placeholder="' + tr('Tulis balasan yang sopan dan tanpa membahas detail kasus...', 'Write a polite reply without discussing case details...') + '"></textarea><div style="display:flex;gap:8px"><button class="btn sm" data-action="rv-reply-send">' + tr('Kirim balasan', 'Send reply') + '</button><button class="btn ghost sm" data-action="rv-reply-x">' + tr('Batal', 'Cancel') + '</button></div>';
  it.appendChild(d);
  btn.hidden = true;
  d.querySelector('textarea').focus();
}
function sendReviewReply(btn) {
  var it = btn.closest('.item'), ta = it.querySelector('.reply textarea'), teks = String(ta.value).trim();
  if (teks.length < 3) { toast(tr('Balasan minimal 3 karakter.', 'A reply needs at least 3 characters.'), 'err'); return; }
  var box = it.querySelector('.reply'), node = htmlToNode('<div class="rv-reply is-pending"><b>' + tr('Balasan pakar', 'Expert reply') + '</b><p>' + escBr(teks) + '</p></div>');
  box.hidden = true;
  it.insertBefore(node, box);
  var undo = function (m) { node.remove(); box.hidden = false; ta.value = teks; toast(m, 'err'); };
  api('apiReplyReview', [S.token, String(it.getAttribute('data-id')), String(it.getAttribute('data-tgl')), teks], function (res) {
    if (!res.ok) { undo(res.msg); return; }
    var nn = htmlToNode(reviewHtml(res.row, false));
    nn.classList.add('fresh');
    it.parentNode.replaceChild(nn, it);
    paintAvatars(document);
    resetStats();
    toast(tr('Balasan terkirim.', 'Reply sent.'), 'ok');
  }, undo);
}
function moderateReview(btn) {
  var it = btn.closest('.item'), m = String(btn.getAttribute('data-m'));
  it.classList.add('is-pending');
  api('apiModerateReview', [S.token, String(it.getAttribute('data-id')), String(it.getAttribute('data-tgl')), m], function (res) {
    if (!res.ok) { it.classList.remove('is-pending'); toast(res.msg, 'err'); return; }
    var nn = htmlToNode(reviewHtml(res.row, false));
    nn.classList.add('fresh');
    it.parentNode.replaceChild(nn, it);
    paintAvatars(document);
    resetStats();
    if (el('r-spot')) loadRight();
    toast(m === 'hide' ? tr('Ulasan disembunyikan dari publik.', 'Review hidden from the public.') : tr('Ulasan ditampilkan.', 'Review is visible.'), 'ok');
  }, function (msg) { it.classList.remove('is-pending'); toast(msg, 'err'); });
}
function reviewFilterHtml(withStatus) {
  var o = [['5', '&#9733; 5'], ['4', '&#9733; 4'], ['3', '&#9733; 3'], ['2', '&#9733; 2'], ['1', '&#9733; 1'], ['komentar', tr('Dengan komentar', 'With comments')], ['Konsultasi', tr('Dari konsultasi', 'From consultations')], ['Tanya Pakar', tr('Dari Tanya Pakar', 'From Q&A')]];
  if (withStatus) for (var k = 0; k < STATUS.reviews.length; k++) o.unshift([STATUS.reviews[STATUS.reviews.length - 1 - k], esc(stLabel(STATUS.reviews[STATUS.reviews.length - 1 - k]))]);
  var h = '';
  for (var i = 0; i < o.length; i++) h += '<option value="' + esc(o[i][0]) + '">' + o[i][1] + '</option>';
  return h;
}
// Ringkasan rating: angka besar, sebaran bintang (bisa diklik untuk filter), tag teratas
function ratingSummaryHtml(sm) {
  if (!sm || !sm.n) return '<div class="card rv-sum"><h3>' + tr('Rating & ulasan', 'Ratings & reviews') + '</h3><p class="muted" style="margin-top:6px">' + tr('Belum ada ulasan. Ulasan muncul setelah client menyelesaikan konsultasi atau menilai jawaban di Tanya Pakar.', 'No reviews yet. Reviews appear after clients finish a consultation or rate an answer in Q&A.') + '</p></div>';
  var h = '<div class="card rv-sum"><h3>' + tr('Rating & ulasan', 'Ratings & reviews') + '</h3><div class="rv-grid"><div class="rv-big"><b>' + nf1(sm.avg) + '</b><span class="muted">/5</span>' + stars(sm.avg, 'lg') + '<p class="muted sm">' + nf(sm.n) + ' ' + tr('ulasan', 'reviews') + ' &bull; ' + nf(sm.puas) + '% ' + tr('puas', 'satisfied') + '</p>';
  if (sm.teladan) h += '<span class="badge teladan">' + tr('Pakar Teladan', 'Top Expert') + '</span>';
  else if (sm.n < 3) h += '<span class="badge b-info">' + tr('Pakar baru', 'New expert') + '</span>';
  h += '</div><div class="rv-bars">';
  for (var s = 5; s >= 1; s--) {
    var c = sm.dist[s - 1] || 0, pct = sm.n ? Math.round(c * 100 / sm.n) : 0;
    h += '<button class="rv-bar" data-action="rv-filter" data-f="' + s + '" title="' + tr('Lihat ulasan bintang ', 'Show ') + s + '"><span>&#9733; ' + s + '</span><i><em style="width:' + pct + '%"></em></i><span class="muted">' + nf(c) + '</span></button>';
  }
  h += '</div></div>';
  if (sm.tags && sm.tags.length) {
    h += '<div class="rv-tags" style="margin-top:12px">';
    for (var t = 0; t < sm.tags.length; t++) h += '<span class="tag-chip">' + esc(sm.tags[t][0]) + ' <b>' + nf(sm.tags[t][1]) + '</b></span>';
    h += '</div>';
  }
  h += '<p class="muted sm" style="margin-top:10px">' + nf(sm.kons) + ' ' + tr('dari konsultasi', 'from consultations') + ' &bull; ' + nf(sm.tanya) + ' ' + tr('dari Tanya Pakar', 'from Q&A') + '</p></div>';
  return h;
}
function setReviewFilter(f) {
  var s = el('flt-reviews');
  if (s) s.value = f;
  if (L.reviews) { L.reviews.f = String(f); loadMore('reviews', true); }
}

// Profil publik pakar: kartu atas, ringkasan rating, lalu daftar ulasan
VIEWS.expert = function () {
  var u = String(S.exp || (S.user ? S.user.username : ''));
  S.exp = u;
  var h = '<div id="xp-top"><div class="skel" style="min-height:240px;margin-bottom:8px"></div></div><div id="xp-sum"></div>';
  h += '<div class="feed-sep">' + tr('Ulasan client', 'Client reviews') + '</div>';
  h += listShell('reviews', { filterHtml: reviewFilterHtml(false), filterLabel: tr('Semua ulasan', 'All reviews') });
  el('view').innerHTML = h;
  initList('reviews');
  api('apiExpertProfile', [S.token, u], function (res) {
    var top = el('xp-top');
    if (!top || S.exp !== u) return;
    if (!res.ok) { top.innerHTML = '<div class="note">' + esc(res.msg) + '</div>'; return; }
    var p = res.p, sm = res.summary, me = S.user && S.user.username === p.username;
    var x = '<div class="card prof-top"><div class="prof-cover"></div><div class="prof-main">' + avatar(p.username, p.nama, 'xl');
    x += '<h1 class="prof-name">' + esc(p.nama) + (p.ver === 'Terverifikasi' ? verMark('1') : '') + '</h1>';
    x += '<p class="prof-head">' + tr('Pakar hukum', 'Legal expert') + (p.bidang ? ' &bull; ' + esc(p.bidang) : '') + '</p>';
    x += '<div class="rate-line" style="margin-top:6px">' + rateChip(sm.avg, sm.n, sm.teladan) + '</div>';
    x += '<p class="prof-meta">' + nf(p.answers) + ' ' + tr('jawaban', 'answers') + ' &bull; ' + nf(p.done) + ' ' + tr('konsultasi selesai', 'completed sessions') + ' &bull; ' + nf(p.posts) + ' ' + tr('postingan', 'posts') + '</p>';
    if (p.bio) x += '<p class="prof-bio">' + escBr(p.bio) + '</p>';
    x += '<div class="pf-actions">';
    if (role() === 'Client') x += '<button class="btn sm" data-action="book" data-user="' + esc(p.username) + '" data-nama="' + esc(p.nama) + '">' + tr('Booking konsultasi', 'Book a consultation') + '</button>';
    if (me) x += '<button class="btn ghost sm" data-action="nav" data-view="profile">' + tr('Edit profil', 'Edit profile') + '</button>';
    x += '</div></div></div>';
    top.innerHTML = x;
    el('xp-sum').innerHTML = ratingSummaryHtml(sm);
    ensurePhotos(top);
  }, function (m) { toast(m, 'err'); });
};
VIEWS.myreviews = function () { S.exp = S.user.username; VIEWS.expert(); };
// Admin: moderasi ulasan (bintang 1-2 otomatis masuk "Perlu Tinjau")
VIEWS.reviews = function () {
  S.exp = '';
  var h = head(tr('Moderasi', 'Moderation'), tr('Moderasi ulasan', 'Review moderation'), tr('Ulasan bintang 1-2 otomatis masuk antrean "Perlu Tinjau". Sembunyikan ulasan yang berisi data pribadi, detail kasus, atau kata kasar. Data tidak pernah dihapus.', 'Reviews with 1-2 stars land in "Needs review". Hide reviews containing personal data, case details or abusive language. Nothing is ever deleted.'));
  h += listShell('reviews', { filterHtml: reviewFilterHtml(true), filterLabel: tr('Semua ulasan', 'All reviews') });
  el('view').innerHTML = h;
  initList('reviews');
};

VIEWS.feed = function () {
  var h = head('Feed', tr('Wawasan hukum', 'Legal insights'), tr('Tips dan analisis singkat dari pakar hukum terverifikasi.', 'Short tips and analysis from verified legal experts.'));
  if (role() === 'Expert') h += composerHtml();
  h += listShell('feed', { filter: S.cfg.kategori, filterLabel: tr('Semua kategori', 'All categories') });
  el('view').innerHTML = h;
  initList('feed');
};

VIEWS.ask = function () {
  var h = head(tr('Tanya Pakar', 'Q&A'), tr('Tanya pakar hukum', 'Ask a legal expert'), tr('Ajukan pertanyaan, pakar terverifikasi akan menjawab.', 'Ask a question and verified experts will answer.'));
  if (role() === 'Client') {
    h += '<div id="credit-widget-box"></div>';
    h += '<div class="card"><h3 style="margin-bottom:12px">' + tr('Ajukan pertanyaan', 'Ask a question') + '</h3><div class="fld"><select class="sel" id="q-kat" aria-label="' + tr('Kategori', 'Category') + '"><option value="">' + tr('Pilih kategori...', 'Choose a category...') + '</option>' + opts(S.cfg.kategori) + '</select></div><div class="fld"><textarea class="inp" id="q-teks" maxlength="600" placeholder="' + tr('Jelaskan situasi Anda. Hindari data pribadi yang sensitif.', 'Describe your situation. Avoid sensitive personal data.') + '"></textarea></div><button class="btn sm" id="btn-q" data-action="ask">' + tr('Kirim pertanyaan', 'Send question') + '</button>';
    h += '<p class="cost">' + tr('Biaya: 1 kuota bulanan, atau ', 'Cost: 1 monthly quota, or ') + nf(S.cfg.cost.question) + tr(' poin bila kuota habis.', ' points once the quota runs out.') + '</p></div>';
  }
  h += listShell('ask', { filter: STATUS.ask, filterLabel: tr('Semua status', 'All statuses'), filterIsStatus: true });
  el('view').innerHTML = h;
  if (role() === 'Client') renderCreditWidget();
  initList('ask');
};

VIEWS.experts = function () {
  var h = head(tr('Direktori', 'Directory'), tr('Pakar hukum', 'Legal experts'), tr('Diurutkan berdasarkan rating dan ulasan client. Pilih pakar sesuai bidang Anda lalu booking konsultasi.', 'Sorted by client ratings and reviews. Pick an expert in your area and book a consultation.'));
  h += listShell('experts', { filter: S.cfg.kategori, filterLabel: tr('Semua bidang', 'All areas') });
  el('view').innerHTML = h;
  initList('experts');
};

VIEWS.bookings = function () {
  var r = role();
  var h = head('Booking', r === 'Client' ? tr('Booking saya', 'My bookings') : (r === 'Expert' ? tr('Permintaan konsultasi', 'Consultation requests') : tr('Semua booking', 'All bookings')), r === 'Client' ? tr('Pantau status konsultasi yang Anda pesan.', 'Track the consultations you have booked.') : tr('Terima, selesaikan, atau tolak permintaan konsultasi.', 'Accept, complete or decline consultation requests.'));
  h += listShell('bookings', { title: tr('Daftar booking', 'Bookings'), heads: bookingHeads(), filter: STATUS.bookings, filterLabel: tr('Semua status', 'All statuses'), filterIsStatus: true });
  el('view').innerHTML = h;
  initList('bookings');
};

VIEWS.earnings = function () {
  var h = head(tr('Pendapatan', 'Earnings'), tr('Pendapatan konsultasi', 'Consultation earnings'), tr('Hasil konsultasi selesai setelah komisi platform. Pajak hanya estimasi.', 'Completed consultations after the platform fee. Tax is an estimate only.'));
  h += '<div class="stats s3" id="stats"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';
  h += listShell('earnings', { title: tr('Riwayat pendapatan', 'Earnings history'), heads: ['ID', tr('Tanggal', 'Date'), 'Client', tr('Layanan', 'Service'), tr('Bruto', 'Gross'), tr('Komisi', 'Fee'), tr('Bersih', 'Net')] });
  el('view').innerHTML = h;
  fetchHub(function (st) {
    if (!el('stats')) return;
    el('stats').innerHTML = statCard(tr('Pendapatan kotor', 'Gross earnings'), rp(st.gross), nf(st.done) + ' ' + tr('konsultasi', 'consultations'), 'var(--brand)') + statCard(tr('Komisi platform', 'Platform fee'), rp(st.comm), Math.round(S.cfg.commission * 100) + '% ' + tr('dari tiap sesi', 'per session'), 'var(--accent)') + statCard(tr('Bersih', 'Net'), rp(st.net), tr('estimasi pajak ', 'est. tax ') + rp(st.tax), 'var(--ok)');
  });
  initList('earnings');
};

VIEWS.verify = function () {
  var h = head(tr('Screening pakar', 'Expert screening'), tr('Screening latar belakang pakar', 'Expert background screening'), tr('Periksa izin praktik, pendidikan, dan pengalaman. Pakar hanya bisa disetujui bila semua poin checklist lolos.', 'Check licences, education and experience. An expert can only be approved when every checklist item passes.'));
  h += '<div class="steps-legend">' + badge('Menunggu') + '<span>&rarr;</span>' + badge('Dalam Screening') + '<span>&rarr;</span>' + badge('Disetujui') + '<span class="muted sm">' + tr('atau', 'or') + '</span>' + badge('Perlu Revisi') + badge('Ditolak') + '</div>';
  h += listShell('verify', { filter: STATUS.verify, filterLabel: tr('Semua status', 'All statuses'), filterIsStatus: true });
  el('view').innerHTML = h;
  initList('verify');
};

/* ----- Admin: modal tinjauan screening ----- */
function openReview(key) {
  var r = S.scr[key];
  if (!r) return;
  var st = r[13], locked = st === 'Disetujui' || st === 'Ditolak' || st === 'Perlu Revisi';
  var chk = String(r[11] || '');
  var h = '<div class="rv-head">' + avatar(r[2], r[3], 'lg') + '<div><h3>' + esc(r[3]) + '</h3><p class="muted sm">' + esc(r[4]) + ' &bull; ' + esc(r[0]) + '</p></div>' + badge(st) + '</div>';
  h += '<dl class="dl">';
  h += '<dt>Username</dt><dd>' + esc(r[2]) + '</dd><dt>Email</dt><dd>' + esc(r[16]) + '</dd>';
  h += '<dt>' + tr('No. izin / KTA', 'Licence no.') + '</dt><dd>' + esc(r[5]) + '</dd><dt>' + tr('Organisasi', 'Body') + '</dt><dd>' + esc(r[6]) + '</dd>';
  h += '<dt>' + tr('Pendidikan', 'Education') + '</dt><dd>' + esc(r[7]) + '</dd><dt>' + tr('Pengalaman', 'Experience') + '</dt><dd>' + nf(r[8]) + ' ' + tr('tahun', 'years') + '</dd>';
  h += '<dt>' + tr('Dokumen', 'Documents') + '</dt><dd>' + (/^https?:\/\//i.test(r[9]) ? '<a class="lnk" href="' + esc(r[9]) + '" target="_blank" rel="noopener noreferrer">' + esc(shortTxt(r[9], 48)) + '</a>' : '-') + '</dd>';
  h += '<dt>' + tr('Diajukan', 'Submitted') + '</dt><dd>' + esc(fmtDate(r[1])) + '</dd></dl>';
  h += '<div class="fld"><label>' + tr('Ringkasan latar belakang', 'Background summary') + '</label><p class="itext bg-sum">' + escBr(r[10]) + '</p></div>';
  h += '<div class="fld"><label>' + tr('Checklist screening', 'Screening checklist') + '</label><div class="chk-list">';
  for (var i = 0; i < S.cfg.checks.length; i++) {
    h += '<label class="chk"><input type="checkbox" class="rv-chk" data-live="rv-chk"' + (chk.charAt(i) === '1' ? ' checked' : '') + (locked ? ' disabled' : '') + '><span class="box"></span><span>' + esc(S.lang === 'en' ? S.cfg.checks[i][1] : S.cfg.checks[i][0]) + '</span></label>';
  }
  h += '</div></div>';
  h += '<div class="fld"><label for="rv-note">' + tr('Catatan admin', 'Admin note') + '</label><textarea class="inp" id="rv-note" maxlength="500"' + (st === 'Ditolak' ? ' disabled' : '') + ' placeholder="' + tr('Wajib diisi untuk minta revisi atau menolak', 'Required when requesting a revision or rejecting') + '">' + esc(r[12]) + '</textarea></div>';
  if (r[14]) h += '<p class="muted sm" style="margin-bottom:14px">' + tr('Terakhir ditinjau oleh ', 'Last reviewed by ') + esc(r[14]) + ' &bull; ' + esc(fmtDate(r[15])) + '</p>';
  if (st === 'Perlu Revisi') h += '<div class="note">' + tr('Menunggu pakar memperbarui datanya. Setelah dikirim ulang, status kembali ke Menunggu.', 'Waiting for the expert to update their details. Once resubmitted, the status returns to Pending.') + '</div>';
  h += '<div class="rv-actions">';
  var b = function (act, label, cls, id) { return '<button class="btn sm ' + (cls || '') + '" data-action="rv-act" data-act="' + act + '" data-key="' + esc(key) + '"' + (id ? ' id="' + id + '"' : '') + '>' + label + '</button>'; };
  if (st === 'Menunggu') h += b('start', tr('Mulai screening', 'Start screening'), 'ghost');
  if (st === 'Menunggu' || st === 'Dalam Screening') h += b('revisi', tr('Minta revisi', 'Request revision'), 'ghost') + b('tolak', tr('Tolak', 'Reject'), 'danger') + b('setujui', tr('Setujui pakar', 'Approve expert'), '', 'rv-ok');
  if (st === 'Perlu Revisi') h += b('tolak', tr('Tolak', 'Reject'), 'danger');
  if (st === 'Disetujui') h += b('tolak', tr('Cabut persetujuan', 'Revoke approval'), 'danger');
  h += '<button class="btn ghost sm" data-action="close-x">' + tr('Tutup', 'Close') + '</button></div>';
  if (st === 'Menunggu' || st === 'Dalam Screening') h += '<p class="muted sm" id="rv-hint" style="margin-top:10px"></p>';
  openModal(h);
  ensurePhotos(el('sheet'));
  updateReviewButtons();
}
function reviewChecks() {
  var cs = document.querySelectorAll('.rv-chk'), s = '';
  for (var i = 0; i < cs.length; i++) s += cs[i].checked ? '1' : '0';
  return s;
}
// Tombol Setujui hanya aktif bila semua poin checklist dicentang
function updateReviewButtons() {
  var ok = el('rv-ok');
  if (!ok) return;
  var c = reviewChecks(), all = c.length > 0 && c.indexOf('0') < 0;
  ok.disabled = !all;
  if (el('rv-hint')) el('rv-hint').textContent = all ? tr('Semua poin lolos. Pakar siap disetujui.', 'All items passed. Ready to approve.') : tr('Centang semua poin checklist untuk bisa menyetujui pakar.', 'Tick every checklist item to approve the expert.');
}
// Optimistic UI: status kartu langsung berubah, dikembalikan bila server menolak
function doReview(btn) {
  var key = String(btn.getAttribute('data-key')), act = String(btn.getAttribute('data-act'));
  var r = S.scr[key];
  if (!r) return;
  var note = el('rv-note') ? val('rv-note') : '', checks = reviewChecks();
  if ((act === 'revisi' || act === 'tolak') && note.length < 5) { toast(tr('Tulis catatan untuk pakar (minimal 5 karakter).', 'Write a note for the expert (at least 5 characters).'), 'err'); el('rv-note').focus(); return; }
  if (act === 'setujui' && checks.indexOf('0') >= 0) { toast(tr('Semua poin screening harus lolos.', 'Every screening item must pass.'), 'err'); return; }
  var next = { start: 'Dalam Screening', revisi: 'Perlu Revisi', tolak: 'Ditolak', setujui: 'Disetujui' }[act];
  var prev = r.slice(), tmp = r.slice();
  tmp[11] = checks || tmp[11]; tmp[12] = note; tmp[13] = next;
  var node = document.querySelector('.item.scr[data-key="' + key.replace(/"/g, '') + '"]');
  if (node) { var nn = htmlToNode(screeningCard(tmp, true)); node.parentNode.replaceChild(nn, node); node = nn; }
  closeModal();
  var back = function (msg) {
    S.scr[key] = prev;
    var cur = document.querySelector('.item.scr[data-key="' + key.replace(/"/g, '') + '"]');
    if (cur) cur.parentNode.replaceChild(htmlToNode(screeningCard(prev, false)), cur);
    paintAvatars(document);
    toast(msg || tr('Gagal menyimpan keputusan.', 'Could not save the decision.'), 'err');
  };
  api('apiReviewScreening', [S.token, String(r[0]), String(r[1]), act, checks, note], function (res) {
    if (!res.ok) { back(res.msg); return; }
    var row = res.row || tmp;
    var cur = document.querySelector('.item.scr[data-key="' + key.replace(/"/g, '') + '"]');
    if (cur) { var fresh = htmlToNode(screeningCard(row, false)); fresh.classList.add('fresh'); cur.parentNode.replaceChild(fresh, cur); }
    paintAvatars(document);
    resetStats();
    if (el('r-list')) loadRight();
    var msg = { start: tr('Screening dimulai.', 'Screening started.'), revisi: tr('Permintaan revisi dikirim ke pakar.', 'Revision request sent to the expert.'), tolak: tr('Pendaftaran ditolak.', 'Application rejected.'), setujui: tr('Pakar disetujui dan kini aktif.', 'Expert approved and now active.') }[act];
    toast(msg, 'ok');
  }, back);
}

/* ----- Pakar: status & data screening sendiri ----- */
function loadMyScreening(cb) {
  api('apiMyScreening', [S.token], function (res) {
    if (!res.ok) { toast(res.msg, 'err'); return; }
    // Bila admin baru saja menyetujui/menolak, perbarui status akun tanpa perlu login ulang
    if (res.ver && res.ver !== S.user.ver) {
      var was = S.user.ver;
      S.user.ver = res.ver;
      if (res.ver === 'Terverifikasi' && was !== 'Terverifikasi') toast(tr('Selamat! Akun pakar Anda telah disetujui.', 'Congratulations! Your expert account has been approved.'), 'ok');
    }
    cb(res.scr);
  }, function (m) { toast(m, 'err'); });
}
function scrSteps(st) {
  var s2 = st === 'Dalam Screening' ? 'cur' : (st === 'Disetujui' || st === 'Ditolak' ? 'done' : (st === 'Perlu Revisi' ? 'warn' : ''));
  var s3 = st === 'Disetujui' ? 'done' : (st === 'Ditolak' ? 'bad' : '');
  var label3 = st === 'Disetujui' ? tr('Disetujui', 'Approved') : (st === 'Ditolak' ? tr('Ditolak', 'Rejected') : tr('Keputusan', 'Decision'));
  return '<ol class="steps"><li class="done"><span></span>' + tr('Data terkirim', 'Submitted') + '</li><li class="' + s2 + '"><span></span>' + (st === 'Perlu Revisi' ? tr('Perlu revisi', 'Needs revision') : tr('Screening admin', 'Admin screening')) + '</li><li class="' + s3 + '"><span></span>' + label3 + '</li></ol>';
}
function scrMessage(st) {
  if (st === 'Menunggu') return tr('Data Anda sudah masuk antrean. Admin akan memeriksa izin praktik, pendidikan, dan pengalaman Anda.', 'Your details are in the queue. The admin will check your licence, education and experience.');
  if (st === 'Dalam Screening') return tr('Admin sedang memeriksa latar belakang Anda.', 'The admin is reviewing your background.');
  if (st === 'Perlu Revisi') return tr('Admin meminta Anda memperbaiki data. Lihat catatan di bawah, lalu kirim ulang.', 'The admin asked you to fix your details. See the note below, then resubmit.');
  if (st === 'Disetujui') return tr('Akun pakar Anda aktif. Anda bisa memposting, menjawab, dan menerima konsultasi.', 'Your expert account is active. You can post, answer and accept consultations.');
  return tr('Pendaftaran pakar Anda ditolak. Lihat catatan admin di bawah.', 'Your expert application was rejected. See the admin note below.');
}
function renderScrSummary(scr) {
  var box = el('scr-box');
  if (!box) return;
  var st = scr ? scr[13] : 'Perlu Revisi';
  if (st === 'Disetujui') { box.innerHTML = ''; return; }
  var h = '<div class="card scr-card"><div class="card-top"><div><h3>' + tr('Status pendaftaran pakar', 'Expert application status') + '</h3><p class="muted sm">' + esc(scrMessage(st)) + '</p></div>' + badge(st) + '</div>' + scrSteps(st);
  if (scr && scr[12]) h += '<p class="scr-note"><b>' + tr('Catatan admin', 'Admin note') + ':</b> ' + esc(scr[12]) + '</p>';
  h += '<button class="btn sm" data-action="nav" data-view="screening">' + (st === 'Perlu Revisi' || st === 'Menunggu' ? tr('Lihat & perbarui data', 'View & update details') : tr('Lihat detail', 'View details')) + '</button></div>';
  box.innerHTML = h;
}
VIEWS.screening = function () {
  var h = head('Screening', tr('Status pendaftaran pakar', 'Expert application status'), tr('Admin memeriksa latar belakang Anda sebelum akun pakar aktif.', 'The admin checks your background before your expert account is activated.'));
  h += '<div id="scr-detail"><div class="skel"></div></div>';
  el('view').innerHTML = h;
  loadMyScreening(function (scr) {
    var box = el('scr-detail');
    if (!box) return;
    var st = scr ? scr[13] : 'Perlu Revisi';
    var editable = !scr || st === 'Menunggu' || st === 'Perlu Revisi';
    var d = scr || ['', '', S.user.username, S.user.nama, S.user.bidang, '', '', '', '', '', '', '', '', st, '', '', ''];
    var x = '<div class="card"><div class="card-top"><div><h3>' + tr('Progres screening', 'Screening progress') + '</h3><p class="muted sm">' + esc(scrMessage(st)) + '</p></div>' + badge(st) + '</div>' + scrSteps(st);
    if (d[12]) x += '<p class="scr-note"><b>' + tr('Catatan admin', 'Admin note') + ':</b> ' + esc(d[12]) + '</p>';
    x += '</div><div class="card" style="max-width:720px"><h3 style="margin-bottom:14px">' + tr('Data latar belakang', 'Background details') + '</h3>';
    if (editable) {
      x += '<div class="row2"><div class="fld"><label for="s-izin">' + tr('No. izin praktik / KTA', 'Practice licence / membership no.') + '</label><input class="inp" id="s-izin" maxlength="40" value="' + esc(d[5] === '-' ? '' : d[5]) + '"></div>';
      x += '<div class="fld"><label for="s-org">' + tr('Organisasi profesi', 'Professional body') + '</label><select class="sel" id="s-org"><option value="">' + tr('Pilih organisasi...', 'Choose a body...') + '</option>' + opts(S.cfg.org, d[6]) + '</select></div></div>';
      x += '<div class="row2"><div class="fld"><label for="s-pend">' + tr('Pendidikan terakhir', 'Highest education') + '</label><input class="inp" id="s-pend" maxlength="120" value="' + esc(d[7] === '-' ? '' : d[7]) + '"></div>';
      x += '<div class="fld"><label for="s-exp">' + tr('Pengalaman (tahun)', 'Experience (years)') + '</label><input class="inp" id="s-exp" type="number" min="0" max="60" inputmode="numeric" value="' + esc(d[8]) + '"></div></div>';
      x += '<div class="fld"><label for="s-link">' + tr('Link dokumen pendukung', 'Supporting documents link') + '</label><input class="inp" id="s-link" type="url" placeholder="https://drive.google.com/..." value="' + esc(d[9] === '-' ? '' : d[9]) + '"><span class="hint">' + tr('Folder berisi scan KTA/izin praktik, ijazah, dan CV. Pastikan admin bisa membukanya.', 'A folder with your licence/membership card, degree and CV. Make sure the admin can open it.') + '</span></div>';
      x += '<div class="fld"><label for="s-ring">' + tr('Ringkasan latar belakang', 'Background summary') + '</label><textarea class="inp" id="s-ring" maxlength="1000">' + esc(d[10] === '-' ? '' : d[10]) + '</textarea></div>';
      x += '<label class="chk agree"><input type="checkbox" id="s-agree"><span class="box"></span><span>' + tr('Saya menyatakan data di atas benar dan bersedia diverifikasi oleh admin.', 'I confirm the information above is true and agree to be verified by the admin.') + '</span></label>';
      x += '<button class="btn" id="btn-scr" data-action="scr-save">' + (st === 'Perlu Revisi' ? tr('Kirim ulang untuk screening', 'Resubmit for screening') : tr('Simpan perubahan', 'Save changes')) + '</button>';
    } else {
      x += '<dl class="dl"><dt>' + tr('No. izin / KTA', 'Licence no.') + '</dt><dd>' + esc(d[5]) + '</dd><dt>' + tr('Organisasi', 'Body') + '</dt><dd>' + esc(d[6]) + '</dd>';
      x += '<dt>' + tr('Pendidikan', 'Education') + '</dt><dd>' + esc(d[7]) + '</dd><dt>' + tr('Pengalaman', 'Experience') + '</dt><dd>' + nf(d[8]) + ' ' + tr('tahun', 'years') + '</dd>';
      x += '<dt>' + tr('Dokumen', 'Documents') + '</dt><dd>' + (/^https?:\/\//i.test(d[9]) ? '<a class="lnk" href="' + esc(d[9]) + '" target="_blank" rel="noopener noreferrer">' + esc(shortTxt(d[9], 48)) + '</a>' : '-') + '</dd></dl>';
      x += '<p class="itext bg-sum">' + escBr(d[10]) + '</p>';
      x += '<p class="muted sm" style="margin-top:12px">' + (st === 'Dalam Screening' ? tr('Data tidak bisa diubah selama admin melakukan screening.', 'Details cannot be changed while the admin is screening.') : tr('Hubungi admin bila ada data yang perlu diubah.', 'Contact the admin if anything needs to change.')) + '</p>';
    }
    x += '</div>';
    box.innerHTML = x;
  });
};
function saveScreening() {
  var p = { noIzin: val('s-izin'), organisasi: val('s-org'), pendidikan: val('s-pend'), pengalaman: val('s-exp'), link: val('s-link'), ringkasan: val('s-ring'), setuju: el('s-agree').checked === true };
  if (!p.noIzin || !p.organisasi || !p.pendidikan || p.pengalaman === '' || !p.link || !p.ringkasan) { toast(tr('Lengkapi semua data latar belakang.', 'Please complete every background field.'), 'err'); return; }
  if (!p.setuju) { toast(tr('Centang pernyataan kebenaran data.', 'Please confirm your information is true.'), 'err'); return; }
  busy('btn-scr', true);
  api('apiUpdateScreening', [S.token, p], function (res) {
    busy('btn-scr', false);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    toast(tr('Data terkirim. Status kembali ke Menunggu screening.', 'Details sent. Your status is back to pending screening.'), 'ok');
    VIEWS.screening();
  }, function (m) { busy('btn-scr', false); toast(m, 'err'); });
}

VIEWS.xrecap = function () {
  var h = head(tr('Rekapitulasi', 'Recap'), tr('Rekap pakar', 'Expert recap'), tr('Aktivitas dan pendapatan setiap pakar terverifikasi.', 'Activity and earnings of each verified expert.'));
  h += listShell('xrecap', { title: tr('Rekap per pakar', 'By expert'), heads: [tr('Pakar', 'Expert'), tr('Bidang', 'Area'), 'Post', tr('Jawaban', 'Answers'), tr('Konsultasi', 'Consultations'), tr('Bruto', 'Gross'), tr('Komisi', 'Fee')] });
  el('view').innerHTML = h;
  initList('xrecap');
};

VIEWS.recap = function () {
  var h = head(tr('Rekapitulasi', 'Recap'), tr('Data kreator', 'Creator data'), tr('Ringkasan aktivitas legal dan pendapatan setiap kreator.', 'Summary of legal activity and earnings per creator.'));
  h += listShell('recap', { title: tr('Rekap per kreator', 'By creator'), heads: legacyHeads('recap') });
  el('view').innerHTML = h;
  initList('recap');
};

VIEWS.profile = function () {
  var u = S.user;
  var h = '<div class="card prof-top"><div class="prof-cover"></div><div class="prof-main"><span class="avatar xl" id="pf-av"></span>';
  h += '<h1 class="prof-name">' + esc(u.nama || u.username) + (isVerifiedExpert() ? verMark('1') : '') + '</h1>';
  h += '<p class="prof-head">' + esc(roleLine()) + '</p>';
  h += '<p class="prof-meta">@' + esc(u.username) + (u.email ? ' &bull; ' + esc(u.email) : '') + '</p>';
  if (u.bio) h += '<p class="prof-bio">' + escBr(u.bio) + '</p>';
  h += '<div class="pf-actions"><button class="btn sm" id="btn-pick" data-action="pick-photo">' + tr('Unggah foto', 'Upload photo') + '</button>';
  h += '<button class="btn ghost sm" id="btn-rmph" data-action="rm-photo" hidden>' + tr('Hapus foto', 'Remove photo') + '</button></div>';
  h += '<p class="muted sm" style="margin-top:8px">' + tr('JPG, PNG, atau WebP. Foto otomatis dipotong persegi dan diperkecil.', 'JPG, PNG or WebP. The photo is cropped square and resized automatically.') + '</p>';
  h += '<input type="file" id="pf-file" accept="image/jpeg,image/png,image/webp" data-live="photo" hidden></div></div>';
  h += '<div class="card"><h3 style="margin-bottom:14px">' + tr('Edit profil', 'Edit profile') + '</h3>';
  h += '<div class="fld"><label for="pf-nama">' + tr('Nama tampilan', 'Display name') + '</label><input class="inp" id="pf-nama" maxlength="60" value="' + esc(u.nama) + '"></div>';
  if (u.role === 'Expert') h += '<div class="fld"><label for="pf-bidang">' + tr('Bidang keahlian', 'Area of expertise') + '</label><select class="sel" id="pf-bidang">' + opts(S.cfg.kategori, u.bidang) + '</select></div>';
  h += '<div class="fld"><label for="pf-bio">' + tr('Bio singkat (tampil sebagai kutipan Pakar Pilihan)', 'Short bio (shown as the Spotlight quote)') + '</label><textarea class="inp" id="pf-bio" maxlength="240" placeholder="' + tr('Ceritakan keahlian atau kebutuhan hukum Anda...', 'Tell us about your expertise or legal needs...') + '">' + esc(u.bio) + '</textarea></div>';
  h += '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sm" id="btn-pf" data-action="save-profile">' + tr('Simpan', 'Save') + '</button><button class="btn ghost sm" data-action="logout">' + tr('Keluar', 'Sign out') + '</button></div></div>';
  el('view').innerHTML = h;
  paintProfilePhoto();
};
function paintProfilePhoto() {
  var box = el('pf-av');
  if (!box) return;
  var f = S.photos[S.user.username];
  box.innerHTML = f ? '<img src="' + esc(f) + '" alt="' + esc(tr('Foto profil', 'Profile photo')) + '">' : esc(initials(S.user.nama || S.user.username));
  if (el('btn-rmph')) el('btn-rmph').hidden = !f;
}
function repaintMyPhoto() { paintMe(); paintProfilePhoto(); paintAvatars(document); }

/* ----- Foto profil: potong persegi + perkecil di browser, kirim sebagai string data URL ----- */
function squareJpeg(img, size, q) {
  var c = document.createElement('canvas');
  c.width = size; c.height = size;
  var g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, size, size);
  var s = Math.min(img.naturalWidth, img.naturalHeight);
  g.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
  return String(c.toDataURL('image/jpeg', q));
}
function handlePhotoFile(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast(tr('Pilih file JPG, PNG, atau WebP.', 'Choose a JPG, PNG or WebP file.'), 'err'); return; }
  if (file.size > 8 * 1024 * 1024) { toast(tr('Ukuran foto maksimal 8 MB.', 'The photo must be 8 MB or smaller.'), 'err'); return; }
  var fr = new FileReader();
  fr.onload = function () {
    var img = new Image();
    img.onload = function () {
      var d = squareJpeg(img, 160, 0.82);
      if (d.length > 44000) d = squareJpeg(img, 128, 0.7);
      uploadPhoto(d);
    };
    img.onerror = function () { toast(tr('Gambar tidak bisa dibaca.', 'The image could not be read.'), 'err'); };
    img.src = String(fr.result);
  };
  fr.onerror = function () { toast(tr('Gambar tidak bisa dibaca.', 'The image could not be read.'), 'err'); };
  fr.readAsDataURL(file);
}
// Optimistic UI: foto langsung tampil, dikembalikan bila server menolak
function uploadPhoto(d) {
  var me = S.user.username, prev = S.photos[me] || '';
  S.photos[me] = d;
  repaintMyPhoto();
  busy('btn-pick', true);
  api('apiSetPhoto', [S.token, String(d)], function (res) {
    busy('btn-pick', false);
    if (!res.ok) { S.photos[me] = prev; repaintMyPhoto(); toast(res.msg, 'err'); return; }
    toast(tr('Foto profil diperbarui.', 'Profile photo updated.'), 'ok');
  }, function (m) { busy('btn-pick', false); S.photos[me] = prev; repaintMyPhoto(); toast(m, 'err'); });
}
function removePhoto() {
  var me = S.user.username, prev = S.photos[me] || '';
  if (!prev) return;
  S.photos[me] = '';
  repaintMyPhoto();
  busy('btn-rmph', true);
  api('apiRemovePhoto', [S.token], function (res) {
    busy('btn-rmph', false);
    if (!res.ok) { S.photos[me] = prev; repaintMyPhoto(); toast(res.msg, 'err'); return; }
    toast(tr('Foto profil dihapus.', 'Profile photo removed.'), 'ok');
  }, function (m) { busy('btn-rmph', false); S.photos[me] = prev; repaintMyPhoto(); toast(m, 'err'); });
}

/* ----- Alat legal: Endorsement Builder, Copyright Tracker, Tax Logger ----- */
VIEWS.contracts = function () {
  var admin = isAdmin();
  var h = head(
    admin ? tr('Verifikasi', 'Verification') : 'Endorsement Builder',
    admin ? tr('Verifikasi kontrak', 'Contract verification') : tr('Kontrak yang jelas, sejak awal', 'Clear agreements from day one'),
    admin ? tr('Setujui atau tolak kontrak kreator. Perubahan status langsung tersimpan.', 'Approve or reject creator contracts. Changes are saved instantly.') : tr('Susun draf kerja sama, lalu ajukan ke tim legal untuk diverifikasi.', 'Draft collaboration terms and submit them to the legal team for review.')
  );
  if (!admin) {
    h += '<div id="credit-widget-box"></div>';
    h += '<div class="grid-2"><div class="card"><h3 style="margin-bottom:14px">' + tr('Detail kerja sama', 'Collaboration details') + '</h3>';
    h += '<div class="fld"><label for="c-brand">' + tr('Nama brand / perusahaan', 'Brand / company name') + '</label><input class="inp" id="c-brand" data-live="draft" placeholder="' + tr('mis. Sekte Abadi', 'e.g. Sekte Abadi') + '"></div>';
    h += '<div class="fld"><label for="c-brand-address">' + tr('Alamat perusahaan', 'Company address') + '</label><textarea class="inp" id="c-brand-address" data-live="draft" placeholder="' + tr('Alamat lengkap perusahaan', 'Full company address') + '"></textarea></div>';
    h += '<div class="row2"><div class="fld"><label for="c-brand-rep">' + tr('Nama perwakilan', 'Representative name') + '</label><input class="inp" id="c-brand-rep" data-live="draft" placeholder="' + tr('mis. John Doe', 'e.g. John Doe') + '"></div>';
    h += '<div class="fld"><label for="c-brand-title">' + tr('Jabatan', 'Job title') + '</label><input class="inp" id="c-brand-title" data-live="draft" placeholder="' + tr('mis. Marketing Director', 'e.g. Marketing Director') + '"></div></div>';
    h += '<div class="row2"><div class="fld"><label for="c-creator-nik">' + tr('NIK kreator', 'Creator ID (NIK)') + '</label><input class="inp" id="c-creator-nik" data-live="draft" placeholder="' + tr('16 digit NIK', '16-digit ID') + '" inputmode="numeric" maxlength="16"></div>';
    h += '<div class="fld"><label for="c-creator-address">' + tr('Alamat kreator', 'Creator address') + '</label><textarea class="inp" id="c-creator-address" data-live="draft" placeholder="' + tr('Alamat domisili/KTP', 'Residential address') + '"></textarea></div></div>';
    h += '<div class="fld"><label for="c-nilai">' + tr('Nilai kontrak (Rp)', 'Contract value (IDR)') + '</label><input class="inp" id="c-nilai" type="number" min="0" inputmode="numeric" data-live="draft" placeholder="1000000"></div>';
    h += '<div class="fld"><label for="c-deliv">Deliverables</label><textarea class="inp" id="c-deliv" data-live="draft" placeholder="' + tr('mis. 2 Instagram Reels 30 detik (satu per baris)', 'e.g. 2 Instagram Reels 30s (one per line)') + '"></textarea></div>';
    h += '<div class="fld"><label for="c-durasi">' + tr('Durasi / jadwal tayang', 'Duration / schedule') + '</label><input class="inp" id="c-durasi" data-live="draft" placeholder="' + tr('mis. 1 - 31 Desember 2026', 'e.g. December 1 - 31, 2026') + '"></div>';
    h += '<div class="row2"><div class="fld"><label for="c-rev">' + tr('Jumlah revisi', 'Revision limit') + '</label><select class="sel" id="c-rev" data-live="draft">' + opts(S.lang === 'en' ? ['1 time', '2 times', '3 times', 'No revision'] : ['1 kali', '2 kali', '3 kali', 'Tanpa revisi'], S.lang === 'en' ? '2 times' : '2 kali') + '</select></div>';
    h += '<div class="fld"><label for="c-hak">' + tr('Hak penggunaan konten', 'Content license duration') + '</label><select class="sel" id="c-hak" data-live="draft">' + opts(S.lang === 'en' ? ['30 days', '90 days', '1 year', 'Unlimited time'] : ['30 hari', '90 hari', '1 tahun', 'Tanpa batas waktu'], S.lang === 'en' ? '30 days' : '30 hari') + '</select></div></div>';
    h += '<div class="fld"><label for="c-bayar">' + tr('Termin pembayaran', 'Payment terms') + '</label><select class="sel" id="c-bayar" data-live="draft">' + opts(S.lang === 'en' ? ['100% upfront', '50% upfront, 50% upon posting', '100% within 7 days after posting'] : ['100% di muka', '50% di muka, 50% setelah tayang', '100% maksimal 7 hari setelah tayang'], S.lang === 'en' ? '50% upfront, 50% upon posting' : '50% di muka, 50% setelah tayang') + '</select></div>';
    h += '<button class="btn block" id="btn-c" data-action="submit-contracts">' + tr('Ajukan untuk verifikasi', 'Submit for verification') + '</button>' + costHint() + '</div>';
    h += '<div class="card"><div class="card-top"><h3>' + tr('Pratinjau draf kontrak', 'Contract draft preview') + '</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" data-action="download-pdf">' + tr('Unduh PDF', 'Download PDF') + '</button><button class="btn ghost sm" data-action="copy-draft">' + tr('Salin draf', 'Copy draft') + '</button></div></div><pre class="draft" id="c-draft"></pre>';
    h += '<p class="muted sm" style="margin-top:10px">' + tr('Draf ini dibuat otomatis dari isian Anda. Ini template umum, bukan nasihat hukum.', 'This draft is generated from your inputs. It is a general template, not legal advice.') + '</p></div></div>';
  }
  h += listShell('contracts', { title: admin ? tr('Antrean kontrak', 'Contract queue') : tr('Riwayat kontrak saya', 'My contracts'), heads: legacyHeads('contracts'), filter: STATUS.contracts, filterLabel: tr('Semua status', 'All statuses'), filterIsStatus: true });
  el('view').innerHTML = h;
  if (!admin) { updateDraft(); renderCreditWidget(); }
  initList('contracts');
};

VIEWS.copyrights = function () {
  var admin = isAdmin();
  var h = head(
    admin ? tr('Penanganan', 'Resolution') : 'Copyright Tracker',
    admin ? tr('Kasus hak cipta', 'Copyright cases') : tr('Lindungi karya Anda', 'Protect your creative work'),
    admin ? tr('Perbarui status penyelesaian setiap laporan pelanggaran.', 'Update the resolution status of each infringement report.') : tr('Laporkan konten yang di-reupload atau dijiplak, lalu pantau progres penanganannya.', 'Report re-uploaded or plagiarised content and track how it is resolved.')
  );
  if (!admin) {
    h += '<div class="card"><h3 style="margin-bottom:14px">' + tr('Laporkan pelanggaran', 'Report an infringement') + '</h3>';
    h += '<div class="tip">' + tr('Simpan bukti sebelum melapor: tangkapan layar, tanggal unggah asli, dan tautan konten Anda.', 'Keep evidence ready: screenshots, original upload dates and links to your content.') + '</div>';
    h += '<div class="fld"><label for="p-link">' + tr('Link pelanggar', 'Infringing link') + '</label><input class="inp" id="p-link" type="url" placeholder="https://..."></div>';
    h += '<div class="fld"><label for="p-desk">' + tr('Deskripsi pelanggaran', 'Description') + '</label><textarea class="inp" id="p-desk" maxlength="500" placeholder="' + tr('Jelaskan konten mana yang dijiplak...', 'Describe which content was plagiarised...') + '"></textarea></div>';
    h += '<button class="btn" id="btn-p" data-action="submit-copyrights">' + tr('Kirim laporan', 'Submit report') + '</button></div>';
  }
  h += listShell('copyrights', { title: admin ? tr('Semua laporan', 'All reports') : tr('Laporan saya', 'My reports'), heads: legacyHeads('copyrights'), filter: STATUS.copyrights, filterLabel: tr('Semua status', 'All statuses'), filterIsStatus: true });
  el('view').innerHTML = h;
  initList('copyrights');
};

VIEWS.taxes = function () {
  var h = head('Tax Logger', tr('Catat penghasilan, lihat estimasi pajak', 'Log earnings, see estimated tax'), tr('Penghasilan dari berbagai platform dan mata uang dikonversi ke Rupiah untuk estimasi kewajiban pajak.', 'Earnings across platforms and currencies are converted to IDR to estimate tax.'));
  h += '<div class="stats s3" id="tax-sum"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';
  h += '<div class="card" id="tax-chart-container" hidden><canvas id="taxChart" height="80" aria-label="' + tr('Grafik pendapatan dan pajak', 'Revenue and tax chart') + '"></canvas></div>';
  h += '<div class="card"><h3 style="margin-bottom:14px">' + tr('Catat penghasilan baru', 'Log new earnings') + '</h3>';
  h += '<div class="row2"><div class="fld"><label for="t-src">' + tr('Sumber penghasilan', 'Revenue source') + '</label><input class="inp" id="t-src" list="t-list" placeholder="' + tr('mis. YouTube AdSense', 'e.g. YouTube AdSense') + '">';
  h += '<datalist id="t-list"><option value="YouTube AdSense"><option value="TikTok Creator Rewards"><option value="Instagram Endorsement"><option value="Twitch"><option value="Spotify Podcast"><option value="Affiliate"></datalist></div>';
  h += '<div class="fld"><label for="t-cur">' + tr('Mata uang', 'Currency') + '</label><select class="sel" id="t-cur" data-live="tax">' + opts(Object.keys(S.cfg.fx), 'IDR') + '</select></div></div>';
  h += '<div class="fld"><label for="t-jml">' + tr('Jumlah', 'Amount') + '</label><input class="inp" id="t-jml" type="number" min="0" step="any" inputmode="decimal" data-live="tax" placeholder="0"></div>';
  h += '<div class="est"><div><span class="muted">' + tr('Setara Rupiah', 'Equivalent IDR') + '</span><br><b id="t-idr">Rp 0</b></div><div style="text-align:right"><span class="muted">' + tr('Estimasi pajak (', 'Est. tax (') + (S.cfg.taxRate * 100) + '%)</span><br><b id="t-est">Rp 0</b></div></div>';
  h += '<button class="btn" id="btn-t" data-action="submit-taxes">' + tr('Simpan pencatatan', 'Save record') + '</button>';
  h += '<p class="muted sm" style="margin-top:10px">' + tr('Estimasi memakai kurs tetap dan tarif PPh Final 0,5% sebagai gambaran. Konsultasikan dengan konsultan pajak.', 'Estimates use fixed exchange rates and a 0.5% final tax rate for illustration. Consult a tax adviser.') + '</p></div>';
  h += listShell('taxes', { title: tr('Riwayat pendapatan', 'Earnings history'), heads: legacyHeads('taxes') });
  el('view').innerHTML = h;
  fetchStats(renderTaxSummary);
  initList('taxes');
};
function renderTaxSummary(st) {
  var box = el('tax-sum');
  if (!box) return;
  box.innerHTML = statCard(tr('Total pendapatan', 'Total revenue'), rp(st.taxes.income), nf(st.taxes.count) + ' ' + tr('transaksi', 'transactions'), 'var(--ok)')
    + statCard(tr('Estimasi pajak', 'Estimated tax'), rp(st.taxes.tax), tr('Akumulasi seluruh catatan', 'All records combined'), 'var(--accent)')
    + statCard(tr('Pendapatan bersih estimasi', 'Estimated net income'), rp(st.taxes.income - st.taxes.tax), tr('Setelah estimasi pajak', 'After estimated tax'), 'var(--brand)');
  var wrap = el('tax-chart-container'), ctx = el('taxChart');
  if (wrap && ctx && typeof Chart !== 'undefined') {
    wrap.hidden = false;
    if (window.taxChartInstance) window.taxChartInstance.destroy();
    window.taxChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [tr('Pendapatan kotor', 'Gross revenue'), tr('Estimasi pajak', 'Estimated tax'), tr('Pendapatan bersih', 'Net income')],
        datasets: [{ label: tr('Nilai (IDR)', 'Amount (IDR)'), data: [st.taxes.income, st.taxes.tax, st.taxes.income - st.taxes.tax], backgroundColor: [cssBrand(), '#E0A458', '#4FB3AA'], borderRadius: 8, maxBarThickness: 70 }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return rp(c.parsed.y); } } } },
        scales: { y: { beginAtZero: true, grid: { color: '#EEF0F3' }, ticks: { callback: function (v) { return nf(v); } } }, x: { grid: { display: false } } }
      }
    });
  }
}
function updateTaxPreview() {
  if (!el('t-est')) return;
  var j = Number(val('t-jml')) || 0;
  var fx = S.cfg.fx[val('t-cur') || 'IDR'] || 0;
  el('t-idr').textContent = rp(j * fx);
  el('t-est').textContent = rp(j * fx * S.cfg.taxRate);
}

/* ============ Draf kontrak (live) & PDF ============ */
function creatorName() { return S.user ? (S.user.nama || S.user.username) : '[Kreator]'; }
function updateDraft() {
  var d = el('c-draft');
  if (!d) return;
  var brand = val('c-brand') || '[Nama Brand]';
  var brandAddress = val('c-brand-address') || '[Alamat Lengkap Perusahaan]';
  var brandRep = val('c-brand-rep') || '[Nama Perwakilan]';
  var brandTitle = val('c-brand-title') || '[Jabatan]';
  var kreator = creatorName();
  var creatorNik = val('c-creator-nik') || '[Nomor NIK]';
  var creatorAddress = val('c-creator-address') || '[Alamat Lengkap Kreator]';
  var nilai = Number(val('c-nilai')) || 0;
  var dt = new Date();
  var hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dt.getDay()];
  var tglStr = dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  var t = 'PERJANJIAN KERJA SAMA ENDORSEMENT\n\n';
  t += 'Tanggal: ' + hari + ', ' + tglStr + '\n\n';
  t += 'PIHAK PERTAMA (Brand)\n';
  t += 'Nama   : ' + brand + '\n';
  t += 'Alamat : ' + brandAddress + '\n';
  t += 'Wakil  : ' + brandRep + ' (' + brandTitle + ')\n\n';
  t += 'PIHAK KEDUA (Kreator)\n';
  t += 'Nama   : ' + kreator + '\n';
  t += 'NIK    : ' + creatorNik + '\n';
  t += 'Alamat : ' + creatorAddress + '\n\n';
  t += 'PASAL 1 - RUANG LINGKUP\n' + (val('c-deliv') || '[Spesifikasi konten]') + '\n\n';
  t += 'PASAL 2 - JANGKA WAKTU\nPeriode penayangan: ' + (val('c-durasi') || '[Periode]') + '\n\n';
  t += 'PASAL 3 - NILAI & PEMBAYARAN\nNilai: ' + (nilai ? rp(nilai) : '[Nilai]') + '\nTermin: ' + val('c-bayar') + '\n\n';
  t += 'PASAL 4 - REVISI KONTEN\nMaksimal revisi: ' + val('c-rev') + '\n\n';
  t += 'PASAL 5 - HAK PENGGUNAAN\nLisensi promosi selama: ' + val('c-hak') + '. Hak Cipta tetap pada Pihak Kedua.\n\n';
  t += 'PASAL 6 & 7 - LAINNYA\nPembatalan sepihak DP hangus. Sengketa diselesaikan musyawarah mufakat.\n\n';
  t += 'Pihak Pertama,                    Pihak Kedua,\n\n\n(' + brand + ')                    (' + kreator + ')';
  d.textContent = t;
}
function copyDraft() {
  var d = el('c-draft');
  if (!d) return;
  var txt = d.textContent;
  var done = function () { toast(tr('Draf disalin.', 'Draft copied.'), 'ok'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); });
  } else { fallbackCopy(txt); done(); }
}
function fallbackCopy(txt) {
  var ta = document.createElement('textarea');
  ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  ta.remove();
}
function downloadPdf() {
  if (typeof html2pdf === 'undefined') { toast(tr('Library PDF belum dimuat.', 'PDF library is not loaded yet.'), 'err'); return; }
  toast(tr('Menyiapkan dokumen PDF...', 'Preparing PDF document...'), 'info');

  var brand = val('c-brand') || '[Nama Brand]';
  var brandAddress = val('c-brand-address') || '[Alamat Lengkap Perusahaan]';
  var brandRep = val('c-brand-rep') || '[Nama Perwakilan]';
  var brandTitle = val('c-brand-title') || '[Jabatan]';
  var kreator = creatorName();
  var creatorNik = val('c-creator-nik') || '[Nomor NIK]';
  var creatorAddress = val('c-creator-address') || '[Alamat Lengkap Kreator]';
  var nilai = Number(val('c-nilai')) || 0;
  var delivRaw = val('c-deliv') || '2 instagram reels 30 detik\n1 instagram story';
  var delivLines = delivRaw.split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
  var delivHtml = '';
  var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  for (var i = 0; i < delivLines.length; i++) {
    var cleanLine = delivLines[i].replace(/^[a-zA-Z0-9][\.\)]\s*/, '');
    var prefix = (letters[i] ? letters[i] : (i + 1)) + '. ';
    delivHtml += '<div style="margin-bottom: 4px; padding-left: 36px; text-indent: -18px;">' + prefix + esc(cleanLine) + '</div>';
  }
  var durasi = val('c-durasi') || '[Periode penayangan]';
  var bayar = val('c-bayar') || '[Termin Pembayaran]';
  var rev = val('c-rev') || '[Jumlah Revisi]';
  var hak = val('c-hak') || '[Hak Penggunaan]';
  var d = new Date();
  var hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
  var tanggalStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  var html = '<div style="font-family: \'Times New Roman\', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; text-align: justify; padding: 0;">';
  html += '<p style="text-align: center; font-weight: bold; margin-bottom: 20px;">PERJANJIAN KERJA SAMA ENDORSEMENT</p>';
  html += '<p style="margin-bottom:10px;">Pada hari ini, ' + hari + ', tanggal ' + tanggalStr + ', yang bertanda tangan di bawah ini:</p>';
  html += '<p style="margin-bottom:10px;">I. <strong>' + esc(brand) + '</strong>, suatu Badan Usaha yang didirikan berdasarkan hukum Negara Republik Indonesia, berkedudukan di ' + esc(brandAddress) + ', dalam hal ini diwakili oleh ' + esc(brandRep) + ' selaku ' + esc(brandTitle) + ', dari dan oleh karenanya sah bertindak untuk dan atas nama <strong>' + esc(brand) + '</strong>. Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</p>';
  html += '<p style="margin-bottom:10px;">II. <strong>' + esc(kreator) + '</strong>, seorang warga negara Indonesia, pemegang Nomor Induk Kependudukan (NIK) ' + esc(creatorNik) + ', beralamat di ' + esc(creatorAddress) + ', bertindak untuk dan atas nama diri sendiri. Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.</p>';
  html += '<p style="margin-bottom:10px;">PIHAK PERTAMA dan PIHAK KEDUA (selanjutnya secara bersama-sama disebut "PARA PIHAK" dan secara sendiri-sendiri disebut "PIHAK") terlebih dahulu menerangkan hal-hal sebagai berikut:</p>';
  html += '<p style="margin-top:0; margin-bottom:10px; padding-left:20px;">a. Bahwa PIHAK PERTAMA adalah pihak yang bergerak di bidang [Bidang Usaha] dan merupakan pemilik sah dari merek ' + esc(brand) + '.<br>';
  html += 'b. Bahwa PIHAK KEDUA adalah seorang kreator konten (content creator) profesional yang menyediakan jasa promosi (endorsement) melalui platform media sosial.<br>';
  html += 'c. Bahwa PIHAK PERTAMA bermaksud untuk menggunakan jasa PIHAK KEDUA untuk mempromosikan produk, dan PIHAK KEDUA sepakat untuk melaksanakan pekerjaan tersebut.</p>';
  html += '<p style="margin-bottom:20px;">Berdasarkan hal-hal tersebut di atas, PARA PIHAK sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama Endorsement ("Perjanjian") dengan syarat dan ketentuan sebagai berikut:</p>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 1<br>RUANG LINGKUP KERJA SAMA</p>';
  html += '<p style="margin-top:0; margin-bottom: 4px;">1. PIHAK PERTAMA menunjuk PIHAK KEDUA, dan PIHAK KEDUA menerima penunjukan tersebut untuk melaksanakan jasa promosi (endorsement) untuk produk PIHAK PERTAMA.</p>';
  html += '<div style="margin-top:0; margin-bottom: 4px;">2. Detail mengenai spesifikasi konten dan platform media sosial adalah sebagai berikut:</div>';
  html += delivHtml;
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 2<br>JANGKA WAKTU</p>';
  html += '<p style="margin-top:0;">Perjanjian ini berlaku efektif untuk periode penayangan: ' + esc(durasi) + ', kecuali diakhiri lebih awal berdasarkan ketentuan dalam Perjanjian ini.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 3<br>NILAI KERJA SAMA DAN TATA CARA PEMBAYARAN</p>';
  html += '<p style="margin-top:0;">1. Nilai kerja sama yang disepakati oleh PARA PIHAK untuk pelaksanaan Perjanjian ini adalah sebesar <strong>' + (nilai ? rp(nilai) : '[Nilai]') + '</strong>.<br>';
  html += '2. Pembayaran akan dilakukan oleh PIHAK PERTAMA kepada PIHAK KEDUA melalui sistem termin sebagai berikut: ' + esc(bayar) + '.<br>';
  html += '3. Pembayaran dilakukan melalui transfer antar bank ke rekening milik PIHAK KEDUA.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 4<br>REVISI KONTEN</p>';
  html += '<p style="margin-top:0;">1. PIHAK KEDUA wajib menyampaikan pratinjau (preview) konten kepada PIHAK PERTAMA sebelum ditayangkan kepada publik.<br>';
  html += '2. PIHAK PERTAMA memiliki hak untuk meminta penyesuaian atau revisi atas konten tersebut dengan batas maksimal: ' + esc(rev) + '.<br>';
  html += '3. Revisi yang diminta tidak boleh menyimpang secara signifikan dari ruang lingkup awal yang telah disepakati.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 5<br>HAK KEKAYAAN INTELEKTUAL DAN PENGGUNAAN KONTEN</p>';
  html += '<p style="margin-top:0;">1. Hak Kekayaan Intelektual (Hak Cipta) atas materi konten yang diproduksi sepenuhnya tetap berada pada PIHAK KEDUA.<br>';
  html += '2. PIHAK KEDUA memberikan hak eksklusif terbatas (lisensi) kepada PIHAK PERTAMA untuk menggunakan dan menayangkan ulang konten tersebut sebagai media promosi selama: ' + esc(hak) + '.<br>';
  html += '3. Penggunaan konten oleh PIHAK PERTAMA di luar batas waktu tersebut mewajibkan adanya kesepakatan komersial tertulis yang baru.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 6<br>PEMBATALAN DAN PENGAKHIRAN</p>';
  html += '<p style="margin-top:0;">1. Dalam hal PIHAK PERTAMA melakukan pembatalan sepihak setelah proses produksi konten telah dilakukan, maka pembayaran yang telah diterima oleh PIHAK KEDUA tidak dapat dikembalikan (non-refundable).<br>';
  html += '2. Pembatalan wajib diberitahukan secara tertulis sebelum tanggal penayangan yang disepakati.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 7<br>PENYELESAIAN SENGKETA</p>';
  html += '<p style="margin-top:0;">1. Segala bentuk perselisihan yang timbul dari pelaksanaan Perjanjian ini akan diselesaikan secara musyawarah untuk mufakat terlebih dahulu sebelum menempuh jalur hukum.<br>';
  html += '2. Apabila musyawarah untuk mufakat tidak tercapai, maka PARA PIHAK sepakat untuk menyelesaikan perselisihan tersebut melalui Kepaniteraan Pengadilan Negeri setempat.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="text-align:center; font-weight:bold; margin:15px 0 5px;">PASAL 8<br>LAIN-LAIN</p>';
  html += '<p style="margin-top:0;">Hal-hal yang belum diatur atau belum cukup diatur dalam Perjanjian ini akan dituangkan dalam suatu Adendum yang merupakan satu kesatuan dan bagian tidak terpisahkan dari Perjanjian ini.</p>';
  html += '</div>';

  html += '<div style="page-break-inside: avoid;">';
  html += '<p style="margin-top:15px;">Demikian Perjanjian ini dibuat dalam rangkap 2 (dua), masing-masing bermaterai cukup dan memiliki kekuatan hukum yang sama.</p>';
  html += '<table style="width: 100%; text-align: center; margin-top: 40px; font-size: 12pt;"><tr>';
  html += '<td style="width: 50%;">PIHAK PERTAMA,<br><br><br><br><br><br><strong>(' + esc(brand) + ')</strong></td>';
  html += '<td style="width: 50%;">PIHAK KEDUA,<br><br><br><br><br><br><strong>(' + esc(kreator) + ')</strong></td>';
  html += '</tr></table>';
  html += '</div>';
  html += '</div>';

  var printContainer = document.createElement('div');
  printContainer.innerHTML = html;
  var opt = {
    margin: [1, 0.6, 1, 0.6],
    filename: 'Kontrak_Endorsement_' + String(brand).replace(/[^A-Za-z0-9]+/g, '_') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(printContainer).save().then(function () {
    toast(tr('PDF berhasil diunduh.', 'PDF downloaded.'), 'ok');
  });
}

/* ============ Optimistic UI: alat legal ============ */
function optRow(key, p) {
  var now = nowStamp(), u = S.user.username;
  if (key === 'contracts') return ['...', now, u, p.brand, String(Math.round(p.nilai)), 'Menunggu Verifikasi'];
  if (key === 'copyrights') return ['...', now, u, p.link, p.desk, 'Dilaporkan'];
  var fx = S.cfg.fx[p.mataUang] || 0;
  return ['...', now, u, p.sumber, p.mataUang, String(p.jumlah), String(Math.round(p.jumlah * fx * S.cfg.taxRate))];
}
function submitCreate(key, p, btnId, onClear) {
  var st = L[key], tb = el('box-' + key);
  if (!st || !tb) return;
  var temp = optRow(key, p);
  var tr0 = htmlToRow(legacyRow(key, temp, true));
  tb.insertBefore(tr0, tb.firstChild);
  st.total++; refreshMeta(key);
  var taxIdr = 0, taxEst = 0;
  if (key === 'taxes' && S.stats) {
    taxIdr = p.jumlah * (S.cfg.fx[p.mataUang] || 0);
    taxEst = Math.round(taxIdr * S.cfg.taxRate);
    S.stats.taxes.count++; S.stats.taxes.income += taxIdr; S.stats.taxes.tax += taxEst;
    renderTaxSummary(S.stats);
  }
  var rollback = function (msg) {
    if (tr0.parentNode) tr0.remove();
    st.total--; refreshMeta(key);
    if (key === 'taxes' && S.stats) {
      S.stats.taxes.count--; S.stats.taxes.income -= taxIdr; S.stats.taxes.tax -= taxEst;
      renderTaxSummary(S.stats);
    }
    busy(btnId, false);
    toast(msg || tr('Gagal menyimpan.', 'Failed to save.'), 'err');
    maybeTopUp(msg);
  };
  busy(btnId, true);
  if (onClear) onClear();
  api(CREATE_FN[key], [S.token, p], function (res) {
    if (!res.ok) { rollback(res.msg); return; }
    var row = res.row || temp.slice();
    if (!res.row) row[0] = 'DEMO-0001';
    var nt = htmlToRow(legacyRow(key, row, false));
    nt.classList.add('fresh');
    if (tr0.parentNode) tr0.parentNode.replaceChild(nt, tr0);
    st.keys[row[0] + '|' + row[1]] = 1;
    if (key !== 'taxes') resetStats();
    applyCreditInfo(res.creditInfo);
    busy(btnId, false);
    var info = '';
    if (res.creditInfo) info = res.creditInfo.type === 'quota' ? tr(' (1 kuota terpakai)', ' (1 quota used)') : tr(' (poin terpakai)', ' (points used)');
    toast(tr('Tersimpan: ', 'Saved: ') + row[0] + info, 'ok');
  }, function (m) { rollback(m); });
}
function submitContract() {
  var p = { brand: val('c-brand'), nilai: Number(val('c-nilai')) };
  if (!p.brand) { toast(tr('Nama brand wajib diisi.', 'Brand name is required.'), 'err'); el('c-brand').focus(); return; }
  if (!(p.nilai > 0)) { toast(tr('Nilai kontrak harus lebih dari 0.', 'Contract value must be greater than 0.'), 'err'); el('c-nilai').focus(); return; }
  submitCreate('contracts', p, 'btn-c', function () {
    var ids = ['c-brand', 'c-brand-address', 'c-brand-rep', 'c-brand-title', 'c-creator-nik', 'c-creator-address', 'c-nilai', 'c-deliv', 'c-durasi'];
    for (var i = 0; i < ids.length; i++) if (el(ids[i])) el(ids[i]).value = '';
    updateDraft();
  });
}
function submitCopyright() {
  var p = { link: val('p-link'), desk: val('p-desk') };
  if (!/^https?:\/\/\S+$/i.test(p.link)) { toast(tr('Link harus diawali http:// atau https://', 'Link must start with http:// or https://'), 'err'); el('p-link').focus(); return; }
  if (!p.desk) { toast(tr('Deskripsi wajib diisi.', 'Description is required.'), 'err'); el('p-desk').focus(); return; }
  submitCreate('copyrights', p, 'btn-p', function () { el('p-link').value = ''; el('p-desk').value = ''; });
}
function submitTax() {
  var p = { sumber: val('t-src'), mataUang: val('t-cur'), jumlah: Number(val('t-jml')) };
  if (!p.sumber) { toast(tr('Sumber penghasilan wajib diisi.', 'Revenue source is required.'), 'err'); el('t-src').focus(); return; }
  if (!(p.jumlah > 0)) { toast(tr('Jumlah harus lebih dari 0.', 'Amount must be greater than 0.'), 'err'); el('t-jml').focus(); return; }
  submitCreate('taxes', p, 'btn-t', function () { el('t-src').value = ''; el('t-jml').value = ''; updateTaxPreview(); });
}

/* ============ Optimistic UI: sosial ============ */
function submitPost() {
  var p = { kategori: val('p-kat'), isi: val('p-isi') };
  if (p.isi.length < 10) { toast(tr('Isi postingan minimal 10 karakter.', 'A post needs at least 10 characters.'), 'err'); el('p-isi').focus(); return; }
  var u = S.user;
  var temp = ['...', nowStamp(), u.username, p.kategori, p.isi, '0', '0', u.nama, u.bidang, '1'];
  var node = prependRow('feed', postHtml(temp, true));
  el('p-isi').value = '';
  busy('btn-post', true);
  var undo = function (msg) {
    busy('btn-post', false);
    if (node) node.remove(); L.feed.total--; refreshMeta('feed'); el('p-isi').value = p.isi; toast(msg, 'err');
  };
  api('apiCreatePost', [S.token, p], function (res) {
    if (!res.ok) { undo(res.msg); return; }
    busy('btn-post', false);
    if (el('cp-form')) el('cp-form').hidden = true;
    if (res.row) {
      var nn = htmlToNode(postHtml(res.row, false));
      nn.classList.add('fresh');
      if (node && node.parentNode) node.parentNode.replaceChild(nn, node);
      L.feed.keys[res.row[0] + '|' + res.row[1]] = 1;
    } else if (node) { node.classList.remove('is-pending'); }
    resetStats();
    toast(tr('Postingan terbit.', 'Post published.'), 'ok');
  }, undo);
}
function submitQuestion() {
  var p = { kategori: val('q-kat'), teks: val('q-teks') };
  if (!p.kategori) { toast(tr('Pilih kategori.', 'Choose a category.'), 'err'); return; }
  if (p.teks.length < 10) { toast(tr('Pertanyaan minimal 10 karakter.', 'A question needs at least 10 characters.'), 'err'); el('q-teks').focus(); return; }
  var temp = ['...', nowStamp(), S.user.username, p.kategori, p.teks, 'Terbuka', '0', S.user.nama];
  var node = prependRow('ask', questionHtml(temp, true));
  el('q-teks').value = '';
  busy('btn-q', true);
  var undo = function (msg) {
    busy('btn-q', false);
    if (node) node.remove(); L.ask.total--; refreshMeta('ask'); el('q-teks').value = p.teks; toast(msg, 'err');
    maybeTopUp(msg);
  };
  api('apiCreateQuestion', [S.token, p], function (res) {
    if (!res.ok) { undo(res.msg); return; }
    busy('btn-q', false);
    if (res.row) {
      var nn = htmlToNode(questionHtml(res.row, false));
      nn.classList.add('fresh');
      if (node && node.parentNode) node.parentNode.replaceChild(nn, node);
      L.ask.keys[res.row[0] + '|' + res.row[1]] = 1;
    } else if (node) { node.classList.remove('is-pending'); }
    applyCreditInfo(res.creditInfo);
    resetStats();
    toast(tr('Pertanyaan terkirim.', 'Question sent.'), 'ok');
  }, undo);
}
function toggleLike(btn) {
  var item = btn.closest('.item');
  if (!item) return;
  var was = btn.classList.contains('liked');
  var cnt = btn.querySelector('.cnt');
  var n = parseInt(String(cnt.textContent).replace(/\D/g, ''), 10) || 0;
  btn.classList.toggle('liked', !was);
  cnt.textContent = nf(was ? Math.max(0, n - 1) : n + 1);
  var back = function () { btn.classList.toggle('liked', was); cnt.textContent = nf(n); toast(tr('Gagal memperbarui suka.', 'Could not update like.'), 'err'); };
  api('apiToggleLike', [S.token, String(item.getAttribute('data-id')), String(item.getAttribute('data-tgl'))], function (res) {
    if (!res.ok) { back(); return; }
    if (res.suka != null) { btn.classList.toggle('liked', res.liked === 1); cnt.textContent = nf(res.suka); }
  }, back);
}
function toggleAnswers(btn) {
  var item = btn.closest('.item');
  var box = item.querySelector('.ans');
  if (!box.hidden) { box.hidden = true; return; }
  box.hidden = false;
  if (box.getAttribute('data-loaded') === '1') return;
  box.innerHTML = '<div class="loader"><span class="spin"></span> ' + tr('Memuat jawaban...', 'Loading answers...') + '</div>';
  api('apiAnswers', [S.token, String(item.getAttribute('data-id')), String(item.getAttribute('data-tgl'))], function (res) {
    if (!res.ok) { box.innerHTML = ''; toast(res.msg, 'err'); return; }
    var h = '';
    for (var i = 0; i < res.rows.length; i++) h += answerHtml(res.rows[i], false);
    box.innerHTML = h || '<p class="muted sm">' + tr('Belum ada jawaban.', 'No answers yet.') + '</p>';
    box.setAttribute('data-loaded', '1');
    ensurePhotos(box);
  }, function (m) { box.innerHTML = ''; toast(m, 'err'); });
}
function openReply(btn) {
  var item = btn.closest('.item');
  if (item.querySelector('.reply')) return;
  var d = document.createElement('div');
  d.className = 'reply';
  d.innerHTML = '<textarea class="inp" maxlength="1000" placeholder="' + tr('Tulis jawaban Anda...', 'Write your answer...') + '"></textarea><div><button class="btn sm" data-action="send-ans">' + tr('Kirim jawaban', 'Send answer') + '</button></div>';
  item.appendChild(d);
  d.querySelector('textarea').focus();
}
function sendAnswer(btn) {
  var item = btn.closest('.item');
  var ta = item.querySelector('.reply textarea');
  var teks = String(ta.value).trim();
  if (teks.length < 10) { toast(tr('Jawaban minimal 10 karakter.', 'An answer needs at least 10 characters.'), 'err'); return; }
  var box = item.querySelector('.ans');
  box.hidden = false;
  if (box.getAttribute('data-loaded') !== '1') { box.innerHTML = ''; box.setAttribute('data-loaded', '1'); }
  var u = S.user;
  var node = htmlToNode(answerHtml(['...', nowStamp(), u.username, teks, u.nama, u.bidang], true));
  var empt = box.querySelector('p.muted');
  if (empt) empt.remove();
  box.appendChild(node);
  ta.value = '';
  busyEl(btn, true);
  var undo = function (msg) { busyEl(btn, false); node.remove(); ta.value = teks; toast(msg, 'err'); };
  api('apiCreateAnswer', [S.token, { qid: String(item.getAttribute('data-id')), tgl: String(item.getAttribute('data-tgl')), jawaban: teks }], function (res) {
    if (!res.ok) { undo(res.msg); return; }
    busyEl(btn, false);
    if (res.row) {
      var nn = htmlToNode(answerHtml(res.row, false));
      nn.classList.add('fresh');
      node.parentNode.replaceChild(nn, node);
    } else { node.classList.remove('is-pending'); }
    var ac = item.querySelector('.ac');
    if (ac) ac.textContent = nf((parseInt(String(ac.textContent).replace(/\D/g, ''), 10) || 0) + 1);
    var st = item.querySelector('.st');
    if (st) st.innerHTML = badge('Terjawab');
    var rp0 = item.querySelector('.reply');
    if (rp0) rp0.remove();
    resetStats();
    toast(tr('Jawaban terkirim.', 'Answer sent.'), 'ok');
  }, undo);
}

/* ----- Booking (modal) ----- */
function openModal(html) { el('sheet').innerHTML = html; el('modal').hidden = false; }
function closeModal() { el('modal').hidden = true; el('sheet').innerHTML = ''; }
function openBook(item) {
  var u = String(item.getAttribute('data-user')), nama = String(item.getAttribute('data-nama'));
  var sv = S.cfg.services, keys = Object.keys(sv);
  var h = '<h3>' + tr('Booking konsultasi', 'Book a consultation') + '</h3><p class="muted sm" style="margin-bottom:16px">' + tr('dengan ', 'with ') + esc(nama) + '</p>';
  h += '<div class="fld"><label for="bk-svc">' + tr('Layanan', 'Service') + '</label><select class="sel" id="bk-svc" data-live="bk">';
  for (var i = 0; i < keys.length; i++) h += '<option value="' + esc(keys[i]) + '">' + esc(sv[keys[i]].label) + ' - ' + rp(sv[keys[i]].price) + '</option>';
  h += '</select></div><div class="sum"><div><span>' + tr('Tarif', 'Price') + '</span><b id="bk-price"></b></div><div><span>' + tr('Komisi platform (dari pakar)', 'Platform fee (paid by expert)') + '</span><b id="bk-comm"></b></div></div>';
  h += '<p class="muted sm" style="margin-bottom:16px">' + tr('Pembayaran disimulasikan pada versi prototipe ini.', 'Payment is simulated in this prototype.') + '</p>';
  h += '<div style="display:flex;gap:10px"><button class="btn" data-action="confirm-book" data-u="' + esc(u) + '" style="flex:1">' + tr('Kirim permintaan', 'Send request') + '</button><button class="btn ghost" data-action="close-x">' + tr('Batal', 'Cancel') + '</button></div>';
  openModal(h);
  updateBookSum();
}
function updateBookSum() {
  var s = S.cfg.services[val('bk-svc')];
  var price = s ? s.price : 0;
  if (el('bk-price')) { el('bk-price').textContent = rp(price); el('bk-comm').textContent = rp(price * S.cfg.commission); }
}
function confirmBook(btn) {
  var p = { expert: String(btn.getAttribute('data-u')), svc: val('bk-svc') };
  closeModal();
  toast(tr('Mengirim permintaan booking...', 'Sending booking request...'), 'info');
  api('apiCreateBooking', [S.token, p], function (res) {
    if (!res.ok) { toast(res.msg, 'err'); return; }
    resetStats();
    toast(tr('Booking terkirim', 'Booking sent') + (res.row ? ': ' + res.row[0] : '') + '. ' + tr('Menunggu konfirmasi pakar.', 'Waiting for the expert to confirm.'), 'ok');
  }, function (m) { toast(m, 'err'); });
}

/* ----- Perubahan status (Admin/Pakar) dengan optimistic UI + rollback ----- */
function changeStatus(sel, fn, argsFn, after) {
  var row = sel.closest('tr');
  if (!row) return;
  var prev = sel.getAttribute('data-prev'), next = String(sel.value);
  sel.setAttribute('data-prev', next);
  sel.className = 'status-sel ' + toneOf(next);
  row.classList.add('is-pending');
  var back = function (msg) {
    row.classList.remove('is-pending');
    sel.value = prev; sel.setAttribute('data-prev', prev); sel.className = 'status-sel ' + toneOf(prev);
    toast(msg || tr('Gagal memperbarui status.', 'Could not update status.'), 'err');
  };
  api(fn, argsFn(row, next), function (res) {
    if (!res.ok) { back(res.msg); return; }
    row.classList.remove('is-pending');
    resetStats();
    toast(tr('Status diperbarui: ', 'Status updated: ') + stLabel(next), 'ok');
    if (after) after(sel, next);
  }, back);
}
function saveProfile() {
  var p = { nama: val('pf-nama'), bio: val('pf-bio'), bidang: el('pf-bidang') ? val('pf-bidang') : '' };
  if (!p.nama) { toast(tr('Nama wajib diisi.', 'Name is required.'), 'err'); return; }
  busy('btn-pf', true);
  api('apiUpdateProfile', [S.token, p], function (res) {
    busy('btn-pf', false);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    if (res.user) { S.user = res.user; renderMeMenu(); paintMe(); if (S.view === 'profile') VIEWS.profile(); }
    toast(tr('Profil disimpan.', 'Profile saved.'), 'ok');
  }, function (m) { busy('btn-pf', false); toast(m, 'err'); });
}

/* ============ Event delegation ============ */
document.addEventListener('click', function (e) {
  var dd = el('clhDropdown'), md = el('meDd'), mo = el('moreDd');
  if (dd && dd.classList.contains('show') && !e.target.closest('.clh-notif-wrapper')) dd.classList.remove('show');
  if (md && md.classList.contains('show') && !e.target.closest('.me-wrap')) md.classList.remove('show');
  if (mo && mo.classList.contains('show') && !e.target.closest('.nav-more')) mo.classList.remove('show');
  var pp = el('palPop');
  if (pp && !pp.hidden && !e.target.closest('#palPop') && !e.target.closest('[data-action=pal-pop]')) closePalPop();
  var t = e.target.closest ? e.target.closest('[data-action]') : null;
  if (!t) return;
  var a = t.getAttribute('data-action');
  if (a === 'close') { if (e.target === t) closeModal(); return; }
  if (a === 'status' || a === 'bk-status') return;
  if (a === 'nav') go(t.getAttribute('data-view'));
  else if (a === 'to-login') { showAuth('login'); if (t.getAttribute('data-msg') === 'book') toast(tr('Masuk atau daftar dulu untuk booking konsultasi.', 'Sign in or sign up to book a session.'), 'info'); }
  else if (a === 'to-reg') showAuth('reg', t.getAttribute('data-role'));
  else if (a === 'to-landing') showLanding();
  else if (a === 'lp-scroll') lpScrollTo(String(t.getAttribute('data-to')));
  else if (a === 'lp-prev') lpGo(LP.idx - 1);
  else if (a === 'lp-next') lpGo(LP.idx + 1);
  else if (a === 'lp-dot') lpGo(parseInt(t.getAttribute('data-i'), 10) || 0);
  else if (a === 'lp-menu') { var nv = el('lp-nav'); if (nv) { var op = nv.classList.toggle('open'); t.setAttribute('aria-expanded', op ? 'true' : 'false'); } }
  else if (a === 'me-menu') toggleDrop('meDd');
  else if (a === 'more-menu') toggleDrop('moreDd');
  else if (a === 'compose') openComposer();
  else if (a === 'compose-x') { if (el('cp-form')) el('cp-form').hidden = true; }
  else if (a === 'ask-go') { go('ask'); setTimeout(function () { if (el('q-teks')) el('q-teks').focus(); }, 60); }
  else if (a === 'share-post') sharePost(t);
  else if (a === 'expert-open') { S.exp = String(t.getAttribute('data-user')); closeModal(); go('expert'); }
  else if (a === 'rate-booking') rateBooking(t);
  else if (a === 'rate-target') rateTarget(t);
  else if (a === 'rate-answer') rateAnswer(t);
  else if (a === 'rf-star') pickStar(parseInt(t.getAttribute('data-v'), 10) || 0);
  else if (a === 'rf-tag') toggleTag(t);
  else if (a === 'rf-send') submitRating();
  else if (a === 'rv-filter') setReviewFilter(String(t.getAttribute('data-f')));
  else if (a === 'rv-reply-open') openReviewReply(t);
  else if (a === 'rv-reply-send') sendReviewReply(t);
  else if (a === 'rv-reply-x') { var it0 = t.closest('.item'); var rp0 = it0.querySelector('.reply'); if (rp0) rp0.remove(); var ob = it0.querySelector('[data-action=rv-reply-open]'); if (ob) ob.hidden = false; }
  else if (a === 'rv-mod') moderateReview(t);
  else if (a === 'pane') switchPane(t.getAttribute('data-t'));
  else if (a === 'role') setRole(t.getAttribute('data-r'));
  else if (a === 'lang') setLang(t.getAttribute('data-l'));
  else if (a === 'lamp') toggleLampTheme();
  else if (a === 'pal') pickPalette(String(t.getAttribute('data-k')));
  else if (a === 'pal-pop') togglePalPop(t);
  else if (a === 'eye') togglePw(t.getAttribute('data-target'));
  else if (a === 'forgot') toast(tr('Hubungi admin Legal Hub untuk mereset password.', 'Contact the Legal Hub admin to reset your password.'), 'info');
  else if (a === 'discover') { toast(tr('Masuk atau daftar untuk menemukan pakar lainnya.', 'Sign in or sign up to discover more experts.'), 'info'); el('l-user').focus(); }
  else if (a === 'login') doLogin();
  else if (a === 'demo-fill') fillDemo(t);
  else if (a === 'register') doRegister();
  else if (a === 'logout') { closeDrops(); doLogout(); }
  else if (a === 'notif') toggleNotif();
  else if (a === 'notif-read') markNotifRead();
  else if (a === 'topup') { closeDrops(); openTopUp(); }
  else if (a === 'do-topup') doTopUp(t);
  else if (a === 'more') loadMore(t.getAttribute('data-key'), false);
  else if (a === 'submit-contracts') submitContract();
  else if (a === 'submit-copyrights') submitCopyright();
  else if (a === 'submit-taxes') submitTax();
  else if (a === 'copy-draft') copyDraft();
  else if (a === 'download-pdf') downloadPdf();
  else if (a === 'post') submitPost();
  else if (a === 'ask') submitQuestion();
  else if (a === 'like') toggleLike(t);
  else if (a === 'toggle-ans') toggleAnswers(t);
  else if (a === 'open-reply') openReply(t);
  else if (a === 'send-ans') sendAnswer(t);
  else if (a === 'book') openBook(t.closest('[data-user]'));
  else if (a === 'confirm-book') confirmBook(t);
  else if (a === 'close-x') closeModal();
  else if (a === 'save-profile') saveProfile();
  else if (a === 'pick-photo') { if (el('pf-file')) el('pf-file').click(); }
  else if (a === 'rm-photo') removePhoto();
  else if (a === 'review') openReview(String(t.getAttribute('data-key')));
  else if (a === 'rv-act') doReview(t);
  else if (a === 'scr-save') saveScreening();
  else if (a === 'im-scan') runImport(true);
  else if (a === 'im-run') runImport(false);
});
document.addEventListener('input', function (e) {
  var t = e.target;
  var lv = t.getAttribute ? t.getAttribute('data-live') : null;
  if (lv === 'draft') updateDraft();
  else if (lv === 'tax') updateTaxPreview();
  else if (lv === 'pal-custom') customPalette(String(t.value), false);
  else if (lv === 'search') {
    var key = t.getAttribute('data-key');
    clearTimeout(L[key].timer);
    L[key].timer = setTimeout(function () { L[key].q = String(t.value).trim(); loadMore(key, true); }, 350);
  }
});
document.addEventListener('change', function (e) {
  var t = e.target;
  if (!t.getAttribute) return;
  var lv = t.getAttribute('data-live'), a = t.getAttribute('data-action');
  if (lv === 'draft') updateDraft();
  else if (lv === 'tax') updateTaxPreview();
  else if (lv === 'photo') handlePhotoFile(t);
  else if (lv === 'pal-custom') customPalette(String(t.value), true);
  else if (lv === 'rv-chk') updateReviewButtons();
  else if (lv === 'bk') updateBookSum();
  else if (lv === 'filter') { var key = t.getAttribute('data-key'); L[key].f = String(t.value); loadMore(key, true); }
  else if (a === 'status') {
    changeStatus(t, 'apiUpdateStatus', function (row, next) { return [S.token, String(row.closest('table').getAttribute('data-key')), String(row.getAttribute('data-id')), String(row.getAttribute('data-tgl')), next]; });
  } else if (a === 'bk-status') {
    changeStatus(t, 'apiUpdateBooking', function (row, next) { return [S.token, String(row.getAttribute('data-id')), String(row.getAttribute('data-tgl')), next]; }, function (sel, next) {
      if (role() === 'Expert') sel.parentNode.innerHTML = bookingSelect(next);
    });
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeModal(); closeDrops(); return; }
  if (e.key !== 'Enter') return;
  var id = e.target && e.target.id;
  if (id === 'l-user' || id === 'l-pass') doLogin();
  else if (id === 'r-pass') doRegister();
  else if (id === 'g-search') globalSearch(String(e.target.value).trim());
  else if (e.target.classList && (e.target.classList.contains('clh-notif-item') || e.target.classList.contains('rx-q'))) e.target.click();
});

/* ============ Admin: Impor data dari app lama (spreadsheet lama hanya dibaca) ============ */
var IMPORT_SHEETS = [['users', 'Users'], ['credits', 'Credits'], ['photos', 'Photos'], ['screenings', 'Screenings'], ['contracts', 'Contracts'], ['copyrights', 'Copyrights'], ['taxes', 'Taxes'], ['posts', 'Posts'], ['questions', 'Questions'], ['answers', 'Answers'], ['bookings', 'Bookings'], ['reviews', 'Reviews']];
VIEWS['import'] = function () {
  var h = head(tr('Migrasi', 'Migration'), tr('Impor data dari app lama', 'Import data from the old app'), tr('Data lama hanya DIBACA. Aman diulang: baris yang sudah ada tidak akan dobel.', 'The old data is only READ. Safe to repeat: existing rows are never duplicated.'));
  h += '<div class="card"><div class="fld"><label for="im-src">' + tr('URL atau ID spreadsheet app lama', 'Old app spreadsheet URL or ID') + '</label>';
  h += '<input class="inp" id="im-src" placeholder="https://docs.google.com/spreadsheets/d/..." value="' + esc(lsGet('lh_im_src') || '') + '">';
  h += '<span class="hint">' + tr('Harus milik akun Google yang sama dengan backend baru.', 'Must belong to the same Google account as the new backend.') + '</span></div>';
  h += '<div class="fld"><label>' + tr('Data yang diimpor', 'Data to import') + '</label><div class="im-grid">';
  for (var i = 0; i < IMPORT_SHEETS.length; i++) h += '<label class="chk"><input type="checkbox" class="im-sh" value="' + IMPORT_SHEETS[i][0] + '" checked><span class="box"></span><span>' + IMPORT_SHEETS[i][1] + '</span></label>';
  h += '</div></div>';
  h += '<label class="chk" style="margin:4px 0 14px"><input type="checkbox" id="im-over"><span class="box"></span><span>' + tr('Timpa data yang sudah ada (profil, saldo, balasan ulasan)', 'Overwrite existing data (profiles, balances, review replies)') + '</span></label>';
  h += '<div class="im-act"><button class="btn ghost" id="btn-im-scan" data-action="im-scan">' + tr('Pindai (tanpa menulis)', 'Scan (no changes)') + '</button>';
  h += '<button class="btn" id="btn-im-run" data-action="im-run">' + tr('Jalankan impor', 'Run import') + '</button></div>';
  h += '<p class="muted sm" style="margin-top:10px">' + tr('Tepat sebelum pindah ke app baru, jalankan impor sekali lagi untuk mengambil data yang masuk ke app lama selama masa transisi.', 'Right before switching, run the import once more to pick up anything added to the old app in the meantime.') + '</p></div>';
  h += '<div id="im-out"></div>';
  el('view').innerHTML = h;
};
function importParams() {
  var src = val('im-src'), sh = [], cb = document.querySelectorAll('.im-sh');
  for (var i = 0; i < cb.length; i++) if (cb[i].checked) sh.push(String(cb[i].value));
  if (!src) { toast(tr('Tempel URL atau ID spreadsheet app lama.', 'Paste the old spreadsheet URL or ID.'), 'err'); return null; }
  if (!sh.length) { toast(tr('Pilih minimal satu data.', 'Choose at least one data set.'), 'err'); return null; }
  lsSet('lh_im_src', src);
  return { src: src, sheets: sh };
}
function runImport(dry) {
  var p = importParams();
  if (!p) return;
  if (!dry && !confirm(tr('Jalankan impor sekarang? Data lama tidak diubah.', 'Run the import now? The old data is not changed.'))) return;
  var bid = dry ? 'btn-im-scan' : 'btn-im-run';
  busy(bid, true);
  el('im-out').innerHTML = '<div class="card"><div class="skel"></div><div class="skel"></div></div>';
  var fn = dry ? 'apiImportScan' : 'apiImportRun';
  var args = dry ? [S.token, p.src, p.sheets] : [S.token, p.src, p.sheets, !!el('im-over').checked];
  api(fn, args, function (res) {
    busy(bid, false);
    if (!res.ok) { el('im-out').innerHTML = ''; toast(res.msg, 'err'); return; }
    renderImport(res);
    toast(dry ? tr('Pindai selesai. Belum ada data yang ditulis.', 'Scan done. Nothing was written yet.') : tr('Impor selesai.', 'Import complete.'), dry ? 'info' : 'ok');
  }, function (m) { busy(bid, false); el('im-out').innerHTML = ''; toast(m, 'err'); });
}
function renderImport(res) {
  var h = '<div class="card"><h3 style="margin-bottom:4px">' + (res.dryRun ? tr('Hasil pindai', 'Scan result') : tr('Hasil impor', 'Import result')) + '</h3>';
  h += '<p class="muted sm" style="margin-bottom:12px">' + tr('Sumber: ', 'Source: ') + esc(res.source.name) + (res.dryRun ? ' &bull; ' + tr('angka di bawah adalah perkiraan bila impor dijalankan', 'figures show what would happen') : '') + '</p>';
  h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + tr('Data', 'Data') + '</th><th>' + tr('Di app lama', 'In old app') + '</th><th>' + tr('Ditambah', 'Added') + '</th><th>' + tr('Diperbarui', 'Updated') + '</th><th>' + tr('Dilewati', 'Skipped') + '</th></tr></thead><tbody>';
  for (var i = 0; i < IMPORT_SHEETS.length; i++) {
    var r = res.report[IMPORT_SHEETS[i][0]];
    if (!r) continue;
    h += '<tr><td><b>' + IMPORT_SHEETS[i][1] + '</b>' + (r.missing ? ' <span class="muted sm">(' + tr('tidak ada di app lama', 'not in old app') + ')</span>' : '') + '</td><td>' + nf(r.source) + '</td><td>' + nf(r.inserted) + '</td><td>' + nf(r.updated) + '</td><td>' + nf(r.skipped) + '</td></tr>';
  }
  h += '</tbody></table></div>';
  if (res.warnings && res.warnings.length) {
    h += '<div class="im-warn"><b>' + tr('Peringatan', 'Warnings') + '</b><ul>';
    for (var w = 0; w < res.warnings.length; w++) h += '<li>' + esc(res.warnings[w]) + '</li>';
    h += '</ul></div>';
  }
  el('im-out').innerHTML = h + '</div>';
}

/* ============ Init: pulihkan sesi bila ada ============ */
/* ============ Landing page (halaman depan publik, sebelum login) ============ */
var LP = { data: null, idx: 0, timer: null, io: null, bound: false };
var LP_SLIDES = [
  { k: ['PLATFORM HUKUM UNTUK KREATOR', 'LEGAL PLATFORM FOR CREATORS'], t: ['Berkarya tenang, urusan hukum ada yang jaga', 'Create with confidence. We handle the legal side.'], s: ['Tanya pakar hukum terverifikasi, susun kontrak, dan lindungi karya Anda dari satu aplikasi.', 'Ask verified legal experts, draft contracts and protect your work, all from one app.'], v: 'laptop' },
  { k: ['KONTRAK ENDORSEMENT', 'ENDORSEMENT CONTRACTS'], t: ['Kontrak endorse aman sebelum tanda tangan', 'Get your endorsement deal right before you sign'], s: ['Isi formulir singkat, dapatkan draf kontrak, lalu tim legal memeriksanya untuk Anda.', 'Fill in a short form, get a draft contract, and our legal team checks it for you.'], v: 'doc' },
  { k: ['PAKAR TERVERIFIKASI', 'VERIFIED EXPERTS'], t: ['Pakar yang lolos screening, rating yang jujur', 'Screened experts. Honest ratings.'], s: ['Izin praktik dan latar belakang setiap pakar diperiksa admin. Ulasan datang dari client sungguhan.', 'Every expert has their licence and background checked. Reviews come from real clients.'], v: 'phone' },
  { k: ['PAJAK & HAK CIPTA', 'TAX & COPYRIGHT'], t: ['Pajak dan hak cipta beres di satu tempat', 'Tax records and copyright, sorted in one place'], s: ['Catat penghasilan dari semua platform, laporkan konten yang dibajak, lalu pantau statusnya.', 'Log income from every platform, report stolen content and follow the case.'], v: 'illus' }
];
function lpReduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

/* ----- Mockup aplikasi (HTML/CSS ringan, bukan gambar) ----- */
function mkFloat(cls, icon, b, sub) { return '<div class="mk-float ' + cls + '"><span class="gi">' + icon + '</span><b>' + esc(b) + '</b>' + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</div>'; }
function mkLaptop() {
  var feed = function (tag) { return '<div class="mk-card"><span class="mk-row"><i class="mk-ava s"></i><span class="mk-lines"><i class="ln w60 dk"></i><i class="ln w40"></i></span></span><i class="mk-tag' + (tag ? ' ' + tag : '') + '"></i><i class="ln w90"></i><i class="ln w70"></i></div>'; };
  var h = '<div class="mk-laptop"><div class="mk-scr"><div class="mk-bar"><i class="mk-logo"></i><i class="mk-search"></i><span class="mk-nav"><i class="on"></i><i></i><i></i><i></i><i></i></span><i class="mk-av"></i></div>';
  h += '<div class="mk-cols"><div class="mk-col"><div class="mk-card pc"><i class="mk-cover"></i><i class="mk-ava pca"></i><i class="ln w70 c dk"></i><i class="ln w50 c"></i></div><div class="mk-card"><i class="ln w80"></i><i class="ln w60"></i><i class="ln w70"></i><i class="ln w50"></i></div></div>';
  h += '<div class="mk-col"><div class="mk-card"><span class="mk-row"><i class="mk-ava s"></i><i class="mk-pill"></i></span></div>' + feed('') + feed('g') + '</div>';
  h += '<div class="mk-col"><div class="mk-card"><i class="ln w60 dk"></i><span class="mk-row"><i class="mk-ava s"></i><span class="mk-lines"><i class="ln w80"></i><b class="mk-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</b></span></span><i class="mk-btn"></i></div><div class="mk-card"><i class="ln w70 dk"></i><span class="mk-row"><i class="mk-ava s"></i><span class="mk-lines"><i class="ln w70"></i><b class="mk-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</b></span></span></div></div></div></div><div class="mk-base"></div>';
  h += mkFloat('f1', '&#9733;', tr('Rating pakar', 'Expert ratings'), tr('dari client sungguhan', 'from real clients'));
  h += mkFloat('f2', '&#10003;', tr('Pakar terverifikasi', 'Verified experts'), '');
  return h + '</div>';
}
function mkDoc() {
  var h = '<div class="mk-docwrap"><div class="mk-doc2"></div><div class="mk-doc"><b class="mk-doc-t">' + tr('PERJANJIAN KERJA SAMA ENDORSEMENT', 'ENDORSEMENT AGREEMENT') + '</b><i class="ln w90"></i><i class="ln w70"></i>';
  h += '<div class="mk-field"><span>Brand</span><b>' + tr('Brand Anda', 'Your brand') + '</b></div><div class="mk-field"><span>' + tr('Nilai kontrak', 'Contract value') + '</span><b>Rp5.000.000</b></div><div class="mk-field"><span>' + tr('Pembayaran', 'Payment') + '</span><b>50% / 50%</b></div>';
  h += '<i class="ln w80"></i><i class="ln w60"></i><div class="mk-sign"><i></i><i></i></div><span class="mk-stamp">&#10003; ' + tr('TERVERIFIKASI', 'VERIFIED') + '</span></div>';
  h += mkFloat('f3', '&#9998;', tr('Draf siap dalam hitungan menit', 'Draft ready in minutes'), '');
  return h + '</div>';
}
function mkPhone() {
  var bars = [92, 6, 2, 0, 0], b = '';
  for (var i = 0; i < 5; i++) b += '<span><em style="width:' + bars[i] + '%"></em></span>';
  var h = '<div class="mk-phonewrap"><div class="mk-phone"><i class="mk-notch"></i><div class="mk-pscr"><div class="mk-pcover"></div><i class="mk-ava pl"></i><i class="ln w60 dk"></i><i class="ln w40"></i>';
  h += '<div class="mk-big">4,9<b class="mk-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</b></div><div class="mk-bars">' + b + '</div><div class="mk-tagsrow"><i></i><i></i><i></i></div><i class="mk-btn wide"></i></div></div>';
  h += mkFloat('f4', '&#10003;', tr('Lolos 5 poin screening', 'Passed 5-point screening'), '');
  h += mkFloat('f5', '&#9733;', tr('Ulasan terverifikasi', 'Verified reviews'), '');
  return h + '</div>';
}
function mkIllus() {
  var h = '<div class="mk-illus"><svg viewBox="0 0 440 340" role="img" aria-label="' + tr('Ilustrasi pajak dan hak cipta', 'Tax and copyright illustration') + '">';
  h += '<rect x="30" y="34" width="268" height="200" rx="20" fill="#fff"/><rect x="54" y="58" width="96" height="10" rx="5" fill="#1D2226"/><rect x="54" y="76" width="60" height="8" rx="4" fill="#C9CDD2"/>';
  var hs = [44, 70, 58, 96, 120], xs = [62, 104, 146, 188, 230];
  for (var i = 0; i < 5; i++) h += '<rect x="' + xs[i] + '" y="' + (214 - hs[i]) + '" width="26" height="' + hs[i] + '" rx="6" style="fill:' + (i === 4 ? 'var(--pl)' : 'var(--plt)') + '"/>';
  h += '<rect x="54" y="214" width="220" height="2" fill="#E0DFDC"/>';
  h += '<g><ellipse cx="96" cy="296" rx="40" ry="12" fill="#C37D16"/><rect x="56" y="270" width="80" height="26" fill="#F5A623"/><ellipse cx="96" cy="270" rx="40" ry="12" fill="#FFC85C"/><ellipse cx="96" cy="270" rx="22" ry="6" fill="#F5A623"/></g>';
  h += '<circle cx="332" cy="214" r="78" fill="#fff"/><circle cx="332" cy="214" r="54" style="fill:var(--pls)"/><text x="332" y="236" text-anchor="middle" font-size="66" font-weight="700" style="fill:var(--pl)" font-family="Arial">&#169;</text>';
  h += '<rect x="248" y="22" width="170" height="44" rx="22" fill="#fff"/><circle cx="272" cy="44" r="8" fill="#057642"/><text x="290" y="49" font-size="14" font-weight="700" fill="#1D2226" font-family="Arial">' + esc(tr('Kasus selesai', 'Case resolved')) + '</text>';
  return h + '</svg></div>';
}
function lpVisual(i) {
  var img = LP.data && LP.data.images ? LP.data.images[i] : '';
  if (img) return '<img class="lp-photo" src="' + esc(img) + '" alt="">';
  var v = LP_SLIDES[i].v;
  return v === 'laptop' ? mkLaptop() : (v === 'doc' ? mkDoc() : (v === 'phone' ? mkPhone() : mkIllus()));
}

/* ----- Render seluruh halaman depan ----- */
function lpPrice() {
  var p = LP.data && LP.data.price;
  if (p) return p;
  var sv = S.cfg.services, m = 0;
  for (var k in sv) if (!m || sv[k].price < m) m = sv[k].price;
  return { start: { poin: 1000, quota: 5 }, topup: S.cfg.topup, svcMin: m, cost: S.cfg.cost };
}
function lpSection(id, cls, eyebrow, title, sub, body) {
  return '<section class="lp-sec' + (cls ? ' ' + cls : '') + '" id="' + id + '"><div class="lp-wrap"><div class="lp-h lp-rv"><p class="eyebrow">' + esc(eyebrow) + '</p><h2>' + esc(title) + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + body + '</div></section>';
}
function renderLanding() {
  var box = el('landing');
  if (!box) return;
  var d = LP.data || {}, st = d.stats || null, h = '';
  var nav = [['lp-fitur', tr('Fitur', 'Features')], ['lp-cara', tr('Cara kerja', 'How it works')], ['lp-pakar', tr('Pakar', 'Experts')], ['lp-harga', tr('Harga', 'Pricing')], ['lp-faq', 'FAQ']];
  h += '<header class="lp-head" id="lp-head"><div class="lp-hin"><button class="lp-brand" data-action="lp-scroll" data-to="lp-top" aria-label="Legal Hub"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg><span>Legal Hub</span></button>';
  h += '<nav class="lp-nav" id="lp-nav" aria-label="' + tr('Menu halaman', 'Page menu') + '">';
  for (var i = 0; i < nav.length; i++) h += '<button data-action="lp-scroll" data-to="' + nav[i][0] + '">' + esc(nav[i][1]) + '</button>';
  h += '</nav><div class="lp-act"><span class="lp-lang"><button class="' + (S.lang === 'id' ? 'on' : '') + '" data-action="lang" data-l="id">ID</button><button class="' + (S.lang === 'en' ? 'on' : '') + '" data-action="lang" data-l="en">EN</button></span>';
  h += '<button class="lp-icon lp-pal" data-action="pal-pop" title="' + tr('Warna tema', 'Theme color') + '" aria-label="' + tr('Warna tema', 'Theme color') + '"><span class="pal-dot"></span></button>';
  h += '<button class="lp-icon" data-action="lamp" title="' + tr('Mode gelap / terang', 'Dark / light mode') + '" aria-label="' + tr('Mode gelap / terang', 'Dark / light mode') + '">' + ic('moon') + '</button>';
  h += '<button class="btn ghost sm lp-in-btn" data-action="to-login">' + tr('Masuk', 'Sign in') + '</button><button class="btn sm lp-up-btn" data-action="to-reg">' + tr('Daftar', 'Sign up') + '</button>';
  h += '<button class="lp-burger" data-action="lp-menu" aria-label="Menu" aria-expanded="false">' + ic('menu') + '</button></div></div></header>';

  // Hero slider
  h += '<section class="lp-hero" id="lp-top" aria-roledescription="carousel" aria-label="' + tr('Sorotan Legal Hub', 'Legal Hub highlights') + '"><div class="lp-glow g1"></div><div class="lp-glow g2"></div><div class="lp-track">';
  for (var s = 0; s < LP_SLIDES.length; s++) {
    var sl = LP_SLIDES[s];
    h += '<div class="lp-slide' + (s === LP.idx ? ' on' : '') + '" role="group" aria-roledescription="slide" aria-label="' + (s + 1) + ' / ' + LP_SLIDES.length + '"' + (s === LP.idx ? '' : ' aria-hidden="true"') + '>';
    h += '<div class="lp-copy"><span class="lp-kick">' + esc(tr(sl.k[0], sl.k[1])) + '</span><h1>' + esc(tr(sl.t[0], sl.t[1])) + '</h1><p>' + esc(tr(sl.s[0], sl.s[1])) + '</p>';
    h += '<div class="lp-cta"><button class="btn lg lp-w" data-action="to-reg" tabindex="' + (s === LP.idx ? '0' : '-1') + '">' + tr('Daftar gratis', 'Sign up free') + '</button><button class="btn lg lp-o" data-action="lp-scroll" data-to="lp-fitur" tabindex="' + (s === LP.idx ? '0' : '-1') + '">' + tr('Lihat fitur', 'See features') + '</button></div>';
    h += '<p class="lp-trust"><span>&#10003; ' + tr('Gratis untuk mulai', 'Free to start') + '</span><span>&#10003; ' + tr('Pakar lolos screening', 'Screened experts') + '</span><span>&#10003; ' + tr('Ulasan anonim', 'Anonymous reviews') + '</span></p></div>';
    h += '<div class="lp-vis">' + lpVisual(s) + '</div></div>';
  }
  h += '</div><button class="lp-arrow prev" data-action="lp-prev" aria-label="' + tr('Slide sebelumnya', 'Previous slide') + '">' + ic('chevL') + '</button><button class="lp-arrow next" data-action="lp-next" aria-label="' + tr('Slide berikutnya', 'Next slide') + '">' + ic('chevR') + '</button><div class="lp-dots">';
  for (var dd = 0; dd < LP_SLIDES.length; dd++) h += '<button class="lp-dot' + (dd === LP.idx ? ' on' : '') + '" data-action="lp-dot" data-i="' + dd + '" aria-label="' + tr('Ke slide ', 'Go to slide ') + (dd + 1) + '"><i></i></button>';
  h += '</div></section>';

  // Angka nyata dari database
  var stats = [['experts', tr('Pakar terverifikasi', 'Verified experts'), 0], ['creators', tr('Kreator bergabung', 'Creators joined'), 0], ['done', tr('Konsultasi selesai', 'Sessions completed'), 0], ['avg', tr('Rating rata-rata', 'Average rating'), 1]];
  h += '<div class="lp-statwrap"><div class="lp-stats lp-rv">';
  for (var k = 0; k < stats.length; k++) {
    var v = st ? Number(st[stats[k][0]]) || 0 : null;
    h += '<div class="lp-stat"><b data-count="' + (v == null ? '' : v) + '" data-dec="' + stats[k][2] + '">' + (v == null ? '&ndash;' : (stats[k][2] ? nf1(v) : nf(v))) + '</b>' + (stats[k][0] === 'avg' && st && st.reviews ? '<em>&#9733; ' + tr('dari ', 'from ') + nf(st.reviews) + ' ' + tr('ulasan', 'reviews') + '</em>' : '') + '<span>' + esc(stats[k][1]) + '</span></div>';
  }
  h += '</div></div>';

  // Fitur
  var feats = [['doc', tr('Kontrak endorsement', 'Endorsement contracts'), tr('Susun draf kontrak yang jelas, lalu minta tim legal memeriksanya.', 'Draft a clear contract, then have our legal team check it.')],
    ['copyright', tr('Pelacak hak cipta', 'Copyright tracker'), tr('Laporkan konten yang dibajak dan pantau penanganannya.', 'Report stolen content and follow how it is handled.')],
    ['coin', tr('Catatan pajak', 'Tax logger'), tr('Catat penghasilan dari semua platform dan mata uang.', 'Log income from every platform and currency.')],
    ['shield', tr('Pakar terverifikasi', 'Verified experts'), tr('Setiap pakar lolos screening izin praktik dan latar belakang.', 'Every expert passes a licence and background check.')],
    ['star', tr('Rating & ulasan', 'Ratings & reviews'), tr('Pilih pakar berdasarkan ulasan dari client sungguhan.', 'Choose experts based on reviews from real clients.')]];
  var fh = '<div class="lp-feat">';
  for (var f = 0; f < feats.length; f++) fh += '<div class="lp-fc lp-rv" style="--d:' + (f * 70) + 'ms"><span class="lp-fi">' + ic(feats[f][0]) + '</span><h3>' + esc(feats[f][1]) + '</h3><p>' + esc(feats[f][2]) + '</p></div>';
  h += lpSection('lp-fitur', '', tr('FITUR', 'FEATURES'), tr('Semua kebutuhan hukum kreator dalam satu aplikasi', 'Everything a creator needs, legally speaking'), tr('Dari kontrak pertama sampai laporan pajak tahunan.', 'From your first contract to your yearly tax report.'), fh + '</div>');

  // Cara kerja
  var steps = [[tr('Daftar gratis', 'Sign up free'), tr('Buat akun sebagai kreator dalam satu menit.', 'Create a creator account in a minute.')], [tr('Tanya atau booking pakar', 'Ask or book an expert'), tr('Ajukan pertanyaan atau pilih pakar dan jadwalkan konsultasi.', 'Post a question, or pick an expert and book a session.')], [tr('Selesai, lalu beri ulasan', 'Done. Leave a review.'), tr('Ulasan Anda membantu kreator lain memilih pakar yang tepat.', 'Your review helps other creators choose the right expert.')]];
  var sh = '<div class="lp-steps">';
  for (var p = 0; p < steps.length; p++) sh += '<div class="lp-step lp-rv" style="--d:' + (p * 90) + 'ms"><span class="lp-num">' + (p + 1) + '</span><h3>' + esc(steps[p][0]) + '</h3><p>' + esc(steps[p][1]) + '</p></div>';
  h += lpSection('lp-cara', 'alt', tr('CARA KERJA', 'HOW IT WORKS'), tr('Tiga langkah, tanpa ribet', 'Three simple steps'), '', sh + '</div>');

  // Pakar unggulan (data nyata)
  var ex = d.experts || [];
  if (ex.length) {
    var eh = '<div class="lp-ex" tabindex="0" aria-label="' + tr('Daftar pakar', 'Expert list') + '">';
    for (var e = 0; e < ex.length; e++) {
      var x = ex[e], av = x[7] ? '<img src="' + esc(x[7]) + '" alt="">' : esc(initials(x[1]));
      eh += '<div class="lp-ec"><i class="lp-ec-cover"></i><span class="avatar lp-ec-av">' + av + '</span><b class="lp-ec-n">' + esc(x[1]) + verMark('1') + '</b><span class="lp-ec-b">' + esc(x[2]) + '</span>';
      eh += '<div class="rate-line lp-ec-r">' + rateChip(x[3], x[4], x[6]) + '</div><span class="lp-ec-d">' + nf(x[5]) + ' ' + tr('konsultasi selesai', 'sessions completed') + '</span><button class="btn ghost sm" data-action="to-login" data-msg="book">' + tr('Booking konsultasi', 'Book a session') + '</button></div>';
    }
    h += lpSection('lp-pakar', '', tr('PAKAR', 'EXPERTS'), tr('Pakar pilihan dengan rating terbaik', 'Top-rated experts'), tr('Diurutkan berdasarkan rating dan ulasan client.', 'Ranked by client ratings and reviews.'), eh + '</div>');
  }

  // Testimoni (nama disingkat/disamarkan)
  var ts = d.testi || [];
  if (ts.length) {
    var th = '<div class="lp-ts">';
    for (var t = 0; t < Math.min(ts.length, 3); t++) {
      var q = ts[t];
      th += '<figure class="lp-tc lp-rv" style="--d:' + (t * 80) + 'ms">' + stars(q[1]) + '<blockquote class="lp-q">' + esc(q[2]) + '</blockquote><figcaption class="lp-who"><span class="avatar">' + esc(initials(q[0].replace(/\*/g, ''))) + '</span><span><b>' + esc(q[0]) + '</b><small>' + tr('untuk ', 'for ') + esc(q[3]) + ' &middot; ' + (q[4] === 'Konsultasi' ? tr('Konsultasi', 'Consultation') : tr('Tanya Pakar', 'Q&A')) + '</small></span></figcaption></figure>';
    }
    h += lpSection('lp-testi', 'alt', tr('KATA MEREKA', 'TESTIMONIALS'), tr('Dipercaya kreator yang sudah mencoba', 'Trusted by creators who tried it'), '', th + '</div>');
  }

  // Harga (dari konfigurasi server)
  var pr = lpPrice(), tp = pr.topup || {};
  var plan = function (hi, name, price, per, items, cta) {
    var li = '';
    for (var a = 0; a < items.length; a++) li += '<li>' + esc(items[a]) + '</li>';
    return '<div class="lp-pc lp-rv' + (hi ? ' hi' : '') + '">' + (hi ? '<span class="lp-badge">' + tr('Untuk kreator aktif', 'For active creators') + '</span>' : '') + '<h3>' + esc(name) + '</h3><div class="lp-price">' + price + (per ? '<small>' + esc(per) + '</small>' : '') + '</div><ul>' + li + '</ul><button class="btn ' + (hi ? '' : 'ghost') + '" data-action="to-reg">' + esc(cta) + '</button></div>';
  };
  var ph = '<div class="lp-pr">';
  ph += plan(false, tr('Gratis', 'Free'), 'Rp0', '', [nf(pr.start.poin) + ' ' + tr('poin awal', 'starter points'), nf(pr.start.quota) + tr(' aksi gratis per bulan', ' free actions a month'), tr('Feed wawasan hukum', 'Legal insight feed'), tr('Direktori pakar & rating', 'Expert directory & ratings')], tr('Mulai gratis', 'Start free'));
  if (tp.subs) ph += plan(true, tp.subs.label, rp(tp.subs.price), tr('/bulan', '/month'), [nf(tp.subs.quota) + tr(' aksi per bulan', ' actions a month'), tr('Tanya pakar & buat kontrak', 'Ask experts & draft contracts'), tr('Catatan pajak tanpa batas', 'Unlimited tax records'), tr('Pelacakan kasus hak cipta', 'Copyright case tracking')], tr('Pilih Pro', 'Choose Pro'));
  if (tp.poin) ph += plan(false, tr('Isi ulang poin', 'Point top-up'), rp(tp.poin.price), '', [nf(tp.poin.poin) + ' ' + tr('poin', 'points'), tr('Tanya pakar: ', 'Ask an expert: ') + nf(pr.cost.question) + ' ' + tr('poin', 'points'), tr('Buat kontrak: ', 'Draft a contract: ') + nf(pr.cost.contract) + ' ' + tr('poin', 'points'), tr('Tanpa masa berlaku bulanan', 'No monthly expiry')], tr('Daftar & isi ulang', 'Sign up & top up'));
  ph += '</div><p class="lp-note">' + tr('Konsultasi dengan pakar mulai ', 'Expert consultations start at ') + rp(pr.svcMin) + tr(' per sesi. Pembayaran di versi prototipe ini masih disimulasikan.', ' per session. Payments are simulated in this prototype.') + '</p>';
  h += lpSection('lp-harga', '', tr('HARGA', 'PRICING'), tr('Mulai gratis, bayar sesuai kebutuhan', 'Start free, pay as you grow'), '', ph);

  // FAQ
  var faq = [[tr('Apakah pakar di Legal Hub benar-benar advokat?', 'Are the experts on Legal Hub real lawyers?'), tr('Setiap pakar mendaftar dengan nomor izin praktik atau KTA, ijazah, dan dokumen pendukung. Admin memeriksa lima poin screening sebelum akun pakar aktif.', 'Every expert signs up with a practice licence or membership number, a degree and supporting documents. An admin checks five screening points before the account goes live.')],
    [tr('Berapa biaya untuk bertanya ke pakar?', 'How much does it cost to ask a question?'), tr('Satu pertanyaan memakai 1 kuota bulanan, atau ', 'Each question uses 1 monthly action, or ') + nf(pr.cost.question) + tr(' poin bila kuota habis.', ' points once your quota runs out.')],
    [tr('Apakah data dan kasus saya aman?', 'Is my data safe?'), tr('Kasus pribadi dibahas lewat booking konsultasi, bukan di feed publik. Ulasan bisa dibuat anonim, dan admin menyembunyikan ulasan yang memuat data pribadi.', 'Personal cases are discussed in booked consultations, not on the public feed. Reviews can be anonymous, and admins hide any review that contains personal data.')],
    [tr('Apakah draf kontrak bisa langsung dipakai?', 'Can I use the contract draft right away?'), tr('Draf adalah template umum, bukan nasihat hukum. Ajukan ke tim legal untuk diperiksa sebelum ditandatangani.', 'The draft is a general template, not legal advice. Send it to the legal team for review before you sign.')],
    [tr('Bagaimana cara membayar?', 'How do I pay?'), tr('Anda bisa mengisi ulang poin atau berlangganan paket Pro. Pada versi prototipe ini pembayaran masih disimulasikan.', 'You can top up points or subscribe to Pro. In this prototype, payments are simulated.')],
    [tr('Saya pakar hukum. Bagaimana cara bergabung?', 'I am a legal expert. How do I join?'), tr('Daftar sebagai pakar, lengkapi data latar belakang, lalu tunggu screening admin. Akun aktif setelah disetujui.', 'Sign up as an expert, complete your background details and wait for the admin screening. Your account goes live once approved.')]];
  var qh = '<div class="lp-faq">';
  for (var z = 0; z < faq.length; z++) qh += '<details class="lp-rv"><summary>' + esc(faq[z][0]) + '</summary><p>' + esc(faq[z][1]) + '</p></details>';
  h += lpSection('lp-faq', 'alt', 'FAQ', tr('Pertanyaan yang sering diajukan', 'Frequently asked questions'), '', qh + '</div>');

  // Ajakan akhir + footer
  h += '<section class="lp-sec lp-endsec"><div class="lp-band lp-rv"><h2>' + tr('Siap berkarya tanpa khawatir?', 'Ready to create without worrying?') + '</h2><p>' + tr('Gabung gratis dan temukan pakar hukum yang tepat untuk Anda.', 'Join free and find the right legal expert for you.') + '</p><div class="lp-cta c"><button class="btn lg lp-w" data-action="to-reg">' + tr('Daftar gratis', 'Sign up free') + '</button><button class="btn lg lp-o" data-action="to-login">' + tr('Saya sudah punya akun', 'I already have an account') + '</button></div></div></section>';
  h += '<footer class="lp-foot"><div class="lp-wrap lp-fgrid"><div><div class="lp-brand static"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg><span>Legal Hub</span></div><p>' + tr('Jejaring profesional yang mempertemukan kreator dengan pakar hukum terverifikasi.', 'The professional network that connects creators with verified legal experts.') + '</p></div>';
  h += '<div><b>' + tr('Produk', 'Product') + '</b>';
  for (var y = 0; y < nav.length; y++) h += '<button data-action="lp-scroll" data-to="' + nav[y][0] + '">' + esc(nav[y][1]) + '</button>';
  h += '</div><div><b>' + tr('Akun', 'Account') + '</b><button data-action="to-login">' + tr('Masuk', 'Sign in') + '</button><button data-action="to-reg">' + tr('Daftar sebagai kreator', 'Join as a creator') + '</button><button data-action="to-reg" data-role="Expert">' + tr('Daftar sebagai pakar', 'Join as an expert') + '</button></div></div>';
  h += '<div class="lp-wrap lp-fbot"><span>&copy; ' + new Date().getFullYear() + ' Legal Hub</span><span>' + tr('Informasi di platform ini bukan pengganti nasihat hukum resmi.', 'Information on this platform is not a substitute for formal legal advice.') + '</span></div></footer>';

  box.innerHTML = h;
  lpBind();
  lpObserve();
  lpGo(LP.idx, true);
  lpOnScroll();
}
function loadLanding() {
  apiCached('apiLanding', [], 'landing', function (res) {
    if (!res || !res.ok) return;
    LP.data = res;
    if (!el('landing').hidden) renderLanding();
  });
}

/* ----- Slider: otomatis, titik navigasi, panah, geser (swipe), keyboard ----- */
function lpGo(i, silent) {
  var sl = document.querySelectorAll('.lp-slide'), dots = document.querySelectorAll('.lp-dot');
  if (!sl.length) return;
  LP.idx = (i + sl.length) % sl.length;
  for (var k = 0; k < sl.length; k++) {
    var on = k === LP.idx;
    sl[k].classList.toggle('on', on);
    if (on) sl[k].removeAttribute('aria-hidden'); else sl[k].setAttribute('aria-hidden', 'true');
    var btns = sl[k].querySelectorAll('button');
    for (var b = 0; b < btns.length; b++) btns[b].tabIndex = on ? 0 : -1;
    dots[k].classList.remove('on');
  }
  void dots[LP.idx].offsetWidth; // ulang animasi progres titik aktif
  dots[LP.idx].classList.add('on');
  if (!silent) lpStart();
}
function lpStart() {
  lpStop();
  if (lpReduced() || el('landing').hidden) { var hr = el('lp-top'); if (hr) hr.classList.add('static'); return; }
  LP.timer = setInterval(function () { var hero = el('lp-top'); if (hero && !hero.classList.contains('paused')) lpGo(LP.idx + 1, true); }, 6500);
}
function lpStop() { if (LP.timer) { clearInterval(LP.timer); LP.timer = null; } }
function lpBind() {
  var hero = el('lp-top');
  if (!hero) return;
  var pause = function () { hero.classList.add('paused'); }, play = function () { hero.classList.remove('paused'); };
  hero.addEventListener('mouseenter', pause); hero.addEventListener('mouseleave', play);
  hero.addEventListener('focusin', pause); hero.addEventListener('focusout', play);
  var x0 = null;
  hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 45) lpGo(LP.idx + (dx < 0 ? 1 : -1)); }, { passive: true });
  hero.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') lpGo(LP.idx + 1); else if (e.key === 'ArrowLeft') lpGo(LP.idx - 1); });
  if (!LP.bound) { LP.bound = true; window.addEventListener('scroll', lpOnScroll, { passive: true }); }
  lpStart();
}
// Header transparan di atas hero, putih setelah halaman di-scroll
function lpOnScroll() {
  var hd = el('lp-head');
  if (hd && !el('landing').hidden) hd.classList.toggle('scrolled', window.scrollY > 24);
}
// Animasi muncul saat di-scroll + hitung naik untuk angka statistik
function lpObserve() {
  if (LP.io) { LP.io.disconnect(); LP.io = null; }
  var nodes = document.querySelectorAll('.lp-rv');
  if (!('IntersectionObserver' in window) || lpReduced()) { for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('in'); lpCount(); return; }
  LP.io = new IntersectionObserver(function (es) {
    for (var k = 0; k < es.length; k++) {
      if (!es[k].isIntersecting) continue;
      es[k].target.classList.add('in');
      if (es[k].target.classList.contains('lp-stats')) lpCount();
      LP.io.unobserve(es[k].target);
    }
  }, { rootMargin: '0px 0px -60px 0px' });
  for (var j = 0; j < nodes.length; j++) LP.io.observe(nodes[j]);
}
function lpCount() {
  var bs = document.querySelectorAll('.lp-stat b[data-count]');
  for (var i = 0; i < bs.length; i++) {
    (function (b) {
      var to = parseFloat(b.getAttribute('data-count')), dec = b.getAttribute('data-dec') === '1';
      if (isNaN(to) || b.getAttribute('data-done') === '1') return;
      b.setAttribute('data-done', '1');
      if (lpReduced()) return;
      var t0 = null, dur = 1200;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), v = to * (1 - Math.pow(1 - p, 3));
        b.textContent = dec ? nf1(v) : nf(Math.round(v));
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    })(bs[i]);
  }
}
function lpScrollTo(id) {
  var n = el(id);
  if (!n) return;
  var nav = el('lp-nav');
  if (nav) nav.classList.remove('open');
  if (id === 'lp-top') { window.scrollTo({ top: 0, behavior: lpReduced() ? 'auto' : 'smooth' }); return; }
  n.scrollIntoView({ behavior: lpReduced() ? 'auto' : 'smooth', block: 'start' });
}
// Navigasi antara halaman depan dan halaman masuk
function showLanding() {
  el('app').hidden = true; el('auth').hidden = true; el('landing').hidden = false;
  window.scrollTo(0, 0);
  renderLanding();
  if (!LP.data) loadLanding();
}
function showAuth(pane, role0) {
  lpStop();
  el('landing').hidden = true; el('app').hidden = true; el('auth').hidden = false;
  switchPane(pane === 'reg' ? 'reg' : 'login');
  if (pane === 'reg') setRole(role0 === 'Expert' ? 'Expert' : 'Client');
  window.scrollTo(0, 0);
  loadSpot();
  setTimeout(function () { var f = el(pane === 'reg' ? 'r-nama' : 'l-user'); if (f) f.focus(); }, 60);
}

/* ============ Init: pulihkan sesi bila ada, selain itu tampilkan halaman depan ============ */
(function init() {
  initAuth();
  var tok = ssGet('lh_t');
  warmUpServer();
  if (!tok || !hasBackend()) { showLanding(); return; }
  api('apiMe', [tok], function (res) {
    if (res.ok) startSession({ token: tok, user: res.user, cfg: res.cfg });
    else { ssSet('lh_t', null); showLanding(); }
  }, function () { showLanding(); });
})();
