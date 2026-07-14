// --- Core Data & State ---
let expenses = JSON.parse(localStorage.getItem('paisaTrackerData')) || [];
let monthlyCredit = parseFloat(localStorage.getItem('paisaMonthlyCredit')) || 0;
let customCategories = JSON.parse(localStorage.getItem('paisaCustomCats')) || {};
let chartInstance = null;

const baseCategories = {
    'Night Rides': { icon: 'ph-motorcycle', color: '#60A5FA' },
    'Roadside Snacks': { icon: 'ph-coffee', color: '#FBBF24' },
    'Weekend Trek & Movies': { icon: 'ph-mountains', color: '#34D399' },
    'Veg Day': { icon: 'ph-leaf', color: '#4ADE80' },
    'Data & Tech': { icon: 'ph-terminal-window', color: '#C084FC' },
    'Stocks & Market': { icon: 'ph-trend-up', color: '#818CF8' },
    'General': { icon: 'ph-shopping-bag', color: '#A1A1AA' }
};

const quickLogTemplates = [
    { name: 'Tea/Snack', cat: 'Roadside Snacks', icon: 'ph-coffee' },
    { name: 'Bike Fuel', cat: 'Night Rides', icon: 'ph-gas-pump' },
    { name: 'Veg Meal', cat: 'Veg Day', icon: 'ph-bowl-food' },
    { name: 'Misc/Toll', cat: 'Weekend Trek & Movies', icon: 'ph-ticket' }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if(monthlyCredit === 0) setMonthlyCredit(); // Ask for credit on first launch
    setupEventListeners();
    populateCategories();
    renderQuickLogs();
    renderUI();
});

function setupEventListeners() {
    // Show/Hide custom category input
    document.getElementById('categoryInput').addEventListener('change', (e) => {
        const customInput = document.getElementById('customCategoryInput');
        e.target.value === 'ADD_NEW' ? customInput.classList.remove('hidden') : customInput.classList.add('hidden');
    });

    // Show/Hide payment details input
    document.getElementById('paymentMethod').addEventListener('change', (e) => {
        const detailsInput = document.getElementById('paymentDetailsInput');
        e.target.value !== 'Cash' ? detailsInput.classList.remove('hidden') : detailsInput.classList.add('hidden');
    });
}

function setMonthlyCredit() {
    const amount = prompt("How much was credited this month as your budget? (₹)", monthlyCredit);
    if (amount !== null && !isNaN(parseFloat(amount))) {
        monthlyCredit = parseFloat(amount);
        localStorage.setItem('paisaMonthlyCredit', monthlyCredit);
        renderUI();
    }
}

function populateCategories() {
    const select = document.getElementById('categoryInput');
    select.innerHTML = '';
    
    const allCats = { ...baseCategories, ...customCategories };
    
    Object.keys(allCats).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });

    // The Add New Option
    const addNewOpt = document.createElement('option');
    addNewOpt.value = "ADD_NEW";
    addNewOpt.textContent = "✨ + Add Custom Category...";
    addNewOpt.style.color = "#fff";
    select.appendChild(addNewOpt);
}

// Quick Logs now pre-fill the form, they don't auto-save
function applyQuickLog(name, cat) {
    document.getElementById('descInput').value = name;
    document.getElementById('categoryInput').value = cat;
    
    // Hide custom inputs just in case they were open
    document.getElementById('customCategoryInput').classList.add('hidden');
    
    // Focus amount so you can just type the number and hit log
    document.getElementById('amountInput').focus();
}

function renderQuickLogs() {
    const grid = document.getElementById('quickLogGrid');
    quickLogTemplates.forEach(log => {
        const btn = document.createElement('button');
        btn.onclick = () => applyQuickLog(log.name, log.cat);
        btn.className = "glass-card flex flex-col items-center justify-center py-4 rounded-xl hover:bg-[#1a1a1a] transition-all active:scale-95";
        btn.innerHTML = `
            <i class="ph ${log.icon} text-xl text-[#EDEDED] mb-1"></i>
            <span class="text-[9px] text-[#A1A1AA] uppercase tracking-wider">${log.name}</span>
        `;
        grid.appendChild(btn);
    });
}

