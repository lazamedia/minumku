let allSales = []; // Menyimpan semua data penjualan
let filteredSales = []; // Menyimpan data penjualan yang sudah disaring
let currentPage = 1; // Halaman yang sedang ditampilkan
let entriesPerPage = 10; // Jumlah data yang ditampilkan per halaman
let salesChart; // Grafik penjualan

// Mulai program ketika halaman sudah siap
document.addEventListener('DOMContentLoaded', function() {
    // Tunggu sebentar untuk memastikan semua file sudah dimuat
    setTimeout(() => {
        loadSalesData(); // Muat data penjualan
        initializeChart(); // Buat grafik
        setupEventListeners(); // Siapkan tombol-tombol
    }, 100);
});

function loadSalesData() {
    // Buat data contoh penjualan yang lebih lengkap
    const now = new Date(); // Tanggal hari ini
    const demoSales = []; // Tempat menyimpan data contoh
    
    // Buat data penjualan untuk 30 hari terakhir
    for (let i = 0; i < 30; i++) {
        const saleDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Tanggal mundur dari hari ini
        const numSales = Math.floor(Math.random() * 5) + 1; // Acak antara 1-5 penjualan per hari
        
        // Buat beberapa penjualan untuk setiap hari
        for (let j = 0; j < numSales; j++) {
            const saleId = demoSales.length + 1; // Nomor urut penjualan
            const items = generateRandomItems(); // Buat daftar barang yang dibeli
            const total = items.reduce((sum, item) => sum + item.total, 0); // Hitung total harga
            const paymentMethod = Math.random() > 0.6 ? 'qris' : 'cash'; // Pilih cara bayar secara acak
            
            // Buat data penjualan
            const sale = {
                id: saleId,
                date: new Date(saleDate.getTime() + (j * 60 * 60 * 1000)).toISOString(),
                items: items,
                total: total,
                paymentMethod: paymentMethod
            };
            
            // Jika bayar tunai, hitung uang kembalian
            if (paymentMethod === 'cash') {
                sale.cashAmount = Math.ceil(total / 5000) * 5000; // Bulatkan ke kelipatan 5000
                sale.change = sale.cashAmount - total; // Hitung kembalian
            }
            
            demoSales.push(sale); // Masukkan ke daftar
        }
    }
    
    // Coba ambil data dari penyimpanan browser, jika tidak ada pakai data contoh
    const savedSales = localStorage.getItem('pos_sales');
    if (savedSales) {
        try {
            const parsed = JSON.parse(savedSales);
            if (Array.isArray(parsed) && parsed.length > 0) {
                allSales = parsed; // Gunakan data tersimpan
            } else {
                allSales = demoSales; // Gunakan data contoh
            }
        } catch (e) {
            console.error('Error parsing sales data:', e);
            allSales = demoSales; // Jika error, pakai data contoh
        }
    } else {
        allSales = demoSales; // Jika tidak ada data, pakai data contoh
    }
    
    // Urutkan berdasarkan tanggal terbaru dulu
    allSales.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredSales = [...allSales]; // Salin semua data ke daftar filter
    updateDashboard(); // Perbarui tampilan
}

function generateRandomItems() {
    // Daftar produk yang tersedia
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
    
    const numItems = Math.floor(Math.random() * 3) + 1; // Pilih 1-3 jenis barang
    const items = []; // Daftar barang yang dibeli
    
    // Buat daftar barang yang dibeli secara acak
    for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)]; // Pilih produk acak
        const quantity = Math.floor(Math.random() * 3) + 1; // Pilih jumlah 1-3
        items.push({
            name: product.name,
            quantity: quantity,
            price: product.price,
            total: quantity * product.price // Hitung total per barang
        });
    }
    
    return items;
}

