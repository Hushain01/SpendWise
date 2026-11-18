SPENDWISE — ANGULARJS PERSONAL EXPENSE TRACKER
=============================================

PROJECT STRUCTURE
-----------------
SpendWise-AngularJS/
  index.html
  package.json
  README.txt
  css/
    styles.css
  js/
    app.js
    controllers.js

REQUIREMENTS
------------
1. Install Node.js (LTS).
2. Open this project folder in VS Code.
3. Open Terminal in the project folder.

INSTALL
-------
Run:
  npm install

RUN
---
Run:
  npm start

Then open:
  http://localhost:8080

IMPORTANT
---------
Do not open index.html by double-clicking it. Run the local server using
npm start. AngularJS is loaded from node_modules/angular/angular.min.js,
so the application does not depend on Google's AngularJS CDN.

FEATURES
--------
- Dashboard with income, expenses, balance and savings rate
- Six-month cash-flow bar chart
- Category spending donut chart
- Add, edit and delete transactions
- Search and filter transactions
- Category-based monthly budgets
- Financial reports
- Currency and profile settings
- Browser localStorage persistence
- Responsive layout for desktop, tablet and mobile

DATA
----
This is a frontend academic project. Data is stored in the browser's
localStorage. It has no server-side database, authentication, or cloud sync.
Use Settings > Reset demo data to restore the sample transactions.

ANGULARJS CONCEPTS
------------------
ng-app, ng-controller, ng-repeat, ng-if, ng-model, ng-click, ng-submit,
ng-options, filters, $scope, controller-as syntax, dependency injection,
$watch, and localStorage integration.

CUSTOMIZATION
-------------
- Change layout and colors in css/styles.css.
- Add AngularJS application configuration in js/app.js.
- Add controller logic in js/controllers.js.
