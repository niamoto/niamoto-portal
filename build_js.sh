#!/usr/bin/env bash

# Build taxon dashboard js
mkdir -p apps/taxon_dashboard/static/taxon_dashboard/js/dist
browserify js/taxon_dashboard/main.js | uglifyjs > apps/taxon_dashboard/static/taxon_dashboard/js/dist/main.min.js

# Build plot dashboard js
mkdir -p apps/plot_dashboard/static/plot_dashboard/js/dist
browserify js/plot_dashboard/main.js | uglifyjs > apps/plot_dashboard/static/plot_dashboard/js/dist/main.min.js

# Build homepage js
node web/static/js/libs/r.js -o web/static/js/build_homepage.js

# Build inventories js
node web/static/js/libs/r.js -o apps/inventories/static/inventories/js/jsbuild/build_add_inventory.js
node web/static/js/libs/r.js -o apps/inventories/static/inventories/js/jsbuild/build_consult_inventories.js
node web/static/js/libs/r.js -o apps/inventories/static/inventories/js/jsbuild/build_taxa_inventory.js

# Build data marts js
mkdir -p apps/data_marts/static/data_marts/js/dist
browserify js/data_marts/data_mart.js | uglifyjs > apps/data_marts/static/data_marts/js/dist/data_mart.js
