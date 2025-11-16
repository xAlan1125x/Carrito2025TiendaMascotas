// === Datos de ejemplo (puedes cambiarlos) ===
const productos = [
  { id: 1, nombre: "Plato de comida", precio: 5000, img: "https://imgs.search.brave.com/WJeKcnOeqsp1PvWvsp3L0ePMtwHLK74aLQIU2WixmkQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzUxdHNBYzVrZlZM/LmpwZw" },
  { id: 2, nombre: "Rascador mediano", precio: 15000, img: "https://imgs.search.brave.com/tSd5X9wjdDnEuKoXpKMPdtc4L7dlxJuUaHORsg_j8Ok/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxREVMYm44aEZM/LmpwZw" },
  { id: 3, nombre: "Alimento CatChow x 15kg", precio: 60000, img: "https://imgs.search.brave.com/PkK1GogQB4hYLD08CmJ_W5jxR2uTKsZjlwz8NgrTyzY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9lbG11/bmRvZGVsYXNtYXNj/b3Rhcy5jb20uYXIv/d3AtY29udGVudC91/cGxvYWRzLzIwMjMv/MDUvY2F0LWNob3ct/MTguanBn" },
  { id: 4, nombre: "Juguete ratón", precio: 3000, img: "https://imgs.search.brave.com/yfJfw-ZcA_OVpEsQQ2LPISoNJ0_MatxS3yhM_8VfzKo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9OUV9OUF85/MzkxMTEtTUxBNDYz/ODIwOTA4MjRfMDYy/MDIxLVYud2VicA" }
];

// === Estado del carrito ===
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

//Descuento
// ------------------ Códigos de descuento ------------------
const discountCodes = {
  "OFF10":   { type: 'percent', value: 10, descripcion: '10% de descuento' },
  "SAVE200": { type: 'fixed', value: 200, descripcion: '200 ARS de descuento' },
  "PROMO50": { type: 'percent', value: 50, minSubtotal: 3000, descripcion: '50% si gastás >= ARS 3000' }
};

let appliedDiscount = JSON.parse(localStorage.getItem('appliedDiscount')) || null;


// === Selectores DOM ===
const productosDiv = document.getElementById('productos');
const carritoUL = document.getElementById('carrito');
const totalSpan = document.getElementById('total');
const cartCount = document.getElementById('cart-count');
const cartSection = document.getElementById('cart-section');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('cerrar-cart');
const vaciarBtn = document.getElementById('vaciar');
const confirmarBtn = document.getElementById('confirmar');

// refs para descuento (añadir junto a otros getElementById)
const subtotalSpan = document.getElementById('subtotal');
const discountAmountSpan = document.getElementById('discount-amount');
const discountInput = document.getElementById('discount-code');
const applyDiscountBtn = document.getElementById('apply-discount');
const removeDiscountBtn = document.getElementById('remove-discount');
const discountMessage = document.getElementById('discount-message');

// === Helper: formatea moneda ARS ===
function formatARS(num){
  return num.toLocaleString('es-AR', { style:'currency', currency:'ARS' });
}

