(function () {
  'use strict';

  if (!window.angular) return;

  angular.module('spendWiseApp', [])
    .controller('MainController', ['$scope', '$timeout', function ($scope, $timeout) {
      var vm = this;
      var STORAGE_KEY = 'spendwise.v2';
      var palette = ['#6b8afd', '#27b58a', '#f2a65a', '#a78bfa', '#ef7185', '#45b8c5', '#9aa5b5'];
      vm.today = new Date();
      vm.greeting = vm.today.getHours() < 12 ? 'Good morning' : (vm.today.getHours() < 18 ? 'Good afternoon' : 'Good evening');
      vm.nav = [
        { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
        { id: 'transactions', label: 'Transactions', icon: '↔' },
        { id: 'budgets', label: 'Budgets', icon: '▤' },
        { id: 'reports', label: 'Reports', icon: '▥' }
      ];
      vm.categories = [
        { name: 'Food & Dining', icon: '🍽' }, { name: 'Transport', icon: '🚗' },
        { name: 'Shopping', icon: '🛍' }, { name: 'Bills & Utilities', icon: '💡' },
        { name: 'Entertainment', icon: '🎬' }, { name: 'Health', icon: '✚' },
        { name: 'Education', icon: '📚' }, { name: 'Salary', icon: '💼' },
        { name: 'Freelance', icon: '💻' }, { name: 'Other', icon: '✦' }
      ];
      vm.settings = { name: '', currency: 'INR', incomeTarget: 0 };
      vm.transactions = [];
      vm.budgets = [];
      vm.page = 'dashboard';
      vm.pageTitle = 'Dashboard';
      vm.selectedMonth = monthKey(new Date());
      vm.filters = { search: '', type: '', category: '' };
      vm.transactionModal = false;
      vm.budgetModal = false;
      vm.mobileMenu = false;
      vm.toast = '';

      function monthKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
      function parseDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
      function dateInput(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
      function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings: vm.settings, transactions: vm.transactions, budgets: vm.budgets }));
      }
      function load() {
        try {
          var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          if (saved.settings) angular.extend(vm.settings, saved.settings);
          vm.transactions = Array.isArray(saved.transactions) ? saved.transactions : [];
          vm.budgets = Array.isArray(saved.budgets) ? saved.budgets : [];
        } catch (e) { vm.transactions = []; vm.budgets = []; }
      }
      vm.money = function (n) {
        var currency = vm.settings.currency || 'INR';
        try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(Number(n) || 0); }
        catch (e) { return '₹' + (Number(n) || 0).toFixed(0); }
      };
      vm.currencySymbol = function () { return ({ INR: '₹', USD: '$', EUR: '€', GBP: '£' })[vm.settings.currency] || '₹'; };
      vm.moneyCompact = function (n) {
        n = Number(n) || 0;
        if (n >= 100000) return vm.currencySymbol() + (n / 100000).toFixed(1) + 'L';
        if (n >= 1000) return vm.currencySymbol() + (n / 1000).toFixed(1) + 'k';
        return vm.currencySymbol() + Math.round(n);
      };
      vm.categoryIcon = function (name) {
        var c = vm.categories.find(function (x) { return x.name === name; });
        return c ? c.icon : '✦';
      };
      vm.go = function (page) {
        vm.page = page;
        vm.pageTitle = ({ dashboard: 'Dashboard', transactions: 'Transactions', budgets: 'Budgets', reports: 'Reports', settings: 'Settings' })[page] || 'Dashboard';
        vm.mobileMenu = false;
      };
      vm.refresh = function () {
        var key = vm.selectedMonth;
        vm.monthTransactions = vm.transactions.filter(function (t) { return t.date.slice(0, 7) === key; });
        vm.income = sum(vm.monthTransactions, 'Income');
        vm.expenses = sum(vm.monthTransactions, 'Expense');
        vm.balance = vm.income - vm.expenses;
        vm.savingsRate = vm.income ? (vm.balance / vm.income) * 100 : 0;
        vm.recent = vm.monthTransactions.slice().sort(byDateDesc).slice(0, 5);
        vm.categoryBreakdown = buildBreakdown(vm.monthTransactions);
        vm.donutStyle = buildDonut(vm.categoryBreakdown);
        vm.budgetSummary = vm.budgets.map(function (b) {
          var spent = vm.monthTransactions.filter(function (t) { return t.type === 'Expense' && t.category === b.category; }).reduce(function (a, t) { return a + Number(t.amount); }, 0);
          return angular.extend({}, b, { spent: spent, percent: b.limit ? spent / b.limit * 100 : 0 });
        });
        vm.monthlyFlow = [];
        for (var i = 5; i >= 0; i--) {
          var d = new Date(vm.today.getFullYear(), vm.today.getMonth() - i, 1);
          var k = monthKey(d);
          var list = vm.transactions.filter(function (t) { return t.date.slice(0, 7) === k; });
          vm.monthlyFlow.push({ label: d.toLocaleDateString('en', { month: 'short' }), income: sum(list, 'Income'), expenses: sum(list, 'Expense') });
        }
        vm.chartMax = Math.max.apply(null, [1].concat(vm.monthlyFlow.map(function (m) { return Math.max(m.income, m.expenses); })));
      };
      function sum(list, type) { return list.filter(function (t) { return t.type === type; }).reduce(function (a, t) { return a + Number(t.amount || 0); }, 0); }
      function byDateDesc(a, b) { return b.date.localeCompare(a.date) || b.id - a.id; }
      function buildBreakdown(list) {
        var groups = {};
        list.filter(function (t) { return t.type === 'Expense'; }).forEach(function (t) { groups[t.category] = (groups[t.category] || 0) + Number(t.amount); });
        var total = Object.keys(groups).reduce(function (a, k) { return a + groups[k]; }, 0);
        return Object.keys(groups).map(function (name, i) { return { name: name, amount: groups[name], percent: total ? groups[name] / total * 100 : 0, color: palette[i % palette.length] }; }).sort(function (a, b) { return b.amount - a.amount; });
      }
      function buildDonut(items) {
        if (!items.length) return 'conic-gradient(#edf0f5 0deg 360deg)';
        var angle = 0, parts = [];
        items.forEach(function (x) { var next = angle + x.percent * 3.6; parts.push(x.color + ' ' + angle + 'deg ' + next + 'deg'); angle = next; });
        return 'conic-gradient(' + parts.join(',') + ')';
      }
      vm.barHeight = function (n) { return Math.max(2, (Number(n) / vm.chartMax) * 100); };
      vm.progressWidth = function (n) { return Math.min(100, Math.max(0, n)) + '%'; };
      vm.progress = function (b) { return b.percent; };
      vm.filteredTransactions = function () {
        var q = (vm.filters.search || '').toLowerCase();
        return vm.monthTransactions.filter(function (t) {
          return (!vm.filters.type || t.type === vm.filters.type) &&
            (!vm.filters.category || t.category === vm.filters.category) &&
            (!q || (t.title + ' ' + t.note + ' ' + t.category).toLowerCase().indexOf(q) !== -1);
        }).slice().sort(byDateDesc);
      };
      vm.openTransaction = function () {
        vm.form = { title: '', amount: null, type: 'Expense', category: 'Food & Dining', date: dateInput(new Date()), note: '' };
        vm.transactionModal = true;
      };
      vm.editTransaction = function (t) {
        vm.form = angular.copy(t); vm.form.date = parseDate(t.date); vm.transactionModal = true;
      };
      vm.saveTransaction = function () {
        if (!vm.form.title || !vm.form.amount || Number(vm.form.amount) <= 0) return;
        var item = angular.copy(vm.form);
        item.date = item.date instanceof Date ? dateInput(item.date) : item.date;
        item.amount = Number(item.amount);
        if (item.id) {
          var idx = vm.transactions.findIndex(function (x) { return x.id === item.id; });
          if (idx >= 0) vm.transactions[idx] = item;
        } else { item.id = Date.now(); vm.transactions.push(item); }
        persist(); vm.closeModals(); vm.refresh(); notify('Transaction saved');
      };
      vm.deleteTransaction = function (t) {
        if (!window.confirm('Delete "' + t.title + '"?')) return;
        vm.transactions = vm.transactions.filter(function (x) { return x.id !== t.id; });
        persist(); vm.refresh(); notify('Transaction deleted');
      };
      vm.openBudget = function () { vm.budgetForm = { category: 'Food & Dining', limit: null }; vm.budgetModal = true; };
      vm.editBudget = function (b) { vm.budgetForm = angular.copy(b); vm.budgetModal = true; };
      vm.saveBudget = function () {
        if (!vm.budgetForm.limit || Number(vm.budgetForm.limit) <= 0) return;
        var item = angular.copy(vm.budgetForm); item.limit = Number(item.limit);
        if (item.id) {
          var idx = vm.budgets.findIndex(function (x) { return x.id === item.id; });
          if (idx >= 0) vm.budgets[idx] = item;
        } else {
          var existing = vm.budgets.find(function (x) { return x.category === item.category; });
          if (existing) existing.limit = item.limit; else { item.id = Date.now(); vm.budgets.push(item); }
        }
        persist(); vm.closeModals(); vm.refresh(); notify('Budget saved');
      };
      vm.deleteBudget = function (b) {
        if (!window.confirm('Delete the ' + b.category + ' budget?')) return;
        vm.budgets = vm.budgets.filter(function (x) { return x.id !== b.id; });
        persist(); vm.refresh(); notify('Budget deleted');
      };
      vm.closeModals = function () { vm.transactionModal = false; vm.budgetModal = false; };
      vm.saveSettings = function () { persist(); notify('Preferences saved'); };
      vm.resetData = function () {
        if (!window.confirm('This will permanently clear all SpendWise transactions, budgets and preferences in this browser. Continue?')) return;
        localStorage.removeItem(STORAGE_KEY);
        vm.settings = { name: '', currency: 'INR', incomeTarget: 0 }; vm.transactions = []; vm.budgets = [];
        persist(); vm.refresh(); notify('All data has been reset');
      };
      vm.exportCsv = function () {
        var rows = [['Name', 'Amount', 'Type', 'Category', 'Date', 'Note']].concat(vm.transactions.map(function (t) { return [t.title, t.amount, t.type, t.category, t.date, t.note || '']; }));
        var csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = 'spendwise-transactions.csv'; a.click(); URL.revokeObjectURL(url);
      };
      function notify(message) { vm.toast = message; $timeout(function () { vm.toast = ''; }, 2600); }

      load(); vm.refresh();
    }]);
})(); 
