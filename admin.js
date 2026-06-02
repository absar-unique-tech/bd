import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

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
let currentEditId = null;

window.login = function(){
  const pass = document.getElementById('pass').value;
  if(pass === '3316'){
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('panel').classList.remove('hidden');
    document.getElementById('panel').style.display = 'block';
    loadDash();
  } else {
    alert('Wrong password!');
  }
}

window.logout = function(){ location.reload() }

window.showTab = function(tab,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tab).classList.add('active');
  if(tab==='dash') loadDash();
  if(tab==='products') loadTable();
  if(tab==='orders') loadOrders();
}

async function loadDash(){
  try {
    const pSnap = await getDocs(collection(db, "products"));
    products = pSnap.docs.map(doc => ({id: doc.id,...doc.data()}));
    document.getElementById('statP').textContent = products.length;

    getDocs(collection(db, "orders")).then(oSnap => {
      document.getElementById('statO').textContent = oSnap.size;
    }).catch(e => {
      console.log("Orders skip:", e);
      document.getElementById('statO').textContent = '0';
    });

  } catch(e){
    console.error("Error:", e);
    alert('Firebase Error! Rules চেক করো।');
  }
}

async function loadTable(){
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    products = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
    const t = document.getElementById('pTable');
    if(products.length===0){
      t.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999">No products yet</td></tr>';
      return;
    }
    t.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>${products.map(p=>`<tr><td><img src="${(p.images||[])[0]||p.img||'https://via.placeholder.com/50'}" style="width:50px;height:50px;object-fit:cover;border-radius:8px"></td><td>${p.name}<br><small style="color:#666">${p.brand||''}</small></td><td>${(p.categories||[p.category]||[]).join(', ')}</td><td>৳${p.price}</td><td>${p.stock}</td><td style="display:flex;gap:6px"><button class="btn-edit" onclick="editP('${p.id}')" style="background:#ff9800;color:#fff;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">✏️ Edit</button><button class="btn-del" onclick="delP('${p.id}')">Delete</button></td></tr>`).join('')}</tbody>`;
  } catch(e){
    console.error("Error:", e);
  }
}

async function loadOrders(){
  try {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    orders = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
    const list = document.getElementById('orderList');

    if(orders.length===0){
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#999;background:#fff;border-radius:12px">No orders yet</div>';
      return;
    }

    list.innerHTML = orders.map(o=>`
      <div class="order-card" style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.1);border-left:4px solid #ff6b00">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:16px;border-bottom:2px solid #f5f5f7">
          <div style="font-size:18px;font-weight:700;color:#1d1d1f">Order #${o.id.slice(-6).toUpperCase()}</div>
          <div style="background:#ff9500;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700">${o.status.toUpperCase()}</div>
        </div>

        <div style="background:#f5f5f7;padding:14px;border-radius:10px;margin-bottom:16px">
          <div style="font-weight:700;color:#666;margin-bottom:8px;font-size:13px">📦 ITEMS:</div>
          ${o.items.map(i=>`
            <div style="display:flex;justify-content:space-between;margin:6px 0;font-size:14px">
              <span>${i.name} ${i.color?`(${i.color})`:''} x${i.qty}</span>
              <span style="font-weight:600">৳${i.price * i.qty}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;margin:6px 0;font-size:14px;color:#666">
            <span>Shipping</span>
            <span>৳60</span>
          </div>
        </div>

        <div style="background:#fff3e6;padding:16px;border-radius:10px;border:2px solid #ff6b00;margin-bottom:16px">
          <div style="font-weight:700;color:#ff6b00;font-size:15px;margin-bottom:12px">👤 CUSTOMER DETAILS:</div>
          <div style="margin:8px 0;font-size:15px"><strong>Name:</strong> ${o.customer.name}</div>
          <div style="margin:8px 0;font-size:15px"><strong>Phone:</strong> <a href="tel:${o.customer.phone}" style="color:#007aff;text-decoration:none;font-weight:600">${o.customer.phone}</a></div>
          <div style="margin:8px 0;font-size:15px"><strong>Address:</strong> ${o.customer.address}</div>
          <div style="margin:8px 0;font-size:13px;color:#666"><strong>Order Date:</strong> ${new Date(o.date).toLocaleString('bn-BD')}</div>
        </div>

        <div style="text-align:right;font-size:22px;font-weight:800;color:#ff6b00">
          Total: ৳${o.total}
        </div>
      </div>
    `).join('');
  } catch(e){
    console.error("Error loading orders:", e);
    document.getElementById('orderList').innerHTML = '<div style="text-align:center;padding:40px;color:#ff3b30;background:#fff;border-radius:12px">Error loading orders. Check Firebase.</div>';
  }
}

