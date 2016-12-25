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

        var occ_selection = svg.selectAll("rect");
        var plot_width = 6;

        function enterOccurrences(occurrences) {
            occ_selection = svg.selectAll("rect").data(occurrences);
            occ_selection.enter()
                .append("rect")
                .attr("x", function (d) { return projection(d)[0] - plot_width / 2; })
                .attr('y', function (d) { return projection(d)[1] - plot_width / 2; })
                .attr("opacity", "0")
                .attr("width", plot_width)
                .attr("height", plot_width)
                .transition()
                .duration(200)
                .attr("fill", function(d) { return "#239023"; })
                .attr("stroke", "#196719")
                .attr("opacity", "0.8");
        };

        function updateOccurrences(data) {
            var occurrences = [data['geometry']['coordinates']];
            occ_selection = svg.selectAll("rect");
            var count = occ_selection.size();
            if (count == 0) {
                enterOccurrences(occurrences);
            } else {
                occ_selection = svg.selectAll("rect").data([]);
                occ_selection.exit()
                    .transition()
                    .duration(200)
                    .remove()
                    .on("end", function () {
                        count -= 1;
                        if (count == 0) {
                            enterOccurrences(occurrences);
                        }
                    })
                    .attr("opacity", "0");
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

            $('#preloader').trigger('elementLoaded', 'map');
        });

        $('#plot_select').on('plotSelected', function (event, data) {
            updateOccurrences(data['plot']);
        });
    };

    return {
        initMap: initMap
    }
});
