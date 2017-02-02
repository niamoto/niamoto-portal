/**
 * Module containing utility functions for making maps.
 */

define(['ol', 'proj4'], function(ol, proj4) {


    function getDefaultMap() {
        /**
         * Return a ol3 map centered in New-Caledonia with Georep's aerial
         * images as the base layer, and a zoom control.
         */
        // Add EPSG:32758 projection
        proj4.defs(
            "EPSG:32758",
            "+proj=utm +zone=58 +south +datum=WGS84 +units=m +no_defs"
        );

        var wms_url = 'http://carto.gouv.nc/arcgis/services/fond_imagerie/MapServer/WMSServer';
        var target = 'map';
        var view = new ol.View({
            projection: 'EPSG:4326',
            center: new ol.proj.transform([165.875, -21.145],
                                          'EPSG:4326',
                                          'EPSG:4326'),
            zoom: 7.5
        });
        var attribution = new ol.control.Attribution({
            collapsible: false
        });
        var map = new ol.Map({
            target: target,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: wms_url,
                        params: {
                            LAYERS: '0',
                            FORMAT: 'image/png',
                            CRS: 'EPSG:32758'
                        },
                        serverType: 'mapserver',
                        attributions: [
                            new ol.Attribution({
                                html: '<a href="http://georep.nc/">Géorep</a> '
                                    + '- <em>Gouvernement de la Nouvelle-Calédonie</em>'
                            })
                        ]
                    })
                })
            ],
            view: view,
            controls: [
                new ol.control.Zoom(),
                attribution
            ]
        });
        return map;
    };


    /**
     * Create and return a Vector Layer (or ImageVectorLayer) from a geojson
     * file.
     * @param geojson - The geojson from which generate the layer.
     * @param opt_options - Options:
     *     @param image_vector
     */
    function makeGeoJSONLayer(geojson, opt_options) {
        var options = opt_options || {};
        var image_vector = options['image_vector'];
        var source = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geojson)
        });
        options['source'] = source;
        if (image_vector) {
            return new ol.layer.Image({
                source: new ol.source.ImageVector(options)
            });
        } else {
            return new ol.layer.Vector(options);
        }
    };


    /**
     * A popup overlay.
     * Inspired by ol3-popup (https://github.com/walkermatt/ol3-popup)
     * @export
     * @constructor
     * @extends {ol.Overlay}
     * @param opt_options - Options:
     *     @param positioning
     *     @param autoPan
     *     @param autoPanAnimation
     *     @param hide_callback - callback to invoke after hiding the popup.
     *     @param show_callback - callback to invoke after showing the popup.
     */
    function Popup(opt_options) {
        var options = opt_options || {};
        var positioning = opt_options['positioning'];
        var autoPan = opt_options['autoPan'];
        var autoPanAnimation = opt_options['autoPanAnimation'];

        this.hide_callback = opt_options['hide_callback'];
        this.show_callback = opt_options['show_callback'];

        this.popup_element = document.createElement('div');
        this.popup_element.className = 'olext-popup';

        this.popup_title = document.createElement('p');
        this.popup_title.className = 'olext-popup-title';

        this.popup_closer = document.createElement('a');
        this.popup_closer.className = 'olext-popup-closer';
        this.popup_closer.href = '#';

        this.popup_content = document.createElement('div');
        this.popup_content.className = 'olext-popup-content';

        this.popup_element.appendChild(this.popup_closer);
        this.popup_element.appendChild(this.popup_title);
        this.popup_element.appendChild(this.popup_content);

        var self = this;

        this.popup_closer.addEventListener('click', function(evt) {
            self.setPosition(undefined);
            if (self.hide_callback) {
                self.hide_callback();
            }
        });

        ol.Overlay.call(this, {
            element: this.popup_element,
            positioning: positioning,
            autoPan: autoPan,
            autoPanAnimation: autoPanAnimation
        })
    };
    ol.inherits(Popup, ol.Overlay);

    /**
     * Show the popup.
     * @export
     * @param {ol.Coordinate} coord - Where to anchor the popup.
     * @param {String} title - HTML to display within the popup title.
     * @param {String} content - HTML to display within the popup content.
     * @param {Function} callback - callback to invoke after show. If the popup was
     *     constructed with a show_callback, this one will be invoked instead.
     */
    Popup.prototype.show = function(coord, title, content,
                                                     callback) {
        this.popup_title.innerHTML = title;
        this.popup_content.innerHTML = content;
        this.setPosition(coord);
        if (callback) {
            callback();
        } else if (this.show_callback) {
            this.show_callback();
        }
        return this;
    };

    /**
     * Hide the popup.
     * @export
     * @param callback - callback to invoke after hide. If the popup was
     *     constructed with a hide_callback, this one will be invoked instead.
     */
    Popup.prototype.hide = function(callback) {
        this.setPosition(undefined);
        if (callback) {
            callback();
        } else if (this.hide_callback) {
            this.hide_callback();
        }
        return this;
    };

    /**
     * Show the popup title.
     * @export
     * @param {String} title - HTML to display within the popup title.
     */
    Popup.prototype.setTitle = function(title) {
        this.popup_title.innerHTML = title;
    }

    /**
     * Update the popup content.
     * @export
     * @param {String} content - HTML to display within the popup content.
     */
    Popup.prototype.setContent = function(content) {
        this.popup_content.innerHTML = content;
    }

    return {
        getDefaultMap: getDefaultMap,
        makeGeoJSONLayer: makeGeoJSONLayer,
        Popup: Popup
    }
});
