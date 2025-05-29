  function logout() {
    // Hapus session dan remembered user
    sessionStorage.removeItem('userSession');
    localStorage.removeItem('rememberedUser');
    // Redirect kembali ke halaman login
    window.location.href = 'index.html';
  }