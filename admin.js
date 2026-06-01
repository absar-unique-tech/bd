let products = JSON.parse(localStorage.getItem('aut_products') || '[]');
let orders = JSON.parse(localStorage.getItem('aut_orders') || '[]');
let users = JSON.parse(localStorage.getItem('aut_users') || '[]');

function login(){
  if(document.getElementById('pass').value==='3316'){
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('panel').style.display='block';
    loadDash();
  }else alert('Wrong password!');
}

function logout(){location.reload()}

function showTab(tab,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.content').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tab).classList.add('active');
  if(tab==='dash') loadDash();
  if(tab==='products') loadTable();
  if(tab==='orders') loadOrders();
  if(tab==='customers') loadCustomers();
}

function loadDash(){
  document.getElementById('statP').textContent = products.length;
  document.getElementById('statO').textContent = orders.length;
  document.getElementById('statC').textContent = users.length;
}

function loadTable(){
  const t = document.getElementById('pTable');
  t.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
    <tbody>${products.map(p=>`<tr><td><img src="${p.images[0]}"></td><td>${p.name}</td><td>${p.category}</td><td>৳${p.price}</td><td>${p.stock}</td><td><button class="btn-del" onclick="delP('${p.id}')">Delete</button></td></tr>`).join('')}</tbody>`;
}

function addProduct(e){
  e.preventDefault();
  const p = {
    id: 'PROD-'+Date.now(),
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
  products.push(p);
  localStorage.setItem('aut_products',JSON.stringify(products));
  alert('Product added!');
  e.target.reset();
  loadTable();
}

function delP(id){
  if(confirm('Delete?')){
    products = products.filter(p=>p.id!==id);
    localStorage.setItem('aut_products',JSON.stringify(products));
    loadTable();
  }
}

function loadOrders(){
  const t = document.getElementById('oTable');
  t.innerHTML = `<thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>${orders.map(o=>`<tr><td>${o.id}</td><td>${o.userId}</td><td>${o.date}</td><td>৳${o.total}</td><td>${o.status}</td></tr>`).join('')}</tbody>`;
}

function loadCustomers(){
  const t = document.getElementById('cTable');
  t.innerHTML = `<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
    <tbody>${users.map(u=>`<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td></tr>`).join('')}</tbody>`;
}
