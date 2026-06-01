let users = JSON.parse(localStorage.getItem('aut_users')||'[]');
let currentUser = JSON.parse(localStorage.getItem('aut_user')||'null');

document.addEventListener('DOMContentLoaded', renderAuth);

function renderAuth(){
  const container = document.getElementById('authContainer');
  if(currentUser){
    const orders = JSON.parse(localStorage.getItem('aut_orders')||'[]').filter(o=>o.userId===currentUser.id);
    container.innerHTML = `
      <div class="user-info">
        <h3>Welcome, ${currentUser.name}</h3>
        <div class="info-row"><span>Customer ID:</span><span>${currentUser.id}</span></div>
        <div class="info-row"><span>Email:</span><span>${currentUser.email}</span></div>
        <div class="info-row"><span>Phone:</span><span>${currentUser.phone}</span></div>
        <button class="btn" onclick="logout()" style="margin-top:15px">Logout</button>
      </div>
      <div class="form-box">
        <h2>My Orders</h2>
        ${orders.length===0?'<p style="text-align:center;color:#999">No orders yet</p>':orders.map(o=>`
          <div style="border:1px solid #ddd;padding:15px;border-radius:5px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <strong>${o.id}</strong>
              <span style="color:#ff6b00">${o.status}</span>
            </div>
            <div style="font-size:13px;color:#666">Date: ${o.date}</div>
            <div style="font-size:13px;color:#666">Total: ৳${o.total}</div>
          </div>
        `).join('')}
      </div>`;
  }else{
    container.innerHTML = `
      <div class="form-box">
        <h2>Login</h2>
        <form onsubmit="login(event)">
          <div class="form-group"><label>Email</label><input type="email" id="loginEmail" required></div>
          <div class="form-group"><label>Password</label><input type="password" id="loginPass" required></div>
          <button type="submit" class="btn">Login</button>
        </form>
        <div class="switch">Don't have an account? <a href="#" onclick="showRegister()">Register</a></div>
      </div>`;
  }
}

function showRegister(){
  document.getElementById('authContainer').innerHTML = `
    <div class="form-box">
      <h2>Register</h2>
      <form onsubmit="register(event)">
        <div class="form-group"><label>Name</label><input type="text" id="regName" required></div>
        <div class="form-group"><label>Email</label><input type="email" id="regEmail" required></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="regPhone" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="regPass" required></div>
        <button type="submit" class="btn">Register</button>
      </form>
      <div class="switch">Already have an account? <a href="#" onclick="renderAuth()">Login</a></div>
    </div>`;
}

function register(e){
  e.preventDefault();
  const user = {
    id:'CUST-'+(1001+users.length),
    name:document.getElementById('regName').value,
    email:document.getElementById('regEmail').value,
    phone:document.getElementById('regPhone').value,
    password:document.getElementById('regPass').value
  };
  users.push(user);
  localStorage.setItem('aut_users',JSON.stringify(users));
  localStorage.setItem('aut_user',JSON.stringify(user));
  alert('Registration successful! Your Customer ID: '+user.id);
  renderAuth();
}

function login(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const user = users.find(u=>u.email===email&&u.password===pass);
  if(user){
    localStorage.setItem('aut_user',JSON.stringify(user));
    currentUser=user;
    renderAuth();
  }else{
    alert('Invalid email or password!');
  }
}

function logout(){
  localStorage.removeItem('aut_user');
  currentUser=null;
  renderAuth();
}
