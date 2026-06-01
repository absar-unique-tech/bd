import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCI39dQTYcZ76ROxUY73jYB3OZPfjsyegI",
  authDomain: "absar-unique-tech.firebaseapp.com",
  projectId: "absar-unique-tech",
  storageBucket: "absar-unique-tech.firebasestorage.app",
  messagingSenderId: "576285730220",
  appId: "1:576285730220:web:1d3cdf9cf3ddc4e00b4609",
  measurementId: "G-T77Z74DM83"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let products = [];
let filteredProducts = [];

async function loadProducts(){
  try {
    const snap = await getDocs(collection(db,'products'));
    products = snap.docs.map(d=>({id:d.id,...d.data()}));
    filteredProducts = products;
    render();
  } catch(e){
    console.error('Error loading products:',e);
    document.getElementById('grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">Failed to load products</div>';
  }
}

function render(){
  const grid = document.getElementById('grid');
  if(filteredProducts.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">No products found</div>';
    return;
  }
  grid.innerHTML = filteredProducts.map(p=>`
    <a href="product.html?id=${p.id}" class="p-card">
      <div class="p-img">
        <img src="${p.img||'https://via.placeholder.com/300'}" alt="${p.name}">
        ${p.soldout?'<div class="soldout">SOLD OUT</div>':''}
        ${p.brand?`<div class="brand">${p.brand}</div>`:''}
      </div>
      <div class="p-info">
        <div class="p-name">${p.name}</div>
        <div class="p-price">৳${p.price}</div>
      </div>
    </a>
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
  menu.classList.toggle('active');
  overlay.classList.toggle('active');
}

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  document.getElementById('cartCount').textContent = count;
}

loadProducts();
updateCartCount();
