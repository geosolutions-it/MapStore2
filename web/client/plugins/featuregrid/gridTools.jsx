const React = require('react');
const bbox = require('@turf/bbox');
const {zoomToExtent} = require('../../actions/map');
const Message = require('../../components/I18N/Message');
const {Glyphicon, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../../components/misc/OverlayTrigger');

module.exports = [{
    name: '',
    key: "geometry",
    width: 35,
    frozen: true,
    events: {
        onClick: (p, opts, describe, {crs} = {}) => {
            return p.geometry ? zoomToExtent(bbox(p), crs || "EPSG:4326") : {type: "NONE"};
        }
    },
    formatter: ({value} = {}) => value ? <Glyphicon glyph="zoom-to" /> :
        <OverlayTrigger placement="top" overlay={<Tooltip id="fe-save-features"><Message msgId="featuregrid.missingGeometry"/></Tooltip>}>
            <Glyphicon glyph="exclamation-mark" />
        </OverlayTrigger>
}];
