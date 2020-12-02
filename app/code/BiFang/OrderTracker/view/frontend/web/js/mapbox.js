define([
    'jquery',
    'mapboxGL'
], function($, mapboxgl) {
    'use strict';
    $.ajaxSetup({'cache':true});

    return function(config, element) {
        var errMsg = '';
        // mapboxgl.accessToken = config.accessToken;

        const routePoints = [
          { class: 'carrier', coordinates: [] },
          { class: 'destination',coordinates: [] }
        ];


        loadPoint(config.from, 
          (coordinates) => routePoints[0].coordinates = coordinates, 
          () => errMsg = 'Sorry, we cannot locate the store address.'
        );

        loadPoint(config.destination, 
          (coordinates) => routePoints[1].coordinates = coordinates, 
          () => errMsg = 'Sorry, we cannot locate your address.'
        );

        var waitRoutePoints = setInterval(() => {
          if (routePoints[0].coordinates.length && routePoints[1].coordinates.length) {
            loadMap();
            clearInterval(waitRoutePoints);
          }
          if (errMsg) {
            console.log(errMsg);
            clearInterval(waitRoutePoints);
          }
        }, 500);



        function loadMap() {
          
          const center = [
              (routePoints[0].coordinates[0] + routePoints[1].coordinates[0]) / 2,
              (routePoints[0].coordinates[1] + routePoints[1].coordinates[1]) / 2
          ];
          mapboxgl.accessToken = config.accessToken;
          try {
            var map = new mapboxgl.Map({
                container: 'order-track-map',
                style: 'mapbox://styles/mapbox/streets-v11', 
                center: center, 
                zoom: 12
            });
          } catch (error) {
            console.log(error);
            return;
          }

          routePoints.forEach((routePoint) => {
              let el = document.createElement('div');
              el.className = routePoint.class;
              new mapboxgl.Marker(el)
                  .setLngLat(routePoint.coordinates)
                  .addTo(map);
          });

          setTimeout(() => {
            map.on('load', () => {
              $.ajax({
                  url: 'https://api.mapbox.com/directions/v5/mapbox/driving-traffic/' + 
                          routePoints[0].coordinates.toString() +
                          ';' +
                          routePoints[1].coordinates.toString() +
                          '?geometries=geojson' +
                          '&access_token=' + config.accessToken,
                          // '&depart_at=' + config.dispatchTime.substring(0,16),
                  type: 'GET'
              }).done((data) => {
                  if (data.code && data.code === 'Ok') {
                      console.log(data);
                      let dispatchTime = new Date(config.dispatchTime);
                      const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
                      dispatchTime.setSeconds(dispatchTime.getSeconds() + data.routes[0].duration);
                      $('#eta').html(dispatchTime.toLocaleDateString('en-AU', dateOptions));
                      let distanceKm = Math.ceil(data.routes[0].distance / 100) / 10;
                      $('#distance').html(distanceKm.toFixed(1) + 'km');
                      loadRoute(map, data.routes[0]);
                  } else {
                      console.log('Can\'t get any route.' + (data.code ? (' Error Code: ' + data.code) : ''));
                  }
              }).fail((error) => {
                  console.log(error);
                  console.log(error.responseJSON.message);
              });
            });
          },2000);
          
        }
        
        function loadPoint(address, success, failure) {
          $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                    address + 
                    '.json?access_token='+ config.accessToken,
            type: 'GET'
          }).done((data) => {
            if(data.features) {
              const feature = data.features.find(feature => feature.place_type == 'address');
              if (feature) {
                success(feature.center);
              } else {
                failure();
              }
            }
          }).fail((error) => {
            failure();
          });
        }

        function loadRoute(map, route) {
            let geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: route.geometry.coordinates
                }
            };
            if (map.getSource('route')) {
                map.getSource('route').setData(geojson);
            } else {
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                      type: 'geojson',
                      data: geojson,
                    },
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round'
                    },
                    paint: {
                      'line-color': '#3887be',
                      'line-width': 5,
                      'line-opacity': 0.75
                    }
                });
            }
            var coordinates = route.geometry.coordinates;
            var bounds = coordinates.reduce(function (bounds, coord) {
              return bounds.extend(coord);
              }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            map.fitBounds(bounds, { padding: 50});
        }

    }
});
