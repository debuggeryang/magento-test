define([
    'jquery',
    'mapboxGL'
], function($, mapboxgl) {
    'use strict';
    $.ajaxSetup({'cache':true});

    return function(config, element) {
        var altMsg = 'You can find more parcel details in your order record.';
        var altDisplay = false;

        const routePoints = [
          { class: 'carrier', coordinates: [] },
          { class: 'destination',coordinates: [] }
        ];


        loadPoint(config.from, 
          (coordinates) => routePoints[0].coordinates = coordinates, 
          () => altDisplay = true
        );

        loadPoint(config.destination, 
          (coordinates) => routePoints[1].coordinates = coordinates, 
          () => altDisplay = true
        );

        var waitRoutePoints = setInterval(() => {
          if (routePoints[0].coordinates.length && routePoints[1].coordinates.length) {
            loadMap();
            clearInterval(waitRoutePoints);
          }
          if (altDisplay) {
            $('#alt-msg').html(altMsg);
            clearInterval(waitRoutePoints);
          }
        }, 500);



        function loadMap() {
          
          const center = [
              (routePoints[0].coordinates[0] + routePoints[1].coordinates[0]) / 2,
              (routePoints[0].coordinates[1] + routePoints[1].coordinates[1]) / 2
          ];
          mapboxgl.accessToken = config.accessToken;

          var map = new mapboxgl.Map({
              container: 'order-track-map',
              style: 'mapbox://styles/mapbox/streets-v11', 
              center: center, 
              zoom: 5
          });


          map.addControl(new mapboxgl.NavigationControl());
          map.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true
              },
              trackUserLocation: true
            })
          );

          routePoints.forEach((routePoint) => {
              let el = document.createElement('div');
              el.className = routePoint.class;
              routePoint.marker = new mapboxgl.Marker(el)
                  .setLngLat(routePoint.coordinates)
                  .addTo(map);
              
          });

          setTimeout(() => {
            map.on('load', () => {
              loadRoute(map, routePoints);
              if (config.dispatchNow) loadTraffic(map);
            });
          },500);
          
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


        function loadRoute(map, routePoints) {
        
          $.ajax({
            url: 'https://api.mapbox.com/directions/v5/mapbox/' + 
                    (config.dispatchNow ? 'driving-traffic/' : 'driving/') +
                    routePoints[0].coordinates.toString() + ';' + routePoints[1].coordinates.toString() +
                    '?geometries=geojson' +
                    '&access_token=' + config.accessToken,
            type: 'GET'
          }).done((data) => {
            if (data.code && data.code === 'Ok') {
                let dispatchTime = new Date(config.dispatchTime);
                dispatchTime.setSeconds(dispatchTime.getSeconds() + data.routes[0].duration);
                let eta = dispatchTime.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
                let distance = (Math.ceil(data.routes[0].distance / 100) / 10).toFixed(1) + 'km';
                routePoints[1].marker.setPopup(new mapboxgl.Popup({offset: 25}).setText('Your parcel destination'));
                routePoints[0].marker.setPopup(new mapboxgl.Popup({offset: 25}).setText('Within ' + distance + '. Estimated to arrive on ' + eta + '.'));
                let geojson = {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: data.routes[0].geometry.coordinates
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
                        'line-color': '#172dd3',
                        'line-width': 5,
                        'line-opacity': 0.75
                      }
                  });
              }
              var coordinates = data.routes[0].geometry.coordinates;
              var bounds = coordinates.reduce(function (bounds, coord) {
                return bounds.extend(coord);
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
              map.fitBounds(bounds, { padding: 60});

            } else {
              $('#alt-msg').addClass('err-msg');
              $("#alt-msg").html('Sorry, we can\'t locate your order on the map, but we have sent you an email with more order details.' + (data.code ? (' Error Code: ' + data.code) : ''));
            }
          }).fail((error) => {
            console.log(error);
            $('#alt-msg').addClass('err-msg');
            $("#alt-msg").html('Sorry, we can\'t locate your order on the map, but we have sent you an email with more order details.');
          });
        }

        function loadTraffic(map) {
          map.addSource('trafficSource', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-traffic-v1'
          });
          map.addLayer({
            "id": "traffic",
            "source": "trafficSource",
            "source-layer": "traffic",
            "type": "line",
              "paint": {
                        "line-width": 1.5,
                          "line-color": [
                            "case",
                            [
                              "==",
                              "low",
                              [
                                "get",
                                "congestion"
                              ]
                            ],
                            "#65c51f",
                            [
                              "==",
                              "moderate",
                              [
                                "get",
                                "congestion"
                              ]
                            ],
                            "#e5fb42",
                            [
                              "==",
                              "heavy",
                              [
                                "get",
                                "congestion"
                              ]
                            ],
                            "#ee8d00",
                            [
                              "==",
                              "severe",
                              [
                                "get",
                                "congestion"
                              ]
                            ],
                            "#ac0550",
                            "#000000"
                          ]
            }
          });
        }


    }
});
