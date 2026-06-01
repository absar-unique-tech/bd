import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

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
let orders = [];

window.login = function(){
  const pass = document.getElementById('pass').value;
  if(pass === '3316'){
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('panel').style.display = 'block';
    loadDash();
  } else {
    alert('Wrong password!');
  }
}

window.logout = function(){ location.reload() }

window.showTab = function(tab,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.content').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tab).classList.add('active');
  if(tab==='dash') loadDash();
  if(tab==='products') loadTable();
  if(tab==='orders') loadOrders();
}

async function loadDash(){
  try {
    const pSnap = await getDocs(collection(db, "products"));
    const oSnap = await getDocs(collection(db, "orders"));
    products = pSnap.docs.map(doc => ({id: doc.id,...doc.data()}));
    orders = oSnap.docs.map(doc => ({id: doc.id,...doc.data()}));
    document.getElementById('statP').textContent = products.length;
    document.getElementById('statO').textContent = orders.length;
  } catch(e){
    console.error("Error loading dashboard:", e);
    alert('Firebase Error! Rules চেক করো।');
  }
}

async function loadTable(){
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    products = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
    const t = document.getElementById('pTable');
    if(products.length===0){
      t.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999">No products yet. Add from "Add Product" tab.</td></tr>';
      return;
    }
    t.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>${products.map(p=>`<tr><td><img src="${p.images[0]}" style="width:50px;height:50px;object-fit:cover;border-radius:8px"></td><td>${p.name}</td><td>${p.category}</td><td>৳${p.price}</td><td>${p.stock}</td><td><button class="btn-del" onclick="delP('${p.id}')">Delete</button></td></tr>`).join('')}</tbody>`;
  } catch(e){
    console.error("Error loading products:", e);
    document.getElementById('pTable').innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#ff3b30">Error loading products. Check Firebase Rules.</td></tr>';
  }
}

async function loadOrders(){
  try {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    orders = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
    const list = document.getElementById('orderList');
    if(orders.length===0){
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#999;background:#fff;border-radius:12px">No orders yet</div>';
      return;
    }
    list.innerHTML = orders.map(o=>`
      <div class="order-card">
        <div class="order-head">
          <div class="order-id">Order #${o.id.slice(-6)}</div>
          <div class="status pending">${o.status}</div>
        </div>
        <div class="order-items">${o.items.map(i=>`${i.name} x${i.qty}`).join(', ')}</div>
        <div class="order-total">Total: ৳${o.total}</div>
        <div class="order-customer">
          <strong>${o.customer.name}</strong><br>
          📞 ${o.customer.phone}<br>
          📍 ${o.customer.address}<br>
          🕒 ${new Date(o.date).toLocaleString('en-BD')}
        </div>
      </div>
    `).join('');
  } catch(e){
    console.error("Error loading orders:", e);
    document.getElementById('orderList').innerHTML = '<div style="text-align:center;padding:40px;color:#ff3b30;background:#fff;border-radius:12px">Error loading orders</div>';
  }
}

window.addProduct = async function(e){
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Adding...';
  
  try {
    const p = {
      name: document.getElementById('pName').value,
      category: document.getElementById('pCat').value,
      brand: document.getElementById('pBrand').value || '',
      price: parseInt(document.getElementById('pPrice').value),
      stock: parseInt(document.getElementById('pStock').value),
      images: document.getElementById('pImg').value.split(',').map(s=>s.trim()).filter(s=>s),
      colors: document.getElementById('pColor').value.split(',').map(s=>s.trim()).filter(s=>s),
      description: document.getElementById('pDesc').value,
      features: document.getElementById('pFeat').value.split(',').map(s=>s.trim()).filter(s=>s),
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, "products"), p);
    alert('✅ Product added successfully! সবাই এখন দেখতে পারবে।');
    e.target.reset();
    loadDash();
    loadTable();
  } catch(e){
    console.error("Error adding product:", e);
    alert('❌ Error adding product. Check Firebase Rules.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Product';
  }
}

window.delP = async function(id){
  if(confirm('Are you sure you want to delete this product?')){
    try {
      await deleteDoc(doc(db, "products", id));
      alert('✅ Product deleted!');
      loadTable();
      loadDash();
    } catch(e){
      console.error("Error deleting product:", e);
      alert('❌ Error deleting product');
    }
  }
}
