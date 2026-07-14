// --- Configuration & Categories ---
const categories = {
    'Night Rides': { icon: 'ph-motorcycle', color: '#60A5FA' }, // Blue
    'Roadside Snacks': { icon: 'ph-coffee', color: '#FBBF24' }, // Yellow
    'Weekend Trek & Movies': { icon: 'ph-mountains', color: '#34D399' }, // Emerald
    'Veg Day': { icon: 'ph-leaf', color: '#4ADE80' }, // Green
    'Data & Tech': { icon: 'ph-terminal-window', color: '#C084FC' }, // Purple
    'Stocks & Market': { icon: 'ph-trend-up', color: '#818CF8' }, // Indigo
    'General': { icon: 'ph-shopping-bag', color: '#A1A1AA' } // Gray
};

// --- Quick Log Shortcuts ---
const quickLogs = [
    { name: 'Tea/Snack', amount: 50, cat: 'Roadside Snacks', icon: 'ph-coffee' },
    { name: 'Bike Fuel', amount: 300, cat: 'Night Rides', icon: 'ph-gas-pump' },
    { name: 'Veg Meal', amount: 200, cat: 'Veg Day', icon: 'ph-bowl-food' },
    { name: 'Toll/Misc', amount: 100, cat: 'Weekend Trek & Movies', icon: 'ph-ticket' }
];

let expenses = JSON.parse(localStorage.getItem('paisaTrackerData')) || [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    renderQuickLogs();
    renderUI();
});

function populateCategories() {
    const select = document.getElementById('categoryInput');
    Object.keys(categories).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function renderQuickLogs() {
    const grid = document.getElementById('quickLogGrid');
    quickLogs.forEach(log => {
        const btn = document.createElement('button');
        btn.onclick = () => saveExpense(log.name, log.amount, log.cat);
        btn.className = "glass-card flex flex-col items-center justify-center py-4 rounded-2xl hover:bg-[#1a1a1a] transition-all active:scale-95";
        btn.innerHTML = `
            <i class="ph ${log.icon} text-2xl text-[#EDEDED] mb-2"></i>
            <span class="text-[10px] text-[#A1A1AA] uppercase tracking-wider">${log.name}</span>
        `;
        grid.appendChild(btn);
    });
}

function renderUI() {
    const list = document.getElementById('expenseList');
    const totalDisplay = document.getElementById('totalDisplay');
    
    list.innerHTML = '';
    let total = 0;

    expenses.slice().reverse().forEach((exp, index) => {
        total += exp.amount;
        const realIndex = expenses.length - 1 - index; 
        const catData = categories[exp.category] || categories['General'];

        const item = document.createElement('div');
        item.className = "transaction-item group flex justify-between items-center p-3 rounded-2xl -mx-3 cursor-default";
        item.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="icon-box w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="color: ${catData.color}">
                    <i class="ph ${catData.icon}"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-[#EDEDED]">${exp.desc}</p>
                    <p class="text-xs text-[#666666] mt-0.5">${new Date(exp.date).toLocaleDateString('en-IN')} • ${exp.category}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-white font-mono">₹${exp.amount.toLocaleString('en-IN')}</span>
                <button onclick="deleteExpense(${realIndex})" class="opacity-0 group-hover:opacity-100 text-[#666666] hover:text-red-500 transition-opacity p-2">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });

    totalDisplay.innerText = total.toLocaleString('en-IN');
    localStorage.setItem('paisaTrackerData', JSON.stringify(expenses));
}

function addManualExpense() {
    const desc = document.getElementById('descInput').value;
    const amount = parseFloat(document.getElementById('amountInput').value);
    const category = document.getElementById('categoryInput').value;

    if (!desc || isNaN(amount) || amount <= 0) return;
    saveExpense(desc, amount, category);
    
    document.getElementById('descInput').value = '';
    document.getElementById('amountInput').value = '';
}

function saveExpense(desc, amount, category) {
    expenses.push({ desc, amount, category, date: new Date().toISOString() });
    renderUI();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    renderUI();
}