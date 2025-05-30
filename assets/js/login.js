// Kelas utama untuk menangani sistem autentikasi POS
class POSAuth {
    constructor() {
        this.users = [];        // Array untuk menyimpan semua data pengguna
        this.currentUser = null; // Pengguna yang sedang login saat ini
        this.init();            // Panggil fungsi inisialisasi
    }
    
    // Fungsi inisialisasi - dijalankan pertama kali saat aplikasi dimuat
    init() {
        this.loadUsersFromStorage();  // Muat data pengguna dari localStorage
        this.setupEventListeners();   // Atur event listener untuk form dan input
        this.checkExistingSession();  // Periksa apakah ada sesi login yang tersimpan
        this.createDefaultUsers();    // Buat pengguna default jika belum ada
    }
    
    // Memuat semua data pengguna dari localStorage browser
    loadUsersFromStorage() {
        try {
            // Ambil data pengguna yang tersimpan dengan key 'pos_users'
            const savedUsers = localStorage.getItem('pos_users');
            if (savedUsers) {
                // Parse JSON string menjadi array JavaScript
                this.users = JSON.parse(savedUsers);
                console.log('Users loaded from localStorage:', this.users.length);
            } else {
                // Jika tidak ada data tersimpan, buat array kosong
                this.users = [];
                console.log('No users found in localStorage');
            }
        } catch (error) {
            // Tangani error jika ada masalah saat membaca data
            console.error('Error loading users from localStorage:', error);
            this.users = [];
        }
    }
     
    // Mengambil hanya pengguna dengan status aktif
    // Filter ini mencegah pengguna yang dinonaktifkan untuk login
    getActiveUsers() {
        return this.users.filter(user => user.status === 'active');
    }
    
    // Membuat pengguna default jika sistem masih kosong
    createDefaultUsers() {
        // Cek apakah sudah ada pengguna dalam sistem
        if (this.users.length === 0) {
            // Data pengguna default dengan berbagai role
            const defaultUsers = [
                {
                    id: 1,
                    name: 'Administrator',
                    username: 'admin',
                    email: 'admin@pos.com',
                    phone: '081234567890',
                    role: 'admin',          // Role administrator - akses penuh
                    status: 'active',       // Status aktif - bisa login
                    password: 'admin123',   // Password default
                    createdAt: new Date().toISOString() // Waktu pembuatan akun
                },
                {
                    id: 2,
                    name: 'Kasir 1',
                    username: 'kasir1',
                    email: 'kasir1@pos.com',
                    phone: '081234567891',
                    role: 'kasir',         // Role kasir - untuk transaksi
                    status: 'active',
                    password: 'kasir123',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Manager',
                    username: 'manager',
                    email: 'manager@pos.com',
                    phone: '081234567892',
                    role: 'manager',       // Role manager - supervisi
                    status: 'active',
                    password: 'manager123',
                    createdAt: new Date().toISOString()
                }
            ];
            
            // Simpan pengguna default ke array dan localStorage
            this.users = defaultUsers;
            this.saveUsersToStorage();
            
            // Tampilkan informasi pengguna default kepada user
            this.showMessage('info', 
                'User default telah dibuat:<br>' +
                '• Admin: admin / admin123<br>' +
                '• Kasir: kasir1 / kasir123<br>' +
                '• Manager: manager / manager123'
            );
        }
    }
    
    // Menyimpan data pengguna ke localStorage browser
    saveUsersToStorage() {
        try {
            // Konversi array JavaScript menjadi JSON string dan simpan
            localStorage.setItem('pos_users', JSON.stringify(this.users));
            console.log('Users saved to localStorage:', this.users.length);
        } catch (error) {
            // Tangani error jika ada masalah saat menyimpan
            console.error('Error saving users to localStorage:', error);
        }
    }
    
    // Mengatur event listener untuk interaksi user dengan form
    setupEventListeners() {
        // Event listener untuk form login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            // Tangani submit form login
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Animasi untuk input field - efek visual saat fokus
        const inputFields = document.querySelectorAll('.input-field');
        inputFields.forEach(field => {
            // Animasi saat input mendapat fokus
            field.addEventListener('focus', function() {
                this.style.transform = 'translateY(-2px)'; // Naik sedikit
            });
            
            // Animasi saat input kehilangan fokus
            field.addEventListener('blur', function() {
                this.style.transform = 'translateY(0)'; // Kembali ke posisi normal
            });
        });
    }
    
