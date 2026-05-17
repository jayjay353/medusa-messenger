const API_URL = location.hostname.includes('github.io') 
  ? 'https://www.queenmedusa-dashboard.stormbot.me'
  : 'http://localhost:3000';


function handleHashChange() {
  const hash = window.location.hash.substring(1);

  // Alle Screens deaktivieren
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  if(hash === 'auth') {
    document.getElementById('auth').classList.add('active');
  } else if(hash === 'chatlist') {
    document.getElementById('chatlist').classList.add('active');
  } else if(hash === 'settings') {
    document.getElementById('settings').classList.add('active');
  } else if(hash === 'account') {
    document.getElementById('account').classList.add('active');
  } else if(hash === 'privacy') {
    document.getElementById('privacy').classList.add('active');
  } else if(hash === 'lists') {
    document.getElementById('lists').classList.add('active');
  } else if(hash === 'chats-settings') {
    document.getElementById('chats-settings').classList.add('active');
  } else if(hash === 'notifications') {
    document.getElementById('notifications').classList.add('active');
  } else if(hash === 'accessibility') {
    document.getElementById('accessibility').classList.add('active');
  } else if(hash === 'help-feedback') {
    document.getElementById('help-feedback').classList.add('active');
  } else if(hash === 'app-language') {
    document.getElementById('app-language').classList.add('active');
  } else {
    document.getElementById('splash').classList.add('active');
  }
}

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', handleHashChange);

function toggleMenu() {
  document.getElementById('menu-dropdown').classList.toggle('show');
}

// Menü schließen wenn außerhalb geklickt wird
document.addEventListener('click', (e) => {
  if(!e.target.closest('.menu-btn') && !e.target.closest('.menu-dropdown')) {
    document.getElementById('menu-dropdown').classList.remove('show');
  }
});

function switchTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  if(tab === 'login') {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
  } else {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  }
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if(!email || !password) {
    alert('Bitte fülle alle Felder aus');
    return;
  }

  checkOwner(email, localStorage.getItem('username'));
  location.hash = 'chatlist';
}

async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if(!username || !email || !password) {
    alert('Bitte fülle alle Felder aus');
    return;
  }
  if(password.length < 6) {
    alert('Passwort muss mindestens 6 Zeichen haben');
    return;
  }

  try {
    // Schlüsselpaar erzeugen und Public Key holen
    const publicKey = await Crypto.generateKeyPair();
    
    // An Backend senden
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, email, publicKey })
    });

    if (!res.ok) throw new Error('Registrierung fehlgeschlagen');

    checkOwner(email, username);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);

    location.hash = 'chatlist';
  } catch (err) {
    console.error(err);
    alert('Fehler bei der Registrierung');
  }
}

function checkOwner(email, username) {
  const ownerEmail = 'jamieleelambert386@gmail.com';
  const ownerUsername = 'Medusa';

  if(email.toLowerCase() === ownerEmail.toLowerCase() && username === ownerUsername) {
    localStorage.setItem('isOwner', 'true');
  } else {
    localStorage.setItem('isOwner', 'false');
  }
}

function handleLogout() {
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('isOwner');
  localStorage.removeItem('privateKey'); // Key auch löschen
  location.hash = 'splash';
}

function closeBottomSheet() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  handleHashChange();
}

// Beispiel: Nachricht verschlüsseln und senden
async function sendEncryptedMessage(message, recipientPublicKey) {
  if (!message || !recipientPublicKey) return;
  
  try {
    const encrypted = await Crypto.encrypt(message, recipientPublicKey);
    // socket.emit('message', encrypted); // wenn socket existiert
    console.log('Verschlüsselt:', encrypted);
  } catch (err) {
    console.error('Verschlüsselung fehlgeschlagen:', err);
  }
}

// Sheets öffnen
document.querySelectorAll('.settings-item[data-target]').forEach(item => {
  item.addEventListener('click', () => {
    const target = document.getElementById(item.dataset.target);
    target.style.display = 'flex';
    setTimeout(() => target.style.transform = 'translateY(0)', 10);
  });
});

// Sheets schließen
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sheet = btn.closest('.bottom-sheet');
    sheet.style.transform = 'translateY(100%)';
    setTimeout(() => sheet.style.display = 'none', 300);
  });
});

// Klick außerhalb schließt Sheet
document.querySelectorAll('.bottom-sheet').forEach(sheet => {
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) {
      sheet.style.transform = 'translateY(100%)';
      setTimeout(() => sheet.style.display = 'none', 300);
    }
  });
});

// ===== 2FA Telefon-Input Aktivierung =====
const phoneInput = document.getElementById('twofa-phone');
const twofaBtn = document.getElementById('twofa-btn');

if(phoneInput && twofaBtn) {
  phoneInput.addEventListener('input', () => {
    if(phoneInput.value.trim().length > 5) {
      twofaBtn.classList.add('active');
      twofaBtn.disabled = false;
    } else {
      twofaBtn.classList.remove('active');
      twofaBtn.disabled = true;
    }
  });

  twofaBtn.addEventListener('click', () => {
    if(!twofaBtn.disabled) {
      alert('Code wurde an ' + phoneInput.value + ' gesendet');
    }
  });
}

// ===== Delete -> E-Mail Sheet Wechsel =====
document.querySelector('.delete-change-btn')?.addEventListener('click', () => {
  const deleteSheet = document.getElementById('sheet-delete');
  const emailSheet = document.getElementById('sheet-email');

  if(deleteSheet && emailSheet) {
    deleteSheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
      deleteSheet.style.display = 'none';
      emailSheet.style.display = 'flex';
      setTimeout(() => emailSheet.style.transform = 'translateY(0)', 10);
    }, 300);
  }
});

// ===== Konto löschen Formular =====
const deleteEmail = document.getElementById('delete-email');
const deletePassword = document.getElementById('delete-password');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

function checkDeleteForm() {
  const isValid = deleteEmail && deletePassword && deleteEmail.value.includes('@') && deletePassword.value.length > 0;
  if (deleteConfirmBtn) {
    deleteConfirmBtn.disabled = !isValid;
    deleteConfirmBtn.style.opacity = isValid ? '1' : '0.5';
  }
}

if(deleteEmail && deletePassword) {
  deleteEmail.addEventListener('input', checkDeleteForm);
  deletePassword.addEventListener('input', checkDeleteForm);

  deleteConfirmBtn.addEventListener('click', () => {
    if(!deleteConfirmBtn.disabled) {
      if(confirm('Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        alert('Konto wird gelöscht...');
      }
    }
  });
}

// ===== E-Mail hinzufügen Formular =====
const emailInput = document.getElementById('email-input');
const emailBtn = document.getElementById('email-btn');

if(emailInput && emailBtn) {
  emailInput.addEventListener('input', () => {
    const isValid = emailInput.value.includes('@') && emailInput.value.includes('.');
    emailBtn.disabled = !isValid;
    if(isValid) {
      emailBtn.classList.add('active');
      emailBtn.style.background = 'var(--accent)';
      emailBtn.style.color = 'white';
      emailBtn.style.cursor = 'pointer';
    } else {
      emailBtn.classList.remove('active');
    }
  });

  emailBtn.addEventListener('click', () => {
    if(!emailBtn.disabled) {
      alert('Bestätigungslink wurde an ' + emailInput.value + ' gesendet');
    }
  });
}
