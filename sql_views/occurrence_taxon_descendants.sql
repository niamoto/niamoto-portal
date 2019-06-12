-- SQL Parametric view for getting a layer containing all the occurrences
-- under a given taxon.

SELECT occ.id,
    occ.date,
    tax.full_name,
    occ.location
FROM niamoto_data_occurrence AS occ
LEFT JOIN niamoto_data_taxon AS tax
    ON occ.taxon_id = tax.id
LEFT JOIN niamoto_data_taxon AS root
    ON root.id = '%id_taxon%'
WHERE root.id IS NULL OR
    (tax.tree_id = root.tree_id AND tax.lft BETWEEN root.lft AND root.rght)
