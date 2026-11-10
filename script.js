// =============================================
// SPENDWISE V2.0 - PERSONAL FINANCE DASHBOARD
// =============================================

const STORAGE_KEY = "spendwiseDataV2";
const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Housing",
  "Salary",
  "Business",
  "Other",
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return {
        transactions: Array.isArray(saved.transactions)
          ? saved.transactions
          : [],
        budget: Number(saved.budget) || 0,
        currency: saved.currency || "KES",
        theme: saved.theme === "dark" ? "dark" : "light",
        categories:
          Array.isArray(saved.categories) && saved.categories.length
            ? saved.categories
            : [...DEFAULT_CATEGORIES],
        profileName: saved.profileName || "",
      };
    }
  } catch (error) {
    console.warn("SpendWise data could not be read:", error);
  }
  // Migrate data from the first SpendWise version, if it exists.
  let oldExpenses = [];
  try {
    oldExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
  } catch (_) {}
  return {
    transactions: oldExpenses.map((item, index) => ({
      id: `old-${Date.now()}-${index}`,
      type: "expense",
      name: item.name || "Expense",
      amount: Number(item.amount) || 0,
      category: item.category || "Other",
      date: item.date || new Date().toISOString().slice(0, 10),
    })),
    budget: Number(localStorage.getItem("monthlyBudget")) || 0,
    currency: "KES",
    theme: "light",
    categories: [...DEFAULT_CATEGORIES],
    profileName: "",
  };
}

let appData = loadData();
let toastTimer;

const $ = (id) => document.getElementById(id);
const els = {
  pageTitle: $("pageTitle"),
  pageEyebrow: $("pageEyebrow"),
  todayLabel: $("todayLabel"),
  currentMonth: $("currentMonth"),
  reportMonth: $("reportMonth"),
  balanceValue: $("balanceValue"),
  incomeValue: $("incomeValue"),
  expenseValue: $("expenseValue"),
  budgetRemainingValue: $("budgetRemainingValue"),
  incomeCaption: $("incomeCaption"),
  expenseCaption: $("expenseCaption"),
  budgetCaption: $("budgetCaption"),
  budgetSpent: $("budgetSpent"),
  budgetTarget: $("budgetTarget"),
  budgetProgress: $("budgetProgress"),
  budgetPercent: $("budgetPercent"),
  budgetMessage: $("budgetMessage"),
  categoryBreakdown: $("categoryBreakdown"),
  recentTable: $("recentTable"),
  transactionsTable: $("transactionsTable"),
  transactionCount: $("transactionCount"),
  searchTransactions: $("searchTransactions"),
  filterType: $("filterType"),
  filterCategory: $("filterCategory"),
  reportIncome: $("reportIncome"),
  reportExpenses: $("reportExpenses"),
  reportNet: $("reportNet"),
  monthlyChart: $("monthlyChart"),
  reportCategories: $("reportCategories"),
  transactionDialog: $("transactionDialog"),
  transactionForm: $("transactionForm"),
  transactionDialogTitle: $("transactionDialogTitle"),
  transactionId: $("transactionId"),
  transactionType: $("transactionType"),
  transactionName: $("transactionName"),
  transactionAmount: $("transactionAmount"),
  transactionCategory: $("transactionCategory"),
  transactionDate: $("transactionDate"),
  currencySetting: $("currencySetting"),
  settingsBudget: $("settingsBudget"),
  darkModeSetting: $("darkModeSetting"),
  categorySettingsList: $("categorySettingsList"),
  profileName: $("profileName"),
  toast: $("toast"),
};

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  // Keep the original keys updated for compatibility with the first version.
  localStorage.setItem(
    "expenses",
    JSON.stringify(appData.transactions.filter((t) => t.type === "expense")),
  );
  localStorage.setItem("monthlyBudget", String(appData.budget));
}

