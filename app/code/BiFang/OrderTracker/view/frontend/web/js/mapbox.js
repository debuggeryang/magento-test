define([
    'jquery',
    'mapboxGL'
], function($, mapboxgl) {
    'use strict';
    return function(config, element) {
        console.log("Hello");
        mapboxgl.accessToken = "pk.eyJ1IjoiZGVidWdnZXJ5YW5nIiwiYSI6ImNraTA4ZmpzOTFiYmIycXRob2wxajlwOW8ifQ.8qdYPNJ_YnIExDIdleL5Eg";
        var map = new mapboxgl.Map({
            container: 'order-track-map', // container id
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [145.08284239881036,-37.88752888327519], // starting position [lng, lat]
            zoom: 10 // starting zoom
        });
        var marker = new mapboxgl.Marker()
            .setLngLat([145.08284239881036,-37.88752888327519])
            .addTo(map);
    }
});
  