// Data Management
let products = [];
let cart = [];
let sales = [];
let currentProduct = null;
let editingProductId = null;
let currentSelection = {
    size: 'regular',
    temp: 'cold',
    quantity: 1
};
let selectedPaymentMethod = null;

// Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUy967NDWx1CTVZf_QmWeaW96DnRK-aPtiXZ6xbavKvS4tQw6rZA-BwkLYxEnr8autAA/exec';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCart();
});

// API Functions
async function apiCall(action, data = {}) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                ...data
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'API call failed');
        }
        
        return result.data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Terjadi kesalahan koneksi ke server', 'error');
        throw error;
    }
}

// Data loading functions
async function loadProducts() {
    try {
        showLoading(true);
        products = await apiCall('getProducts');
        renderProducts();
        showNotification('Data produk berhasil dimuat', 'success');
    } catch (error) {
        console.error('Failed to load products:', error);
        // Use default products if API fails
        products = [
            { id: 1, name: "Es Teh Original", price: 15000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop" },
            { id: 2, name: "Es Jeruk Segar", price: 18000, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop" },
            { id: 3, name: "Kopi Hitam", price: 12000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop" },
            { id: 4, name: "Cappuccino", price: 25000, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop" },
        ];
        renderProducts();
    } finally {
        showLoading(false);
    }
}

async function loadSales() {
    try {
        sales = await apiCall('getSales');
        return sales;
    } catch (error) {
        console.error('Failed to load sales:', error);
        return [];
    }
}

// Product management functions
function renderProducts(filter = 'all') {
    const productGrid = document.getElementById('product-grid');
    const filteredProducts = products;
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer" onclick="openProductModal(${product.id})">
            <div class="relative overflow-hidden">
                <img src="${product.image}" class="w-full h-48 object-cover" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop'">
                <div class="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    <i class="fas fa-plus"></i>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-gray-800 mb-2">${product.name}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-blue-600">Rp ${formatPrice(product.price)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Product modal functions
function openProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    document.getElementById('modal-product-name').textContent = currentProduct.name;
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
    
    // Reset selections
    currentSelection = { size: 'regular', temp: 'cold', quantity: 1 };
    updateModalSelections();
    updateModalPrice();
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('product-modal').classList.remove('flex');
}

function selectSize(size) {
    currentSelection.size = size;
    updateModalSelections();
    updateModalPrice();
}

function selectTemp(temp) {
    currentSelection.temp = temp;
    updateModalSelections();
    updateModalPrice();
}

function changeQuantity(change) {
    currentSelection.quantity = Math.max(1, currentSelection.quantity + change);
    document.getElementById('modal-quantity').textContent = currentSelection.quantity;
    updateModalPrice();
}

function updateModalSelections() {
    // Update size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200');
    });
    document.querySelector(`[onclick="selectSize('${currentSelection.size}')"]`).classList.add('border-blue-500', 'bg-blue-50');

    // Update temp selection
    document.querySelectorAll('.temp-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200');
    });
    document.querySelector(`[onclick="selectTemp('${currentSelection.temp}')"]`).classList.add('border-blue-500', 'bg-blue-50');

    document.getElementById('modal-quantity').textContent = currentSelection.quantity;
}

function updateModalPrice() {
    if (!currentProduct) return;
    
    let price = currentProduct.price;
    if (currentSelection.size === 'large') price += 5000;
    
    const total = price * currentSelection.quantity;
    document.getElementById('modal-total-price').textContent = `Rp ${formatPrice(total)}`;
}

function addToCart() {
    if (!currentProduct) return;

    let price = currentProduct.price;
    if (currentSelection.size === 'large') price += 5000;

    const cartItem = {
        id: Date.now(),
        productId: currentProduct.id,
        name: currentProduct.name,
        size: currentSelection.size,
        temp: currentSelection.temp,
        quantity: currentSelection.quantity,
        price: price,
        total: price * currentSelection.quantity
    };

    cart.push(cartItem);
    updateCart();
    closeProductModal();
    
    // Show success animation
    showNotification('Produk berhasil ditambahkan ke keranjang!', 'success');
}

