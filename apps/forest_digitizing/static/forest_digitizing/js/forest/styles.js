/**
* Ol styles for forest visualization app.
*/

var username = document.getElementById('username').innerHTML;

forest.styles = {};

forest.styles['massif_style'] = olext.utils.makeStyle({
    'fill_color': 'rgba(0, 0, 0, 0)',
    'stroke_color': '#FCFFD0',
    'stroke_width': 2
});

forest.styles['forest_style'] = olext.utils.makeStyle({
    'fill_color': 'rgba(146, 255, 92, 0.1)',
    'stroke_color': '#133B10',
    'stroke_width': 1
});

forest.styles['forest30k_style'] = olext.utils.makeStyle({
    'fill_color': 'rgba(217, 92, 255, 0.1)',
    'stroke_color': '#133B10',
    'stroke_width': 1
});

forest.styles['selected_point_style'] = olext.utils.makeStyle({
    'image': olext.utils.makeCircle({
        'radius': 5,
        'fill_color': 'rgb(51, 133, 214)',
        'stroke_color': 'rgb(21, 103, 184)'
    })
});

forest.styles['point_style'] = olext.utils.makeStyle({
    'image': olext.utils.makeCircle({
        'radius': 5,
        'fill_color': olext.utils.hexToRGBA('#FF8000', 0.8),
        'stroke_color': olext.utils.hexToRGBA('#8A0808', 0.8)
    })
});

forest.styles['point_alt_style'] = olext.utils.makeStyle({
    'image': olext.utils.makeCircle({
        'radius': 5,
        'fill_color': olext.utils.hexToRGBA('#FF5CAD', 0.8),
        'stroke_color': olext.utils.hexToRGBA('#7D194B', 0.8)
    })
});

forest.styles['problem_style'] = function(feature, resolution) {
    var creator = feature.get('creator_username');
    if (creator == username) {
        return [forest.styles['point_style']];
    } else {
        return [forest.styles['point_alt_style']];
    }
};

forest.styles['overlay_style'] = olext.utils.makeStyle({
    'image': olext.utils.makeCircle({
        'radius': 6,
        'fill_color': olext.utils.hexToRGBA('#FF3300', 0.8),
        'stroke_color': '#FF3300'
    })
});