    // Menangani proses login saat form dikirim
    async handleLogin(e) {
        e.preventDefault(); // Mencegah form reload halaman
        
        // Ambil nilai dari form input
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');
        
        // Validasi input - pastikan tidak kosong
        if (!username || !password) {
            this.showMessage('error', 'Username dan password harus diisi!');
            return;
        }
        
        // Tampilkan status loading pada tombol
        this.setLoadingState(loginBtn, true);
        
        // Simulasi delay jaringan untuk UX yang lebih baik
        setTimeout(() => {
            // Validasi kredensial login
            if (this.validateLogin(username, password)) {
                // Jika valid, simpan sesi dan alihkan ke halaman POS
                this.saveSession(this.currentUser, rememberMe);
                this.showMessage('success', 'Login berhasil! Mengalihkan ke halaman POS...');
                
                // Delay sebelum redirect untuk memberi waktu user melihat pesan sukses
                setTimeout(() => {
                    this.redirectToPOS();
                }, 1500);
            } else {
                // Jika gagal, kembalikan tombol ke state normal
                this.setLoadingState(loginBtn, false);
            }
        }, 1000); // Delay 1 detik untuk simulasi proses
    }
    
    // Memvalidasi kredensial login user
    validateLogin(username, password) {
        // Refresh data dari localStorage sebelum validasi (untuk data yang up-to-date)
        this.loadUsersFromStorage();
        
        // Ambil hanya pengguna dengan status aktif
        const activeUsers = this.getActiveUsers();
        
        console.log('Active users for login:', activeUsers.length);
        
        // Cek apakah ada pengguna aktif dalam sistem
        if (activeUsers.length === 0) {
            this.showMessage('error', 'Tidak ada user aktif di sistem!');
            return false;
        }
        
        // Cari pengguna berdasarkan username, email, atau nama (case insensitive)
        // Ini memberikan fleksibilitas login dengan berbagai identitas
        const user = activeUsers.find(u => {
            const usernameMatch = u.username && u.username.toLowerCase() === username.toLowerCase();
            const emailMatch = u.email && u.email.toLowerCase() === username.toLowerCase();
            const nameMatch = u.name && u.name.toLowerCase() === username.toLowerCase();
            
            return usernameMatch || emailMatch || nameMatch;
        });
        
        // Jika pengguna tidak ditemukan
        if (!user) {
            this.showMessage('error', 'Username/Email tidak ditemukan atau user tidak aktif!');
            return false;
        }
        
        // Verifikasi password (perbandingan langsung - dalam produksi sebaiknya di-hash)
        if (user.password !== password) {
            this.showMessage('error', 'Password salah!');
            return false;
        }
        
        // Jika semua validasi berhasil, set current user
        this.currentUser = user;
        console.log('Login successful for user:', user.name);
        return true;
    }
    