// Cart management functions
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const mobileCartItems = document.getElementById('mobile-cart-items');
    const cartCount = document.getElementById('cart-count');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    const totalAmount = document.getElementById('total-amount');
    const mobileTotal = document.getElementById('mobile-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const mobileCheckoutBtn = document.getElementById('mobile-checkout-btn');

    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCount.textContent = itemCount;
    mobileCartCount.textContent = itemCount;
    totalAmount.textContent = `Rp ${formatPrice(total)}`;
    mobileTotal.textContent = `Rp ${formatPrice(total)}`;

    checkoutBtn.disabled = cart.length === 0;
    mobileCheckoutBtn.disabled = cart.length === 0;

    const cartHTML = cart.length === 0 ? `
        <div class="text-center text-gray-500 py-8">
            <i class="fas fa-shopping-cart text-4xl mb-3"></i>
            <p>Keranjang kosong</p>
            <p class="text-sm">Pilih produk untuk mulai berbelanja</p>
        </div>
    ` : cart.map(item => `
        <div class="flex justify-between items-center border border-gray-200 p-3 rounded-lg shadow-sm hover:shadow-md transition">
            <div class="flex-1">
                <p class="font-semibold text-gray-800">${item.name}</p>
                <p class="text-sm text-gray-500">
                    ${item.size === 'large' ? 'Large' : 'Regular'} • ${item.temp === 'hot' ? 'Panas' : 'Dingin'}
                </p>
                <p class="text-sm text-gray-500">
                    <span class="font-semibold">${item.quantity}</span> x Rp ${formatPrice(item.price)} = 
                    <strong class="text-blue-600">Rp ${formatPrice(item.total)}</strong>
                </p>
            </div>
            <div class="flex gap-2">
                <button onclick="editCartItem(${item.id})" class="text-yellow-600 hover:text-yellow-800 transition">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="removeCartItem(${item.id})" class="text-red-600 hover:text-red-800 transition">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    cartItems.innerHTML = cartHTML;
    mobileCartItems.innerHTML = cartHTML;
}

function removeCartItem(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
    showNotification('Item berhasil dihapus dari keranjang', 'info');
}

function editCartItem(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    // Remove current item and open modal with current settings
    removeCartItem(itemId);
    currentProduct = product;
    currentSelection = {
        size: item.size,
        temp: item.temp,
        quantity: item.quantity
    };
    
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
    
    updateModalSelections();
    updateModalPrice();
}

// Mobile cart functions
function showMobileCart() {
    document.getElementById('mobile-cart-modal').classList.remove('hidden');
    updateMobileCartTotal();
}

function closeMobileCart() {
    document.getElementById('mobile-cart-modal').classList.add('hidden');
}

function updateMobileCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('mobile-cart-total').textContent = `Rp ${formatPrice(total)}`;
}

// Checkout functions
function showCheckout() {
    if (cart.length === 0) return;

    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');

    const total = cart.reduce((sum, item) => sum + item.total, 0);
    checkoutTotal.textContent = `Rp ${formatPrice(total)}`;

    checkoutItems.innerHTML = cart.map(item => `
        <div class="flex justify-between text-sm">
            <span>${item.name} (${item.quantity}x)</span>
            <span>Rp ${formatPrice(item.total)}</span>
        </div>
    `).join('');

    document.getElementById('checkout-modal').classList.remove('hidden');
    document.getElementById('checkout-modal').classList.add('flex');
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.getElementById('checkout-modal').classList.remove('flex');
    resetCheckout();
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Update payment button styles
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('border-green-500', 'border-blue-500', 'bg-green-50', 'bg-blue-50');
        btn.classList.add('border-gray-200');
    });

    const selectedBtn = document.querySelector(`[onclick="selectPayment('${method}')"]`);
    if (method === 'cash') {
        selectedBtn.classList.add('border-green-500', 'bg-green-50');
        document.getElementById('cash-input').classList.remove('hidden');
        document.getElementById('qris-section').classList.add('hidden');
    } else {
        selectedBtn.classList.add('border-blue-500', 'bg-blue-50');
        document.getElementById('cash-input').classList.add('hidden');
        document.getElementById('qris-section').classList.remove('hidden');
    }

    updatePaymentButton();
}

function updatePaymentButton() {
    const processBtn = document.getElementById('process-payment-btn');
    processBtn.disabled = !selectedPaymentMethod;
}

// Cash input handler
document.getElementById('cash-amount').addEventListener('input', function() {
    const cashAmount = parseFloat(this.value) || 0;
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const change = cashAmount - total;
    
    const changeDiv = document.getElementById('change-amount');
    if (cashAmount >= total && cashAmount > 0) {
        changeDiv.textContent = `Kembalian: Rp ${formatPrice(change)}`;
        changeDiv.classList.remove('hidden', 'text-red-600');
        changeDiv.classList.add('text-green-600');
    } else if (cashAmount > 0) {
        changeDiv.textContent = `Uang kurang: Rp ${formatPrice(Math.abs(change))}`;
        changeDiv.classList.remove('hidden', 'text-green-600');
        changeDiv.classList.add('text-red-600');
    } else {
        changeDiv.classList.add('hidden');
    }
});

async function processPayment() {
    if (!selectedPaymentMethod) return;

    const total = cart.reduce((sum, item) => sum + item.total, 0);
    
    if (selectedPaymentMethod === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
        if (cashAmount < total) {
            showNotification('Jumlah uang tidak mencukupi!', 'error');
            return;
        }
    }

    try {
        showLoading(true);

        // Save sale to Google Sheets
        const sale = {
            date: new Date().toISOString(),
            items: [...cart],
            total: total,
            paymentMethod: selectedPaymentMethod,
            cashAmount: selectedPaymentMethod === 'cash' ? parseFloat(document.getElementById('cash-amount').value) : total,
            change: selectedPaymentMethod === 'cash' ? parseFloat(document.getElementById('cash-amount').value) - total : 0
        };

        const savedSale = await apiCall('addSale', { sale });

        // Clear cart
        cart = [];
        updateCart();
        closeCheckout();

        showNotification('Pembayaran berhasil diproses!', 'success');
        showReceipt({ ...sale, id: savedSale.id });
    } catch (error) {
        console.error('Payment processing failed:', error);
        showNotification('Gagal memproses pembayaran. Silakan coba lagi.', 'error');
    } finally {
        showLoading(false);
    }
}

function resetCheckout() {
    selectedPaymentMethod = null;
    document.getElementById('cash-amount').value = '';
    document.getElementById('change-amount').classList.add('hidden');
    document.getElementById('cash-input').classList.add('hidden');
    document.getElementById('qris-section').classList.add('hidden');
    
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('border-green-500', 'border-blue-500', 'bg-green-50', 'bg-blue-50');
        btn.classList.add('border-gray-200');
    });
    
    updatePaymentButton();
}

function showReceipt(sale) {
    const receiptHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
                <div class="text-center mb-6">
                    <i class="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
                    <h3 class="text-2xl font-bold text-gray-800">Pembayaran Berhasil</h3>
                </div>
                
                <div class="space-y-3 mb-6">
                    <div class="flex justify-between">
                        <span>Tanggal</span>
                        <span>${new Date(sale.date).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Total</span>
                        <span class="font-bold">Rp ${formatPrice(sale.total)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Pembayaran</span>
                        <span class="capitalize">${sale.paymentMethod}</span>
                    </div>
                    ${sale.paymentMethod === 'cash' ? `
                        <div class="flex justify-between">
                            <span>Uang Diterima</span>
                            <span>Rp ${formatPrice(sale.cashAmount)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Kembalian</span>
                            <span>Rp ${formatPrice(sale.change)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" class="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition">
                    Tutup
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', receiptHTML);
}

// Product Manager functions
function showProductManager() {
    renderProductTable();
    document.getElementById('product-manager-modal').classList.remove('hidden');
    document.getElementById('product-manager-modal').classList.add('flex');
}

function closeProductManager() {
    document.getElementById('product-manager-modal').classList.add('hidden');
    document.getElementById('product-manager-modal').classList.remove('flex');
}

function renderProductTable() {
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = products.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 p-3">${product.name}</td>
            <td class="border border-gray-300 p-3">Rp ${formatPrice(product.price)}</td>
            <td class="border border-gray-300 p-3">
                <button onclick="editProduct(${product.id})" class="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${product.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddProduct() {
    editingProductId = null;
    document.getElementById('add-product-form').reset();
    document.querySelector('#add-product-modal h3').textContent = 'Tambah Produk Baru';
    document.querySelector('#add-product-form button').innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Produk';
    document.getElementById('add-product-modal').classList.remove('hidden');
    document.getElementById('add-product-modal').classList.add('flex');
}

function closeAddProduct() {
    document.getElementById('add-product-modal').classList.add('hidden');
    document.getElementById('add-product-modal').classList.remove('flex');
    document.getElementById('add-product-form').reset();
    editingProductId = null;
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    
    // Fill form with existing data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    
    // Change modal title and button text
    document.querySelector('#add-product-modal h3').textContent = 'Edit Produk';
    document.querySelector('#add-product-form button').innerHTML = '<i class="fas fa-save mr-2"></i>Update Produk';
    
    document.getElementById('add-product-modal').classList.remove('hidden');
    document.getElementById('add-product-modal').classList.add('flex');
}

async function deleteProduct(productId) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    try {
        showLoading(true);
        await apiCall('deleteProduct', { productId });
        
        // Remove from local array
        products = products.filter(p => p.id !== productId);
        renderProducts();
        renderProductTable();
        
        showNotification('Produk berhasil dihapus', 'success');
    } catch (error) {
        console.error('Failed to delete product:', error);
        showNotification('Gagal menghapus produk', 'error');
    } finally {
        showLoading(false);
    }
}

// Add/Edit product form handler
document.getElementById('add-product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseInt(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop'
    };

    try {
        showLoading(true);

        if (editingProductId) {
            // Update existing product
            const updatedProduct = { id: editingProductId, ...productData };
            await apiCall('updateProduct', { product: updatedProduct });
            
            const productIndex = products.findIndex(p => p.id === editingProductId);
            if (productIndex !== -1) {
                products[productIndex] = updatedProduct;
            }
            
            showNotification('Produk berhasil diupdate', 'success');
        } else {
            // Add new product
            const newProduct = await apiCall('addProduct', { product: productData });
            products.push(newProduct);
            showNotification('Produk berhasil ditambahkan', 'success');
        }

        renderProducts();
        renderProductTable();
        closeAddProduct();
    } catch (error) {
        console.error('Failed to save product:', error);
        showNotification('Gagal menyimpan produk', 'error');
    } finally {
        showLoading(false);
    }
});

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white animate-fade-in ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            }"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showLoading(show = true) {
    let loadingEl = document.getElementById('loading-indicator');
    
    if (show) {
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'loading-indicator';
            loadingEl.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
            loadingEl.innerHTML = `
                <div class="bg-white rounded-lg p-6 flex items-center gap-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="text-gray-700">Memproses...</span>
                </div>
            `;
            document.body.appendChild(loadingEl);
        }
    } else {
        if (loadingEl) {
            loadingEl.remove();
        }
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('bg-black')) {
        const modals = ['product-modal', 'checkout-modal', 'product-manager-modal', 'add-product-modal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
        closeMobileCart();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modal
        const modals = ['product-modal', 'checkout-modal', 'mobile-cart-modal', 'product-manager-modal', 'add-product-modal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    }
});