function currency(value) {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: appData.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (_) {
    return `${appData.currency} ${amount.toFixed(2)}`;
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function monthKey(dateString) {
  return String(dateString || "").slice(0, 7);
}
function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function currentMonthTransactions() {
  return appData.transactions.filter(
    (t) => monthKey(t.date) === currentMonthKey(),
  );
}
function totalFor(items, type) {
  return items
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}
function makeId() {
  return window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function applyTheme() {
  document.body.classList.toggle("dark-theme", appData.theme === "dark");
  if (els.darkModeSetting)
    els.darkModeSetting.checked = appData.theme === "dark";
}

function renderHeader() {
  const now = new Date();
  els.todayLabel.textContent = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const month = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  els.currentMonth.textContent = month;
  els.reportMonth.textContent = month;
  const greeting = appData.profileName
    ? `Welcome back, ${appData.profileName}.`
    : "Good money habits start here.";
  document.querySelector(".welcome-row h2").textContent = greeting;
}

function renderDashboard() {
  const monthItems = currentMonthTransactions();
  const income = totalFor(monthItems, "income");
  const expenses = totalFor(monthItems, "expense");
  const allIncome = totalFor(appData.transactions, "income");
  const allExpenses = totalFor(appData.transactions, "expense");
  const budgetLeft = appData.budget - expenses;

  els.balanceValue.textContent = currency(allIncome - allExpenses);
  els.incomeValue.textContent = currency(income);
  els.expenseValue.textContent = currency(expenses);
  els.budgetRemainingValue.textContent = appData.budget
    ? currency(budgetLeft)
    : "—";
  els.incomeCaption.textContent = `${monthItems.filter((t) => t.type === "income").length} income records this month`;
  els.expenseCaption.textContent = `${monthItems.filter((t) => t.type === "expense").length} expense records this month`;
  els.budgetCaption.textContent = appData.budget
    ? "Against your monthly budget"
    : "Set a monthly budget in Settings";

  els.budgetSpent.textContent = currency(expenses);
  els.budgetTarget.textContent = `of ${currency(appData.budget)}`;
  const percent = appData.budget > 0 ? (expenses / appData.budget) * 100 : 0;
  els.budgetProgress.style.width = `${Math.min(percent, 100)}%`;
  els.budgetProgress.className =
    "progress-fill" +
    (percent >= 100 ? " over" : percent >= 80 ? " warning" : "");
  els.budgetPercent.textContent = appData.budget
    ? `${Math.round(percent)}% used`
    : "No budget set";
  els.budgetMessage.textContent = !appData.budget
    ? "Set a budget to begin"
    : percent > 100
      ? "Budget exceeded"
      : percent >= 80
        ? "Approaching your limit"
        : "You are within budget";

  renderCategoryBreakdown(
    els.categoryBreakdown,
    monthItems.filter((t) => t.type === "expense"),
  );
  renderRecentTransactions();
}

function renderCategoryBreakdown(container, items) {
  const totals = {};
  items.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
  });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);
  if (!entries.length) {
    container.innerHTML =
      '<p class="empty-inline">Add expenses to see your category breakdown.</p>';
    return;
  }
  container.innerHTML = entries
    .slice(0, 7)
    .map(([name, amount]) => {
      const width = total ? (amount / total) * 100 : 0;
      return `<div class="category-row"><span class="category-name">${escapeHTML(name)}</span><span class="category-amount">${currency(amount)}</span><div class="category-track"><span style="width:${width}%"></span></div></div>`;
    })
    .join("");
}

function transactionRow(t, includeActions = false) {
  const typeLabel = t.type === "income" ? "Income" : "Expense";
  const amountClass = t.type === "income" ? "amount-income" : "amount-expense";
  const sign = t.type === "income" ? "+" : "−";
  return `<tr>
    <td><span class="transaction-title">${escapeHTML(t.name)}</span><span class="transaction-sub">${escapeHTML(t.id.slice(0, 8))}</span></td>
    <td>${escapeHTML(t.category)}</td>
    <td>${formatDate(t.date)}</td>
    <td><span class="type-pill ${t.type}">${typeLabel}</span></td>
    <td class="align-right ${amountClass}">${sign}${currency(t.amount)}</td>
    ${includeActions ? `<td><div class="row-actions"><button class="small-action" data-action="edit" data-id="${escapeHTML(t.id)}">Edit</button><button class="small-action delete" data-action="delete" data-id="${escapeHTML(t.id)}">Delete</button></div></td>` : ""}
  </tr>`;
}

