// ───────────────────────────────────────────
// ALL FIELD IDs
// ───────────────────────────────────────────

const fields = [
    'd-booking', 'd-program', 'party', 'guests',
    'phone', 'name', 'details',
    'reference-num', 'booking-amnt',
    'advance1', 'advance2', 'advance3',
    'extra', 'total-paid', 'balance',
    'bbq', 'drink', 'paid-food', 'balance-food', 'other'
];


// ───────────────────────────────────────────
// LOGIN STATE
// ───────────────────────────────────────────

let isLoggedIn = false;
let pendingDetailsOpen = false; // tracks if Details was clicked before login


// ───────────────────────────────────────────
// FOOD PRICES — localStorage
// ───────────────────────────────────────────

function getFoodPrices() {
    const stored = localStorage.getItem('sarwari_food_prices');
    return stored ? JSON.parse(stored) : null;
}

function saveFoodPrices(bbqPrice, drinkPrice) {
    localStorage.setItem('sarwari_food_prices', JSON.stringify({
        bbq: parseFloat(bbqPrice) || 0,
        drink: parseFloat(drinkPrice) || 0
    }));
}


// ───────────────────────────────────────────
// PAYMENT CALCULATIONS
// ───────────────────────────────────────────

const bookingAmnt = document.getElementById('booking-amnt');
const advance1    = document.getElementById('advance1');
const advance2    = document.getElementById('advance2');
const advance3    = document.getElementById('advance3');
const totalPaid   = document.getElementById('total-paid');
const balance     = document.getElementById('balance');
const extra       = document.getElementById('extra');
const bbq         = document.getElementById('bbq');
const drink       = document.getElementById('drink');
const paidFood    = document.getElementById('paid-food');
const balanceFood = document.getElementById('balance-food');

function calculate() {
    const booking  = parseFloat(bookingAmnt.value) || 0;
    const adv1     = parseFloat(advance1.value)    || 0;
    const adv2     = parseFloat(advance2.value)    || 0;
    const adv3     = parseFloat(advance3.value)    || 0;
    const bbqQty   = parseFloat(bbq.value)         || 0;
    const drinkQty = parseFloat(drink.value)       || 0;
    const foodPaid = parseFloat(paidFood.value)    || 0;

    const totalAdvances = adv1 + adv2 + adv3;

    const prices   = getFoodPrices();
    const bbqPrice = prices ? prices.bbq   : 0;
    const drkPrice = prices ? prices.drink : 0;

    const foodTotal = (bbqQty * bbqPrice) + (drinkQty * drkPrice);

    // Booking Details — food completely separate
    totalPaid.value = totalAdvances;
    extra.value     = totalAdvances > booking ? (totalAdvances - booking) : 0;
    balance.value   = booking - totalAdvances;

    // Food balance only
    balanceFood.value = foodTotal - foodPaid;
}

// Warn if prices not set when typing BBQ/drink qty
function checkPriceSet(e) {
    const prices = getFoodPrices();
    if (!prices || (prices.bbq === 0 && prices.drink === 0)) {
        alert('⚠️ Please set the food prices first using the ✎ Details button!');
        e.target.value = '';
        return;
    }
    calculate();
}

bbq.addEventListener('input', checkPriceSet);
drink.addEventListener('input', checkPriceSet);
bookingAmnt.addEventListener('input', calculate);
advance1.addEventListener('input', calculate);
advance2.addEventListener('input', calculate);
advance3.addEventListener('input', calculate);
paidFood.addEventListener('input', calculate);


// ───────────────────────────────────────────
// DECORATION TOGGLE
// ───────────────────────────────────────────

function toggleAddon(el) {
    if (el.classList.contains('locked')) return;
    el.classList.toggle('selected');
}


// ───────────────────────────────────────────
// LOCK / UNLOCK FORM
// ───────────────────────────────────────────

function lockForm() {
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('readonly', true);
    });
    document.querySelectorAll('.addon-option').forEach(el => {
        el.classList.add('locked');
    });
}

function unlockForm() {
    const alwaysReadonly = ['extra', 'total-paid', 'balance', 'balance-food'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && !alwaysReadonly.includes(id)) {
            el.removeAttribute('readonly');
        }
    });
    document.querySelectorAll('.addon-option').forEach(el => {
        el.classList.remove('locked');
    });
}


// ───────────────────────────────────────────
// CREDENTIALS — localStorage
// ───────────────────────────────────────────

function getCredentials() {
    const stored = localStorage.getItem('sarwari_credentials');
    return stored ? JSON.parse(stored) : null;
}

function saveCredentials(username, password) {
    localStorage.setItem('sarwari_credentials', JSON.stringify({ username, password }));
}


// ───────────────────────────────────────────
// MODAL SYSTEM
// ───────────────────────────────────────────

function showModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('authModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('authModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
});