function setupEventListeners() {
    // Pasang pengawas untuk filter periode waktu
    document.getElementById('period-filter').addEventListener('change', applyFilters);
    // Pasang pengawas untuk filter metode pembayaran
    document.getElementById('payment-filter').addEventListener('change', applyFilters);
    
    // Pasang pengawas untuk mengubah jumlah data per halaman
    document.getElementById('entries-per-page').addEventListener('change', function() {
        entriesPerPage = parseInt(this.value); // Ambil nilai yang dipilih
        currentPage = 1; // Kembali ke halaman pertama
        renderSalesTable(); // Tampilkan ulang tabel
        updatePagination(); // Perbarui navigasi halaman
    });
}

function applyFilters() {
    // Ambil nilai filter yang dipilih
    const period = document.getElementById('period-filter').value;
    const paymentMethod = document.getElementById('payment-filter').value;

    // Saring data berdasarkan filter
    filteredSales = allSales.filter(sale => {
        let passesFilter = true; // Anggap lolos filter dulu

        // Cek filter metode pembayaran
        if (paymentMethod !== 'all' && sale.paymentMethod !== paymentMethod) {
            passesFilter = false;
        }

        // Cek filter periode waktu
        if (period !== 'all') {
            const now = new Date();
            const saleDate = new Date(sale.date);
            let startDate = new Date();

            // Tentukan tanggal mulai berdasarkan periode
            switch (period) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0); // Mulai dari jam 00:00 hari ini
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7); // 7 hari yang lalu
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1); // 1 bulan yang lalu
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1); // 1 tahun yang lalu
                    break;
            }

            // Cek apakah tanggal penjualan dalam rentang yang diinginkan
            if (saleDate < startDate || saleDate > now) {
                passesFilter = false;
            }
        }

        return passesFilter;
    });

    currentPage = 1; // Kembali ke halaman pertama
    updateDashboard(); // Perbarui tampilan
    showNotification('Filter berhasil diterapkan', 'success'); // Tampilkan pesan sukses
}

function resetFilters() {
    // Kembalikan filter ke pengaturan awal
    document.getElementById('period-filter').value = 'all';
    document.getElementById('payment-filter').value = 'all';
    
    filteredSales = [...allSales]; // Tampilkan semua data
    currentPage = 1; // Kembali ke halaman pertama
    updateDashboard(); // Perbarui tampilan
    showNotification('Filter berhasil direset', 'info'); // Tampilkan pesan info
}

function updateDashboard() {
    // Perbarui semua bagian tampilan
    updateStatistics(); // Perbarui statistik
    renderSalesTable(); // Perbarui tabel penjualan
    updatePagination(); // Perbarui navigasi halaman
    if (salesChart) {
        updateChart(); // Perbarui grafik jika ada
    }
}

function updateStatistics() {
    // Hitung total penjualan
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    // Hitung jumlah transaksi
    const totalTransactions = filteredSales.length;
    // Hitung rata-rata per transaksi
    const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    // Hitung total barang terjual
    const totalItems = filteredSales.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Tampilkan statistik di layar
    document.getElementById('total-sales').textContent = `Rp ${formatPrice(totalSales)}`;
    document.getElementById('total-transactions').textContent = totalTransactions;
    document.getElementById('avg-transaction').textContent = `Rp ${formatPrice(avgTransaction)}`;
    document.getElementById('total-items').textContent = totalItems;
}

function renderSalesTable() {
    const tbody = document.getElementById('sales-table-body');
    // Hitung data yang akan ditampilkan di halaman ini
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const paginatedSales = filteredSales.slice(startIndex, endIndex);

    // Jika tidak ada data, tampilkan pesan kosong
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

    // Buat baris tabel untuk setiap penjualan
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

    // Perbarui info jumlah data yang ditampilkan
    document.getElementById('showing-from').textContent = startIndex + 1;
    document.getElementById('showing-to').textContent = Math.min(endIndex, filteredSales.length);
    document.getElementById('total-entries').textContent = filteredSales.length;
}

