define([
    'jquery',
    'd3',
    'topojson',
    'static_urls',
    'd3-array',
    'd3-geo',
    'd3-geo-projection'
], function($, d3, topojson, static_urls) {

    function initMap() {
        var height = $("#map_widget").height();
        var width = $("#map_widget").width();

        var projection = d3.geoMercator();

        var svg = d3.select("#map_widget").append("svg")
            .attr("width", width)
            .attr("height", height);

        var occ_selection = svg.selectAll("circle")

        function enterOccurrences(occurrences) {
            occ_selection = svg.selectAll("circle").data(occurrences);
            occ_selection.enter()
                .append("circle")
                .attr("cx", function (d) { return projection(d)[0]; })
                .attr('cy', function (d) { return projection(d)[1]; })
                .attr("r", 0)
                .transition()
                .duration(500)
                .attr("r", "3")
                .attr("fill", function(d) { return "#239023"; })
                .attr("stroke", "#196719")
                .attr("opacity", "0.8");
        };

        function updateOccurrences(data) {
            var occurrences = data['coordinates'];
            occ_selection = svg.selectAll("circle");
            var count = occ_selection.size();
            if (count == 0) {
                enterOccurrences(occurrences);
            } else {
                occ_selection = svg.selectAll("circle").data([]);
                occ_selection.exit()
                    .transition()
                    .duration(500)
                    .remove()
                    .on("end", function () {
                        count -= 1;
                        if (count == 0) {
                            enterOccurrences(occurrences);
                        }
                    })
                    .attr('r', '0');
            }
        };

        d3.json(static_urls.nc_adm_topojson, function (error, nc) {
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

            $('#preloader').trigger('hide');
        });
        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            updateOccurrences(data);
        });
    };

    return {
        initMap: initMap
    }
});
