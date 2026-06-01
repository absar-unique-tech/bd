import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
}

async function loadDash(){
  const querySnapshot = await getDocs(collection(db, "products"));
  products = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
  document.getElementById('statP').textContent = products.length;
}

async function loadTable(){
  const querySnapshot = await getDocs(collection(db, "products"));
  products = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
  const t = document.getElementById('pTable');
  if(products.length===0){
    t.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999">No products yet. Add from "Add Product" tab.</td></tr>';
    return;
  }
  t.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>${products.map(p=>`<tr><td><img src="${p.images[0]}"></td><td>${p.name}</td><td>${p.category}</td><td>৳${p.price}</td><td>${p.stock}</td><td><button class="btn-del" onclick="delP('${p.id}')">Delete</button></td></tr>`).join('')}</tbody>`;
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
