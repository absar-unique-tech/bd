let products = JSON.parse(localStorage.getItem('aut_products') || '[]');
let cart = JSON.parse(localStorage.getItem('aut_cart') || '[]');

document.addEventListener('DOMContentLoaded', function(){
  loadProducts();
  updateCartCount();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js')}
});

function toggleMenu(){
  document.getElementById('menu').classList.toggle('active');
}

function showTab(tab,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tab+'Tab').classList.add('active');
}

function loadProducts(list
