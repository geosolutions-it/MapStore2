import React from 'react';
import bbox from '@turf/bbox';
import { zoomToExtent } from '../../actions/map';
import Message from '../../components/I18N/Message';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../components/misc/OverlayTrigger';

export default [{
    name: '',
    key: "geometry",
    width: 35,
    frozen: true,
    events: {
        onClick: (p, opts, describe, {crs, maxZoom} = {}) => {
            return p.geometry ? zoomToExtent(bbox(p), crs || "EPSG:4326", maxZoom) : {type: "NONE"};
        }
    },
    formatter: ({value} = {}) => value ? <Glyphicon glyph="zoom-to" /> :
        <OverlayTrigger placement="top" overlay={<Tooltip id="fe-save-features"><Message msgId="featuregrid.missingGeometry"/></Tooltip>}>
            <Glyphicon glyph="exclamation-mark" />
        </OverlayTrigger>
}];
