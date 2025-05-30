// Variabel untuk menyimpan data pengguna dan status edit
let users = []; // Daftar semua pengguna
let editingUserId = null; // ID pengguna yang sedang diedit

// Memulai aplikasi ketika halaman web selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    loadUsers(); // Ambil data pengguna dari penyimpanan
    renderUsers(); // Tampilkan daftar pengguna di tabel
    updateStatistics(); // Perbarui angka statistik
    setupSearchFilter(); // Siapkan fitur pencarian
    setupFormSubmit(); // Siapkan form untuk menyimpan data
});

// Mengambil data pengguna dari penyimpanan browser
function loadUsers() {
    try {
        // Coba ambil data pengguna yang tersimpan di browser
        const savedUsers = localStorage.getItem('pos_users');
        if (savedUsers) {
            users = JSON.parse(savedUsers); // Ubah dari teks ke data yang bisa dipakai
        }
        
        // Jika belum ada pengguna, buat akun admin default
        if (users.length === 0) {
            users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@pos.com',
                    password: 'admin123',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            saveUsers(); // Simpan akun admin ke penyimpanan
        }
    } catch (error) {
        // Jika ada masalah saat mengambil data
        console.error('Error loading users:', error);
        showNotification('Error memuat data pengguna!', 'error');
        users = []; // Kosongkan daftar pengguna
    }
}

// Menyimpan data pengguna ke penyimpanan browser
function saveUsers() {
    try {
        // Simpan daftar pengguna ke penyimpanan browser
        localStorage.setItem('pos_users', JSON.stringify(users));
        // Simpan waktu terakhir data diperbarui
        localStorage.setItem('pos_users_updated', new Date().toISOString());
    } catch (error) {
        // Jika gagal menyimpan data
        console.error('Error saving users:', error);
        showNotification('Error menyimpan data pengguna!', 'error');
    }
}

// Membuat nomor ID baru untuk pengguna baru
function generateUserId() {
    // Cari nomor ID terbesar yang ada, lalu tambah 1
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
}

