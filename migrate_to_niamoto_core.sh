#!/usr/bin/env bash

psql -d niamoto -c "\
    CREATE TABLE temp_taxa_inventory_taxon (
        taxa_inventory_id integer,
        taxon_id integer
    );
    INSERT INTO temp_taxa_inventory_taxon (taxa_inventory_id, taxon_id)
        SELECT t_occ.taxa_inventory_id AS taxa_inventory_id,
            occ.taxon_id AS taxon_id
        FROM inventories_taxainventoryoccurrence AS t_occ
        INNER JOIN niamoto_data_occurrence AS occ
            ON t_occ.occurrence_ptr_id = occ.id;"

python manage.py migrate

psql -d niamoto -c "\
    INSERT INTO inventories_taxainventorytaxon (taxa_inventory_id, taxon_id, taxon_id_no_constraint)
        SELECT taxa_inventory_id,
            taxon_id,
            taxon_id
        FROM temp_taxa_inventory_taxon;"
