var edgeLayerGroup = new L.LayerGroup().addTo(map);
var lines = [];
var mcolor;
d3.csv('static/data/SanFrancisco_edges.csv', function(error, data) {
    d3.csv('static/data/map.csv', function(error, mdata) {
        if (error) throw error;
        for(var n = 0; n < 4468; n++) {
            if (mdata[n].tci > 0 && mdata[n].tci <= 0.7) {
                mcolor = getColor(mdata[n].tci)
                var geometry = data[n].geometry.slice(12, data[n].geometry.length - 1);
                var slice = geometry.split(', ')
                var polylineGeometrys = []
                for (var i=0; i < slice.length; i++) {
                    var location = slice[i].split(' ');
                    polylineGeometrys.push([location[1], location[0]])
                }
                var m_polyline = new L.polyline(polylineGeometrys, {
                    color: mcolor,
                    weight: 5,
                    opacity: 1,
                    customData: {
                        edge_index: n,
                        edge_osmid: data[n].osmid,
                        edge_length: data[n].length
                    }
                })
                edgeLayerGroup.addLayer(m_polyline)
                }
            }
    })
})

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