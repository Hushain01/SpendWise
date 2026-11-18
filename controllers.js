(function () {
  'use strict';

  angular.module('spendWise').controller('MainController', ['$scope', '$window', '$timeout', function ($scope, $window, $timeout) {
    var vm = this;
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var dateString = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var monthKey = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
    var parseDate = function (s) { return new Date(s + 'T12:00:00'); };

    vm.today = now;
    vm.greeting = now.getHours() < 12 ? 'Good morning' : (now.getHours() < 17 ? 'Good afternoon' : 'Good evening');
    vm.nav = [
      { id: 'dashboard', label: 'Overview', icon: '▦' },
      { id: 'transactions', label: 'Transactions', icon: '↕' },
      { id: 'budgets', label: 'Budgets', icon: '◉' },
      { id: 'reports', label: 'Reports', icon: '▥' }
    ];
    vm.page = 'dashboard';
    vm.pageTitle = 'Dashboard';
    vm.pageSubtitle = 'Here is what is happening with your finances.';
    vm.monthKey = monthKey(now);
    vm.monthOptions = [];
    for (var i = 0; i < 18; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      vm.monthOptions.push({ key: monthKey(d), label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }) });
    }

    vm.categories = [
      { name: 'Food', icon: '🍔', color: '#efa45f', type: 'Expense' },
      { name: 'Transport', icon: '🚗', color: '#5b9ce0', type: 'Expense' },
      { name: 'Shopping', icon: '🛍️', color: '#a48be1', type: 'Expense' },
      { name: 'Housing', icon: '🏠', color: '#55b5a0', type: 'Expense' },
      { name: 'Bills', icon: '🧾', color: '#e47e89', type: 'Expense' },
      { name: 'Entertainment', icon: '🎬', color: '#d1a34b', type: 'Expense' },
      { name: 'Health', icon: '💊', color: '#63b5a4', type: 'Expense' },
      { name: 'Education', icon: '📚', color: '#858bd4', type: 'Expense' },
      { name: 'Other', icon: '📦', color: '#999bab', type: 'Expense' },
      { name: 'Salary', icon: '💼', color: '#43aa80', type: 'Income' },
      { name: 'Other income', icon: '💰', color: '#58a5bd', type: 'Income' }
    ];
    vm.expenseCategories = vm.categories.filter(function (c) { return c.type === 'Expense'; });

    var demoTransactions = [
      { id: 1, title: 'Monthly salary', category: 'Salary', type: 'Income', amount: 45000, date: dateString(new Date(now.getFullYear(), now.getMonth(), 2)), note: 'Monthly salary' },
      { id: 2, title: 'Apartment rent', category: 'Housing', type: 'Expense', amount: 12000, date: dateString(new Date(now.getFullYear(), now.getMonth(), 3)), note: 'Monthly rent' },
      { id: 3, title: 'Grocery shopping', category: 'Food', type: 'Expense', amount: 2450, date: dateString(new Date(now.getFullYear(), now.getMonth(), 5)), note: 'Weekly groceries' },
      { id: 4, title: 'Electricity bill', category: 'Bills', type: 'Expense', amount: 1350, date: dateString(new Date(now.getFullYear(), now.getMonth(), 8)), note: 'Monthly utility' },
      { id: 5, title: 'Freelance project', category: 'Other income', type: 'Income', amount: 6000, date: dateString(new Date(now.getFullYear(), now.getMonth(), 10)), note: 'Website design' },
      { id: 6, title: 'Fuel and travel', category: 'Transport', type: 'Expense', amount: 1800, date: dateString(new Date(now.getFullYear(), now.getMonth(), 12)), note: 'Commute' },
      { id: 7, title: 'New headphones', category: 'Shopping', type: 'Expense', amount: 2200, date: dateString(new Date(now.getFullYear(), now.getMonth(), 14)), note: 'Electronics' },
      { id: 8, title: 'Dinner with friends', category: 'Food', type: 'Expense', amount: 950, date: dateString(new Date(now.getFullYear(), now.getMonth(), 16)), note: 'Weekend dinner' },
      { id: 9, title: 'Streaming subscription', category: 'Entertainment', type: 'Expense', amount: 499, date: dateString(new Date(now.getFullYear(), now.getMonth(), 18)), note: 'Monthly subscription' },
      { id: 10, title: 'Investment return', category: 'Other income', type: 'Income', amount: 1200, date: dateString(new Date(now.getFullYear(), now.getMonth(), 20)), note: 'Investment' }
    ];
    var defaultBudgets = [
      { category: 'Food', limit: 6000 }, { category: 'Transport', limit: 3500 },
      { category: 'Shopping', limit: 5000 }, { category: 'Housing', limit: 14000 },
      { category: 'Bills', limit: 3000 }
    ];

    function readStorage(key, fallback) {
      try {
        var stored = $window.localStorage.getItem(key);
        return stored === null ? angular.copy(fallback) : JSON.parse(stored);
      } catch (e) { return angular.copy(fallback); }
    }
    vm.transactions = readStorage('spendwise_transactions', demoTransactions);
    vm.budgets = readStorage('spendwise_budgets', defaultBudgets);
    vm.settings = readStorage('spendwise_settings', { name: 'Alex Morgan', currency: 'INR', incomeTarget: 50000 });

    vm.persist = function () {
      try {
        $window.localStorage.setItem('spendwise_transactions', JSON.stringify(vm.transactions));
        $window.localStorage.setItem('spendwise_budgets', JSON.stringify(vm.budgets));
        $window.localStorage.setItem('spendwise_settings', JSON.stringify(vm.settings));
      } catch (e) { vm.notify('Could not save data in this browser.'); }
    };

    vm.currencySymbol = function () {
      return { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[vm.settings.currency] || '₹';
    };
    vm.money = function (amount) {
      return vm.currencySymbol() + (Number(amount) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };
    vm.moneyCompact = function (amount) {
      amount = Number(amount) || 0;
      if (amount >= 100000) return vm.currencySymbol() + (amount / 100000).toFixed(1) + 'L';
      if (amount >= 1000) return vm.currencySymbol() + (amount / 1000).toFixed(0) + 'k';
      return vm.currencySymbol() + amount.toFixed(0);
    };
    vm.navigate = function (page) {
      vm.page = page;
      vm.mobileNav = false;
      var pages = {
        dashboard: ['Dashboard', 'Here is what is happening with your finances.'],
        transactions: ['Transactions', 'Review, search and manage all your activity.'],
        budgets: ['Budget planner', 'Set limits and build healthier spending habits.'],
        reports: ['Financial reports', 'Understand your spending patterns.'],
        settings: ['Settings', 'Manage your personal preferences.']
      };
      vm.pageTitle = pages[page][0];
      vm.pageSubtitle = pages[page][1];
    };

    vm.recalculate = function () {
      var selected = vm.monthKey.split('-');
      var year = Number(selected[0]), month = Number(selected[1]) - 1;
      vm.monthTransactions = vm.transactions.filter(function (t) {
        var date = parseDate(t.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
      vm.income = vm.monthTransactions.filter(function (t) { return t.type === 'Income'; }).reduce(function (sum, t) { return sum + Number(t.amount || 0); }, 0);
      vm.expenses = vm.monthTransactions.filter(function (t) { return t.type === 'Expense'; }).reduce(function (sum, t) { return sum + Number(t.amount || 0); }, 0);
      vm.balance = vm.income - vm.expenses;
      vm.savingsRate = vm.income ? (vm.balance / vm.income) * 100 : 0;

      var totals = {};
      vm.monthTransactions.filter(function (t) { return t.type === 'Expense'; }).forEach(function (t) {
        totals[t.category] = (totals[t.category] || 0) + Number(t.amount || 0);
      });
      vm.categorySummary = Object.keys(totals).map(function (name) {
        return { name: name, amount: totals[name], percent: vm.expenses ? totals[name] / vm.expenses * 100 : 0, color: vm.categoryColor(name) };
      }).sort(function (a, b) { return b.amount - a.amount; });

      var start = new Date(year, month - 5, 1);
      vm.chartData = [];
      for (var i = 0; i < 6; i++) {
        var date = new Date(start.getFullYear(), start.getMonth() + i, 1);
        var rows = vm.transactions.filter(function (t) {
          var td = parseDate(t.date);
          return td.getFullYear() === date.getFullYear() && td.getMonth() === date.getMonth();
        });
        vm.chartData.push({
          label: date.toLocaleString('en-IN', { month: 'short' }),
          income: rows.filter(function (t) { return t.type === 'Income'; }).reduce(function (s, t) { return s + Number(t.amount); }, 0),
          expense: rows.filter(function (t) { return t.type === 'Expense'; }).reduce(function (s, t) { return s + Number(t.amount); }, 0)
        });
      }
      vm.chartMax = Math.max(1000, Math.ceil(Math.max.apply(null, vm.chartData.map(function (m) { return Math.max(m.income, m.expense); })) * 1.2 / 1000) * 1000);
      var angle = 0, gradients = [];
      vm.categorySummary.forEach(function (c) {
        var end = angle + c.percent * 3.6;
        gradients.push(c.color + ' ' + angle + 'deg ' + end + 'deg');
        angle = end;
      });
      vm.donutBackground = gradients.length ? 'conic-gradient(' + gradients.join(',') + ')' : '#ececf2';
    };

    vm.categoryColor = function (name) {
      var item = vm.categories.find(function (c) { return c.name === name; });
      return item ? item.color : '#999bab';
    };
    vm.categoryIcon = function (name) {
      var item = vm.categories.find(function (c) { return c.name === name; });
      return item ? item.icon : '📦';
    };
    vm.spentFor = function (category) {
      return vm.monthTransactions.filter(function (t) { return t.type === 'Expense' && t.category === category; })
        .reduce(function (sum, t) { return sum + Number(t.amount || 0); }, 0);
    };
    vm.progress = function (budget) {
      return budget.limit > 0 ? Math.min(100, vm.spentFor(budget.category) / budget.limit * 100) : 0;
    };
    vm.filteredTransactions = function () {
      var search = (vm.search || '').toLowerCase();
      return vm.monthTransactions.filter(function (t) {
        return (!vm.typeFilter || t.type === vm.typeFilter) &&
          (!vm.categoryFilter || t.category === vm.categoryFilter) &&
          (!search || (t.title + ' ' + t.category + ' ' + (t.note || '')).toLowerCase().indexOf(search) !== -1);
      }).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    };

    vm.transactionModal = false;
    vm.budgetModal = false;
    vm.editingTransaction = false;
    vm.editingBudget = false;
    vm.openTransaction = function () {
      vm.editingTransaction = false;
      vm.form = { title: '', amount: null, type: 'Expense', category: 'Food', date: dateString(now), note: '' };
      vm.transactionModal = true;
    };
    vm.categoriesForForm = function () { return vm.categories.filter(function (c) { return c.type === vm.form.type; }); };
    vm.updateFormCategory = function () {
      var list = vm.categoriesForForm();
      if (list.length) vm.form.category = list[0].name;
    };
    vm.editTransaction = function (transaction) {
      vm.editingTransaction = true;
      vm.editingId = transaction.id;
      vm.form = angular.copy(transaction);
      vm.form.date = parseDate(transaction.date);
      vm.transactionModal = true;
    };
    vm.saveTransaction = function () {
      var amount = Number(vm.form.amount);
      if (!vm.form.title || !isFinite(amount) || amount <= 0 || !vm.form.date) return;
      var record = angular.copy(vm.form);
      record.amount = amount;
      record.date = dateString(new Date(record.date));
      if (vm.editingTransaction) {
        var index = vm.transactions.findIndex(function (t) { return t.id === vm.editingId; });
        if (index !== -1) vm.transactions[index] = angular.extend({}, vm.transactions[index], record);
        vm.notify('Transaction updated successfully.');
      } else {
        record.id = Date.now();
        vm.transactions.push(record);
        vm.notify('Transaction added successfully.');
      }
      vm.persist();
      vm.recalculate();
      vm.transactionModal = false;
    };
    vm.deleteTransaction = function (transaction) {
      if (!$window.confirm('Delete "' + transaction.title + '" permanently?')) return;
      vm.transactions = vm.transactions.filter(function (t) { return t.id !== transaction.id; });
      vm.persist(); vm.recalculate(); vm.notify('Transaction deleted.');
    };

    vm.openBudget = function () {
      vm.editingBudget = false;
      vm.budgetForm = { category: 'Food', limit: 5000 };
      vm.budgetModal = true;
    };
    vm.editBudget = function (budget) {
      vm.editingBudget = true;
      vm.originalBudgetCategory = budget.category;
      vm.budgetForm = angular.copy(budget);
      vm.budgetModal = true;
    };
    vm.saveBudget = function () {
      var limit = Number(vm.budgetForm.limit);
      if (!isFinite(limit) || limit <= 0) return;
      var existing = vm.budgets.find(function (b) { return b.category === vm.budgetForm.category && b.category !== vm.originalBudgetCategory; });
      if (existing) { vm.notify('A budget already exists for this category.'); return; }
      if (vm.editingBudget) {
        var old = vm.budgets.find(function (b) { return b.category === vm.originalBudgetCategory; });
        if (old) { old.category = vm.budgetForm.category; old.limit = limit; }
      } else {
        var found = vm.budgets.find(function (b) { return b.category === vm.budgetForm.category; });
        if (found) found.limit = limit;
        else vm.budgets.push({ category: vm.budgetForm.category, limit: limit });
      }
      vm.persist(); vm.budgetModal = false; vm.notify('Budget saved successfully.');
    };
    vm.deleteBudget = function (budget) {
      if (!$window.confirm('Delete the ' + budget.category + ' budget?')) return;
      vm.budgets = vm.budgets.filter(function (b) { return b.category !== budget.category; });
      vm.persist(); vm.notify('Budget deleted.');
    };
    vm.closeModals = function () { vm.transactionModal = false; vm.budgetModal = false; };

    vm.saveSettings = function () { vm.persist(); vm.notify('Preferences saved.'); };
    vm.resetData = function () {
      if (!$window.confirm('Reset all data to the original demo data? This cannot be undone.')) return;
      ['spendwise_transactions', 'spendwise_budgets', 'spendwise_settings'].forEach(function (key) { $window.localStorage.removeItem(key); });
      $window.location.reload();
    };
    vm.toast = '';
    vm.notify = function (message) {
      vm.toast = message;
      if (vm.toastTimer) $timeout.cancel(vm.toastTimer);
      vm.toastTimer = $timeout(function () { vm.toast = ''; }, 2600);
    };

    vm.recalculate();
    $scope.$watch(function () { return vm.monthKey; }, function (next, previous) {
      if (next && next !== previous) vm.recalculate();
    });
  }]);
})();
