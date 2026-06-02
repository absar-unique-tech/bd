import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { getDatabase, ref, push } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js';

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
const db = getFirestore(app);
const database = getDatabase(app);

let allProducts = [];
let currentProduct = null;
let currentPrice = 0;

const user = localStorage.getItem('userName');
if(user){
  document.getElementById('userName').textContent = user;
  document.getElementById('menuUser').textContent = user;
}

async function loadProducts(){
  const q = query(collection(db,'products'),orderBy('order','desc'));
  const snap = await getDocs(q);
  allProducts = [];
  snap.forEach(d=>allProducts.push({id:d.id,...d.data()}));
  render(allProducts);
}

function getMediaHtml(url, name){
  if(!url) return '<img src="https://via.placeholder.com/300" alt="No Image">';

  if(url.includes('youtube.com/watch') || url.includes('youtu.be/')){
    let videoId = '';
    if(url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
    else if(url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:8px"></iframe>`;
  }

  return `<img src="${url}" alt="${name}" onerror="this.src='https://via.placeholder.com/300'">`;
}

function render(products){
  const grid = document.getElementById('grid');
  grid.innerHTML = products.length?products.map(p=>{
    const mainImg = (p.images||[])[0] || p.img || 'https://via.placeholder.com/300';
    const totalMedia = (p.images||[]).length || 1;
    const hasVideo = mainImg.includes('youtube') || mainImg.includes('youtu.be');

    return `
    <div class="p-card">
      <div class="p-img" onclick="window.location='product.html?id=${p.id}'">
        ${getMediaHtml(mainImg, p.name)}
        ${p.soldout || p.stock === 0?'<div class="soldout">SOLD OUT</div>':''}
        ${p.brand?`<div class="brand">${p.brand}</div>`:''}
        ${totalMedia > 1?`<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.8);color:#fff;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700">${hasVideo?'▶':''} 1/${totalMedia}</div>`:''}
      </div>
      <div class="p-info">
        <div class="p-name" onclick="window.location='product.html?id=${p.id}'">${p.name}</div>
        <div class="p-price">৳${p.price}</div>
        <button class="buy-btn" onclick='openOrderForm(${JSON.stringify(p)})' ${p.soldout || p.stock === 0?'disabled':''}>
          ${p.soldout || p.stock === 0?'Out of Stock':'Buy Now'}
        </button>
      </div>
    </div>
  `}).join(''):'<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">No products</div>';
}

window.filter = function(cat,el){
  if(el){
    document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
  }
  render(cat==='all'?allProducts:allProducts.filter(p=>p.categories && p.categories.includes(cat)));
}

window.search = function(term){
  render(allProducts.filter(p=>p.name.toLowerCase().includes(term.toLowerCase())));
}

window.toggleMenu = function(){
  document.getElementById('menu').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

window.openOrderForm = function(p){
  currentProduct = p;
  currentPrice = p.price;
  document.getElementById('orderProduct').value = p.name;
  document.getElementById('orderColor').value = p.color? p.color.split(',')[0].trim() : 'N/A';
  document.getElementById('productPrice').textContent = p.price + ' TK';
  document.getElementById('orderModal').classList.add('active');
  document.getElementById('deliveryCharge').textContent = '0 TK';
  document.getElementById('totalAmount').textContent = p.price + ' TK';
  document.querySelectorAll('input[name="delivery"]').forEach(r => r.checked = false);
}

window.updateTotal = function(){
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const charge = delivery? parseInt(delivery.value) : 0;
  document.getElementById('deliveryCharge').textContent = charge + ' TK';
  document.getElementById('totalAmount').textContent = (currentPrice + charge) + ' TK';
}

window.closeModal = function(){
  document.getElementById('orderModal').classList.remove('active');
  document.getElementById('orderName').value = '';
  document.getElementById('orderPhone').value = '';
  document.getElementById('orderAddress').value = '';
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

  if(!name) return alert('নাম লিখুন!');
  if(!phone || phone.length < 11) return alert('সঠিক মোবাইল নাম্বার দিন!');
  if(!address) return alert('ঠিকানা লিখুন!');
  if(!delivery) return alert('ডেলিভারি এরিয়া সিলেক্ট করুন!');

  const deliveryCharge = parseInt(delivery.value);
  const deliveryArea = deliveryCharge === 80? 'Inside Dhaka' : 'Outside Dhaka';
  const productColor = currentProduct.color? currentProduct.color.split(',')[0].trim() : 'N/A';
  const mainImg = (currentProduct.images||[])[0] || currentProduct.img;

  const orderData = {
    customerName: name,
    phone: phone,
    address: address,
    productName: currentProduct.name,
    productPrice: currentPrice,
    productColor: productColor,
    deliveryCharge: deliveryCharge,
    deliveryArea: deliveryArea,
    totalAmount: currentPrice + deliveryCharge,
    orderTime: new Date().toLocaleString('en-BD', {timeZone: 'Asia/Dhaka'}),
    orderStatus: "New"
  };

  saveOrderToHistory(currentProduct.name, currentPrice + deliveryCharge, mainImg, productColor);

  push(ref(database, 'orders'), orderData).then(()=>{
    alert('✅ অর্ডার সফল!\n\nপ্রোডাক্ট: ' + currentProduct.name + '\nসর্বমোট: ' + (currentPrice + deliveryCharge) + ' TK\n\nআমরা শীঘ্রই কল দিব।');
    closeModal();
    window.location.href = 'my-orders.html';
  });
}

loadProducts();
