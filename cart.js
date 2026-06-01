let cart = JSON.parse(localStorage.getItem('aut_cart') || '[]');

document.addEventListener('DOMContentLoaded', renderCart);

function renderCart(){
  const container = document.getElementById('cartContainer');
  if(cart.length===0){
    container.innerHTML = `<div class="empty"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><a href="index.html" class="btn">Continue Shopping</a></div>`;
    return;
  }
  let subtotal = 0;
  const itemsHTML = cart.map((item,idx)=>{
    subtotal += item.price * item.qty;
    return `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        ${item.color?`<div style="font-size:12px;color:#666">Color: ${item.color}</div>`:''}
        <div class="item-price">৳${item.price}</div>
        <div class="item-controls">
          <div class="qty-box">
            <button onclick="updateQty(${idx},-1)">-</button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${idx},1)">+</button>
          </div>
          <span class="remove" onclick="removeItem(${idx})">Remove</span>
        </div>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = itemsHTML + `
    <div class="summary">
      <div class="sum-row"><span>Subtotal</span><span>৳${subtotal}</span></div>
      <div class="sum-row"><span>Shipping</span><span>৳60</span></div>
      <div class="sum-row total"><span>Total</span><span>৳${subtotal+60}</span></div>
      <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
    </div>`;
}

function updateQty(idx,change){
  cart[idx].qty += change;
  if(cart[idx].qty<1) cart[idx].qty=1;
  localStorage.setItem('aut_cart',JSON.stringify(cart));
  renderCart();
}

function removeItem(idx){
  cart.splice(idx,1);
  localStorage.setItem('aut_cart',JSON.stringify(cart));
  renderCart();
}

function checkout(){
  const user = JSON.parse(localStorage.getItem('aut_user')||'null');
  if(!user){alert('Please login first!');location.href='login.html';return}
  const orders = JSON.parse(localStorage.getItem('aut_orders')||'[]');
  const order = {
    id:'ORD-'+Date.now(),
    userId:user.id,
    items:cart,
    total:cart.reduce((s,i)=>s+i.price*i.qty,0)+60,
    date:new Date().toLocaleDateString(),
    status:'Pending'
  };
  orders.push(order);
  localStorage.setItem('aut_orders',JSON.stringify(orders));
  cart=[];
  localStorage.setItem('aut_cart',JSON.stringify(cart));
  alert('Order placed successfully! Order ID: '+order.id);
  location.href='index.html';
}
