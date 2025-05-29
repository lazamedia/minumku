
let allSales = [];
let filteredSales = [];
let currentPage = 1;
let entriesPerPage = 10;
let salesChart;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure Chart.js is loaded
    setTimeout(() => {
        loadSalesData();
        initializeChart();
        setupEventListeners();
    }, 100);
});

function loadSalesData() {
    // Generate more comprehensive demo data
    const now = new Date();
    const demoSales = [];
    
    // Generate sales for last 30 days
    for (let i = 0; i < 30; i++) {
        const saleDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const numSales = Math.floor(Math.random() * 5) + 1; // 1-5 sales per day
        
        for (let j = 0; j < numSales; j++) {
            const saleId = demoSales.length + 1;
            const items = generateRandomItems();
            const total = items.reduce((sum, item) => sum + item.total, 0);
            const paymentMethod = Math.random() > 0.6 ? 'qris' : 'cash';
            
            const sale = {
                id: saleId,
                date: new Date(saleDate.getTime() + (j * 60 * 60 * 1000)).toISOString(),
                items: items,
                total: total,
                paymentMethod: paymentMethod
            };
            
            if (paymentMethod === 'cash') {
                sale.cashAmount = Math.ceil(total / 5000) * 5000;
                sale.change = sale.cashAmount - total;
            }
            
            demoSales.push(sale);
        }
    }
    
    // Try to load from localStorage, fallback to demo data
    const savedSales = localStorage.getItem('pos_sales');
    if (savedSales) {
        try {
            const parsed = JSON.parse(savedSales);
            if (Array.isArray(parsed) && parsed.length > 0) {
                allSales = parsed;
            } else {
                allSales = demoSales;
            }
        } catch (e) {
            console.error('Error parsing sales data:', e);
            allSales = demoSales;
        }
    } else {
        allSales = demoSales;
    }
    
    // Sort by date descending
    allSales.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredSales = [...allSales];
    updateDashboard();
}

function generateRandomItems() {
    const products = [
        { name: 'Kopi Hitam', price: 15000 },
        { name: 'Kopi Susu', price: 18000 },
        { name: 'Es Teh', price: 8000 },
        { name: 'Es Jeruk', price: 10000 },
        { name: 'Roti Bakar', price: 12000 },
        { name: 'Nasi Goreng', price: 25000 },
        { name: 'Mie Ayam', price: 20000 },
        { name: 'Ayam Penyet', price: 22000 },
        { name: 'Jus Jeruk', price: 12000 },
        { name: 'Jus Alpukat', price: 15000 }
    ];
    
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    
    for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        items.push({
            name: product.name,
            quantity: quantity,
            price: product.price,
            total: quantity * product.price
        });
    }
    
    return items;
}

function setupEventListeners() {
    document.getElementById('period-filter').addEventListener('change', applyFilters);
    document.getElementById('payment-filter').addEventListener('change', applyFilters);
    
    document.getElementById('entries-per-page').addEventListener('change', function() {
        entriesPerPage = parseInt(this.value);
        currentPage = 1;
        renderSalesTable();
        updatePagination();
    });
}

function applyFilters() {
    const period = document.getElementById('period-filter').value;
    const paymentMethod = document.getElementById('payment-filter').value;

    filteredSales = allSales.filter(sale => {
        let passesFilter = true;

        if (paymentMethod !== 'all' && sale.paymentMethod !== paymentMethod) {
            passesFilter = false;
        }

        if (period !== 'all') {
            const now = new Date();
            const saleDate = new Date(sale.date);
            let startDate = new Date();

            switch (period) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            if (saleDate < startDate || saleDate > now) {
                passesFilter = false;
            }
        }

        return passesFilter;
    });

    currentPage = 1;
    updateDashboard();
    showNotification('Filter berhasil diterapkan', 'success');
}

function resetFilters() {
    document.getElementById('period-filter').value = 'all';
    document.getElementById('payment-filter').value = 'all';
    
    filteredSales = [...allSales];
    currentPage = 1;
    updateDashboard();
    showNotification('Filter berhasil direset', 'info');
}

function updateDashboard() {
    updateStatistics();
    renderSalesTable();
    updatePagination();
    if (salesChart) {
        updateChart();
    }
}

function updateStatistics() {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const totalItems = filteredSales.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    document.getElementById('total-sales').textContent = `Rp ${formatPrice(totalSales)}`;
    document.getElementById('total-transactions').textContent = totalTransactions;
    document.getElementById('avg-transaction').textContent = `Rp ${formatPrice(avgTransaction)}`;
    document.getElementById('total-items').textContent = totalItems;
}

