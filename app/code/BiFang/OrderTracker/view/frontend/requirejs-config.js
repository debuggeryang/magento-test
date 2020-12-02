/**
 * Magento Test
 */
var config = {
    paths: {
        'mapbox': 'BiFang_OrderTracker/js/mapbox',
        'mapboxGL': 'BiFang_OrderTracker/js/mapbox/mapbox-gl',
        "bootstrap": "BiFang_OrderTracker/js/bootstrap/bootstrap.bundle.min",
    },
    shim: {
        'mapbox': ['mapboxGL'],
    }
};
