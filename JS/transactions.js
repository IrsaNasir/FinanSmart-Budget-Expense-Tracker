let allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];

function formatAmount(amount) {
  return Number(amount).toLocaleString();
}

function renderAllTransactions() {
  const tbody = document.getElementById('allTransactionsBody');
  const categoryFilter = document.getElementById('filterCategory')?.value || 'all';
  const typeFilter = document.getElementById('filterType')?.value || 'all';
  const searchQuery = document.getElementById('txSearchBar')?.value.toLowerCase() || '';

  if (!tbody) return; // Guard clause if tbody is missing

  let filtered = [...allTransactions].reverse();

  if (categoryFilter !== 'all') {
    filtered = filtered.filter(t => t.category === categoryFilter);
  }

  if (typeFilter !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter);
  }

  if (searchQuery) {
    filtered = filtered.filter(t =>
      t.category.toLowerCase().includes(searchQuery) ||
      t.description.toLowerCase().includes(searchQuery)
    );
  }

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94A3B8; padding:20px;">No transactions found.</td></tr>';
    return;
  }

  filtered.forEach(t => {
    const row = document.createElement('tr');
    const amountClass = t.type === 'income' ? 'income-text' : 'expense-text';
    const amountSign = t.type === 'income' ? '+' : '-';
    const typeBadgeClass = t.type === 'income' ? 'income' : 'expense';
    const typeLabel = t.type === 'income' ? 'Income' : 'Expense';

    row.innerHTML = `
      <td>${t.date}</td>
      <td><span class="cat-badge">${t.category}</span></td>
      <td>${t.description}</td>
      <td class="${amountClass}">${amountSign} ${formatAmount(t.amount)}</td>
      <td><span class="type-badge ${typeBadgeClass}">${typeLabel}</span></td>
      <td><button class="delete-btn" onclick="deleteFromAll(${t.id})">🗑️</button></td>
    `;

    tbody.appendChild(row);
  });
}

function deleteFromAll(id) {
  allTransactions = allTransactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(allTransactions));
  renderAllTransactions();
}

// Dark mode
const themeToggle = document.getElementById('themeToggle');
const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  if (themeToggle) themeToggle.innerHTML = sunIcon;
}

// Fix 1: Optional chaining on themeToggle
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? sunIcon : moonIcon;
});

// Fix 2: Safe listeners for Filters
document.getElementById('filterCategory')?.addEventListener('change', renderAllTransactions);
document.getElementById('filterType')?.addEventListener('change', renderAllTransactions);
document.getElementById('txSearchBar')?.addEventListener('input', renderAllTransactions);

renderAllTransactions();

// Fix 3: Safe check for Logout button
const logoutBtn = document.querySelector('.logout');
logoutBtn?.addEventListener('click', function(e) {
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

  if (!badge || !list) return;

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

// Fix 4: Safe Notification Bell listeners
const notifBell = document.getElementById('notifBell');
const notifDropdown = document.getElementById('notifDropdown');

notifBell?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (notifDropdown) {
    notifDropdown.style.display = notifDropdown.style.display === 'block' ? 'none' : 'block';
  }
});

document.addEventListener('click', () => {
  if (notifDropdown) notifDropdown.style.display = 'none';
});

renderNotifications();

// ===== Sidebar Toggle =====
const sidebarToggle = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

if (sidebar && mainContent) {
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
    mainContent.style.marginLeft = '70px';
  }

  // Fix 5: Safe Sidebar Toggle
  sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    mainContent.style.marginLeft = isCollapsed ? '70px' : '220px';
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  });
}

// ===== Profile Dropdown =====
const profileTrigger = document.getElementById('profileTrigger');
const profileDropdown = document.getElementById('profileDropdown');

profileTrigger?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (profileDropdown) {
    profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
  }
});

document.addEventListener('click', () => {
  if (profileDropdown) profileDropdown.style.display = 'none';
});

// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn && sidebar) {
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });

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
