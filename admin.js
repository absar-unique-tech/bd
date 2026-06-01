import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

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
  const pSnap = await getDocs(collection(db, "products"));
  const oSnap = await getDocs(collection(db, "orders"));
  products = pSnap.docs.map(doc => ({id: doc.id,...doc.data()}));
  orders = oSnap.docs.map(doc => ({id: doc.id,...doc.data()}));
  document.getElementById('statP').textContent = products.length;
  document.getElementById('statO').textContent = orders.length;
}

async function loadTable(){
  const querySnapshot = await getDocs(collection(db, "products"));
  products = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
  const t = document.getElementById('pTable');
  if(products.length===0){
    t.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999">No products yet</td></tr>';
    return;
  }
  t.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>${products.map(p=>`<tr><td><img src="${p.images[0]}" style="width:50px;height:50px;object-fit:cover;border-radius:8px"></td><td>${p.name}</td><td>${p.category}</td><td>৳${p.price}</td><td>${p.stock}</td><td><button class="btn-del" onclick="delP('${p.id}')" style="background:#ff3b30;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">Delete</button></td></tr>`).join('')}</tbody>`;
}

async function loadOrders(){
  const querySnapshot = await getDocs(collection(db, "orders"));
  orders = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
  const list = document.getElementById('orderList');
  if(orders.length===0){
    list.innerHTML = '<div style="text-align:center;padding:40px;color:#999">No orders yet</div>';
    return;
  }
  list.innerHTML = orders.reverse().map(o=>`
    <div style="background:#f5f5f7;border-radius:12px;padding:16px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <div style="font-weight:600">Order #${o.id.slice(-6)}</div>
        <div style="background:#007aff;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px">${o.status}</div>
      </div>
      <div style="color:#666;margin-bottom:8px">${o.items.map(i=>`${i.name} x${i.qty}`).join(', ')}</div>
      <div style="font-weight:600;margin-bottom:8px">Total: ৳${o.total}</div>
      <div style="font-size:14px;color:#666">
        ${o.customer.name} | ${o.customer.phone}<br>
        ${o.customer.address}
      </div>
    </div>
  `).join('');
}

window.addProduct = async function(e){
  e.preventDefault();
  const p = {
    name: document.getElementById('pName').value,
    category: document.getElementById('pCat').value,
    brand: document.getElementById('pBrand').value,
    price: parseInt(document.getElementById('pPrice').value),
    stock: parseInt(document.getElementById('pStock').value),
    images: document.getElementById('pImg').value.split(',').map(s=>s.trim()),
    colors: document.getElementById('pColor').value.split(',').map(s=>s.trim()).filter(s=>s),
    description: document.getElementById('pDesc').value,
    features: document.getElementById('pFeat').value.split(',').map(s=>s.trim()).filter(s=>s)
  };
  await addDoc(collection(db, "products"), p);
  alert('Product added! সবাই এখন দেখতে পারবে ✅');
  e.target.reset();
  loadTable();
}

window.delP = async function(id){
  if(confirm('Delete this product?')){
    await deleteDoc(doc(db, "products", id));
    loadTable();
    alert('Deleted!')
  }
}
