// 1. Database
let products = []; // Start empty, we will fetch them
let cart = JSON.parse(localStorage.getItem('vaexium-cart')) || [];

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://vaexium-shop-api.onrender.com';

// 2. Fetch Data from Backend
async function loadProducts() {
    try {
        // We fetch from the server we just built
        const response = await fetch(`${API_BASE_URL}/api/products`);
        products = await response.json(); // Save database data into our variable
        
        renderProducts();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        document.getElementById('product-grid').innerHTML = "<p>Error loading shop items.</p>";
    }
}

const grid = document.getElementById('product-grid');

function renderProducts() {
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <article class="card">
            <a href="product.html?id=${product.id}" class="playlist-cover" style="border:none; overflow: hidden; display:block; cursor:pointer;">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </a>
            
            <div class="tag-container">
                ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
            
            <p class="card-desc">${product.description}</p>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                <span style="font-size: 1.1rem; font-weight:bold;">£${product.price}</span>
                <button class="btn-add" onclick="addToCart(${product.id})">Add +</button>
            </div>
        </article>
    `).join('');
}

// 4. Cart Functions
function addToCart(id) {
    // Re-using the changeQuantity logic to keep things clean
    changeQuantity(id, 1);
    document.getElementById('cart-sidebar').classList.add('open');
}

function changeQuantity(id, change) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += change;

        // If quantity drops to 0 or less, remove the item completely
        if (existingItem.quantity <= 0) {
            removeFromCart(id);
            return; // Stop here
        }
    } else if (change > 0) {
        // Logic for adding a new item if it doesn't exist (from main grid)
        const product = products.find(p => p.id === id);
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    saveCart();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none'; // Hide badge if 0

    // Update List
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg" style="color:var(--text-muted); text-align:center; margin-top: 20px;">Your cart is empty.</p>';
        cartTotal.innerText = '£0.00';
        return;
    }

    let totalPrice = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        totalPrice += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img 
                    src="${item.image}" 
                    alt="${item.name}" 
                    loading="lazy"  style="width: 40%; height: 40%; object-fit: cover;"
                >
                <div style="flex:1;">
                    <h4 style="font-size:0.9rem; margin-bottom: 4px;">${item.name}</h4>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span style="color:var(--text-muted); font-size:0.9rem;">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                    <p style="font-size:0.8rem; margin-top:4px;">£${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="btn-remove" title="Remove Item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    cartTotal.innerText = '£' + totalPrice.toFixed(2);
}

function saveCart() {
    localStorage.setItem('vaexium-cart', JSON.stringify(cart));
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

// Function to trigger checkout
async function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        // 1. Send cart to backend
        const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: cart })
        });

        const data = await response.json();

        // 2. Redirect to the URL Stripe gave us
        if (data.url) {
            window.location.href = data.url; // Redirect the user
        } else {
            console.error("Stripe URL not found", data);
        }

    } catch (error) {
        console.error("Error during checkout:", error);
    }
}

// Initialize
if (grid) {
    loadProducts();
}
updateCartUI();