function renderRecentTransactions() {
  const recent = [...appData.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  els.recentTable.innerHTML = recent.length
    ? recent.map((t) => transactionRow(t)).join("")
    : '<tr><td colspan="5" class="empty-row">No transactions yet. Select “Add transaction” to get started.</td></tr>';
}

function renderTransactions() {
  const search = els.searchTransactions.value.trim().toLowerCase();
  const type = els.filterType.value;
  const category = els.filterCategory.value;
  const filtered = [...appData.transactions]
    .filter((t) => {
      const matchesSearch = `${t.name} ${t.category} ${t.date}`
        .toLowerCase()
        .includes(search);
      return (
        matchesSearch &&
        (type === "all" || t.type === type) &&
        (category === "all" || t.category === category)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  els.transactionsTable.innerHTML = filtered.length
    ? filtered.map((t) => transactionRow(t, true)).join("")
    : '<tr><td colspan="6" class="empty-row">No matching transactions found.</td></tr>';
  els.transactionCount.textContent = `${filtered.length} of ${appData.transactions.length} transactions`;
}

function renderReports() {
  const monthItems = currentMonthTransactions();
  const income = totalFor(monthItems, "income");
  const expenses = totalFor(monthItems, "expense");
  els.reportIncome.textContent = currency(income);
  els.reportExpenses.textContent = currency(expenses);
  els.reportNet.textContent = currency(income - expenses);
  renderCategoryBreakdown(
    els.reportCategories,
    monthItems.filter((t) => t.type === "expense"),
  );

  const months = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString(undefined, { month: "short" }),
    });
  }
  const values = months.map((m) => {
    const items = appData.transactions.filter(
      (t) => monthKey(t.date) === m.key,
    );
    return {
      ...m,
      income: totalFor(items, "income"),
      expense: totalFor(items, "expense"),
    };
  });
  const max = Math.max(1, ...values.flatMap((v) => [v.income, v.expense]));
  els.monthlyChart.innerHTML = values
    .map((v) => {
      const incomeHeight = Math.max(v.income ? 3 : 0, (v.income / max) * 145);
      const expenseHeight = Math.max(
        v.expense ? 3 : 0,
        (v.expense / max) * 145,
      );
      return `<div class="bar-group"><div class="bar-pair"><span class="bar income" title="Income: ${currency(v.income)}" style="height:${incomeHeight}px"></span><span class="bar expense" title="Expenses: ${currency(v.expense)}" style="height:${expenseHeight}px"></span></div><span class="bar-label">${v.label}</span></div>`;
    })
    .join("");
}

function populateCategorySelects() {
  const current = els.transactionCategory.value;
  els.transactionCategory.innerHTML = appData.categories
    .map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
    .join("");
  if (appData.categories.includes(current))
    els.transactionCategory.value = current;

  const selected = els.filterCategory.value;
  els.filterCategory.innerHTML =
    '<option value="all">All categories</option>' +
    appData.categories
      .map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
      .join("");
  if (appData.categories.includes(selected))
    els.filterCategory.value = selected;
}

function renderSettings() {
  els.currencySetting.value = appData.currency;
  els.settingsBudget.value = appData.budget || "";
  els.profileName.value = appData.profileName;
  els.darkModeSetting.checked = appData.theme === "dark";
  els.categorySettingsList.innerHTML = appData.categories
    .map(
      (c) =>
        `<span class="category-chip">${escapeHTML(c)}<button type="button" title="Remove ${escapeHTML(c)}" data-remove-category="${escapeHTML(c)}">×</button></span>`,
    )
    .join("");
  populateCategorySelects();
}

function renderAll() {
  applyTheme();
  renderHeader();
  renderDashboard();
  renderTransactions();
  renderReports();
  renderSettings();
}

const viewInfo = {
  dashboard: ["YOUR FINANCIAL OVERVIEW", "Dashboard"],
  transactions: ["YOUR MONEY ACTIVITY", "Transactions"],
  reports: ["UNDERSTAND YOUR FINANCES", "Reports & analytics"],
  settings: ["MAKE SPENDWISE YOUR OWN", "Settings"],
  data: ["BACK UP AND MANAGE YOUR RECORDS", "Data management"],
};

function showView(name) {
  if (!viewInfo[name]) return;
  document
    .querySelectorAll(".view")
    .forEach((view) => view.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((link) =>
      link.classList.toggle("active", link.dataset.view === name),
    );
  $(`view-${name}`).classList.add("active");
  els.pageEyebrow.textContent = viewInfo[name][0];
  els.pageTitle.textContent = viewInfo[name][1];
  $("sidebar").classList.remove("open");
  if (name === "transactions") renderTransactions();
  if (name === "reports") renderReports();
}

function openTransactionDialog(transaction = null) {
  els.transactionForm.reset();
  els.transactionId.value = transaction ? transaction.id : "";
  els.transactionDialogTitle.textContent = transaction
    ? "Edit transaction"
    : "Add transaction";
  els.transactionType.value = transaction ? transaction.type : "expense";
  els.transactionName.value = transaction ? transaction.name : "";
  els.transactionAmount.value = transaction ? transaction.amount : "";
  els.transactionDate.value = transaction
    ? transaction.date
    : new Date().toISOString().slice(0, 10);
  populateCategorySelects();
  if (transaction && appData.categories.includes(transaction.category))
    els.transactionCategory.value = transaction.category;
  if (!transaction && appData.categories.includes("Other"))
    els.transactionCategory.value = "Other";
  els.transactionDialog.showModal();
}

function closeTransactionDialog() {
  els.transactionDialog.close();
}

function saveTransaction(event) {
  event.preventDefault();
  const id = els.transactionId.value;
  const name = els.transactionName.value.trim();
  const amount = Number(els.transactionAmount.value);
  const category = els.transactionCategory.value;
  const date = els.transactionDate.value;
  const type = els.transactionType.value;
  if (!name || !category || !date || !Number.isFinite(amount) || amount <= 0) {
    showToast("Please complete all fields with a valid amount.");
    return;
  }
  if (id) {
    const index = appData.transactions.findIndex((t) => t.id === id);
    if (index !== -1)
      appData.transactions[index] = {
        ...appData.transactions[index],
        name,
        amount,
        category,
        date,
        type,
      };
    showToast("Transaction updated.");
  } else {
    appData.transactions.push({
      id: makeId(),
      name,
      amount,
      category,
      date,
      type,
    });
    showToast("Transaction added.");
  }
  saveData();
  closeTransactionDialog();
  renderAll();
}

function deleteTransaction(id) {
  const transaction = appData.transactions.find((t) => t.id === id);
  if (!transaction) return;
  if (!confirm(`Delete "${transaction.name}"? This action cannot be undone.`))
    return;
  appData.transactions = appData.transactions.filter((t) => t.id !== id);
  saveData();
  renderAll();
  showToast("Transaction deleted.");
}

function exportBackup() {
  const backup = {
    app: "SpendWise",
    version: 2,
    exportedAt: new Date().toISOString(),
    data: appData,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `spendwise-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Backup downloaded.");
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const imported = parsed.data || parsed;
      if (
        !Array.isArray(imported.transactions) ||
        !Array.isArray(imported.categories)
      ) {
        throw new Error("This file is not a valid SpendWise backup.");
      }
      if (
        !confirm(
          "Importing will replace the SpendWise data currently saved in this browser. Continue?",
        )
      )
        return;
      appData = {
        transactions: imported.transactions.map((t) => ({
          id: String(t.id || makeId()),
          type: t.type === "income" ? "income" : "expense",
          name: String(t.name || "Untitled"),
          amount: Number(t.amount) || 0,
          category: String(t.category || "Other"),
          date: String(t.date || new Date().toISOString().slice(0, 10)),
        })),
        budget: Math.max(0, Number(imported.budget) || 0),
        currency: ["KES", "USD", "EUR", "GBP", "UGX", "TZS"].includes(
          imported.currency,
        )
          ? imported.currency
          : "KES",
        theme: imported.theme === "dark" ? "dark" : "light",
        categories: imported.categories.map(String),
        profileName: String(imported.profileName || ""),
      };
      saveData();
      renderAll();
      showToast("Backup imported successfully.");
    } catch (error) {
      alert(error.message || "Could not import this file.");
    } finally {
      $("importFile").value = "";
    }
  };
  reader.readAsText(file);
}

// Navigation and quick actions
document
  .querySelectorAll(".nav-link")
  .forEach((button) =>
    button.addEventListener("click", () => showView(button.dataset.view)),
  );
document
  .querySelectorAll("[data-open-view]")
  .forEach((button) =>
    button.addEventListener("click", () => showView(button.dataset.openView)),
  );
$("quickAddBtn").addEventListener("click", () => openTransactionDialog());
$("transactionAddBtn").addEventListener("click", () => openTransactionDialog());
$("closeDialog").addEventListener("click", closeTransactionDialog);
$("cancelDialog").addEventListener("click", closeTransactionDialog);
els.transactionForm.addEventListener("submit", saveTransaction);
$("mobileMenu").addEventListener("click", () =>
  $("sidebar").classList.toggle("open"),
);

// Transaction search, filters, edit and delete
els.searchTransactions.addEventListener("input", renderTransactions);
els.filterType.addEventListener("change", renderTransactions);
els.filterCategory.addEventListener("change", renderTransactions);
els.transactionsTable.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const transaction = appData.transactions.find(
    (t) => t.id === button.dataset.id,
  );
  if (!transaction) return;
  if (button.dataset.action === "edit") openTransactionDialog(transaction);
  if (button.dataset.action === "delete") deleteTransaction(transaction.id);
});

// Settings
$("preferencesForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const budget = Number(els.settingsBudget.value);
  if (
    els.settingsBudget.value.trim() &&
    (!Number.isFinite(budget) || budget < 0)
  ) {
    showToast("Enter a valid budget amount.");
    return;
  }
  appData.currency = els.currencySetting.value;
  appData.budget = budget || 0;
  saveData();
  renderAll();
  showToast("Preferences saved.");
});

els.darkModeSetting.addEventListener("change", () => {
  appData.theme = els.darkModeSetting.checked ? "dark" : "light";
  saveData();
  applyTheme();
  showToast("Theme updated.");
});

$("categoryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("newCategory");
  const name = input.value.trim();
  if (!name) return;
  if (appData.categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
    showToast("That category already exists.");
    return;
  }
  appData.categories.push(name);
  input.value = "";
  saveData();
  renderAll();
  showToast("Category added.");
});

els.categorySettingsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-category]");
  if (!button) return;
  const name = button.dataset.removeCategory;
  const inUse = appData.transactions.some((t) => t.category === name);
  if (inUse) {
    showToast(
      "This category is used by a transaction and cannot be removed yet.",
    );
    return;
  }
  if (!confirm(`Remove the "${name}" category?`)) return;
  appData.categories = appData.categories.filter((c) => c !== name);
  saveData();
  renderAll();
  showToast("Category removed.");
});

$("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  appData.profileName = els.profileName.value.trim();
  saveData();
  renderHeader();
  showToast("Display name saved.");
});

// Backup and data controls
$("exportBtn").addEventListener("click", exportBackup);
$("importFile").addEventListener("change", (event) =>
  importBackup(event.target.files[0]),
);
$("clearDataBtn").addEventListener("click", () => {
  const confirmed = confirm(
    "Are you sure you want to permanently clear all SpendWise data from this browser? Export a backup first if you may need it.",
  );
  if (!confirmed) return;
  appData = {
    transactions: [],
    budget: 0,
    currency: "KES",
    theme: "light",
    categories: [...DEFAULT_CATEGORIES],
    profileName: "",
  };
  saveData();
  renderAll();
  showToast("All SpendWise data has been cleared.");
});

// Keep multiple open tabs reasonably synchronized.
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    appData = loadData();
    renderAll();
    showToast("SpendWise updated from another tab.");
  }
});

renderAll();
