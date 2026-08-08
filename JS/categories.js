 const catTransactions = JSON.parse(localStorage.getItem('transactions')) || [];

const allCategories = [
  { name: 'Food', icon: '🍔' },
  { name: 'Shopping', icon: '🛒' },
  { name: 'Bills', icon: '💡' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Health', icon: '🏥' },
  { name: 'Salary', icon: '💰' },
  { name: 'Other', icon: '🗂️' }
];

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  allCategories.forEach(cat => {
    const catTx = catTransactions.filter(t => t.category === cat.name);
    const total = catTx.reduce((a, b) => a + b.amount, 0);
    const count = catTx.length;

    grid.innerHTML += `
      <div class="category-card">
        <div class="cat-emoji">${cat.icon}</div>
        <p class="cat-name">${cat.name}</p>
        <p class="cat-total">${formatAmount(total)}</p>
        <p class="cat-count">${count} transaction${count !== 1 ? 's' : ''}</p>
      </div>
    `;
  });
}

// Dark mode
const themeToggle = document.getElementById('themeToggle');
const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = sunIcon;
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? sunIcon : moonIcon;
});

renderCategories();

document.querySelector('.logout').addEventListener('click', function(e) {
  e.preventDefault();
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    window.location.href = 'index.html';
  }
});
// ===== Notifications =====
function generateNotifications() {
  const tx = JSON.parse(localStorage.getItem('transactions')) || [];
  const notifs = [];

  const limits = { Food: 10000, Shopping: 10000, Bills: 9000, Entertainment: 10000 };
  const spending = {};

  tx.forEach(t => {
    if (t.type === 'expense') {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    }
  });

  Object.keys(limits).forEach(cat => {
    if (spending[cat] && spending[cat] >= limits[cat]) {
      notifs.push({ from: 'FinFlow Alerts', text: `⚠️ You exceeded your ${cat} budget!` });
    } else if (spending[cat] && spending[cat] >= limits[cat] * 0.8) {
      notifs.push({ from: 'FinFlow Alerts', text: `⚡ You're close to your ${cat} budget limit.` });
    }
  });

  const lastIncome = [...tx].reverse().find(t => t.type === 'income');
  if (lastIncome) {
    notifs.push({ from: 'FinFlow', text: `💰 Rs ${lastIncome.amount.toLocaleString()} income received.` });
  }

  const income = tx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = tx.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  if (income > 0 && expense > 0 && expense < income * 0.8) {
    notifs.push({ from: 'FinFlow', text: `🎉 Great job! You've saved over 20% this month.` });
  }

  return notifs;
}

function renderNotifications() {
  const notifs = generateNotifications();
  const badge = document.getElementById('notifBadge');
  const list = document.getElementById('notifList');

  if (notifs.length > 0) {
    badge.style.display = 'flex';
    badge.textContent = notifs.length;
  } else {
    badge.style.display = 'none';
  }

  list.innerHTML = notifs.length
    ? notifs.map(n => `<div class="notif-item"><div class="notif-from">${n.from}</div>${n.text}</div>`).join('')
    : '<div class="notif-empty">No new notifications</div>';
}

const notifBell = document.getElementById('notifBell');
const notifDropdown = document.getElementById('notifDropdown');

notifBell.addEventListener('click', (e) => {
  e.stopPropagation();
  notifDropdown.style.display = notifDropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', () => {
  notifDropdown.style.display = 'none';
});

renderNotifications();

// ===== Sidebar Toggle =====
const sidebarToggle = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  sidebar.classList.add('collapsed');
  mainContent.style.marginLeft = '70px';
}

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  const isCollapsed = sidebar.classList.contains('collapsed');
  mainContent.style.marginLeft = isCollapsed ? '70px' : '220px';
  localStorage.setItem('sidebarCollapsed', isCollapsed);
});

// ===== Profile Dropdown =====
const profileTrigger = document.getElementById('profileTrigger');
const profileDropdown = document.getElementById('profileDropdown');

profileTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', () => {
  profileDropdown.style.display = 'none';
});

// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    }
  });
}

// ===== Update Profile Avatar Initial =====
const savedName = localStorage.getItem('userName');
if (savedName) {
  const initial = savedName.charAt(0).toUpperCase();
  document.querySelectorAll('.profile-avatar, .profile-avatar-big-small').forEach(el => {
    el.textContent = initial;
  });
}
