import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getDatabase, ref, onValue, push, set } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyCI39dQTYcZ76ROxUY73jYB3OZPfjsyegI",
  authDomain: "absar-unique-tech.firebaseapp.com",
  databaseURL: "https://absar-unique-tech-default-rtdb.firebaseio.com",
  projectId: "absar-unique-tech",
  storageBucket: "absar-unique-tech.firebasestorage.app",
  messagingSenderId: "576285730220",
  appId: "1:576285730220:web:1d3cdf9cf3ddc4e00b4609"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let allProducts = [];
let currentProduct = null;
let currentPrice = 0;

const user = localStorage.getItem('userName');
if(user){
  document.getElementById('userName').textContent = user;
  document.getElementById('menuUser').textContent = user;
}

function updateCartCount(){
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.getElementById('cartCount').textContent = cart.reduce((sum,item)=>sum+item.qty,0);
}
updateCartCount();

// ✅ Realtime Database থেকে Products Load কর
const productsRef = ref(database, 'products');
onValue(productsRef, (snapshot) => {
  allProducts = [];
  snapshot.forEach(child => {
    allProducts.push({id: child.key,...child.val()});
  });
  console.log('Loaded products:', allProducts.length);
  render(allProducts);
}, (error) => {
  console.error('Firebase Load Error:', error);
  document.getElementById('grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:red">Error: '+error.message+'</div>';
});

function getMediaHtml(url, name){
  if(!url) return '<img src="https://via.placeholder.com/300" alt="No Image">';

  if(url.includes('youtube.com/watch') || url.includes('youtu.be/')){
    let videoId = '';
    if(url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
    else if(url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    return `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${name}" onerror="this.src='https://via.placeholder.com/300'">`;
  }

  return `<img src="${url}" alt="${name}" onerror="this.src='https://via.placeholder.com/300'">`;
}

function render(products){
  const grid = document.getElementById('grid');
  if(products.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">কোনো প্রোডাক্ট নাই</div>';
    return;
  }

  let html = '';
  products.forEach(p=>{
    const stock = parseInt(p.stock||0);
    const isSoldOut = stock<=0;
    const imgList = (p.images||'').split('\n').filter(i=>i.trim());
    const firstImg = imgList[0] || 'https://via.placeholder.com/300';
    const totalMedia = imgList.length || 1;
    const hasVideo = imgList.some(u=>u.includes('youtube') || u.includes('youtu.be'));

    html += `
    <div class="p-card">
      <div class="p-img" onclick="window.location='product.html?id=${p.id}'">
        ${getMediaHtml(firstImg, p.name)}
        ${isSoldOut?'<div class="soldout">SOLD OUT</div>':''}
        ${p.brand?`<div class="brand">${p.brand}</div>`:''}
        ${totalMedia > 1?`<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.8);color:#fff;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700">${hasVideo?'▶':''} 1/${totalMedia}</div>`:''}
      </div>
      <div class="p-info">
        <div class="p-name" onclick="window.location='product.html?id=${p.id}'">${p.name}</div>
        <div class="p-price">৳${p.price}</div>
        <div style="display:flex;gap:8px;margin-top:auto">
          <button class="buy-btn" style="flex:1;background:#666" onclick='addToCart(${JSON.stringify(p).replace(/'/g,"&apos;")})' ${isSoldOut?'disabled':''}>
            ${isSoldOut?'Out of Stock':'🛒 Cart'}
          </button>
          <button class="buy-btn" style="flex:1" onclick='openOrderForm(${JSON.stringify(p).replace(/'/g,"&apos;")})' ${isSoldOut?'disabled':''}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  `});
  grid.innerHTML = html;
}

window.filter = function(cat,el){
  if(el){
    document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
  }
  if(cat==='all'){
    render(allProducts);
  } else {
    const filtered = allProducts.filter(p=>{
      const cats = (p.category||'').split(',').map(c=>c.trim().toLowerCase());
      return cats.includes(cat.toLowerCase());
    });
    render(filtered);
  }
}

window.search = function(term){
  const filtered = allProducts.filter(p=>
    p.name.toLowerCase().includes(term.toLowerCase()) ||
    (p.brand||'').toLowerCase().includes(term.toLowerCase()) ||
    (p.category||'').toLowerCase().includes(term.toLowerCase())
  );
  render(filtered);
}