function processForm() {
    const desc = document.getElementById('descInput').value;
    const amount = parseFloat(document.getElementById('amountInput').value);
    let category = document.getElementById('categoryInput').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    let paymentDetails = document.getElementById('paymentDetailsInput').value;

    if (!desc || isNaN(amount) || amount <= 0) return alert("Please enter a valid description and amount.");

    // Handle Custom Category Creation
    if (category === 'ADD_NEW') {
        const customCatName = document.getElementById('customCategoryInput').value.trim();
        if (!customCatName) return alert("Please enter a name for your custom category.");
        
        // Save new category
        customCategories[customCatName] = { icon: 'ph-star', color: '#F87171' }; // Default styling for custom cats
        localStorage.setItem('paisaCustomCats', JSON.stringify(customCategories));
        category = customCatName;
        populateCategories(); // Refresh dropdown
    }

    // Format Payment Info
    let finalPaymentString = paymentMethod;
    if (paymentMethod !== 'Cash' && paymentDetails.trim() !== '') {
        finalPaymentString = `${paymentMethod} (${paymentDetails.trim()})`;
    }

    expenses.push({ desc, amount, category, payment: finalPaymentString, date: new Date().toISOString() });
    
    // Reset Form
    document.getElementById('descInput').value = '';
    document.getElementById('amountInput').value = '';
    document.getElementById('paymentDetailsInput').value = '';
    document.getElementById('customCategoryInput').value = '';
    document.getElementById('customCategoryInput').classList.add('hidden');
    document.getElementById('paymentDetailsInput').classList.add('hidden');
    document.getElementById('categoryInput').value = 'General';
    document.getElementById('paymentMethod').value = 'Cash';

    renderUI();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    renderUI();
}

function renderUI() {
    const list = document.getElementById('expenseList');
    list.innerHTML = '';
    let totalSpent = 0;
    const allCats = { ...baseCategories, ...customCategories };

    expenses.slice().reverse().forEach((exp, index) => {
        totalSpent += exp.amount;
        const realIndex = expenses.length - 1 - index; 
        const catData = allCats[exp.category] || allCats['General'];

        const item = document.createElement('div');
        item.className = "transaction-item group flex justify-between items-center p-3 rounded-2xl -mx-3 cursor-default";
        item.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="icon-box w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="color: ${catData.color}">
                    <i class="ph ${catData.icon}"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-[#EDEDED]">${exp.desc}</p>
                    <p class="text-[10px] text-[#666666] mt-1">${new Date(exp.date).toLocaleDateString('en-IN')} • ${exp.category} • <span class="text-[#A1A1AA]">${exp.payment || 'Cash'}</span></p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-white font-mono">₹${exp.amount.toLocaleString('en-IN')}</span>
                <button onclick="deleteExpense(${realIndex})" class="text-[#333] hover:text-red-500 transition-colors p-2 active:scale-90">
                    <i class="ph ph-x"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });

    // Update Top Balances
    document.getElementById('creditDisplay').innerText = monthlyCredit.toLocaleString('en-IN');
    document.getElementById('totalSpentDisplay').innerText = totalSpent.toLocaleString('en-IN');
    
    const available = monthlyCredit - totalSpent;
    const availableEl = document.getElementById('availableDisplay');
    availableEl.innerText = `₹${available.toLocaleString('en-IN')}`;
    availableEl.style.color = available < 0 ? '#F87171' : '#EDEDED'; // Turn red if over budget

    localStorage.setItem('paisaTrackerData', JSON.stringify(expenses));
    drawPulseChart();
}

function drawPulseChart() {
    const ctx = document.getElementById('pulseChart').getContext('2d');
    
    // Get last 10 expenses for the trend
    const recentExp = expenses.slice(-10);
    const dataPoints = recentExp.length > 0 ? recentExp.map(e => e.amount) : [0,0,0,0,0];
    const labels = recentExp.length > 0 ? recentExp.map(e => e.desc) : ['','','','',''];

    if (chartInstance) chartInstance.destroy();

    // Create a glowing gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(192, 132, 252, 0.5)'); // Purple top
    gradient.addColorStop(1, 'rgba(192, 132, 252, 0)');   // Fade out

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                borderColor: '#C084FC',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0, // Hides the ugly dots, makes it look like a smooth pulse
                fill: true,
                tension: 0.4 // Makes the line wavy and smooth
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false }, // Hide ugly grids
                y: { display: false, min: 0 }
            },
            interaction: { intersect: false }
        }
    });
}