    // Menyimpan sesi login ke browser storage
    saveSession(user, rememberMe = false) {
        // Data sesi yang akan disimpan
        const sessionData = {
            userId: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            loginTime: new Date().toISOString(), // Waktu login
            isLoggedIn: true
        };
        
        // Simpan ke sessionStorage (sesi sementara - hilang saat tab ditutup)
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
        
        // Simpan ke localStorage jika "Remember Me" dicentang (persisten)
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify(sessionData));
        }
        
        console.log('Session saved for user:', user.name);
    }
    
    // Memeriksa apakah ada sesi login yang tersimpan saat halaman dimuat
    checkExistingSession() {
        // Cek sessionStorage terlebih dahulu (prioritas tinggi)
        let session = sessionStorage.getItem('userSession');
        
        // Jika tidak ada di sessionStorage, cek localStorage untuk remembered user
        if (!session) {
            session = localStorage.getItem('rememberedUser');
        }
        
        if (session) {
            try {
                // Parse data sesi dari JSON
                const sessionData = JSON.parse(session);
                if (sessionData.isLoggedIn) {
                    // Verifikasi bahwa pengguna masih aktif di sistem
                    this.loadUsersFromStorage();
                    const user = this.users.find(u => u.id === sessionData.userId && u.status === 'active');
                    
                    if (user) {
                        // Jika valid, sambut user dan redirect ke POS
                        this.showMessage('info', `Selamat datang kembali, ${sessionData.name}! Mengalihkan ke POS...`);
                        setTimeout(() => {
                            this.redirectToPOS();
                        }, 2000);
                    } else {
                        // Jika user tidak aktif lagi, hapus sesi yang tidak valid
                        this.clearSession();
                        this.showMessage('error', 'Sesi login tidak valid. Silakan login ulang.');
                    }
                }
            } catch (error) {
                // Tangani error jika data sesi rusak
                console.error('Error parsing session data:', error);
                this.clearSession();
            }
        }
    }
    
    // Menghapus semua data sesi dari browser
    clearSession() {
        sessionStorage.removeItem('userSession');      // Hapus sesi sementara
        localStorage.removeItem('rememberedUser');     // Hapus sesi permanen
    }
    
    // Mengalihkan pengguna ke halaman POS utama
    redirectToPOS() {
        // Ganti dengan nama file halaman POS yang sesuai
        window.location.href = 'pos.html';
    }
    
    // Fungsi logout - menghapus sesi dan kembali ke halaman login
    logout() {
        this.clearSession();           // Hapus semua data sesi
        this.currentUser = null;       // Reset current user
        this.showMessage('info', 'Anda telah logout.');
        setTimeout(() => {
            window.location.href = 'index.html'; // Kembali ke halaman login
        }, 1000);
    }
    
    // Mengatur tampilan tombol saat proses loading
    setLoadingState(button, loading) {
        if (loading) {
            // Tampilan saat loading: spinner + teks "Memproses..."
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';
            button.disabled = true;  // Disable tombol agar tidak bisa diklik
        } else {
            // Tampilan normal: ikon login + teks "Masuk"
            button.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Masuk';
            button.disabled = false; // Enable kembali tombol
        }
    }
    
    // Menampilkan pesan kepada pengguna dengan berbagai tipe
    showMessage(type, message) {
        const container = document.getElementById('messageContainer');
        if (!container) return; // Keluar jika container tidak ditemukan
        
        // Hapus pesan yang sudah ada sebelumnya
        container.innerHTML = '';
        
        // Definisi style untuk berbagai tipe pesan
        const styles = {
            error: 'bg-red-100 border border-red-400 text-red-700',       // Merah untuk error
            success: 'bg-green-100 border border-green-400 text-green-700', // Hijau untuk sukses
            info: 'bg-blue-100 border border-blue-400 text-blue-700',       // Biru untuk info
            warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700' // Kuning untuk warning
        };
        
        // Definisi ikon untuk berbagai tipe pesan
        const icons = {
            error: 'fas fa-exclamation-triangle',  // Ikon peringatan untuk error
            success: 'fas fa-check-circle',        // Ikon centang untuk sukses
            info: 'fas fa-info-circle',            // Ikon info untuk informasi
            warning: 'fas fa-exclamation-circle'   // Ikon peringatan untuk warning
        };
        
        // Buat elemen div untuk pesan
        const messageDiv = document.createElement('div');
        messageDiv.className = `${styles[type]} px-4 py-3 rounded-xl animate-pulse`;
        messageDiv.innerHTML = `<i class="${icons[type]} mr-2"></i>${message}`;
        
        // Tambahkan pesan ke container
        container.appendChild(messageDiv);
        
        // Auto-remove pesan error dan warning setelah 5 detik
        if (type === 'error' || type === 'warning') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
    
    // Fungsi debug - menampilkan semua data pengguna di console
    debugShowUsers() {
        console.log('=== ALL USERS ===');
        console.log(this.users);               // Tampilkan semua pengguna
        console.log('=== ACTIVE USERS ===');
        console.log(this.getActiveUsers());    // Tampilkan hanya pengguna aktif
    }
    
    // Menambah pengguna baru ke sistem (untuk testing dan pengembangan)
    addUser(userData) {
        // Buat ID baru berdasarkan ID tertinggi yang ada + 1
        const newUser = {
            id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role || 'kasir',      // Default role kasir
            status: userData.status || 'active', // Default status aktif
            password: userData.password,
            createdAt: new Date().toISOString()
        };
        
        // Tambahkan ke array dan simpan ke localStorage
        this.users.push(newUser);
        this.saveUsersToStorage();
        
        return newUser; // Kembalikan data pengguna yang baru dibuat
    }
    
    // Mengubah status pengguna (aktif/nonaktif)
    updateUserStatus(userId, status) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = status;        // Update status
            this.saveUsersToStorage();   // Simpan perubahan
            return true;                 // Berhasil
        }
        return false;                    // Gagal - user tidak ditemukan
    }
}

// Fungsi global untuk toggle visibilitas password
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    // Toggle tipe input antara 'password' dan 'text'
    if (passwordField.type === 'password') {
        passwordField.type = 'text';              // Tampilkan password
        toggleIcon.classList.remove('fa-eye');    // Ganti ikon
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';          // Sembunyikan password
        toggleIcon.classList.remove('fa-eye-slash'); // Ganti ikon
        toggleIcon.classList.add('fa-eye');
    }
}

// Variabel global untuk menyimpan instance POS Auth
let posAuth;

// Inisialisasi aplikasi POS Auth saat halaman selesai dimuat
window.addEventListener('DOMContentLoaded', () => {
    posAuth = new POSAuth(); // Buat instance baru
    
    // Debug: tampilkan data pengguna di console setelah 1 detik
    // (untuk keperluan pengembangan dan debugging)
    setTimeout(() => {
        posAuth.debugShowUsers();
    }, 1000);
});

// Ekspos fungsi ke global scope untuk debugging di browser console
window.posAuth = posAuth;                    // Akses ke instance utama
window.debugUsers = () => posAuth?.debugShowUsers(); // Shortcut untuk debug

// Untuk keperluan demo - tambahkan parameter demo ke URL
// Ini berguna untuk membedakan mode demo dan produksi
if (!window.location.search.includes('demo=true')) {
    const url = new URL(window.location);
    url.searchParams.set('demo', 'true');
    history.replaceState(null, '', url);     // Update URL tanpa reload halaman
}