// ───────────────────────────────────────────
// DETAILS BUTTON — food pricing
// ───────────────────────────────────────────

document.getElementById('detailsBtn').addEventListener('click', function () {
    // Always force login every time — no exceptions
    isLoggedIn = false;
    pendingDetailsOpen = true;
    document.getElementById('editBtn').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        alert('🔐 Please login first using the ✎ Edit button above!');
    }, 600);
});

function showPricingModal() {
    const prices = getFoodPrices();
    const savedBbq   = prices ? prices.bbq   : '';
    const savedDrink = prices ? prices.drink : '';

    showModal(`
        <h3 style="margin-top:0; color:white; text-align:center;">🍖 Food Prices</h3>
        <p style="color:#aaa; font-size:13px; text-align:center; margin-bottom:20px;">Set the price per item. These will be saved for future use.</p>
        <label class="modal-label">BBQ Price (per piece)</label>
        <input type="number" id="price-bbq" class="modal-input" placeholder="BBQ Price" value="${savedBbq}">
        <label class="modal-label">Cold Drink Price (per bottle)</label>
        <input type="number" id="price-drink" class="modal-input" placeholder="Cold Drink Price" value="${savedDrink}">
        <p id="price-error" class="modal-error"></p>
        <button onclick="submitPricing()" class="modal-btn-primary">💾 Save Prices</button>
        <button onclick="closeModal()" class="modal-btn-secondary">Cancel</button>
    `);
}

function submitPricing() {
    const bbqPrice   = document.getElementById('price-bbq').value.trim();
    const drinkPrice = document.getElementById('price-drink').value.trim();
    const error      = document.getElementById('price-error');

    if (!bbqPrice || !drinkPrice) {
        error.textContent = '✗ Please enter both prices.';
        return;
    }

    saveFoodPrices(bbqPrice, drinkPrice);
    closeModal();
    calculate(); // recalculate with new prices
    alert('✓ Prices saved! BBQ: ' + bbqPrice + ' | Cold Drink: ' + drinkPrice);
}


// ───────────────────────────────────────────
// EDIT BUTTON — first time setup or login
// ───────────────────────────────────────────

document.getElementById('editBtn').addEventListener('click', function () {
    const creds = getCredentials();
    if (!creds) {
        showSetupModal();
    } else {
        showLoginModal();
    }
});


// ───────────────────────────────────────────
// FIRST TIME SETUP
// ───────────────────────────────────────────

function showSetupModal() {
    showModal(`
        <h3 style="margin-top:0; color:white; text-align:center;">🔐 Set Up Your Credentials</h3>
        <p style="color:#aaa; font-size:13px; text-align:center; margin-bottom:20px;">First time — choose a username and password.</p>
        <label class="modal-label">Username</label>
        <input type="text" id="setup-user" class="modal-input" placeholder="Choose a username">
        <label class="modal-label">Password</label>
        <input type="password" id="setup-pass" class="modal-input" placeholder="Choose a password">
        <label class="modal-label">Confirm Password</label>
        <input type="password" id="setup-pass2" class="modal-input" placeholder="Repeat your password">
        <p id="setup-error" class="modal-error"></p>
        <button onclick="submitSetup()" class="modal-btn-primary">Save & Unlock</button>
        <button onclick="closeModal()" class="modal-btn-secondary">Cancel</button>
    `);
}

function submitSetup() {
    const user  = document.getElementById('setup-user').value.trim();
    const pass  = document.getElementById('setup-pass').value.trim();
    const pass2 = document.getElementById('setup-pass2').value.trim();
    const error = document.getElementById('setup-error');

    if (!user || !pass || !pass2) {
        error.textContent = '✗ Please fill in all fields.';
        return;
    }
    if (pass !== pass2) {
        error.textContent = '✗ Passwords do not match!';
        return;
    }

    saveCredentials(user, pass);
    isLoggedIn = true;
    closeModal();
    unlockForm();

    // If Details button was waiting, scroll down and open it
    if (pendingDetailsOpen) {
        pendingDetailsOpen = false;
        setTimeout(() => {
            document.getElementById('detailsBtn').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => showPricingModal(), 600);
        }, 300);
    } else {
        alert('✓ Credentials saved! Form is now unlocked.');
    }
}


// ───────────────────────────────────────────
// LOGIN
// ───────────────────────────────────────────

function showLoginModal() {
    showModal(`
        <h3 style="margin-top:0; color:white; text-align:center;">🔐 Verification</h3>
        <label class="modal-label">Username</label>
        <input type="text" id="login-user" class="modal-input" placeholder="Enter username">
        <label class="modal-label">Password</label>
        <input type="password" id="login-pass" class="modal-input" placeholder="Enter password">
        <p id="login-error" class="modal-error"></p>
        <button onclick="submitLogin()" class="modal-btn-primary">Unlock</button>
        <button onclick="showForgotModal()" class="modal-btn-forgot">Forgot Password?</button>
        <button onclick="closeModal()" class="modal-btn-secondary">Cancel</button>
    `);

    setTimeout(() => {
        const passInput = document.getElementById('login-pass');
        if (passInput) {
            passInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') submitLogin();
            });
        }
    }, 100);
}