window.addProduct = async function(e){
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    let mediaLinks = document.getElementById('pImg').value
   .split(/[\r\n]+/)
   .map(s=>s.trim())
   .filter(s=>s!== '');

    if(mediaLinks.length === 0){
      mediaLinks = ['https://via.placeholder.com/300x300?text=No+Image'];
    }

    const p = {
      name: document.getElementById('pName').value,
      categories: Array.from(document.querySelectorAll('input[name="pCategory"]:checked')).map(c=>c.value),
      brand: document.getElementById('pBrand').value || '',
      price: parseInt(document.getElementById('pPrice').value),
      stock: parseInt(document.getElementById('pStock').value),
      images: mediaLinks,
      img: mediaLinks[0],
      colors: document.getElementById('pColor').value.split(',').map(s=>s.trim()).filter(s=>s),
      description: document.getElementById('pDesc').value,
      features: document.getElementById('pFeat').value.split(',').map(s=>s.trim()).filter(s=>s),
      createdAt: new Date().toISOString()
    };

    if(!p.name ||!p.price || p.categories.length===0){
      alert('❌ নাম, দাম আর ক্যাটাগরি লাগবেই!');
      btn.disabled = false;
      btn.textContent = 'Add Product';
      return;
    }

    await addDoc(collection(db, "products"), p);
    alert('✅ Product added successfully!');
    e.target.reset();
    loadDash();
    loadTable();
  } catch(e){
    console.error("Error:", e);
    alert('❌ Error adding product. Check Firebase Rules.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Product';
  }
}

window.delP = async function(id){
  if(confirm('Delete this product?')){
    try {
      await deleteDoc(doc(db, "products", id));
      alert('✅ Deleted!');
      loadTable();
      loadDash();
    } catch(e){
      console.error("Error:", e);
      alert('❌ Error deleting');
    }
  }
}

window.editP = function(id){
  const p = products.find(prod => prod.id === id);
  if(!p) return;

  currentEditId = id;

  document.getElementById('editModal').classList.add('active');
  document.getElementById('editId').value = p.id;
  document.getElementById('editName').value = p.name || '';
  document.getElementById('editBrand').value = p.brand || '';
  document.getElementById('editPrice').value = p.price || 0;
  document.getElementById('editStock').value = p.stock || 0;
  document.getElementById('editColor').value = (p.colors || []).join(', ');

  document.querySelectorAll('#editModal input[name="editCategory"]').forEach(cb=>{
    cb.checked = (p.categories || [p.category] || []).includes(cb.value);
  });

  document.getElementById('editImg').value = (p.images || [p.img] || []).join('\n');
  document.getElementById('editFeatures').value = (p.features || []).join(', ');
  document.getElementById('editDetails').value = p.details || '';
  document.getElementById('editDesc').value = p.description || '';
}

window.closeEditModal = function(){
  document.getElementById('editModal').classList.remove('active');
  currentEditId = null;
}

window.updateProduct = async function(){
  if(!currentEditId) return;

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Updating...';

  try {
    const mediaLinks = document.getElementById('editImg').value
   .split(/[\r\n]+/)
   .map(s=>s.trim())
   .filter(s=>s!== '');

    const data = {
      name: document.getElementById('editName').value,
      brand: document.getElementById('editBrand').value,
      price: parseInt(document.getElementById('editPrice').value),
      stock: parseInt(document.getElementById('editStock').value) || 0,
      colors: document.getElementById('editColor').value.split(',').map(s=>s.trim()).filter(s=>s),
      categories: Array.from(document.querySelectorAll('#editModal input[name="editCategory"]:checked')).map(c=>c.value),
      images: mediaLinks,
      img: mediaLinks[0],
      features: document.getElementById('editFeatures').value.split(',').map(s=>s.trim()).filter(s=>s),
      details: document.getElementById('editDetails').value,
      description: document.getElementById('editDesc').value
    };

    if(!data.name ||!data.price || data.categories.length===0){
      alert('❌ নাম, দাম আর ক্যাটাগরি লাগবেই!');
      btn.disabled = false;
      btn.textContent = '✅ Update Product';
      return;
    }

    await updateDoc(doc(db,'products', currentEditId), data);
    alert('✅ প্রোডাক্ট আপডেট হইছে!');
    closeEditModal();
    loadTable();
    loadDash();
  } catch(e){
    console.error("Error:", e);
    alert('❌ Error updating product');
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ Update Product';
  }
}
