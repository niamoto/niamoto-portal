#!/usr/bin/env bash

# Build taxon dashboard js
mkdir -p apps/taxon_dashboard/static/taxon_dashboard/js/dist
browserify js/taxon_dashboard/main.js | uglifyjs > apps/taxon_dashboard/static/taxon_dashboard/js/dist/main.min.js

# Build plot dashboard js
mkdir -p apps/plot_dashboard/static/plot_dashboard/js/dist
browserify js/plot_dashboard/main.js | uglifyjs > apps/plot_dashboard/static/plot_dashboard/js/dist/main.min.js

# Build homepage js
browserify js/homepage/homepage.js | uglifyjs > web/static/js/homepage.min.js

# Build inventories js
mkdir -p apps/inventories/static/inventories/js/dist
browserify js/inventories/add_inventory.js | uglifyjs > apps/inventories/static/inventories/js/dist/add_inventory.min.js
browserify js/inventories/taxa_inventory.js | uglifyjs > apps/inventories/static/inventories/js/dist/taxa_inventory.min.js
browserify js/inventories/consult_inventories.js | uglifyjs > apps/inventories/static/inventories/js/dist/consult_inventories.min.js

# Build data marts js
mkdir -p apps/data_marts/static/data_marts/js/dist
browserify js/data_marts/data_mart.js | uglifyjs > apps/data_marts/static/data_marts/js/dist/data_mart.js