function submitLogin() {
    const creds = getCredentials();
    const user  = document.getElementById('login-user').value.trim();
    const pass  = document.getElementById('login-pass').value.trim();
    const error = document.getElementById('login-error');

    if (user === creds.username && pass === creds.password) {
        isLoggedIn = true;
        closeModal();
        unlockForm();

        // If Details button was waiting, scroll down and open it
        if (pendingDetailsOpen) {
            pendingDetailsOpen = false;
            setTimeout(() => {
                document.getElementById('detailsBtn').scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => showPricingModal(), 600);
            }, 300);
        } else {
            alert('✓ Access granted! You can now edit the form.');
        }
    } else {
        error.textContent = '✗ Wrong username or password!';
    }
}


// ───────────────────────────────────────────
// FORGOT PASSWORD
// ───────────────────────────────────────────

function showForgotModal() {
    showModal(`
        <h3 style="margin-top:0; color:white; text-align:center;">🔑 Reset Password</h3>
        <p style="color:#aaa; font-size:13px; text-align:center; margin-bottom:20px;">Enter your old username to verify identity.</p>
        <label class="modal-label">Old Username</label>
        <input type="text" id="forgot-old-user" class="modal-input" placeholder="Enter your old username">
        <label class="modal-label">New Username</label>
        <input type="text" id="forgot-new-user" class="modal-input" placeholder="Enter new username">
        <label class="modal-label">New Password</label>
        <input type="password" id="forgot-new-pass" class="modal-input" placeholder="Enter new password">
        <label class="modal-label">Confirm New Password</label>
        <input type="password" id="forgot-new-pass2" class="modal-input" placeholder="Repeat new password">
        <p id="forgot-error" class="modal-error"></p>
        <button onclick="submitForgot()" class="modal-btn-primary">Reset & Unlock</button>
        <button onclick="showLoginModal()" class="modal-btn-secondary">← Back to Login</button>
    `);
}

function submitForgot() {
    const creds    = getCredentials();
    const oldUser  = document.getElementById('forgot-old-user').value.trim();
    const newUser  = document.getElementById('forgot-new-user').value.trim();
    const newPass  = document.getElementById('forgot-new-pass').value.trim();
    const newPass2 = document.getElementById('forgot-new-pass2').value.trim();
    const error    = document.getElementById('forgot-error');

    if (!oldUser || !newUser || !newPass || !newPass2) {
        error.textContent = '✗ Please fill in all fields.';
        return;
    }
    if (oldUser !== creds.username) {
        error.textContent = '✗ Old username does not match our records!';
        return;
    }
    if (newPass !== newPass2) {
        error.textContent = '✗ New passwords do not match!';
        return;
    }

    saveCredentials(newUser, newPass);
    isLoggedIn = true;
    closeModal();
    unlockForm();
    alert('✓ Credentials updated! Form is now unlocked.');
}


// ───────────────────────────────────────────
// SAVE — Download as JSON
// ───────────────────────────────────────────

function saveForm() {
    const data = {};

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
    });

    const addons = [];
    document.querySelectorAll('.addon-option').forEach(el => {
        if (el.classList.contains('selected')) {
            addons.push(el.getAttribute('data-name'));
        }
    });
    data['addons'] = addons;

    const clientName = document.getElementById('name').value.trim() || 'client';
    const eventDate  = document.getElementById('d-program').value   || 'unknown-date';
    const filename   = `${clientName}_${eventDate}.json`.replace(/\s+/g, '_');

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}


// ───────────────────────────────────────────
// LOAD — Fill form in readonly mode
// ───────────────────────────────────────────

function loadForm() {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json';

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);

                fields.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && data[id] !== undefined) el.value = data[id];
                });

                document.querySelectorAll('.addon-option').forEach(el => {
                    const name = el.getAttribute('data-name');
                    if (data['addons'] && data['addons'].includes(name)) {
                        el.classList.add('selected');
                    } else {
                        el.classList.remove('selected');
                    }
                });

                calculate();
                lockForm();
                isLoggedIn = false;
                alert('✓ Form loaded in view mode. Click ✎ Edit to make changes.');
            } catch {
                alert('✗ Invalid file. Please select a valid saved form.');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}


// ───────────────────────────────────────────
// BUTTON WIRING
// ───────────────────────────────────────────

document.getElementById('saveBtn').addEventListener('click', saveForm);
document.getElementById('loadBtn').addEventListener('click', loadForm);