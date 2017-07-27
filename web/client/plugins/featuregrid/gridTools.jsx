const React = require('react');
const bbox = require('@turf/bbox');
const {zoomToExtent} = require('../../actions/map');
const {Glyphicon} = require('react-bootstrap');
module.exports = [{
        name: '',
        key: "geometry",
        width: 35,
        locked: true,
        events: {
            onClick: (p, opts, describe, {crs}= {}) => {
                return p.geometry ? zoomToExtent(bbox(p), crs || "EPSG:4326") : {type: "NONE"};
            }
        },
        formatter: ({value} = {}) => value ? <Glyphicon glyph="zoom-to" /> : <Glyphicon glyph="plus" />
}];
