# niamoto-portal

niamoto web portal providing web API's and applications.

Detailed documentation is in the "docs" directory.


## Setting up Niamoto

#### /!\ The documentation is incomplete, work is in progress to complete it /!\

### Manual operations

Although most of the steps setting up Niamoto are automated, there are still some of them that need to be done manually. Work is in progress to automate them.


#### Configure layers in the Geoserver

The Geoserver, running in the **niamoto-geoserver** container, has to distribute some layers using the PostGIS database (running in the **niamoto-postgres** container). 
Here is a list of these layers, and how to configure them.

Before setting up the layers, it is necessary to create the niamoto datastore and connect it to the PostGIS database:

1. Create a workspace called ```niamoto``` in the geoserver web administration interface.
2. Create a vector datastore, using the PostGIS backend, with the following parameters:
    - **workspace**: select ```niamoto```
    - **name**: ```niamoto_db```
    - **host**: ```niamoto-postgres```
    - **port**: ```5432```
    - **schema**: ```public```
    - **user**: ```niamoto```
    - **passwd**: ```niamoto```


##### niamoto:niamoto_data_massif

This layer is necessary for displaying the massifs in the digitizing web app. It just need to be added as a layer from the niamoto:niamoto_db datastore, using the ```niamoto_data_massif``` table.  

##### niamoto:forest_digitizing_forestfragment30k

This layer is necessary for displaying the 1:30000 forest fragments in the digitizing web app. It just need to be added as a layer from the niamoto:niamoto_db datastore, using the ```forest_digitizing_forestfragment30k``` table.  

##### niamoto:forest_digitizing_forestfragment3k

This layer is necessary for displaying the 1:3000 forest fragments in the digitizing web app. It just need to be added as a layer from the niamoto:niamoto_db datastore, using the ```forest_digitizing_forestfragment3k``` table.

##### niamoto:forest_digitizing_digitizingproblem_view

This layer is necessary for displaying the digitizing problems in the digitizing web app. It has to be added as a sql view layer from the niamoto:niamoto_db datastore. Here is the sql code of the view:

```
SELECT p.id,
    p.uuid,
    p.location,
    p.created,
    p.modified,
    p.problem,
    p.comments,
    u.username AS creator_username,
    CONCAT(u.first_name, ' ', u.last_name) AS creator_name,
    p.massif_id
FROM forest_digitizing_digitizingproblem AS p
LEFT JOIN auth_user AS u
ON p.created_by_id = u.id
```

If Geoserver does not detect it automatically, the **location** type to **Point** and the **SRID** to **4326**.

##### niamoto:occurrence_taxon_descendants

This layer is used by the **Niamoto Occurrences** QGIS plugin. It has to be added as a sql view layer from the niamoto:niamoto_db datastore. Here is the sql code of the view:

```
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
```

The **id_taxon** parameter need to have **-1** as default value, and ```^[\w\d\s]+$``` as validation regex.

If Geoserver does not detect it automatically, the **location** type to **Point** and the **SRID** to **4326**.


#### Insert the DEM into the PostGIS database

In order to infer the elevation of occurrences and plots from their geographic location, Niamoto needs a DEM. This DEM has to be stored in the PostGIS database.

1. Open a bash in the **niamoto-postgres** container:

``` 
$ cd /home/niamoto/niamoto-docker-compose
$ sudo docker-compose exec niamoto-postgres /bin/bash
```

2. Generate the sql file using raster2pgsql:

```
$ raster2pgsql -c -F -n "name" -t 200x200 -I mnt10_wgs84.tif public.mnt10_wgs84 > mnt.sql
```

3. Change user to postgres and execute the generated sql file

```
$ psql -f mnt.sql
```
