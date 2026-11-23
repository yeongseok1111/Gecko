/* =========================================================
   Gecko 쇼핑몰 데이터 영역
   실제 DB 연결 시 아래 배열 구조를 테이블/조회 데이터로 교체하세요.
   ========================================================= */
const PRODUCTS = [
  { id: 1, name: "레오파드게코 노멀", category: "레오파드게코", price: 79000, stock: 12, image: "./img/products/leopard-gecko.jpg", description: "차분한 무늬가 매력적인 레오파드게코입니다. 개체별 색상과 패턴은 사진과 다를 수 있습니다." },
  { id: 2, name: "크레스티드게코 하이포", category: "크레스티드게코", price: 99000, stock: 8, image: "./img/products/crested-gecko.jpg", description: "머리 위 속눈썹 같은 돌기가 특징인 크레스티드게코입니다." },
  { id: 3, name: "게코류 스노우", category: "기타 게코류", price: 75000, stock: 10, image: "./img/products/snow-gecko.jpg", description: "밝고 부드러운 색감이 돋보이는 게코류 예시 상품입니다." },
  { id: 4, name: "레오파드게코 하이옐로우", category: "레오파드게코", price: 95000, stock: 6, image: "./img/products/yellow-gecko.jpg", description: "선명한 노란색 계열의 패턴이 특징인 레오파드게코입니다." },
  { id: 5, name: "레오파드게코 탠저린", category: "레오파드게코", price: 109000, stock: 5, image: "./img/products/leopard2.jpg", description: "따뜻한 오렌지 계열 색감이 매력적인 레오파드게코입니다." },
  { id: 6, name: "크레스티드게코 달마시안", category: "크레스티드게코", price: 120000, stock: 4, image: "./img/products/crested2.jpg", description: "개성 있는 무늬가 돋보이는 크레스티드게코입니다." },
  { id: 7, name: "게코류 화이트", category: "기타 게코류", price: 89000, stock: 7, image: "./img/products/gecko2.jpg", description: "밝은 색조의 외형을 가진 게코류 예시 상품입니다." },
  { id: 8, name: "기타 도마뱀 베이비", category: "기타 도마뱀", price: 69000, stock: 9, image: "./img/products/gecko3.jpg", description: "작은 크기와 귀여운 외형이 특징인 도마뱀 예시 상품입니다." }
];

const MEMBER_GRADES = [
  { name: "브론즈", minSpent: 0, rate: 0.01 },
  { name: "실버", minSpent: 100000, rate: 0.03 },
  { name: "골드", minSpent: 300000, rate: 0.05 },
  { name: "플래티넘", minSpent: 700000, rate: 0.07 }
];
const SIGNUP_BONUS = 3000;

/* =========================================================
   화면 기능 및 체험용 데이터 저장
   ========================================================= */
const $ = (selector) => document.querySelector(selector);
const money = (value) => `${Number(value).toLocaleString("ko-KR")}원`;
const safe = (value) => String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
const load = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let members = load("geckoMembers", []);
let currentUserId = load("geckoCurrentUser", null);
let cart = load("geckoCart", []);
let orders = load("geckoOrders", []);
let activeCategory = "전체";
let activeSlide = 0;
let toastTimer;

