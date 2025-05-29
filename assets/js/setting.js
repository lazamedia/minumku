
let users = [];
let editingUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    renderUsers();
    updateStatistics();
    setupSearchFilter();
    setupFormSubmit();
});

// Load users from localStorage
function loadUsers() {
    try {
        const savedUsers = localStorage.getItem('pos_users');
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        }
        
        // Add default admin if no users exist
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
            saveUsers();
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error memuat data pengguna!', 'error');
        users = [];
    }
}

// Save users to localStorage
function saveUsers() {
    try {
        localStorage.setItem('pos_users', JSON.stringify(users));
        localStorage.setItem('pos_users_updated', new Date().toISOString());
    } catch (error) {
        console.error('Error saving users:', error);
        showNotification('Error menyimpan data pengguna!', 'error');
    }
}

// Generate new user ID
function generateUserId() {
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
}

// Render users table
function renderUsers(filteredUsers = null) {
    const tbody = document.getElementById('users-table-body');
    const emptyState = document.getElementById('empty-state');
    const usersToRender = filteredUsers || users;

    if (usersToRender.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    
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

// Helper functions for styling
function getStatusBadgeClass(status) {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

function getStatusIcon(status) {
    return status === 'active' ? 'fas fa-check-circle' : 'fas fa-times-circle';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Update statistics
function updateStatistics() {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('active-users').textContent = activeUsers;
}

// Search functionality
function setupSearchFilter() {
    const searchInput = document.getElementById('search-user');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query === '') {
            renderUsers();
            return;
        }

        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );

        renderUsers(filteredUsers);
    });
}

// Form submission
function setupFormSubmit() {
    const form = document.getElementById('user-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUserData();
    });
}

// Modal functions
function showAddUser() {
    editingUserId = null;
    document.getElementById('user-modal-title').textContent = 'Tambah User Baru';
    document.getElementById('save-btn-text').textContent = 'Simpan';
    document.getElementById('user-form').reset();
    document.querySelector('input[name="user-status"][value="active"]').checked = true;
    document.getElementById('password-section').classList.remove('hidden');
    document.getElementById('user-password').required = true;
    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('user-modal').classList.add('flex');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
    document.getElementById('user-modal').classList.remove('flex');
    document.getElementById('user-form').reset();
    editingUserId = null;
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    editingUserId = userId;
    document.getElementById('user-modal-title').textContent = 'Edit User';
    document.getElementById('save-btn-text').textContent = 'Update';
    
    // Fill form
    document.getElementById('user-name').value = user.username;
    document.getElementById('user-email').value = user.email;
    document.querySelector(`input[name="user-status"][value="${user.status}"]`).checked = true;
    
    // Hide password field for editing
    document.getElementById('password-section').classList.add('hidden');
    document.getElementById('user-password').required = false;
    
    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('user-modal').classList.add('flex');
}

// Save user data (Create/Update)
function saveUserData() {
    const username = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const status = document.querySelector('input[name="user-status"]:checked').value;

    // Validation
    if (!username || !email) {
        showNotification('Username dan email harus diisi!', 'error');
        return;
    }

    if (!editingUserId && (!password || password.length < 6)) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }

    // Check if email already exists (except for current user when editing)
    const existingUser = users.find(u => u.email === email && u.id !== editingUserId);
    if (existingUser) {
        showNotification('Email sudah digunakan!', 'error');
        return;
    }

    // Check if username already exists (except for current user when editing)
    const existingUsername = users.find(u => u.username === username && u.id !== editingUserId);
    if (existingUsername) {
        showNotification('Username sudah digunakan!', 'error');
        return;
    }

    if (editingUserId) {
        // Update existing user
        const userIndex = users.findIndex(u => u.id === editingUserId);
        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                username: username,
                email: email,
                status: status,
                updatedAt: new Date().toISOString()
            };
            
            // Update password only if provided
            if (password && password.length >= 6) {
                users[userIndex].password = password;
            }
            
            showNotification('User berhasil diupdate!', 'success');
        }
    } else {
        // Create new user
        const newUser = {
            id: generateUserId(),
            username: username,
            email: email,
            password: password,
            status: status,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        showNotification('User berhasil ditambahkan!', 'success');
    }

    saveUsers();
    renderUsers();
    updateStatistics();
    closeUserModal();
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    user.updatedAt = new Date().toISOString();
    
    saveUsers();
    renderUsers();
    updateStatistics();
    
    const statusText = user.status === 'active' ? 'diaktifkan' : 'dinonaktifkan';
    showNotification(`User ${user.username} berhasil ${statusText}`, 'success');
}

function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Prevent deleting the last admin user
    if (user.username === 'admin' && users.length === 1) {
        showNotification('Tidak dapat menghapus admin terakhir!', 'error');
        return;
    }

    document.getElementById('delete-message').textContent = 
        `Yakin ingin menghapus user "${user.username}"? Tindakan ini tidak dapat dibatalkan.`;
    
    // Store user ID for deletion
    deleteCallback = () => {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        renderUsers();
        updateStatistics();
        showNotification(`User "${user.username}" berhasil dihapus`, 'success');
    };
    
    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('delete-modal').classList.add('flex');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    document.getElementById('delete-modal').classList.remove('flex');
    deleteCallback = null;
}

function confirmDelete() {
    if (deleteCallback) {
        deleteCallback();
        deleteCallback = null;
    }
    closeDeleteModal();
}

// Password toggle
function togglePassword() {
    const passwordInput = document.getElementById('user-password');
    const toggleIcon = document.getElementById('password-toggle-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
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
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
