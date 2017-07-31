module.exports = {
    pointFt: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [40, -30]
        },
        id: "point",
        properties: {}
    },
    lineStringFt: {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [[40, -30], [41, -30]]
        },
        id: "linestring",
        properties: {}
    },
    polygonFt: {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[[40, -30], [41, -31], [43, -32], [40, -30]]]
        },
        id: "polygon",
        properties: {}
    },
    multipointFt: {
        type: "Feature",
        geometry: {
            type: "MultiPoint",
            coordinates: [[40, -30]]
        },
        id: "multipoint",
        properties: {}
    },
    multilineStringFt: {
        type: "Feature",
        geometry: {
            type: "MultiLineString",
            coordinates: [[[40, -30], [41, -30]]]
        },
        id: "multilinestring",
        properties: {}
    },
    multipolygonFt: {
        type: "Feature",
        geometry: {
            type: "MultiPolygon",
            coordinates: [[[[40, -30], [41, -31], [43, -32], [40, -30]]]]
        },
        id: "multipolygon",
        properties: {}
    }
};
