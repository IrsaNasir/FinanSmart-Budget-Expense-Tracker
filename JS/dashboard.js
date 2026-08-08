// ===== 1. Get Transactions from localStorage =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// ===== 2. Calculate Totals =====
function calculateTotals() {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  const balance = income - expense;
  const savings = balance;

  return { income, expense, balance, savings };
}

// ===== 3. Update Summary Cards =====
function updateSummaryCards() {
  const { income, expense, balance, savings } = calculateTotals();

  document.getElementById('totalIncome').textContent = formatAmount(income);
  document.getElementById('totalExpense').textContent = formatAmount(expense);
  document.getElementById('totalBalance').textContent = formatAmount(balance);
  document.getElementById('totalSavings').textContent = formatAmount(savings);
}

// ===== 4. Render Recent Transactions Table =====
function renderTransactions() {
  const tbody = document.getElementById('transactionsBody');
  tbody.innerHTML = '';

  const recent = [...transactions].reverse().slice(0, 6);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94A3B8; padding:20px;">No transactions yet. Add one to get started!</td></tr>';
    return;
  }

  recent.forEach(t => {
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
      <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button></td>
    `;

    tbody.appendChild(row);
  });
}

// ===== 5. Delete Transaction =====
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  refreshDashboard();
}

// ===== 6. Update Budget Progress Bars =====
function updateBudgetBars() {
  const limits = {
    Food: 10000,
    Shopping: 10000,
    Bills: 9000,
    Entertainment: 10000
  };

  const spending = { Food: 0, Shopping: 0, Bills: 0, Entertainment: 0 };

  transactions.forEach(t => {
    if (t.type === 'expense' && spending.hasOwnProperty(t.category)) {
      spending[t.category] += t.amount;
    }
  });

  Object.keys(limits).forEach(category => {
    const spent = spending[category];
    const limit = limits[category];
    const percent = Math.min(Math.round((spent / limit) * 100), 100);

    const fillBar = document.getElementById('fill-' + category);
    const amountText = document.getElementById('amount-' + category);

    if (fillBar) fillBar.style.width = percent + '%';
    if (amountText) amountText.textContent = formatAmount(spent);
  });
}

// ===== 7. Update Charts =====
let pieChartInstance, lineChartInstance;

function updateCharts() {
  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#E2E8F0' : '#1E293B';

  const categoryTotals = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const total = data.reduce((a, b) => a + b, 0);

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            font: { size: 12, weight: '600' },
            color: textColor,
            generateLabels: function(chart) {
              const d = chart.data;
              return d.labels.map((label, i) => {
                const value = d.datasets[0].data[i];
                const percent = total ? ((value / total) * 100).toFixed(0) : 0;
                return {
                  text: `${label} (${percent}%)`,
                  fillStyle: d.datasets[0].backgroundColor[i],
                  fontColor: textColor,
                  index: i
                };
              });
            }
          }
        }
      }
    }
  });

  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  if (lineChartInstance) lineChartInstance.destroy();

  lineChartInstance = new Chart(document.getElementById('lineChart'), {
    type: 'bar',
    data: {
      labels: ['This Month'],
      datasets: [
        { label: 'Income', data: [income], backgroundColor: '#10B981', borderRadius: 10, barThickness: 60 },
        { label: 'Expense', data: [expense], backgroundColor: '#EF4444', borderRadius: 10, barThickness: 60 }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 16, font: { size: 12, weight: '600' }, color: textColor }
        }
      },
      scales: {
        y: {
          grid: { color: isDark ? '#334155' : '#F1F5F9' },
          ticks: { font: { size: 11 }, color: '#94A3B8' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' }, color: textColor }
        }
      }
    }
  });
}

// ===== 8. Refresh Everything =====
function refreshDashboard() {
  transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  updateSummaryCards();
  renderTransactions();
  updateBudgetBars();
  updateCharts();
}

// ===== 9. Run on Page Load =====
document.addEventListener('DOMContentLoaded', refreshDashboard);

// ===== Dark/Light Mode Toggle =====
const themeToggle = document.getElementById('themeToggle');
const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = sunIcon;
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = sunIcon;
  } else {
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = moonIcon;
  }

  updateCharts();
});

// ===== Search Transactions =====
const searchBar = document.querySelector('.search-bar');

searchBar.addEventListener('input', function() {
  const query = this.value.toLowerCase();

  const filtered = transactions.filter(t =>
    t.category.toLowerCase().includes(query) ||
    t.description.toLowerCase().includes(query)
  );

  renderFilteredTransactions(filtered);
});

function renderFilteredTransactions(list) {
  const tbody = document.getElementById('transactionsBody');
  tbody.innerHTML = '';

  const recent = [...list].reverse().slice(0, 6);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94A3B8; padding:20px;">No matching transactions found.</td></tr>';
    return;
  }

  recent.forEach(t => {
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
      <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button></td>
    `;

    tbody.appendChild(row);
  });
}

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
      notifs.push({ from: 'FinanSmart Alerts', text: `⚠️ You exceeded your ${cat} budget!` });
    } else if (spending[cat] && spending[cat] >= limits[cat] * 0.8) {
      notifs.push({ from: 'FinanSmart Alerts', text: `⚡ You're close to your ${cat} budget limit.` });
    }
  });

  const lastIncome = [...tx].reverse().find(t => t.type === 'income');
  if (lastIncome) {
    notifs.push({ from: 'FinanSmart', text: `💰 Rs ${lastIncome.amount.toLocaleString()} income received.` });
  }

  const income = tx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = tx.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  if (income > 0 && expense > 0 && expense < income * 0.8) {
    notifs.push({ from: 'FinanSmart', text: `🎉 Great job! You've saved over 20% this month.` });
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
const sidebarToggle = document.getElementById('sidebarToggle');
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

  setTimeout(() => {

    window.dispatchEvent(new Event('resize'));

    if (pieChartInstance) {
      pieChartInstance.resize();
    }

    if (lineChartInstance) {
      lineChartInstance.resize();
    }

  }, 320);

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
