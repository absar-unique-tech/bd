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
let products = [];
let cart = JSON.parse(localStorage.getItem('aut_cart') || '[]');

document.addEventListener('DOMContentLoaded', async function(){
  await loadProducts();
  updateCartCount();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js')}
});

async function loadProducts(){
  const querySnapshot = await getDocs(collection(db, "products"));
  products = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
  renderProducts(products);
}

function toggleMenu(){document.getElementById('menu').classList.toggle('active')}
function showTab(tab,el){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));el.classList.add('active');document.getElementById(tab+'Tab').classList.add('active')}

function renderProducts(list=products){
  const grid = document.getElementById('grid');
  if(list.length===0){grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#999">No Products Found<br><br><a href="admin.html" style="color:#ff6b00">Add Products from Admin Panel</a></p>';return}
  grid.innerHTML = list.map(p=>`<a href="product.html?id=${p.id}" class="p-card"><div class="p-img">${p.stock===0?'<span class="soldout">SOLD OUT</span>':''}${p.brand?`<span class="brand">${p.brand}</span>`:''}<img src="${p.images[0]}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300'"></div><div class="p-info"><div class="p-name">${p.name}</div><div class="p-price">৳${p.price}</div></div></a>`).join('');
}

window.filter = function(cat){toggleMenu();const filtered = cat==='all'?products:products.filter(p=>p.category===cat);renderProducts(filtered)}
window.search = function(val){const filtered = products.filter(p=>p.name.toLowerCase().includes(val.toLowerCase()) || p.category.toLowerCase().includes(val.toLowerCase()));renderProducts(filtered)}
function updateCartCount(){const count = cart.reduce((s,i)=>s+i.qty,0);document.getElementById('cartCount').textContent = count}
window.toggleMenu = toggleMenu; window.showTab = showTab;
