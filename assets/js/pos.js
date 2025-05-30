
let products = [
    { id: 1, name: "Es Teh Original"    , price: 3000, image: "https://png.pngtree.com/png-clipart/20240622/original/pngtree-plastic-jumbo-cup-iced-tea-vector-png-image_15387450.png" },
    { id: 2, name: "Es Teh Mangga"      , price: 5000, image: "https://png.pngtree.com/png-clipart/20240622/original/pngtree-plastic-jumbo-cup-iced-tea-vector-png-image_15387450.png" },
    { id: 3, name: "Es Teh Leci"        , price: 5000, image: "https://png.pngtree.com/png-clipart/20240622/original/pngtree-plastic-jumbo-cup-iced-tea-vector-png-image_15387450.png" },
    { id: 4, name: "Es Teh Melon"       , price: 5000, image: "https://png.pngtree.com/png-clipart/20240622/original/pngtree-plastic-jumbo-cup-iced-tea-vector-png-image_15387450.png" },
    { id: 4, name: "Es Teh Jeruk"       , price: 5000, image: "https://png.pngtree.com/png-clipart/20240622/original/pngtree-plastic-jumbo-cup-iced-tea-vector-png-image_15387450.png" },
];

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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderProducts();
    updateCart();
});

// Data persistence functions with localStorage
function saveData() {
    try {
        // Save products to localStorage
        localStorage.setItem('pos_products', JSON.stringify(products));
        
        // Save sales to localStorage
        localStorage.setItem('pos_sales', JSON.stringify(sales));
        
        // Save timestamp
        localStorage.setItem('pos_last_updated', new Date().toISOString());
        
        console.log('Data saved to localStorage successfully');
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        showNotification('Error menyimpan data!', 'error');
    }
}