// === Render de productos disponibles ===
function mostrarProductos(){
  productosDiv.innerHTML = '';
  productos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <div class="product-name">${p.nombre}</div>
      <div class="product-price">${formatARS(p.precio)}</div>
      <button class="btn btn-primary agregar" data-id="${p.id}">Agregar</button>
    `;
    productosDiv.appendChild(card);
  });
}

// === Funciones del carrito ===
function guardarCarrito(){
  localStorage.setItem('carrito', JSON.stringify(carrito));
  localStorage.setItem('appliedDiscount', JSON.stringify(appliedDiscount));
  actualizarContador();
}

function actualizarContador(){
  const totalItems = carrito.reduce((acc,i) => acc + i.cantidad, 0);
  cartCount.textContent = totalItems;
}

function agregarAlCarrito(id){
  const prod = productos.find(p => p.id === +id);
  if(!prod) return;
  const existe = carrito.find(i => i.id === prod.id);
  if(existe){
    existe.cantidad += 1;
  } else {
    carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, img: prod.img, cantidad: 1 });
  }
  guardarCarrito();
  mostrarCarrito();
}

function modificarCantidad(id, delta){
  const item = carrito.find(i => i.id === +id);
  if(!item) return;
  item.cantidad += delta;
  if(item.cantidad <= 0){
    carrito = carrito.filter(i => i.id !== +id);
  }
  guardarCarrito();
  mostrarCarrito();
}

function vaciarCarrito(){
  if(carrito.length === 0) return;
  if(!confirm('¿Querés vaciar el carrito?')) return;
  carrito = [];
  appliedDiscount = null; // limpiar código al vaciar
  guardarCarrito();
  mostrarCarrito();
}

function confirmarCompra(){
  if(carrito.length === 0){ alert('El carrito está vacío.'); return; }
  // calcular con descuento aplicado
  const subtotal = calcularSubtotal();
  const discountValue = calcularDescuento(subtotal);
  const total = subtotal - discountValue;

  alert('Compra confirmada. Total: ' + formatARS(total));
  carrito = [];
  appliedDiscount = null; // limpiar código al confirmar
  guardarCarrito();
  mostrarCarrito();
}

function calcularTotal(){
  return carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
}

function calcularSubtotal(){
  return carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
}

function calcularDescuento(subtotal){
  if(!appliedDiscount) return 0;
  const rule = discountCodes[appliedDiscount.code];
  if(!rule) return 0;
  if(rule.minSubtotal && subtotal < rule.minSubtotal) return 0;
  if(rule.type === 'percent') return Math.round(subtotal * (rule.value/100));
  if(rule.type === 'fixed') return Math.min(rule.value, subtotal);
  return 0;
}

// === Render del carrito ===
function mostrarCarrito(){
  carritoUL.innerHTML = '';

  // Render items (si vacio mostrar mensaje)
  if(carrito.length === 0){
    carritoUL.innerHTML = '<li>El carrito está vacío.</li>';
  } else {
    carrito.forEach(it => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${it.img}" alt="${it.nombre}">
        <div class="meta">
          <div style="font-weight:600">${it.nombre}</div>
          <div class="product-price">${formatARS(it.precio)} x ${it.cantidad} = <strong>${formatARS(it.precio * it.cantidad)}</strong></div>
        </div>
        <div class="qty-controls">
          <button class="btn btn-sm btn-outline-secondary minus" data-id="${it.id}">−</button>
          <span>${it.cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary plus" data-id="${it.id}">+</button>
        </div>
      `;
      carritoUL.appendChild(li);
    });
  }

  // Totales (siempre calcular)
  const subtotal = calcularSubtotal();
  const discountValue = calcularDescuento(subtotal);
  const total = subtotal - discountValue;

  if (subtotalSpan) subtotalSpan.textContent = formatARS(subtotal);
  if (discountAmountSpan) discountAmountSpan.textContent = discountValue > 0 ? `- ${formatARS(discountValue)}` : formatARS(0);
  if (totalSpan) totalSpan.textContent = formatARS(total);

  // mostrar estado del código aplicado
  if(appliedDiscount && discountCodes[appliedDiscount.code]){
    discountMessage.style.color = '#0a0';
    const rule = discountCodes[appliedDiscount.code];
    discountMessage.textContent = `Código aplicado: ${appliedDiscount.code} — ${rule.descripcion || ''}`;
    if (applyDiscountBtn) applyDiscountBtn.style.display = 'none';
    if (removeDiscountBtn) removeDiscountBtn.style.display = 'inline-block';
    if(discountInput) discountInput.value = appliedDiscount.code;
  } else {
    if (discountMessage) discountMessage.textContent = '';
    if (applyDiscountBtn) applyDiscountBtn.style.display = 'inline-block';
    if (removeDiscountBtn) removeDiscountBtn.style.display = 'none';
  }

  // contador
  actualizarContador();
}


// === Eventos (delegación) ===
document.addEventListener('click', function(e){
  // Agregar desde lista de productos
  if(e.target.matches('.agregar')){
    const id = e.target.dataset.id;
    agregarAlCarrito(id);
    return;
  }
  // + en carrito
  if(e.target.matches('.plus')){
    modificarCantidad(e.target.dataset.id, +1);
    return;
  }
  // - en carrito
  if(e.target.matches('.minus')){
    modificarCantidad(e.target.dataset.id, -1);
    return;
  }
});

// --- funciones para aplicar/quitar código y listeners (fuera de delegación) ---
function aplicarCodigo(codigo){
  if(!codigo) {
    discountMessage.style.color = '#c00';
    discountMessage.textContent = 'Ingresá un código.';
    return;
  }
  const code = codigo.trim().toUpperCase();
  const rule = discountCodes[code];
  if(!rule){
    discountMessage.style.color = '#c00';
    discountMessage.textContent = 'Código inválido.';
    return;
  }
  const subtotal = calcularSubtotal();
  if(rule.minSubtotal && subtotal < rule.minSubtotal){
    discountMessage.style.color = '#c00';
    discountMessage.textContent = `Requiere subtotal mínimo ${formatARS(rule.minSubtotal)}.`;
    return;
  }
  appliedDiscount = { code, appliedAt: new Date().toISOString() };
  guardarCarrito();
  mostrarCarrito();
  discountMessage.style.color = '#0a0';
  discountMessage.textContent = `Código ${code} aplicado.`;
}

function quitarCodigo(){
  appliedDiscount = null;
  guardarCarrito();
  mostrarCarrito();
  discountMessage.style.color = '#000';
  discountMessage.textContent = 'Código quitado.';
}

// listeners para botones aplicar/quitar
if(applyDiscountBtn) applyDiscountBtn.addEventListener('click', () => aplicarCodigo(discountInput.value));
if(removeDiscountBtn) removeDiscountBtn.addEventListener('click', quitarCodigo);

// Botones de carrito / vaciar / confirmar / abrir / cerrar
vaciarBtn.addEventListener('click', vaciarCarrito);
confirmarBtn.addEventListener('click', confirmarCompra);
openCartBtn.addEventListener('click', () => { cartSection.classList.remove('hidden'); mostrarCarrito(); });
closeCartBtn.addEventListener('click', () => { cartSection.classList.add('hidden'); });

// Inicialización
mostrarProductos();
mostrarCarrito();
