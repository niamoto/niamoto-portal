#!/usr/bin/env bash

# Build taxon dashboard js
node web/static/js/libs/r.js -o apps/taxon_dashboards/static/taxon_dashboards/js/build.js

# Build plot dashboard js
node web/static/js/libs/r.js -o apps/plot_dashboard/static/plot_dashboard/js/build.js

# Build homepage js
node web/static/js/libs/r.js -o web/static/js/build_homepage.js

# Build inventories js
node web/static/js/libs/r.js -o apps/inventories/static/inventories/js/jsbuild/build_add_inventory.js
node web/static/js/libs/r.js -o apps/inventories/static/inventories/js/jsbuild/build_consult_inventories.js
node web/static/js/libs/r.js -o apps/inventories/static/inventories/js/jsbuild/build_taxa_inventory.js

# Build data marts js
mkdir apps/data_marts/static/data_marts/css/js
browserify js/data_marts/data_mart.js -t babelify --presets [es2015 react] -o apps/data_marts/static/data_marts/js/dist/data_mart.js
