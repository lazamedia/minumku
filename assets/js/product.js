// Product Manager JavaScript Module
// Handles product CRUD operations and modal interactions

// Global variables for product management
let editingProductId = null;

// Product Manager Modal Functions
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
                <button onclick="editProduct(${product.id})" class="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 transition">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct(${product.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </td>
        </tr>
    `).join('');
}

// Add Product Modal Functions
function showAddProduct() {
    editingProductId = null;
    document.getElementById('add-product-form').reset();
    document.querySelector('#add-product-modal h3').textContent = 'Tambah Produk Baru';
    document.querySelector('#add-product-form button[type="submit"]').innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Produk';
    document.getElementById('add-product-modal').classList.remove('hidden');
    document.getElementById('add-product-modal').classList.add('flex');
}

function closeAddProduct() {
    document.getElementById('add-product-modal').classList.add('hidden');
    document.getElementById('add-product-modal').classList.remove('flex');
    document.getElementById('add-product-form').reset();
    editingProductId = null;
}

// Product CRUD Operations
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Produk tidak ditemukan!', 'error');
        return;
    }

    editingProductId = productId;
    
    // Fill form with existing data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    
    // Change modal title and button text
    document.querySelector('#add-product-modal h3').textContent = 'Edit Produk';
    document.querySelector('#add-product-form button[type="submit"]').innerHTML = '<i class="fas fa-save mr-2"></i>Update Produk';
    
    document.getElementById('add-product-modal').classList.remove('hidden');
    document.getElementById('add-product-modal').classList.add('flex');
}

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Produk tidak ditemukan!', 'error');
        return;
    }

    showDeleteConfirmation(
        'Hapus Produk',
        `Yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`,
        () => {
            // Remove product from array
            products = products.filter(p => p.id !== productId);
            
            // Re-render components
            renderProducts();
            renderProductTable();
            
            // Save to localStorage
            saveData();
            
            showNotification('Produk berhasil dihapus', 'success');
        }
    );
}

// Form submission handler
function initializeProductForm() {
    const form = document.getElementById('add-product-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form data
        const name = document.getElementById('product-name').value.trim();
        const price = parseInt(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value.trim();

        if (!name) {
            showNotification('Nama produk tidak boleh kosong!', 'error');
            return;
        }

        if (!price || price <= 0) {
            showNotification('Harga produk harus lebih besar dari 0!', 'error');
            return;
        }

        const productData = {
            name: name,
            price: price,
            image: image || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop'
        };

        if (editingProductId) {
            // Update existing product
            const productIndex = products.findIndex(p => p.id === editingProductId);
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], ...productData };
                showNotification('Produk berhasil diupdate', 'success');
            } else {
                showNotification('Error: Produk tidak ditemukan!', 'error');
                return;
            }
        } else {
            // Check if product name already exists
            const existingProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (existingProduct) {
                showNotification('Produk dengan nama tersebut sudah ada!', 'error');
                return;
            }

            // Add new product
            const newProduct = {
                id: Date.now(), // Simple ID generation
                ...productData
            };
            products.push(newProduct);
            showNotification('Produk berhasil ditambahkan', 'success');
        }

        // Re-render components
        renderProducts();
        renderProductTable();
        
        // Close modal and save data
        closeAddProduct();
        saveData();
    });
}

// Delete confirmation dialog
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

// Bulk operations (bonus features)
function deleteAllProducts() {
    if (products.length === 0) {
        showNotification('Tidak ada produk untuk dihapus', 'info');
        return;
    }

    showDeleteConfirmation(
        'Hapus Semua Produk',
        `Yakin ingin menghapus semua ${products.length} produk? Tindakan ini tidak dapat dibatalkan.`,
        () => {
            products = [];
            renderProducts();
            renderProductTable();
            saveData();
            showNotification('Semua produk berhasil dihapus', 'success');
        }
    );
}

function exportProducts() {
    if (products.length === 0) {
        showNotification('Tidak ada produk untuk diekspor', 'info');
        return;
    }

    try {
        const dataStr = JSON.stringify(products, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `products_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Data produk berhasil diekspor!', 'success');
    } catch (error) {
        console.error('Error exporting products:', error);
        showNotification('Error mengekspor data produk!', 'error');
    }
}

function importProducts(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedProducts = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedProducts)) {
                throw new Error('Format file tidak valid');
            }

            // Validate product structure
            const validProducts = importedProducts.filter(product => 
                product.name && 
                typeof product.price === 'number' && 
                product.price > 0
            );

            if (validProducts.length === 0) {
                throw new Error('Tidak ada produk valid dalam file');
            }

            // Add unique IDs and merge with existing products
            const newProducts = validProducts.map(product => ({
                ...product,
                id: Date.now() + Math.random() // Ensure unique ID
            }));

            products = [...products, ...newProducts];
            
            renderProducts();
            renderProductTable();
            saveData();
            
            showNotification(`${newProducts.length} produk berhasil diimpor!`, 'success');
        } catch (error) {
            console.error('Error importing products:', error);
            showNotification('Error mengimpor data produk! Pastikan format file benar.', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Search and filter products in table
function searchProducts(searchTerm) {
    const tbody = document.getElementById('product-table-body');
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 p-3">${product.name}</td>
            <td class="border border-gray-300 p-3">Rp ${formatPrice(product.price)}</td>
            <td class="border border-gray-300 p-3">
                <button onclick="editProduct(${product.id})" class="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 transition">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct(${product.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </td>
        </tr>
    `).join('');
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="border border-gray-300 p-8 text-center text-gray-500">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>Tidak ada produk yang ditemukan</p>
                </td>
            </tr>
        `;
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProductForm();
    
    // Add search functionality if search input exists
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchProducts(e.target.value);
        });
    }
});

// Keyboard shortcuts for product manager
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N to add new product (when product manager is open)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        const productManagerModal = document.getElementById('product-manager-modal');
        if (!productManagerModal.classList.contains('hidden')) {
            e.preventDefault();
            showAddProduct();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeProductManager();
        closeAddProduct();
        closeDeleteConfirmation();
    }
});

// Export functions for use in other modules
window.ProductManager = {
    showProductManager,
    closeProductManager,
    showAddProduct,
    closeAddProduct,
    editProduct,
    deleteProduct,
    searchProducts,
    exportProducts,
    importProducts,
    deleteAllProducts
};