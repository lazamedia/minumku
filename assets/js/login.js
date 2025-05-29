
class POSAuth {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.loadUsersFromStorage();
        this.setupEventListeners();
        this.checkExistingSession();
        this.createDefaultUsers();
    }
    
    // Load semua user dari localStorage
    loadUsersFromStorage() {
        try {
            const savedUsers = localStorage.getItem('pos_users');
            if (savedUsers) {
                this.users = JSON.parse(savedUsers);
                console.log('Users loaded from localStorage:', this.users.length);
            } else {
                this.users = [];
                console.log('No users found in localStorage');
            }
        } catch (error) {
            console.error('Error loading users from localStorage:', error);
            this.users = [];
        }
    }
    
    // Ambil hanya user dengan status aktif
    getActiveUsers() {
        return this.users.filter(user => user.status === 'active');
    }
    
    // Buat user default jika belum ada
    createDefaultUsers() {
        if (this.users.length === 0) {
            const defaultUsers = [
                {
                    id: 1,
                    name: 'Administrator',
                    username: 'admin',
                    email: 'admin@pos.com',
                    phone: '081234567890',
                    role: 'admin',
                    status: 'active',
                    password: 'admin123',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Kasir 1',
                    username: 'kasir1',
                    email: 'kasir1@pos.com',
                    phone: '081234567891',
                    role: 'kasir',
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
                    role: 'manager',
                    status: 'active',
                    password: 'manager123',
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.users = defaultUsers;
            this.saveUsersToStorage();
            
            // Tampilkan info user default
            this.showMessage('info', 
                'User default telah dibuat:<br>' +
                '• Admin: admin / admin123<br>' +
                '• Kasir: kasir1 / kasir123<br>' +
                '• Manager: manager / manager123'
            );
        }
    }
    
    // Simpan users ke localStorage
    saveUsersToStorage() {
        try {
            localStorage.setItem('pos_users', JSON.stringify(this.users));
            console.log('Users saved to localStorage:', this.users.length);
        } catch (error) {
            console.error('Error saving users to localStorage:', error);
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Input field animations
        const inputFields = document.querySelectorAll('.input-field');
        inputFields.forEach(field => {
            field.addEventListener('focus', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            field.addEventListener('blur', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');
        
        // Validate input
        if (!username || !password) {
            this.showMessage('error', 'Username dan password harus diisi!');
            return;
        }
        
        // Show loading
        this.setLoadingState(loginBtn, true);
        
        // Simulate network delay
        setTimeout(() => {
            if (this.validateLogin(username, password)) {
                this.saveSession(this.currentUser, rememberMe);
                this.showMessage('success', 'Login berhasil! Mengalihkan ke halaman POS...');
                
                setTimeout(() => {
                    this.redirectToPOS();
                }, 1500);
            } else {
                this.setLoadingState(loginBtn, false);
            }
        }, 1000);
    }
    
    // Validate login credentials
    validateLogin(username, password) {
        // Refresh data dari localStorage sebelum validasi
        this.loadUsersFromStorage();
        
        // Ambil hanya user dengan status aktif
        const activeUsers = this.getActiveUsers();
        
        console.log('Active users for login:', activeUsers.length);
        
        if (activeUsers.length === 0) {
            this.showMessage('error', 'Tidak ada user aktif di sistem!');
            return false;
        }
        
        // Cari user berdasarkan username, email, atau name (case insensitive)
        const user = activeUsers.find(u => {
            const usernameMatch = u.username && u.username.toLowerCase() === username.toLowerCase();
            const emailMatch = u.email && u.email.toLowerCase() === username.toLowerCase();
            const nameMatch = u.name && u.name.toLowerCase() === username.toLowerCase();
            
            return usernameMatch || emailMatch || nameMatch;
        });
        
        if (!user) {
            this.showMessage('error', 'Username/Email tidak ditemukan atau user tidak aktif!');
            return false;
        }
        
        // Verifikasi password
        if (user.password !== password) {
            this.showMessage('error', 'Password salah!');
            return false;
        }
        
        this.currentUser = user;
        console.log('Login successful for user:', user.name);
        return true;
    }
    
    // Save login session
    saveSession(user, rememberMe = false) {
        const sessionData = {
            userId: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            loginTime: new Date().toISOString(),
            isLoggedIn: true
        };
        
        // Save to sessionStorage (sesi sementara)
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
        
        // Save to localStorage jika "Remember Me" dicentang
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify(sessionData));
        }
        
        console.log('Session saved for user:', user.name);
    }
    
    // Check existing session
    checkExistingSession() {
        // Cek session storage dulu
        let session = sessionStorage.getItem('userSession');
        
        // Jika tidak ada, cek localStorage untuk remembered user
        if (!session) {
            session = localStorage.getItem('rememberedUser');
        }
        
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.isLoggedIn) {
                    // Verifikasi user masih aktif di localStorage
                    this.loadUsersFromStorage();
                    const user = this.users.find(u => u.id === sessionData.userId && u.status === 'active');
                    
                    if (user) {
                        this.showMessage('info', `Selamat datang kembali, ${sessionData.name}! Mengalihkan ke POS...`);
                        setTimeout(() => {
                            this.redirectToPOS();
                        }, 2000);
                    } else {
                        // User tidak aktif lagi, hapus session
                        this.clearSession();
                        this.showMessage('error', 'Sesi login tidak valid. Silakan login ulang.');
                    }
                }
            } catch (error) {
                console.error('Error parsing session data:', error);
                this.clearSession();
            }
        }
    }
    
    // Clear session
    clearSession() {
        sessionStorage.removeItem('userSession');
        localStorage.removeItem('rememberedUser');
    }
    
    // Redirect to POS
    redirectToPOS() {
        // Ganti dengan halaman POS yang sesuai
        window.location.href = 'pos.html';
    }
    
    // Logout function
    logout() {
        this.clearSession();
        this.currentUser = null;
        this.showMessage('info', 'Anda telah logout.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    // Set loading state for button
    setLoadingState(button, loading) {
        if (loading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Masuk';
            button.disabled = false;
        }
    }
    
    // Show message function
    showMessage(type, message) {
        const container = document.getElementById('messageContainer');
        if (!container) return;
        
        // Remove existing messages
        container.innerHTML = '';
        
        // Define styles for different message types
        const styles = {
            error: 'bg-red-100 border border-red-400 text-red-700',
            success: 'bg-green-100 border border-green-400 text-green-700',
            info: 'bg-blue-100 border border-blue-400 text-blue-700',
            warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700'
        };
        
        const icons = {
            error: 'fas fa-exclamation-triangle',
            success: 'fas fa-check-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-circle'
        };
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${styles[type]} px-4 py-3 rounded-xl animate-pulse`;
        messageDiv.innerHTML = `<i class="${icons[type]} mr-2"></i>${message}`;
        
        container.appendChild(messageDiv);
        
        // Auto remove after 5 seconds for error messages
        if (type === 'error' || type === 'warning') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
    
    // Debug function - tampilkan semua user
    debugShowUsers() {
        console.log('=== ALL USERS ===');
        console.log(this.users);
        console.log('=== ACTIVE USERS ===');
        console.log(this.getActiveUsers());
    }
    
    // Tambah user baru (untuk testing)
    addUser(userData) {
        const newUser = {
            id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role || 'kasir',
            status: userData.status || 'active',
            password: userData.password,
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsersToStorage();
        
        return newUser;
    }
    
    // Update status user
    updateUserStatus(userId, status) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = status;
            this.saveUsersToStorage();
            return true;
        }
        return false;
    }
}


// Toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}


// Global variable untuk instance POS Auth
let posAuth;

// Initialize POS Auth when page loads
window.addEventListener('DOMContentLoaded', () => {
    posAuth = new POSAuth();
    
    // Debug: tampilkan user di console (untuk development)
    setTimeout(() => {
        posAuth.debugShowUsers();
    }, 1000);
});

// Expose functions to global scope for debugging
window.posAuth = posAuth;
window.debugUsers = () => posAuth?.debugShowUsers();

// For demo purposes - add demo parameter to URL
if (!window.location.search.includes('demo=true')) {
    const url = new URL(window.location);
    url.searchParams.set('demo', 'true');
    history.replaceState(null, '', url);
}
