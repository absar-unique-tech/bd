import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCI39dQTYcZ76ROxUY73jYB3OZPfjsyegI",
  authDomain: "absar-unique-tech.firebaseapp.com",
  projectId: "absar-unique-tech",
  storageBucket: "absar-unique-tech.firebasestorage.app",
  messagingSenderId: "576285730220",
  appId: "1:576285730220:web:1d3cdf9cf3ddc4e00b4609"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let allProducts = [];
let filteredProducts = [];

async function loadProducts(){
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    allProducts = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
    filteredProducts = allProducts;
    renderProducts();
    updateCartCount();
  } catch(e){
    console.error("Error loading products:", e);
    document.getElementById('grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ff3b30">Error loading products. Check Firebase Rules.</div>';
  }
}

function renderProducts(){
  const grid = document.getElementById('grid');
  if(filteredProducts.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999">No products available. Add from Admin Panel.</div>';
    return;
  }
  grid.innerHTML = filteredProducts.map(p => `
    <a href="product.html?id=${p.id}" class="p-card">
      <div class="p-img">
        <img src="${p.images[0]}" alt="${p.name}">
        ${p.stock===0?'<div class="soldout">SOLD OUT</div>':''}
        ${p.brand?`<div class="brand">${p.brand}</div>`:''}
      </div>
      <div class="p-info">
        <div class="p-name">${p.name}</div>
        <div class="p-price">৳${p.price}</div>
      </div>
    </a>
  `).join('');
}

window.search = function(query){
  query = query.toLowerCase();
  filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    (p.brand && p.brand.toLowerCase().includes(query))
  );
  renderProducts();
}

window.filter = function(cat){
  filteredProducts = cat === 'all'? allProducts : allProducts.filter(p => p.category === cat);
  renderProducts();
}

window.toggleMenu = function(){
  document.getElementById('menu').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  document.getElementById('cartCount').textContent = cart.reduce((sum,i)=>sum+i.qty,0);
}

loadProducts();
