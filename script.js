// Base URL for API calls (adjust if your backend port changes)
const API_BASE = 'http://localhost:3000/api';

// Function to show/hide sections (for single-page navigation)
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

// Load and display products on the home page
function loadProducts() {
  fetch(`${API_BASE}/products`)
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById('products');
      container.innerHTML = '';  // Clear previous content
      products.forEach(p => {
        container.innerHTML += `
          <div class="product">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p>$${p.price}</p>
            <button onclick="viewProduct('${p._id}')">View Details</button>
          </div>
        `;
      });
    })
    .catch(err => console.error('Error loading products:', err));
}

// View product details (fetches and displays a single product)
function viewProduct(id) {
  fetch(`${API_BASE}/products/${id}`)
    .then(res => res.json())
    .then(p => {
      document.getElementById('product-info').innerHTML = `
        <h2>${p.name}</h2>
        <p>${p.description}</p>
        <p>$${p.price}</p>
      `;
      showSection('product-details');
    })
    .catch(err => console.error('Error loading product:', err));
}

// Add product to cart (client-side storage)
document.getElementById('add-to-cart').onclick = () => {
  const productInfo = document.getElementById('product-info').innerHTML;
  // Extract product data from HTML (simplified; in a real app, pass ID directly)
  const name = productInfo.match(/<h2>(.*?)<\/h2>/)[1];
  const price = parseFloat(productInfo.match(/\$(\d+)/)[1]);
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ name, price });  // Note: In production, store product ID for orders
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
  showSection('cart');
  loadCart();  // Refresh cart display
};

// Load and display cart items
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    container.innerHTML += `<p>${item.name} - $${item.price}</p>`;
    total += item.price;
  });
  container.innerHTML += `<p><strong>Total: $${total}</strong></p>`;
}

// Checkout (requires login; sends order to backend)
document.getElementById('checkout').onclick = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    showSection('login');
    return;
  }
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert('Cart is empty!');
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  // Simplified: Assumes product IDs are 'sample_id'; replace with actual IDs from cart
  const orderData = {
    products: cart.map(item => ({ product: 'sample_id', quantity: 1 })),  // Update to use real product IDs
    total
  };
  fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(orderData)
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        alert('Order placed successfully!');
        localStorage.removeItem('cart');  // Clear cart after order
        loadCart();
        showSection('home');
      } else {
        alert('Error placing order: ' + data.message);
      }
    })
    .catch(err => console.error('Checkout error:', err));
};

// Login form submission
document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      showSection('home');
    } else {
      alert('Login failed: ' + data.message);
    }
  } catch (err) {
    console.error('Login error:', err);
  }
};

// Register form submission
document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    alert(data.message);
    showSection('login');
  } catch (err) {
    console.error('Register error:', err);
  }
};

// Initialize: Show home and load products/cart on page load
showSection('home');
loadProducts();
loadCart();