function updatePagination() {
    // Hitung jumlah halaman yang dibutuhkan
    const totalPages = Math.ceil(filteredSales.length / entriesPerPage);
    const container = document.getElementById('pagination-container');
    
    // Jika hanya 1 halaman atau kurang, sembunyikan navigasi
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Tombol halaman sebelumnya
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Hitung halaman mana saja yang akan ditampilkan
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Buat tombol untuk setiap halaman
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="px-3 py-2 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded">
                ${i}
            </button>
        `;
    }

    // Tombol halaman selanjutnya
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = paginationHTML;
}

function changePage(page) {
    // Hitung total halaman
    const totalPages = Math.ceil(filteredSales.length / entriesPerPage);
    // Pastikan halaman yang diminta valid
    if (page < 1 || page > totalPages) return;
    
    currentPage = page; // Ubah halaman aktif
    renderSalesTable(); // Tampilkan data halaman baru
    updatePagination(); // Perbarui navigasi halaman
}

function showSaleDetail(saleId) {
    // Cari data penjualan berdasarkan ID
    const sale = allSales.find(s => s.id === saleId);
    if (!sale) return;

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    // Buat tampilan daftar barang
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

    // Buat tampilan info pembayaran
    let paymentInfo = '';
    if (sale.paymentMethod === 'cash') {
        // Untuk pembayaran tunai, tampilkan uang diterima dan kembalian
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
        // Untuk pembayaran digital
        paymentInfo = `
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex justify-between">
                    <span>Pembayaran:</span>
                    <span class="font-semibold">${sale.paymentMethod.toUpperCase()}</span>
                </div>
            </div>
        `;
    }

    // Tampilkan detail lengkap dalam popup
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

    // Tampilkan popup
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDetailModal() {
    // Sembunyikan popup detail
    const modal = document.getElementById('detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function exportData() {
    // Cek apakah ada data untuk diekspor
    if (filteredSales.length === 0) {
        showNotification('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    // Buat header file CSV
    let csvContent = 'ID,Tanggal,Items,Total,Metode Pembayaran,Uang Diterima,Kembalian\n';
    
    // Tambahkan setiap baris data
    filteredSales.forEach(sale => {
        const items = sale.items.map(item => `${item.name} (${item.quantity}x)`).join('; ');
        const cashAmount = sale.cashAmount || 0;
        const change = sale.change || 0;
        
        csvContent += `${sale.id},"${formatDateTime(sale.date)}","${items}",${sale.total},${sale.paymentMethod.toUpperCase()},${cashAmount},${change}\n`;
    });
    
    // Buat file dan download
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

// Fungsi-fungsi bantuan untuk format tampilan
function formatPrice(price) {
    // Format angka menjadi format rupiah Indonesia
    return new Intl.NumberFormat('id-ID').format(Math.round(price));
}

function formatDate(dateString) {
    // Format tanggal menjadi format Indonesia (contoh: 15 Jan 2024)
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    // Format tanggal dan waktu lengkap (contoh: 15 Jan 2024, 14:30)
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
    // Buat kotak pesan notifikasi
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm animate-fade-in`;
    
    // Tentukan warna berdasarkan jenis pesan
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500'; // Hijau untuk sukses
            break;
        case 'error':
            notification.className += ' bg-red-500'; // Merah untuk error
            break;
        case 'warning':
            notification.className += ' bg-yellow-500'; // Kuning untuk peringatan
            break;
        default:
            notification.className += ' bg-blue-500'; // Biru untuk info
    }
    
    // Isi pesan dengan tombol tutup
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Tampilkan pesan di layar
    document.body.appendChild(notification);
    
    // Hilangkan pesan setelah 5 detik
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Pengawas kejadian (Event Listeners)
document.addEventListener('click', function(e) {
    // Tutup popup jika klik di luar area popup
    const modal = document.getElementById('detail-modal');
    if (e.target === modal) {
        closeDetailModal();
    }
});

document.addEventListener('keydown', function(e) {
    // Tutup popup jika tekan tombol Escape
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});

