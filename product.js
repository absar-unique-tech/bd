let products = JSON.parse(localStorage.getItem('aut_products') || '[]');
let cart = JSON.parse(localStorage.getItem('aut_cart') || '[]');
let currentProduct = null;
let selectedColor = null;
let qty = 1;

document.addEventListener('DOMContentLoaded', function(){
  const id = new URLSearchParams(window.location.search).get('id');
  currentProduct = products.find(p=>p.id===id);
  if(currentProduct){
    renderDetails();
    updateCartCount();
  }else{
    document.getElementById('details').innerHTML = '<p style="text-align:center;padding:40px">Product not found</p>';
  }
});

function renderDetails(){
  const p = currentProduct;
  document.getElementById('details').innerHTML = `
    <div class="gallery">
      <img id="mainImg" src="${p.images[0]}" alt="${p.name}">
      <div class="thumbs">
        ${p.images.map((img,i)=>`<img src="${img}" class="${i===0?'active':''}" onclick="changeImg('${img}',this)">`).join('')}
      </div>
    </div>
    <div class="content">
      <div class="breadcrumb"><a href="index.html">Home</a> / ${p.category} / ${p.name}</div>
      ${p.brand?`<div class="brand"><span>${p.brand}</span></div>`:''}
      <h1 class="name">${p.name}</h1>
      <div class="price">৳${p.price}</div>
      ${p.colors&&p.colors.length>0?`
      <div class="color-sec">
        <label>Color:</label>
        <div class="colors">
          ${p.colors.map(c=>`<button class="color-btn" onclick="selectColor('${c}',this)">${c}</button>`).join('')}
        </div>
      </div>`:''}
      <div class="qty-sec">
        <div class="qty-box">
          <button onclick="changeQty(-1)">-</button>
          <input type="number" id="qty" value="1" min="1" max="${p.stock}">
          <button onclick="changeQty(1)">+</button>
        </div>
      </div>
      <div class="btns">
        <button class="btn" onclick="addCart()" ${p.stock===0?'disabled':''}>Add to cart</button>
        <button class="btn" onclick="buyNow()" ${p.stock===0?'disabled':''}>Buy now</button>
      </div>
      <div class="wishlist" onclick="alert('Added to wishlist!')">♡ Add to wishlist</div>
      <div class="cat-info">Category: ${p.category}</div>
      <div class="desc">
        <h3>Description</h3>
        <h4>${p.name}</h4>
        <p>${p.description||'No description'}</p>
        ${p.features?`<h4>Key Features:</h4><ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul>`:''}
        <h4>Specifications:</h4>
        <p>Stock: ${p.stock} units</p>
        ${p.brand?`<p>Brand: ${p.brand}</p>`:''}
      </div>
    </div>
  `;
}

function changeImg(src,el){
  document.getElementById('mainImg').src = src;
  document.querySelectorAll('.thumbs img').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
}

function selectColor(c,el){
  selectedColor = c;
  document.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}

function changeQty(d){
  const input = document.getElementById('qty');
  qty = parseInt(input.value) + d;
  if(qty<1) qty=1;
  if(qty>currentProduct.stock) qty=currentProduct.stock;
  input.value = qty;
}

function addCart(){
  if(currentProduct.stock===0){alert('Out of stock!');return}
  qty = parseInt(document.getElementById('qty').value);
  const exist = cart.find(i=>i.id===currentProduct.id&&i.color===selectedColor);
  if(exist){exist.qty+=qty}else{
    cart.push({id:currentProduct.id,name:currentProduct.name,price:currentProduct.price,image:currentProduct.images[0],qty:qty,color:selectedColor});
  }
  localStorage.setItem('aut_cart',JSON.stringify(cart));
  updateCartCount();
  alert('Added to cart!');
}

function buyNow(){addCart();location.href='cart.html'}
function updateCartCount(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = count;
}
