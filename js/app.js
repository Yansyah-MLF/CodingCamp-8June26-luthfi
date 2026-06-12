// DOM Elements
const expenseForm = document.getElementById('expense-form');
const itemNameInput = document.getElementById('item-name');
const itemAmountInput = document.getElementById('item-amount');
const itemCategoryInput = document.getElementById('item-category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');
const themeToggleBtn = document.getElementById('theme-toggle');
const budgetLimitInput = document.getElementById('budget-limit');
const budgetWarning = document.getElementById('budget-warning');
const balanceCard = document.querySelector('.balance-card');
const sortFilter = document.getElementById('sort-filter');

// App State (Load from Local Storage)
let products = JSON.parse(localStorage.getItem('camping_products')) || [];
let valueLimit = localStorage.getItem('camping_valueLimit') || 5000000;
let currentTheme = localStorage.getItem('theme') || 'light';
let myChart;

// Initialize App
function init() {
    budgetLimitInput.value = valueLimit;
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggleBtn.innerText = currentTheme === 'light' ? '🌙 Dark' : '☀️ Light';
    render();
}

// Main Render Function
function render() {
    updateInventoryValue();
    renderList();
    renderChart();
    localStorage.setItem('camping_products', JSON.stringify(products));
}

// 1. Update Total Inventory Value
function updateInventoryValue() {
    const total = products.reduce((sum, item) => sum + item.amount, 0);
    totalBalanceEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;

    if (total > valueLimit) {
        balanceCard.classList.add('over-budget');
        budgetWarning.classList.remove('hidden');
    } else {
        balanceCard.classList.remove('over-budget');
        budgetWarning.classList.add('hidden');
    }
}

// 2. Render Product List with Sorting
function renderList() {
    transactionList.innerHTML = '';
    let sortedProducts = [...products];
    const sortValue = sortFilter.value;

    if (sortValue === 'amount-high') {
        sortedProducts.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === 'amount-low') {
        sortedProducts.sort((a, b) => a.amount - b.amount);
    } else if (sortValue === 'category') {
        sortedProducts.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        sortedProducts.reverse();
    }

    sortedProducts.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="info">
                <strong>${item.name}</strong>
                <span class="category-badge">${item.category}</span>
            </div>
            <div class="amount-delete">
                <span class="amount">Rp ${item.amount.toLocaleString('id-ID')}</span>
                <button class="btn-delete" onclick="deleteProduct(${item.id})">❌</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
}

// 3. Render Pie Chart with New Camping Categories
function renderChart() {
    // Definisi 5 kategori sesuai request Kiro
    const categoryTotals = { Tent: 0, Hiking: 0, Lighting: 0, Safety: 0, Cooking: 0 };
    
    products.forEach(item => {
        if (categoryTotals[item.category] !== undefined) {
            categoryTotals[item.category] += item.amount;
        }
    });

    const ctx = document.getElementById('expenseChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                // Ditambahkan 5 warna estetik untuk tiap kategori camping
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Add Product Handler
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!itemNameInput.value.trim() || !itemAmountInput.value || !itemCategoryInput.value) {
        alert('Please fill out all fields!');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: itemNameInput.value.trim(),
        amount: parseFloat(itemAmountInput.value),
        category: itemCategoryInput.value
    };

    products.push(newProduct);
    expenseForm.reset();
    render();
});

// Delete Product Function
window.deleteProduct = function(id) {
    products = products.filter(item => item.id !== id);
    render();
};

// Live Update Limit Change
budgetLimitInput.addEventListener('input', (e) => {
    valueLimit = parseFloat(e.target.value) || 0;
    localStorage.setItem('camping_valueLimit', valueLimit);
    updateInventoryValue();
});

// Sort Trigger
sortFilter.addEventListener('change', renderList);

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerText = '🌙 Dark';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerText = '☀️ Light';
    }
});

// Run App
init();