window.toggleMenu = function(){
  document.getElementById('menu').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

window.addToCart = function(p){
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let exist = cart.find(item => item.id === p.id);

  if(exist){
    exist.qty += 1;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      img: (p.images||'').split('\n')[0] || 'https://via.placeholder.com/300',
      color: p.color? p.color.split(',')[0].trim() : 'N/A',
      qty: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('✅ কার্টে যোগ হইছে!\n\n' + p.name);
}

window.openOrderForm = function(p){
  currentProduct = p;
  currentPrice = parseInt(p.price);
  document.getElementById('orderProduct').value = p.name;
  document.getElementById('orderColor').value = p.color? p.color.split(',')[0].trim() : 'N/A';
  document.getElementById('productPrice').textContent = p.price + ' TK';
  document.getElementById('orderModal').classList.add('active');
  document.getElementById('deliveryCharge').textContent = '0 TK';
  document.getElementById('totalAmount').textContent = p.price + ' TK';
  document.querySelectorAll('input[name="delivery"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = false);
  document.getElementById('paymentInfo').style.display = 'none';
}

window.updateTotal = function(){
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const charge = delivery? parseInt(delivery.value) : 0;
  document.getElementById('deliveryCharge').textContent = charge + ' TK';
  document.getElementById('totalAmount').textContent = (currentPrice + charge) + ' TK';
}

window.showPaymentInfo = function(){
  const payment = document.querySelector('input[name="payment"]:checked');
  const infoBox = document.getElementById('paymentInfo');

  if(payment && payment.value!== 'Cash on Delivery'){
    infoBox.style.display = 'block';
    infoBox.innerHTML = `
      <div style="background:#e3f2fd;padding:12px;border-radius:8px;border:2px solid #2196f3">
        <div style="font-weight:700;color:#1976d2;margin-bottom:8px">💳 ${payment.value} নাম্বার:</div>
        <div style="font-size:20px;font-weight:800;color:#0d47a1;text-align:center;margin:8px 0">01955379242</div>
        <div style="font-size:12px;color:#555;text-align:center">এই নাম্বারে Send Money করুন এবং Transaction ID অর্ডারের সময় দিবেন</div>
      </div>
    `;
  } else {
    infoBox.style.display = 'none';
  }
}

window.closeModal = function(){
  document.getElementById('orderModal').classList.remove('active');
  document.getElementById('orderName').value = '';
  document.getElementById('orderPhone').value = '';
  document.getElementById('orderAddress').value = '';
  document.getElementById('transactionId').value = '';
}

function saveOrderToHistory(productName, productPrice, productImage, productColor) {
    let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
    let newOrder = {
        id: Date.now(),
        name: productName,
        price: productPrice,
        image: productImage,
        color: productColor,
        date: new Date().toLocaleDateString('bn-BD', {timeZone: 'Asia/Dhaka'}),
        status: 'Confirmed'
    };
    orders.push(newOrder);
    localStorage.setItem('myOrders', JSON.stringify(orders));
}

window.submitOrder = function(){
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const address = document.getElementById('orderAddress').value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const payment = document.querySelector('input[name="payment"]:checked');
  const transactionId = document.getElementById('transactionId').value.trim();

  if(!name) return alert('নাম লিখুন!');
  if(!phone || phone.length < 11) return alert('সঠিক মোবাইল নাম্বার দিন!');
  if(!address) return alert('ঠিকানা লিখুন!');
  if(!delivery) return alert('ডেলিভারি এরিয়া সিলেক্ট করুন!');
  if(!payment) return alert('পেমেন্ট মেথড সিলেক্ট করুন!');

  if(payment.value!== 'Cash on Delivery' &&!transactionId){
    return alert('bKash/Nagad Transaction ID দিন!');
  }

  const deliveryCharge = parseInt(delivery.value);
  const deliveryArea = deliveryCharge === 80? 'Inside Dhaka' : 'Outside Dhaka';
  const paymentMethod = payment.value;
  const productColor = currentProduct.color? currentProduct.color.split(',')[0].trim() : 'N/A';
  const mainImg = (currentProduct.images||'').split('\n')[0] || 'https://via.placeholder.com/300';

  const orderData = {
    customerName: name,
    phone: phone,
    address: address,
    productName: currentProduct.name,
    productPrice: currentPrice,
    productColor: productColor,
    deliveryCharge: deliveryCharge,
    deliveryArea: deliveryArea,
    paymentMethod: paymentMethod,
    transactionId: transactionId || 'N/A',
    totalAmount: currentPrice + deliveryCharge,
    orderTime: new Date().toLocaleString('en-BD', {timeZone: 'Asia/Dhaka'}),
    orderStatus: "New"
  };

  saveOrderToHistory(currentProduct.name, currentPrice + deliveryCharge, mainImg, productColor);

  // ✅ Realtime Database এ Order Save কর
  push(ref(database, 'orders'), orderData).then(()=>{
    let msg = '✅ অর্ডার সফল!\n\nপ্রোডাক্ট: ' + currentProduct.name + '\nপেমেন্ট: ' + paymentMethod;
    if(transactionId) msg += '\nTrxID: ' + transactionId;
    msg += '\nসর্বমোট: ' + (currentPrice + deliveryCharge) + ' TK\n\nআমরা শীঘ্রই কল দিব।';
    alert(msg);
    closeModal();
    window.location.href = 'my-orders.html';
  }).catch(e=>{
    alert('❌ অর্ডার ফেইল: '+e.message);
  });
}
