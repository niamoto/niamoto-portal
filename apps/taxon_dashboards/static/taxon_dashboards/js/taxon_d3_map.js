(function($, undefined) {

    $(document).ready(function () {

        var height = $("#map_widget").height();
        var width = $("#map_widget").width();

        var projection = d3.geoMercator();

        var svg = d3.select("#map_widget").append("svg")
            .attr("width", width)
            .attr("height", height);

        var occ_selection = svg.selectAll("circle")

        function updateOccurrences(taxon_id) {

            var url = "/api/1.0/taxon_dashboard/coordinates_for_taxon/" + taxon_id + "/";

            d3.json(url, function (error, occurrences) {
                if (error) throw error;
                occ_selection = svg.selectAll("circle").data(occurrences);

                occ_selection.enter()
                    .append("circle")
                    .attr("cx", function (d) { return projection(d)[0]; })
                    .attr('cy', function (d) { return projection(d)[1]; })
                    .attr("r", 0)
                    .transition()
                    .duration(500)
                    .attr("r", "3")
                    .attr("fill", "red");

                occ_selection.transition()
                    .duration(500)
                    .attr("cx", function (d) { return projection(d)[0]; })
                    .attr('cy', function (d) { return projection(d)[1]; })

                occ_selection.exit()
                    .transition()
                    .duration(500)
                    .attr('r', '0')
                    .remove();
            });
        };

        d3.json(nc_topojson_url, function (error, nc) {
            if (error) throw error;

            var features = topojson.feature(nc, nc.objects.nc_adm0);

            var center = d3.geoCentroid(features);
            var scale  = 150;
            var offset = [(width/2) + 10, (height/2) - 10];
            projection = d3.geoMercator().scale(scale).center(center)
                .translate(offset);
            var path = d3.geoPath()
                .projection(projection);
            var bounds  = path.bounds(features);
            var hscale  = scale * width  / (bounds[1][0] - bounds[0][0]);
            var vscale  = scale * height / (bounds[1][1] - bounds[0][1]);
            var scale   = (hscale < vscale) ? hscale : vscale;
            var offset  = [
                width - (bounds[0][0] + bounds[1][0])/2,
                height - (bounds[0][1] + bounds[1][1])/2
            ];

            // new projection
            projection = d3.geoMercator().center(center)
                .scale(0.9 * scale).translate(offset);
            path = path.projection(projection);


            svg.append("path")
                .datum(features)
                .attr("class", "land")
                .attr("d", path);
        });
        $('#taxon_treeview').on('taxonSelected', function (event, node) {
            updateOccurrences(node['id']);
        });
    });
})(jQuery);
