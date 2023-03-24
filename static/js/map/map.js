L.mapbox.accessToken = 'pk.eyJ1Ijoic2VvbmdidW0iLCJhIjoiY2xmMTM0czN4MDFqMzN4bmQ3enQ4YWY3MCJ9.P7jBRrMB0r4ImDGPJUwPNg';

// Detect color scheme
var isDarkReaderEnabled =
    "querySelector" in document &&
    !!document.querySelector("meta[name=darkreader]");
mapStyle = 'mapbox://styles/seongbum/clf14nuri007q01nzhkzyq37x';
if (isDarkReaderEnabled) {
    mapStyle = 'mapbox://styles/seongbum/clfajemdk000a01jvrk8ineb6';
    console.log("dark theme enabled")
}

var map = L.mapbox.map('map', null, { renderer: L.canvas() })
    .setView([37.7938262, -122.41103158], 15)
    .addLayer(L.mapbox.styleLayer(mapStyle));

map.legendControl.addLegend(document.getElementById('legend').innerHTML);
var featureGroup = L.featureGroup().addTo(map);
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: featureGroup
    },
    draw: {
        polygon: {
            shapeOptions: {
                fill: false
            }
        },
        polyline: false,
        rectangle: {
            shapeOptions: {
                fill: false
            }
        },
        circle: {
            shapeOptions: {
                fill: false
            }
        },
        marker: false
    }
}).addTo(map);

map.on('draw:created', showPolygonArea);
map.on('draw:edited', onPolygonAreaEdited);
map.on('draw:deleted', onPolygonAreaDeleted);

function onPolygonAreaDeleted(e) {
    $(".open-inspector:not(.template)").remove();
}

function onPolygonAreaEdited(e) {
    $(".open-inspector:not(.template)").remove();
    e.layers.eachLayer(function (layer) {
        showPolygonArea({ layer: layer });
    });
}

var layerset = new Array(3);

function showPolygonArea(e) {
    $(".open-inspector:not(.template)").remove();

    var layer = e.layer;

    featureGroup.clearLayers();

    layerset[0] = layer;
    featureGroup.addLayer(layer);
    if ("_latlngs" in layer) {
        var bbox = [-122.4259, 37.8117, -122.3813, 37.7680]
        var cellSide = 0.2;
        var options = { units: 'kilometers' };
        var hexgrid = turf.squareGrid(bbox, cellSide, options);

        var test2 = [];
        var polyList = [];
        test2.push(polyList)
        for (var i = 0; i < layer._latlngs[0].length; i++) {
            polyList.push([layer._latlngs[0][i].lng, layer._latlngs[0][i].lat])
        }
        polyList.push([layer._latlngs[0][0].lng, layer._latlngs[0][0].lat])

        let poly2 = turf.polygon(test2);


        _.each(hexgrid.features, function (hex) {
            var intersection = turf.intersect(poly2, hex.geometry);
            if (intersection) {
                hex.geometry = intersection.geometry;
            } else {
                hex.geometry = { type: "Polygon", coordinates: [] }
            }
        })

        var geoHexgrid = L.geoJSON(hexgrid, {
            style: function (feature) {
                return {
                    weight: 1,
                    fillColor: false
                };
            },
            onEachFeature: function onEachFeature(featureData, featureLayer) {

                featureLayer.on('click', function () {
                    geoHexgrid.setStyle({
                        weight: 1
                    })
                    d3.csv('static/data/SanFrancisco_edges.csv', function (error, data) {
                        d3.csv('static/data/map.csv', function (error, mdata) {
                            if (error) throw error;
                            var x1 = 0, x2 = 100
                            for (var i = 0; i < 4; i++) {
                                if (featureLayer._latlngs[0][i].lat > x1) {
                                    x1 = featureLayer._latlngs[0][i].lat
                                }
                                if (featureLayer._latlngs[0][i].lat < x2) {
                                    x2 = featureLayer._latlngs[0][i].lat
                                }
                            }
                            var y1 = -130, y2 = -100
                            for (var i = 0; i < 4; i++) {
                                if (featureLayer._latlngs[0][i].lng > y1) {
                                    y1 = featureLayer._latlngs[0][i].lng
                                }
                                if (featureLayer._latlngs[0][i].lng < y2) {
                                    y2 = featureLayer._latlngs[0][i].lng
                                }
                            }
                            var cnt = 0, sum = 0
                            for (var i = 0; i < 4468; i++) {
                                var geometry = data[i].geometry.slice(12, data[i].geometry.length - 1);
                                var slice = geometry.split(', ')
                                var center = [0, 0]
                                var location = slice[0].split(' ');
                                center[0] += parseFloat(location[1]);
                                center[1] += parseFloat(location[0]);
                                location = slice[slice.length - 1].split(' ');
                                center[0] += parseFloat(location[1]);
                                center[1] += parseFloat(location[0]);
                                center[0] /= 2;
                                center[1] /= 2;

                                if (center[0] > x2 && center[0] < x1 && center[1] > y2 && center[1] < y1) {
                                    if (mdata[i].tci > 0 && mdata[i].tci <= 1) {
                                        cnt += 1
                                        sum += parseFloat(mdata[i].tci)
                                    }
                                }
                            }
                            console.log(sum / cnt)
                            if (cnt != 0) {
                                featureLayer.setStyle({
                                    fillColor: getColor(sum / cnt),
                                    fillOpacity: 0.6
                                })
                            }
                        })
                    })
                    /*featureLayer.setStyle({
                        weight: 5
                    })*/
                });
            }
        });
        layerset[1] = poly2;
        layerset[2] = geoHexgrid;

        $("#inspector").trigger("add_button", [map, poly2]);
    }
    else {
        var bbox = [-122.4259, 37.8117, -122.3813, 37.7680]
        var center = [layer._latlng.lng, layer._latlng.lat];
        var radius = layer._mRadius;
        var coptions = { steps: 80, units: 'meters' };
        var circle = turf.circle(center, radius, coptions);
        var cellSide = 0.2;
        var options = { units: 'kilometers' };
        var hexgrid = turf.squareGrid(bbox, cellSide, options);

        _.each(hexgrid.features, function (hex) {
            var intersection = turf.intersect(circle, hex.geometry);
            if (intersection) {
                hex.geometry = intersection.geometry;
            } else {
                hex.geometry = { type: "Polygon", coordinates: [] }
            }
        })
        var geoHexgrid = L.geoJSON(hexgrid, {
            style: function (feature) {
                return {
                    weight: 1,
                    fillColor: getColor(37),
                    fillOpacity: 0.3,
                    color: 'black'
                };
            },
            onEachFeature: function onEachFeature(featureData, featureLayer) {
                featureLayer.on('click', function () {
                    geoHexgrid.setStyle({
                        weight: 1
                    })
                    featureLayer.setStyle({
                        weight: 5
                    })
                });
            }
        });
        layerset[1] = circle;
        layerset[2] = geoHexgrid;
    }
}

function getColor(d) {
    if (d <= 1 && d > 0.8) {
        return "#FF000000"
    } else if (d <= 0.8 && d > 0.6) {
        return "#feafaf";
    } else if (d <= 0.6 && d > 0.4) {
        return "#Fe807f";
    } else if (d <= 0.4 && d > 0.2) {
        return "#Fd403f";
    } else if (d <= 0.2 && d > 0) {
        return "#FD0100";
    }
}
