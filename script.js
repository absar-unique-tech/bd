import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { getDatabase, ref, push } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyCI39dQTYcZ76ROxUY73jYB3OZPfjsyegI",
  authDomain: "absar-unique-tech.firebaseapp.com",
  databaseURL: "https://absar-unique-tech-default-rtdb.firebaseio.com",
  projectId: "absar-unique-tech",
  storageBucket: "absar-unique-tech.firebasestorage.app",
  messagingSenderId: "576285730220",
  appId: "1:576285730220:web:1d3cdf9cf3ddc4e00b4609",
  measurementId: "G-T77Z74DM83"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

let products = [];
let filteredProducts = [];
let currentPrice = 0;
let currentProduct = '';

async function loadProducts(){
  try {
    const snap = await getDocs(collection(db,'products'));
    products = snap.docs.map(d=>({id:d.id,...d.data()}));
    filteredProducts = products;
    render();
  } catch(e){
    console.error('Error:',e);
    document.getElementById('grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">Products load করতে সমস্যা। F12 চেপে Console দেখ।</div>';
  }
}

function render(){
  const grid = document.getElementById('grid');
  if(filteredProducts.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">কোনো প্রোডাক্ট নাই</div>';
    return;
  }
  grid.innerHTML = filteredProducts.map(p=>`
    <div class="p-card">
      <div class="p-img" onclick="window.location.href='product.html?id=${p.id}'">
        <img src="${p.img||'https://via.placeholder.com/300'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300'">
        ${p.soldout?'<div class="soldout">SOLD OUT</div>':''}
        ${p.brand?`<div class="brand">${p.brand}</div>`:''}
      </div>
      <div class="p-info">
        <div class="p-name" onclick="window.location.href='product.html?id=${p.id}'">${p.name}</div>
        <div class="p-price">৳${p.price}</div>
        ${!p.soldout ? `<button class="buy-btn" onclick="event.stopPropagation(); openOrderForm(${p.price}, '${p.name.replace(/'/g,"\\'")}')">অর্ডার করুন</button>` : ''}
      </div>
    </div>
  `).join('');
}

window.filter = function(cat){
  if(cat==='all') filteredProducts = products;
  else filteredProducts = products.filter(p=>p.category===cat);
  render();
}

window.search = function(q){
  q = q.toLowerCase();
  filteredProducts = products.filter(p=>
    p.name.toLowerCase().includes(q) || 
    (p.brand && p.brand.toLowerCase().includes(q))
  );
  render();
}

window.toggleMenu = function(){
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('overlay');
  if(menu && overlay){
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

window.openOrderForm = function(price, productName) {
  currentPrice = price;
  currentProduct = productName;
  document.getElementById('orderProduct').value = productName;
  document.getElementById('productPrice').textContent = price + ' TK';
  document.getElementById('orderModal').classList.add('active');
  document.getElementById('deliveryCharge').textContent = '0 TK';
  document.getElementById('totalAmount').textContent = price + ' TK';
  document.querySelectorAll('input[name="delivery"]').forEach(r => r.checked = false);
}

window.updateTotal = function() {
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const charge = delivery ? parseInt(delivery.value) : 0;
  document.getElementById('deliveryCharge').textContent = charge + ' TK';
  document.getElementById('totalAmount').textContent = (currentPrice + charge) + ' TK';
}

window.closeModal = function() {
  document.getElementById('orderModal').classList.remove('active');
  document.getElementById('orderName').value = '';
  document.getElementById('orderPhone').value = '';
  document.getElementById('orderAddress').value = '';
}

window.submitOrder = function() {
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const address = document.getElementById('orderAddress').value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked');
  
  if(!name) return alert('নাম লিখুন!');
  if(!phone || phone.length < 11) return alert('সঠিক মোবাইল নাম্বার দিন!');
  if(!address) return alert('ঠিকানা লিখুন!');
  if(!delivery) return alert('ডেলিভারি এরিয়া সিলেক্ট করুন!');

  const deliveryCharge = parseInt(delivery.value);
  const deliveryArea = deliveryCharge === 80 ? 'Inside Dhaka' : 'Outside Dhaka';
  
  const orderData = {
    customerName: name,
    phone: phone,
    address: address,
    productName: currentProduct,
    productPrice: currentPrice,
    deliveryCharge: deliveryCharge,
    deliveryArea: deliveryArea,
    totalAmount: currentPrice + deliveryCharge,
    orderTime: new Date().toLocaleString('en-BD', {timeZone: 'Asia/Dhaka'}),
    orderStatus: "New"
  };

  push(ref(database, 'orders'), orderData).then(() => {
    alert('✅ অর্ডার সফল!\n\nপ্রোডাক্ট: ' + currentProduct + '\nসর্বমোট: ' + (currentPrice + deliveryCharge) + ' TK\n\nআমরা শীঘ্রই কল দিব।');
    closeModal();
  }).catch((error) => {
    alert('❌ সমস্যা: ' + error.message);
  });
}

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  document.getElementById('cartCount').textContent = count;
}

loadProducts();
updateCartCount();