function currentUser() { return members.find(member => member.id === currentUserId) || null; }
function getGrade(spent) { return [...MEMBER_GRADES].reverse().find(grade => spent >= grade.minSpent) || MEMBER_GRADES[0]; }
function persist() { save("geckoMembers", members); save("geckoCurrentUser", currentUserId); save("geckoCart", cart); save("geckoOrders", orders); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2300); }
function openModal(html) { $("#modalContent").innerHTML = html; $("#modalBackdrop").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closeModal() { $("#modalBackdrop").classList.add("hidden"); document.body.style.overflow = ""; }

function renderCategories() {
  const categories = ["전체", ...new Set(PRODUCTS.map(product => product.category))];
  $("#categoryTabs").innerHTML = categories.map(category => `<button class="category-tab ${category === activeCategory ? "active" : ""}" data-category="${safe(category)}">${safe(category)}</button>`).join("");
}
function renderProducts() {
  const keyword = $("#searchInput").value.trim().toLowerCase();
  let list = PRODUCTS.filter(product => (activeCategory === "전체" || product.category === activeCategory) && `${product.name} ${product.category}`.toLowerCase().includes(keyword));
  const sort = $("#sortSelect").value;
  if (sort === "low") list.sort((a,b) => a.price-b.price);
  if (sort === "high") list.sort((a,b) => b.price-a.price);
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name, "ko"));
  $("#resultCount").textContent = `총 ${list.length}개 상품`;
  $("#emptyProducts").classList.toggle("hidden", list.length > 0);
  $("#productGrid").innerHTML = list.map(product => `<article class="product-card">
    <button class="product-open" data-detail="${product.id}" aria-label="${safe(product.name)} 상세 보기" style="display:block;border:0;padding:0;background:none;width:100%;text-align:left"><img class="product-image" src="${product.image}" alt="${safe(product.name)}" loading="lazy"><div class="product-info"><div class="product-category">${safe(product.category)}</div><h3 class="product-name">${safe(product.name)}</h3><div class="product-bottom"><span class="price">${money(product.price)}</span><span class="stock-note">재고 ${product.stock}개</span></div></div></button>
    <div style="padding:0 15px 15px"><button class="add-cart" data-add="${product.id}" ${product.stock < 1 ? "disabled" : ""}>장바구니 담기</button></div></article>`).join("");
}
function renderCartCount() { $("#cartCount").textContent = cart.reduce((sum,item) => sum + item.qty, 0); }
function addToCart(id) {
  const product = PRODUCTS.find(item => item.id === id); if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) { if (existing.qty >= product.stock) return showToast("재고 수량을 초과할 수 없습니다."); existing.qty += 1; }
  else cart.push({ id, qty: 1 });
  persist(); renderCartCount(); showToast("장바구니에 담았습니다.");
}
function showDetail(id) {
  const product = PRODUCTS.find(item => item.id === id); if (!product) return;
  openModal(`<div class="detail-layout"><img src="${product.image}" alt="${safe(product.name)}"><div><p class="section-kicker">${safe(product.category)}</p><h2 id="modalTitle">${safe(product.name)}</h2><p>${safe(product.description)}</p><div class="detail-price">${money(product.price)}</div><p class="stock-note">남은 재고 ${product.stock}개</p><button class="full-button" data-add="${product.id}">장바구니 담기</button></div></div>`);
}
function showCart() {
  const rows = cart.map(item => { const product = PRODUCTS.find(p => p.id === item.id); return product ? { ...product, qty: item.qty } : null; }).filter(Boolean);
  const total = rows.reduce((sum,item) => sum + item.price * item.qty, 0);
  openModal(`<h2 id="modalTitle">장바구니</h2><p class="modal-sub">담아둔 상품을 확인해 주세요.</p>${rows.length ? rows.map(item => `<div class="cart-row"><img src="${item.image}" alt="${safe(item.name)}"><div><strong>${safe(item.name)}</strong><small>${money(item.price)}</small><div class="qty-control"><button data-qty="${item.id}" data-delta="-1" aria-label="수량 줄이기">−</button><span>${item.qty}</span><button data-qty="${item.id}" data-delta="1" aria-label="수량 늘리기">+</button></div></div><button class="remove-item" data-remove="${item.id}">삭제</button></div>`).join("") : `<p class="empty-state">장바구니가 비어 있습니다.</p>`}<div class="cart-total"><span>상품 합계</span><span>${money(total)}</span></div><button class="full-button" data-checkout ${rows.length ? "" : "disabled"}>체험 결제하기</button>`);
}
function changeQty(id, delta) {
  const item = cart.find(row => row.id === id); const product = PRODUCTS.find(row => row.id === id); if (!item || !product) return;
  item.qty += delta; if (item.qty <= 0) cart = cart.filter(row => row.id !== id);
  else if (item.qty > product.stock) { item.qty = product.stock; showToast("재고 수량까지만 담을 수 있습니다."); }
  persist(); renderCartCount(); showCart();
}
function checkout() {
  const user = currentUser(); if (!user) { closeModal(); showAuth("login", "결제를 진행하려면 로그인해 주세요."); return; }
  if (!cart.length) return showToast("장바구니가 비어 있습니다.");
  const total = cart.reduce((sum,item) => { const product = PRODUCTS.find(p => p.id === item.id); return sum + (product ? product.price * item.qty : 0); }, 0);
  const grade = getGrade(user.totalSpent || 0); const earned = Math.floor(total * grade.rate);
  openModal(`<h2 id="modalTitle">체험 결제 확인</h2><p class="modal-sub">실제 결제는 발생하지 않으며, 수업용 주문 내역만 저장됩니다.</p><div class="profile-summary"><p>주문 금액</p><strong>${money(total)}</strong><p>${grade.name} 등급 · 적립 예정 ${earned.toLocaleString("ko-KR")}P (${grade.rate*100}%)</p></div><label class="form-field"><span>받는 분</span><input id="orderReceiver" value="${safe(user.name)}" required></label><label class="form-field"><span>배송 메모</span><input id="orderMemo" placeholder="요청사항 (선택)"></label><button class="full-button" data-confirm-order>체험 주문 완료</button>`);
}
function confirmOrder() {
  const user = currentUser(); if (!user || !cart.length) return;
  const total = cart.reduce((sum,item) => { const product = PRODUCTS.find(p => p.id === item.id); return sum + (product ? product.price * item.qty : 0); }, 0);
  const grade = getGrade(user.totalSpent || 0); const earned = Math.floor(total * grade.rate);
  const items = cart.map(item => { const p = PRODUCTS.find(product => product.id === item.id); return { id:item.id, name:p.name, price:p.price, qty:item.qty }; });
  const order = { id: `GK${Date.now().toString().slice(-9)}`, date: new Date().toLocaleString("ko-KR"), items, total, earned, receiver: $("#orderReceiver").value.trim() || user.name, memo: $("#orderMemo").value.trim() };
  orders.unshift({ userId:user.id, ...order }); user.points = (user.points || 0) + earned; user.totalSpent = (user.totalSpent || 0) + total;
  cart = []; persist(); renderCartCount(); showToast("체험 주문이 완료되었습니다."); showMyPage();
}
function showAuth(mode = "login", note = "") {
  const signup = mode === "signup";
  openModal(`<h2 id="modalTitle">${signup ? "Gecko 회원가입" : "로그인"}</h2><p class="modal-sub">${note || (signup ? "가입하고 3,000P 혜택을 받아보세요." : "Gecko에 오신 것을 환영합니다.")}</p><form id="authForm">${signup ? `<label class="form-field"><span>이름</span><input name="name" required maxlength="20" placeholder="이름"></label>` : ""}<label class="form-field"><span>이메일</span><input name="email" type="email" required placeholder="name@example.com"></label><label class="form-field"><span>비밀번호</span><input name="password" type="password" required minlength="4" placeholder="4자 이상 입력"></label><button class="full-button" type="submit">${signup ? "가입하고 3,000P 받기" : "로그인"}</button></form><div class="switch-line">${signup ? `이미 회원이신가요? <button class="text-button" data-auth="login">로그인</button>` : `아직 회원이 아니신가요? <button class="text-button" data-auth="signup">회원가입</button>`}</div>`);
}
function handleAuthSubmit(event) {
  event.preventDefault(); const form = new FormData(event.currentTarget); const email = String(form.get("email")).trim().toLowerCase(); const password = String(form.get("password"));
  if (event.currentTarget.querySelector('[name="name"]')) {
    if (members.some(member => member.email === email)) return showToast("이미 가입된 이메일입니다.");
    const member = { id:`M${Date.now()}`, name:String(form.get("name")).trim(), email, password, points:SIGNUP_BONUS, totalSpent:0, joinedAt:new Date().toLocaleDateString("ko-KR") };
    members.push(member); currentUserId = member.id; persist(); showToast("가입 완료! 3,000P가 지급되었습니다."); showMyPage();
  } else {
    const member = members.find(item => item.email === email && item.password === password);
    if (!member) return showToast("이메일 또는 비밀번호를 확인해 주세요.");
    currentUserId = member.id; persist(); showToast("로그인되었습니다."); showMyPage();
  }
}
function showMyPage() {
  const user = currentUser(); if (!user) return showAuth("login");
  const grade = getGrade(user.totalSpent || 0); const myOrders = orders.filter(order => order.userId === user.id);
  openModal(`<h2 id="modalTitle">마이페이지</h2><p class="modal-sub">${safe(user.name)}님, Gecko에 오신 것을 환영합니다.</p><div class="profile-summary"><strong>${safe(grade.name)} 회원</strong><p>${safe(user.email)}</p><p>보유 포인트 <b>${(user.points || 0).toLocaleString("ko-KR")}P</b></p><p>누적 구매 금액 ${money(user.totalSpent || 0)} · 구매 적립률 ${grade.rate*100}%</p></div><h3 style="font-size:15px">회원 등급 안내</h3>${MEMBER_GRADES.map(item => `<p style="font-size:12px;margin:5px 0">${item.name} · 누적 ${money(item.minSpent)} 이상 · ${item.rate*100}% 적립</p>`).join("")}<h3 style="font-size:15px;margin-top:22px">주문 내역</h3>${myOrders.length ? myOrders.map(order => `<div class="order-card"><strong>${safe(order.id)} · ${money(order.total)}</strong><p>${safe(order.date)} · 적립 ${order.earned.toLocaleString("ko-KR")}P</p><p>${order.items.map(item => `${safe(item.name)} ${item.qty}개`).join(", ")}</p></div>`).join("") : `<p class="modal-sub">아직 주문 내역이 없습니다.</p>`}<button class="full-button" data-logout>로그아웃</button>`);
}