// Menampilkan daftar pengguna dalam bentuk tabel
function renderUsers(filteredUsers = null) {
    const tbody = document.getElementById('users-table-body'); // Bagian isi tabel
    const emptyState = document.getElementById('empty-state'); // Pesan saat tidak ada data
    const usersToRender = filteredUsers || users; // Data yang akan ditampilkan

    // Jika tidak ada pengguna untuk ditampilkan
    if (usersToRender.length === 0) {
        tbody.innerHTML = ''; // Kosongkan tabel
        emptyState.classList.remove('hidden'); // Tampilkan pesan kosong
        return;
    }

    emptyState.classList.add('hidden'); // Sembunyikan pesan kosong
    
    // Buat baris tabel untuk setiap pengguna
    tbody.innerHTML = usersToRender.map(user => `
        <tr class="table-row hover:bg-gray-50 transition-all duration-200">
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">#${user.id}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span class="text-white font-bold text-sm">${user.username.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${user.username}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${user.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(user.status)}">
                    <i class="${getStatusIcon(user.status)} mr-1"></i>
                    ${user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(user.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="editUser(${user.id})" 
                        class="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-lg transition">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="toggleUserStatus(${user.id})" 
                        class="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition">
                    <i class="fas fa-toggle-${user.status === 'active' ? 'off' : 'on'}"></i>
                </button>
                <button onclick="deleteUser(${user.id})" 
                        class="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Fungsi bantuan untuk menentukan warna status pengguna
function getStatusBadgeClass(status) {
    // Jika aktif = hijau, jika tidak aktif = merah
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

// Fungsi bantuan untuk menentukan ikon status pengguna
function getStatusIcon(status) {
    // Jika aktif = ikon centang, jika tidak aktif = ikon silang
    return status === 'active' ? 'fas fa-check-circle' : 'fas fa-times-circle';
}

// Mengubah format tanggal menjadi lebih mudah dibaca
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', // Tahun dalam angka
        month: 'short', // Bulan disingkat (Jan, Feb, dst)
        day: 'numeric' // Tanggal dalam angka
    });
}

// Memperbarui angka statistik di dashboard
function updateStatistics() {
    const totalUsers = users.length; // Total semua pengguna
    const activeUsers = users.filter(u => u.status === 'active').length; // Pengguna aktif saja
    
    // Tampilkan angka di halaman web
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('active-users').textContent = activeUsers;
}

// Menyiapkan fitur pencarian pengguna
function setupSearchFilter() {
    const searchInput = document.getElementById('search-user'); // Kotak pencarian
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim(); // Kata kunci pencarian
        
        // Jika kotak pencarian kosong, tampilkan semua pengguna
        if (query === '') {
            renderUsers();
            return;
        }

        // Cari pengguna berdasarkan nama atau email
        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );

        renderUsers(filteredUsers); // Tampilkan hasil pencarian
    });
}

// Menyiapkan form untuk menyimpan data pengguna
function setupFormSubmit() {
    const form = document.getElementById('user-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Cegah halaman refresh otomatis
        saveUserData(); // Simpan data yang diinput
    });
}

// Menampilkan popup untuk menambah pengguna baru
function showAddUser() {
    editingUserId = null; // Reset status edit
    document.getElementById('user-modal-title').textContent = 'Tambah User Baru';
    document.getElementById('save-btn-text').textContent = 'Simpan';
    document.getElementById('user-form').reset(); // Kosongkan form
    document.querySelector('input[name="user-status"][value="active"]').checked = true; // Set status aktif
    document.getElementById('password-section').classList.remove('hidden'); // Tampilkan kolom password
    document.getElementById('user-password').required = true; // Password wajib diisi
    document.getElementById('user-modal').classList.remove('hidden'); // Tampilkan popup
    document.getElementById('user-modal').classList.add('flex');
}

// Menutup popup pengguna
function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden'); // Sembunyikan popup
    document.getElementById('user-modal').classList.remove('flex');
    document.getElementById('user-form').reset(); // Kosongkan form
    editingUserId = null; // Reset status edit
}

// Menampilkan popup untuk mengedit pengguna
function editUser(userId) {
    const user = users.find(u => u.id === userId); // Cari data pengguna
    if (!user) return; // Jika tidak ditemukan, berhenti

    editingUserId = userId; // Simpan ID yang sedang diedit
    document.getElementById('user-modal-title').textContent = 'Edit User';
    document.getElementById('save-btn-text').textContent = 'Update';
    
    // Isi form dengan data pengguna yang akan diedit
    document.getElementById('user-name').value = user.username;
    document.getElementById('user-email').value = user.email;
    document.querySelector(`input[name="user-status"][value="${user.status}"]`).checked = true;
    
    // Sembunyikan kolom password saat edit (opsional)
    document.getElementById('password-section').classList.add('hidden');
    document.getElementById('user-password').required = false;
    
    // Tampilkan popup
    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('user-modal').classList.add('flex');
}

// Menyimpan data pengguna (baru atau update)
function saveUserData() {
    // Ambil data dari form
    const username = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const status = document.querySelector('input[name="user-status"]:checked').value;

    // Cek apakah data sudah diisi lengkap
    if (!username || !email) {
        showNotification('Username dan email harus diisi!', 'error');
        return;
    }

    // Cek password untuk pengguna baru (minimal 6 karakter)
    if (!editingUserId && (!password || password.length < 6)) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }

    // Cek apakah email sudah dipakai pengguna lain
    const existingUser = users.find(u => u.email === email && u.id !== editingUserId);
    if (existingUser) {
        showNotification('Email sudah digunakan!', 'error');
        return;
    }

    // Cek apakah username sudah dipakai pengguna lain
    const existingUsername = users.find(u => u.username === username && u.id !== editingUserId);
    if (existingUsername) {
        showNotification('Username sudah digunakan!', 'error');
        return;
    }

    if (editingUserId) {
        // Update data pengguna yang sudah ada
        const userIndex = users.findIndex(u => u.id === editingUserId);
        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex], // Salin data lama
                username: username,
                email: email,
                status: status,
                updatedAt: new Date().toISOString() // Catat waktu update
            };
            
            // Update password hanya jika diisi
            if (password && password.length >= 6) {
                users[userIndex].password = password;
            }
            
            showNotification('User berhasil diupdate!', 'success');
        }
    } else {
        // Buat pengguna baru
        const newUser = {
            id: generateUserId(), // Buat ID baru
            username: username,
            email: email,
            password: password,
            status: status,
            createdAt: new Date().toISOString() // Catat waktu pembuatan
        };
        
        users.push(newUser); // Tambahkan ke daftar pengguna
        showNotification('User berhasil ditambahkan!', 'success');
    }

    saveUsers(); // Simpan ke penyimpanan browser
    renderUsers(); // Perbarui tampilan tabel
    updateStatistics(); // Perbarui statistik
    closeUserModal(); // Tutup popup
}

// Mengubah status pengguna (aktif/tidak aktif)
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId); // Cari pengguna
    if (!user) return;

    // Balik status: aktif jadi tidak aktif, atau sebaliknya
    user.status = user.status === 'active' ? 'inactive' : 'active';
    user.updatedAt = new Date().toISOString(); // Catat waktu perubahan
    
    saveUsers(); // Simpan perubahan
    renderUsers(); // Perbarui tampilan
    updateStatistics(); // Perbarui statistik
    
    const statusText = user.status === 'active' ? 'diaktifkan' : 'dinonaktifkan';
    showNotification(`User ${user.username} berhasil ${statusText}`, 'success');
}

// Menghapus pengguna
function deleteUser(userId) {
    const user = users.find(u => u.id === userId); // Cari pengguna
    if (!user) return;

    // Cegah menghapus admin terakhir
    if (user.username === 'admin' && users.length === 1) {
        showNotification('Tidak dapat menghapus admin terakhir!', 'error');
        return;
    }

    // Tampilkan pesan konfirmasi
    document.getElementById('delete-message').textContent = 
        `Yakin ingin menghapus user "${user.username}"? Tindakan ini tidak dapat dibatalkan.`;
    
    // Siapkan fungsi untuk menghapus jika dikonfirmasi
    deleteCallback = () => {
        users = users.filter(u => u.id !== userId); // Hapus dari daftar
        saveUsers(); // Simpan perubahan
        renderUsers(); // Perbarui tampilan
        updateStatistics(); // Perbarui statistik
        showNotification(`User "${user.username}" berhasil dihapus`, 'success');
    };
    
    // Tampilkan popup konfirmasi
    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('delete-modal').classList.add('flex');
}

// Menutup popup konfirmasi hapus
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    document.getElementById('delete-modal').classList.remove('flex');
    deleteCallback = null; // Reset fungsi hapus
}

// Menjalankan penghapusan setelah dikonfirmasi
function confirmDelete() {
    if (deleteCallback) {
        deleteCallback(); // Jalankan penghapusan
        deleteCallback = null; // Reset fungsi
    }
    closeDeleteModal(); // Tutup popup
}

// Menampilkan/menyembunyikan password di form
function togglePassword() {
    const passwordInput = document.getElementById('user-password');
    const toggleIcon = document.getElementById('password-toggle-icon');
    
    if (passwordInput.type === 'password') {
        // Ubah ke teks biasa (tampilkan password)
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        // Ubah ke password tersembunyi
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Sistem notifikasi (pesan pop-up)
function showNotification(message, type = 'info') {
    // Buat elemen notifikasi baru
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : // Sukses = hijau
        type === 'error' ? 'bg-red-500 text-white' : // Error = merah
        type === 'warning' ? 'bg-yellow-500 text-white' : // Peringatan = kuning
        'bg-blue-500 text-white' // Info = biru
    }`;
    
    // Isi notifikasi dengan ikon dan pesan
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification); // Tambahkan ke halaman
    
    // Animasi munculnya notifikasi
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification); // Hapus dari halaman
        }, 300);
    }, 3000);
}