function loadData() {
    try {
        // Load products from localStorage
        const savedProducts = localStorage.getItem('pos_products');
        if (savedProducts) {
            products = JSON.parse(savedProducts);
            console.log('Products loaded from localStorage:', products.length, 'items');
        }
        
        // Load sales from localStorage
        const savedSales = localStorage.getItem('pos_sales');
        if (savedSales) {
            sales = JSON.parse(savedSales);
            console.log('Sales loaded from localStorage:', sales.length, 'transactions');
        }
        
        // Load timestamp
        const lastUpdated = localStorage.getItem('pos_last_updated');
        if (lastUpdated) {
            console.log('Data last updated:', new Date(lastUpdated).toLocaleString('id-ID'));
        }
        
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        showNotification('Error memuat data!', 'error');
        
        // Reset to default data if loading fails
        products = [
            { id: 1, name: "Es Teh Original", price: 15000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop" },
            { id: 2, name: "Es Jeruk Segar", price: 18000, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop" },
            { id: 3, name: "Kopi Hitam", price: 12000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop" },
            { id: 4, name: "Cappuccino", price: 25000, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop" },
        ];
        sales = [];
    }
}

// Additional function to clear all data (for testing/reset purposes)
function clearAllData() {
    if (confirm('Yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan!')) {
        localStorage.removeItem('pos_products');
        localStorage.removeItem('pos_sales');
        localStorage.removeItem('pos_last_updated');
        
        // Reset to default data
        products = [
            { id: 1, name: "Es Teh Original", price: 15000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop" },
            { id: 2, name: "Es Jeruk Segar", price: 18000, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop" },
            { id: 3, name: "Kopi Hitam", price: 12000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop" },
            { id: 4, name: "Cappuccino", price: 25000, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop" },
        ];
        sales = [];
        cart = [];
        
        renderProducts();
        updateCart();
        showNotification('Semua data berhasil dihapus dan direset!', 'success');
    }
}

// Export data functions
function exportData() {
    try {
        const data = {
            products: products,
            sales: sales,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Data berhasil diekspor!', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error mengekspor data!', 'error');
    }
}

// Product management functions
function renderProducts(filter = 'all') {
    const productGrid = document.getElementById('product-grid');
    const filteredProducts = products;
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card bg-white rounded-2xl shadow-lg border border-gray-400 overflow-hidden cursor-pointer" onclick="openProductModal(${product.id})">
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

    // Check if item with same variant already exists
    const existingItemIndex = cart.findIndex(item => 
        item.productId === currentProduct.id && 
        item.size === currentSelection.size && 
        item.temp === currentSelection.temp
    );

    if (existingItemIndex !== -1) {
        // Update existing item quantity
        cart[existingItemIndex].quantity += currentSelection.quantity;
        cart[existingItemIndex].total = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
    } else {
        // Add new item to cart
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
    }

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
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    showDeleteConfirmation(
        'Hapus Item',
        `Yakin ingin menghapus "${item.name}" dari keranjang?`,
        () => {
            cart = cart.filter(item => item.id !== itemId);
            updateCart();
            showNotification('Item berhasil dihapus dari keranjang', 'success');
        }
    );
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

function processPayment() {
    if (!selectedPaymentMethod) return;

    const total = cart.reduce((sum, item) => sum + item.total, 0);
    
    if (selectedPaymentMethod === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
        if (cashAmount < total) {
            showNotification('Jumlah uang tidak mencukupi!', 'error');
            return;
        }
    }

    // Save sale
    const sale = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        total: total,
        paymentMethod: selectedPaymentMethod,
        cashAmount: selectedPaymentMethod === 'cash' ? parseFloat(document.getElementById('cash-amount').value) : total,
        change: selectedPaymentMethod === 'cash' ? parseFloat(document.getElementById('cash-amount').value) - total : 0
    };

    sales.push(sale);
    saveData(); // Save to localStorage

    // Clear cart
    cart = [];
    updateCart();
    closeCheckout();

    showNotification('Pembayaran berhasil diproses!', 'success');
    showReceipt(sale);
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

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    showDeleteConfirmation(
        'Hapus Produk',
        `Yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`,
        () => {
            products = products.filter(p => p.id !== productId);
            renderProducts();
            renderProductTable();
            saveData(); // Save to localStorage
            showNotification('Produk berhasil dihapus', 'success');
        }
    );
}

// Add/Edit product form handler
document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseInt(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop'
    };

    if (editingProductId) { 
        // Update existing product
        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...productData };
            showNotification('Produk berhasil diupdate', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            id: Date.now(),
            ...productData
        };
        products.push(newProduct); 
        showNotification('Produk berhasil ditambahkan', 'success');
    }

    renderProducts();
    renderProductTable(); 
    closeAddProduct();
    saveData(); // Save to localStorage
});

// Custom confirmation dialog for delete actions
function showDeleteConfirmation(title, message, onConfirm) {
    const confirmationHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="delete-confirmation">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in transform scale-95 animate-bounce-in">
                <div class="text-center mb-6">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-600">${message}</p>
                </div>
                
                <div class="flex gap-3">
                    <button onclick="closeDeleteConfirmation()" class="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>Batal
                    </button>
                    <button onclick="confirmDelete()" class="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition shadow-lg">
                        <i class="fas fa-trash mr-2"></i>Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Store the callback function
    window.deleteConfirmationCallback = onConfirm;
    
    // Add bounce animation
    setTimeout(() => {
        const modal = document.querySelector('#delete-confirmation .animate-bounce-in');
        if (modal) {
            modal.classList.remove('scale-95');
            modal.classList.add('scale-100');
        }
    }, 10);
}

function closeDeleteConfirmation() {
    const confirmation = document.getElementById('delete-confirmation');
    if (confirmation) {
        confirmation.remove();
    }
    delete window.deleteConfirmationCallback;
}

function confirmDelete() {
    if (window.deleteConfirmationCallback) {
        window.deleteConfirmationCallback();
    }
    closeDeleteConfirmation();
}



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
        
        // Close delete confirmation if open
        closeDeleteConfirmation();
    }
});

// Add CSS for bounce animation
const style = document.createElement('style');
style.textContent = `
    .animate-bounce-in {
        animation: bounceIn 0.3s ease-out;
    }
    
    @keyframes bounceIn {
        0% {
            transform: scale(0.3);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