// 이벤트 위임: 모달을 다시 그려도 모든 버튼이 동작하도록 처리
$("#productGrid").addEventListener("click", event => { const add = event.target.closest("[data-add]"); const detail = event.target.closest("[data-detail]"); if (add) addToCart(Number(add.dataset.add)); else if (detail) showDetail(Number(detail.dataset.detail)); });
$("#categoryTabs").addEventListener("click", event => { const button = event.target.closest("[data-category]"); if (!button) return; activeCategory = button.dataset.category; renderCategories(); renderProducts(); });
$("#searchInput").addEventListener("input", renderProducts); $("#sortSelect").addEventListener("change", renderProducts);
$("#modalContent").addEventListener("click", event => {
  const add = event.target.closest("[data-add]"); const qty = event.target.closest("[data-qty]"); const remove = event.target.closest("[data-remove]");
  const auth = event.target.closest("[data-auth]");
  if (add) { addToCart(Number(add.dataset.add)); showCart(); }
  if (qty) changeQty(Number(qty.dataset.qty), Number(qty.dataset.delta));
  if (remove) { cart = cart.filter(item => item.id !== Number(remove.dataset.remove)); persist(); renderCartCount(); showCart(); }
  if (event.target.closest("[data-checkout]")) checkout();
  if (event.target.closest("[data-confirm-order]")) confirmOrder();
  if (auth) showAuth(auth.dataset.auth);
  if (event.target.closest("[data-logout]")) { currentUserId = null; persist(); closeModal(); showToast("로그아웃되었습니다."); }
});
$("#modalContent").addEventListener("submit", event => { if (event.target.id === "authForm") handleAuthSubmit(event); });
$("#modalClose").addEventListener("click", closeModal); $("#modalBackdrop").addEventListener("click", event => { if (event.target === $("#modalBackdrop")) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
$("#cartButton").addEventListener("click", showCart); $("#accountButton").addEventListener("click", () => currentUser() ? showMyPage() : showAuth("login"));
$("#searchFocus").addEventListener("click", () => { $("#products").scrollIntoView({behavior:"smooth"}); setTimeout(() => $("#searchInput").focus(), 350); });
$("#menuToggle").addEventListener("click", () => { const nav = $("#mainNav"); nav.classList.toggle("open"); $("#menuToggle").setAttribute("aria-expanded", nav.classList.contains("open")); });
$("#mainNav").addEventListener("click", event => { if (event.target.closest("a")) { $("#mainNav").classList.remove("open"); $("#menuToggle").setAttribute("aria-expanded", "false"); } });

// 6초 간격 메인 비주얼 자동 전환
const slides = [...document.querySelectorAll(".hero-slide")]; const dots = [...document.querySelectorAll("#slideDots button")];
function setSlide(index) { activeSlide = index; slides.forEach((slide,i) => slide.classList.toggle("active", i === index)); dots.forEach((dot,i) => dot.classList.toggle("active", i === index)); }
dots.forEach((dot,index) => dot.addEventListener("click", () => setSlide(index)));
setInterval(() => setSlide((activeSlide + 1) % slides.length), 6000);

renderCategories(); renderProducts(); renderCartCount();
