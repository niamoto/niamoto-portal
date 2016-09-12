(function($, undefined) {

    var data = {};

    function getTaxaTreeFromTaxaList(taxa_list) {
        var tax_dict = {};
        var tree = [];
        for (var i = 0; i < taxa_list.length; i++) {
            var taxon = taxa_list[i]
            taxon['text'] = taxon['full_name'];
            taxon['nodes'] = [];
            taxon['state'] = {
                expanded: false,
            },
            tax_dict[taxon['id']] = taxon;
        }
        for (var tax_id in tax_dict) {
            var tax = tax_dict[tax_id];
            if (tax['parent'] != null) {
                tax_dict[tax['parent']]['nodes'].push(tax);
            }
        }
        for (var tax_id in tax_dict) {
            var tax = tax_dict[tax_id];
            if (tax['nodes'].length == 0) {
                tax['nodes'] = null;
                tax['icon'] = 'glyphicon glyphicon-leaf';
            }
            if (tax['parent'] == null) {
                tree.push(tax);
            }
        }
        return tree;
    };

    function taxonSelected(node) {
        $('#selected_taxon_name').html(node['text']);
    }

    function buildTaxaTree() {
        $.ajax({
            type: 'GET',
            url: taxa_tree_url,
            success: function (result) {
                var taxa_list = result;
                var taxa_tree = getTaxaTreeFromTaxaList(taxa_list);
                $('#taxon_treeview').treeview({
                    data: taxa_tree,
                    onNodeSelected: function (event, node) {
                        taxonSelected(node);
                        updateTaxonData(node['id']);
                    }
                });
            }
        })
    };

    function updateTaxonData(taxon_id) {
        var url = "/api/1.0/dashboard/taxon_dashboard/"
            + taxon_id + "/?include_coordinates=true"
            + "&include_taxon_distribution=true";

        d3.json(url, function (error, data) {
            if (error) throw error;
            $('#taxon_treeview').trigger('taxonSelected', data);
        });
    }

    function initSearch() {
        $('#input-search').val("");
        $('#input-search').change(function () {
            $('#taxon_treeview').treeview('collapseAll');
            var pattern = $('#input-search').val();
            var matching = $('#taxon_treeview').treeview('search', pattern, {
                ignoreCase: true,
                exactMatch: false,
                revealResults: true
            });
            if (matching.length == 0) {
                return
            }
            var first_element = $("[data-nodeid='" + matching[0]['nodeId'] + "']");
            var m_tree_top = $('#taxon_treeview').offset().top;
            var m_tree_scrolltop = $('#taxon_treeview').scrollTop();
            var scroll_top = first_element.offset().top - m_tree_top + m_tree_scrolltop;
            $('#taxon_treeview').animate({scrollTop: scroll_top}, 200);
        });
    };

    function initMap() {
        var height = $("#map_widget").height();
        var width = $("#map_widget").width();

        var projection = d3.geoMercator();

        var svg = d3.select("#map_widget").append("svg")
            .attr("width", width)
            .attr("height", height);

        var occ_selection = svg.selectAll("circle")

        function updateOccurrences(data) {
            var occurrences = data['coordinates'];
            occ_selection = svg.selectAll("circle").data(occurrences);

            occ_selection.enter()
                .append("circle")
                .attr("cx", function (d) { return projection(d)[0]; })
                .attr('cy', function (d) { return projection(d)[1]; })
                .attr("r", 0)
                .transition()
                .duration(500)
                .attr("r", "3")
                .attr("fill", "#239023")
                .attr("stroke", "#196719")
                .attr("opacity", "0.8");

            occ_selection.transition()
                .duration(500)
                .attr("cx", function (d) { return projection(d)[0]; })
                .attr('cy', function (d) { return projection(d)[1]; })

            occ_selection.exit()
                .transition()
                .duration(500)
                .attr('r', '0')
                .remove();
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
        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            updateOccurrences(data);
        });
    };

    function initDonutChart() {

        var height = $("#taxon_proportions_widget").height();
        var width = $("#taxon_proportions_widget").width();
        var radius = Math.min(width, height) / 2;

        var svg = d3.select("#taxon_proportions_widget").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g");

            svg.append("g")
                .attr("class", "slices");
            svg.append("g")
                .attr("class", "labels");
            svg.append("g").
                attr("class", "lines");

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var pie = d3.pie()
            .sort(null)
            .value(function(d) {
                return d[1];
            });

        var arc = d3.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        var tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        var color = [
            "#5496c4", "#ffd24d", "#a29cc9", "#f96353", "#6cc6b7",
            "#fcac4f", "#a0d643", "#f99fcd", "#b068b1", "#b3b3b3"
        ];

        var total = 0;

        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            updateData(data);
        });

        function updateData(taxon_data) {
            var data = taxon_data['taxon_distribution'];
            total = taxon_data['nb_occurrences'];
            // Sort data and retain only 10 categories
            data.sort(function(a, b) {
                if (a[1] < b[1]) return -1;
                if (a[1] > b[1]) return 1;
                return 0;
            });
            data.reverse();
            if (data.length > 10) {
                var others = ['Autres', 0, []];
                for (var i = 9; i < data.length; i++) {
                    var j = data[i];
                    others[1] += j[1];
                    others[2].push(j[0]);
                }
                data = data.slice(0, 9);
                data.push(others);
            }
            var domain = [];
            for (var i = 0; i < data.length; i++) {
                domain.push(data[i][0]);
            }

            /* ------- PIE SLICES -------*/

            var slice = svg.select(".slices")
                .selectAll("path.slice")
                .data(pie(data));

            slice.enter()
                .insert("path")
                .style("fill", function(d, i) { return color[i]; })
                .style("opacity", "0.9")
                .attr("class", "slice")
                .on('mouseover', function(d) {
                    d3.select(this).style("opacity", "1.0");
                    var html = "<p><strong>" + d.data[0] + "</strong></p>";
                    html += "<p>" + parseFloat(100 * ((d.data[1]) / total)).toFixed(2) + "%</p>"
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", .9);
                    tooltip.html(html);
                })
                .on('mouseout', function(d) {
                    d3.select(this).style("opacity", "0.9");
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", 0);
                })
                .on('mousemove', function(d) {
                    var w = $("#tooltip").width();
                    var h = $("#tooltip").height();
                    tooltip.style("left", (d3.event.pageX - w / 2 - 15) + "px")
                    .style("top", (d3.event.pageY - h - 25) + "px");
                })
                .transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = {
                        endAngle: 2 * Math.PI,
                        index: 0,
                        padAngle: 0,
                        startAngle: 2 * Math.PI,
                        value: null
                    };
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });


            slice.transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            slice.exit()
                .transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var dest = {
                        endAngle: this._current.endAngle,
                        index: 0,
                        padAngle: 0,
                        startAngle: this._current.endAngle,
                        value: null
                    };
                    var interpolate = d3.interpolate(this._current, dest);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                })
                .remove();

            /* ------- TEXT LABELS -------*/


        };


    };

    $(document).ready(function () {
        buildTaxaTree();
        initSearch();
        initMap();
        initDonutChart();
    });

})(jQuery);