function renderSalesTable() {
    const tbody = document.getElementById('sales-table-body');
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const paginatedSales = filteredSales.slice(startIndex, endIndex);

    if (paginatedSales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="border border-gray-300 p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-3"></i>
                    <p>Tidak ada data penjualan</p>
                    <p class="text-sm">Data tidak ditemukan berdasarkan filter yang dipilih</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = paginatedSales.map((sale, index) => `
        <tr class="hover:bg-gray-50 transition">
            <td class="border border-gray-300 p-3">#${sale.id}</td>
            <td class="border border-gray-300 p-3">${formatDate(sale.date)}</td>
            <td class="border border-gray-300 p-3">
                <div class="text-sm">
                    ${sale.items.map(item => `${item.name} (${item.quantity}x)`).join('<br>')}
                </div>
            </td>
            <td class="border border-gray-300 p-3 font-semibold text-blue-600">Rp ${formatPrice(sale.total)}</td>
            <td class="border border-gray-300 p-3">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    sale.paymentMethod === 'cash' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                }">
                    ${sale.paymentMethod.toUpperCase()}
                </span>
            </td>
            <td class="border border-gray-300 p-3">
                <button onclick="showSaleDetail(${sale.id})" class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition">
                    <i class="fas fa-eye mr-1"></i>Detail
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('showing-from').textContent = startIndex + 1;
    document.getElementById('showing-to').textContent = Math.min(endIndex, filteredSales.length);
    document.getElementById('total-entries').textContent = filteredSales.length;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredSales.length / entriesPerPage);
    const container = document.getElementById('pagination-container');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="px-3 py-2 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded">
                ${i}
            </button>
        `;
    }

    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredSales.length / entriesPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderSalesTable();
    updatePagination();
}

function initializeChart() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        setTimeout(initializeChart, 500); // Retry after 500ms
        return;
    }

    try {
        const ctx = document.getElementById('salesChart');
        if (!ctx) {
            console.error('Canvas element not found');
            return;
        }

        const context = ctx.getContext('2d');
        if (!context) {
            console.error('Cannot get 2D context');
            return;
        }

        // Destroy existing chart if it exists
        if (salesChart) {
            salesChart.destroy();
        }

        salesChart = new Chart(context, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Penjualan (Rp)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Penjualan: Rp ${formatPrice(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Tanggal'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Penjualan (Rp)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + formatPrice(value);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });

        console.log('Chart initialized successfully');
        updateChart();

    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

function updateChart() {
    if (!salesChart) {
        console.log('Chart not initialized yet');
        return;
    }

    try {
        // Group sales by date
        const salesByDate = {};
        filteredSales.forEach(sale => {
            const date = new Date(sale.date).toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += sale.total;
        });

        // Sort dates and get last 14 days
        const sortedDates = Object.keys(salesByDate).sort();
        const last14Days = sortedDates.slice(-14);
        
        if (last14Days.length === 0) {
            // No data available
            salesChart.data.labels = ['Tidak ada data'];
            salesChart.data.datasets[0].data = [0];
        } else {
            const labels = last14Days.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('id-ID', { 
                    day: '2-digit',
                    month: 'short'
                });
            });
            const data = last14Days.map(date => salesByDate[date]);

            salesChart.data.labels = labels;
            salesChart.data.datasets[0].data = data;
        }

        salesChart.update('none'); // Update without animation for better performance
        console.log('Chart updated successfully');

    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

function showSaleDetail(saleId) {
    const sale = allSales.find(s => s.id === saleId);
    if (!sale) return;

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    let itemsHTML = '';
    sale.items.forEach(item => {
        itemsHTML += `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                    <span class="font-medium">${item.name}</span>
                    <span class="text-gray-500 text-sm ml-2">(${item.quantity}x @ Rp ${formatPrice(item.price)})</span>
                </div>
                <span class="font-semibold">Rp ${formatPrice(item.total)}</span>
            </div>
        `;
    });

    let paymentInfo = '';
    if (sale.paymentMethod === 'cash') {
        paymentInfo = `
            <div class="bg-green-50 p-4 rounded-lg">
                <div class="flex justify-between mb-2">
                    <span>Uang Diterima:</span>
                    <span class="font-semibold">Rp ${formatPrice(sale.cashAmount || 0)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Kembalian:</span>
                    <span class="font-semibold">Rp ${formatPrice(sale.change || 0)}</span>
                </div>
            </div>
        `;
    } else {
        paymentInfo = `
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex justify-between">
                    <span>Pembayaran:</span>
                    <span class="font-semibold">${sale.paymentMethod.toUpperCase()}</span>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-sm text-gray-600">ID Transaksi</span>
                        <p class="font-semibold">#${sale.id}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-600">Tanggal & Waktu</span>
                        <p class="font-semibold">${formatDateTime(sale.date)}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-800 mb-3">Detail Produk</h4>
                <div class="space-y-2">
                    ${itemsHTML}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-300">
                    <div class="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span class="text-blue-600">Rp ${formatPrice(sale.total)}</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-800 mb-3">Informasi Pembayaran</h4>
                ${paymentInfo}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function exportData() {
    if (filteredSales.length === 0) {
        showNotification('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    let csvContent = 'ID,Tanggal,Items,Total,Metode Pembayaran,Uang Diterima,Kembalian\n';
    
    filteredSales.forEach(sale => {
        const items = sale.items.map(item => `${item.name} (${item.quantity}x)`).join('; ');
        const cashAmount = sale.cashAmount || 0;
        const change = sale.change || 0;
        
        csvContent += `${sale.id},"${formatDateTime(sale.date)}","${items}",${sale.total},${sale.paymentMethod.toUpperCase()},${cashAmount},${change}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data berhasil diekspor ke CSV', 'success');
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(Math.round(price));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm animate-fade-in`;
    
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500';
            break;
        case 'error':
            notification.className += ' bg-red-500';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500';
            break;
        default:
            notification.className += ' bg-blue-500';
    }
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Event Listeners
document.addEventListener('click', function(e) {
    const modal = document.getElementById('detail-modal');
    if (e.target === modal) {
        closeDetailModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});

// Add window resize listener to handle chart responsiveness
window.addEventListener('resize', function() {
    if (salesChart) {
        salesChart.resize();
    }
});
