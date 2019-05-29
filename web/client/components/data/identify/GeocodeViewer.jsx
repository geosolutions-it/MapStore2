/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ResizableModal = require('../../misc/ResizableModal');
const Portal = require('../../misc/Portal');
const Message = require('../../I18N/Message');
const {Glyphicon, Row, Col} = require('react-bootstrap');

/**
 * Component for rendering lat and lng of the current selected point
 * @memberof components.data.identify
 * @name GeocodeViewer
 * @class
 * @prop {bool} enableRevGeocode enable/disable the component
 * @prop {function} hideRevGeocode called when click on close buttons
 * @prop {bool} showModalReverse show/hide modal
 * @prop {node} revGeocodeDisplayName text/info displayed on modal
 */

module.exports = ({latlng, enableRevGeocode, hideRevGeocode = () => {}, showModalReverse, revGeocodeDisplayName}) => {

    let lngCorrected = null;
    if (latlng) {
        /* lngCorrected is the converted longitude in order to have the value between
        the range (-180 / +180).*/
        lngCorrected = latlng && Math.round(latlng.lng * 100000) / 100000;
        /* the following formula apply the converion */
        lngCorrected = lngCorrected - 360 * Math.floor(lngCorrected / 360 + 0.5);
    }

    return enableRevGeocode && latlng && lngCorrected ? (
        <Row key="ms-geocode-coords" className="ms-geoscode-viewer text-center">
            <Col xs={12}>
                <div className="ms-geocode-coords">{latlng ? 'Lat: ' + (Math.round(latlng.lat * 100000) / 100000) + '- Long: ' + lngCorrected : null}</div>
            </Col>
            <Portal>
                <ResizableModal
                    fade
                    title={<span><Glyphicon glyph="map-marker"/>&nbsp;<Message msgId="identifyRevGeocodeModalTitle" /></span>}
                    size="xs"
                    show={showModalReverse}
                    onClose={hideRevGeocode}
                    buttons={[{
                        text: <Message msgId="close"/>,
                        onClick: hideRevGeocode,
                        bsStyle: 'primary'
                    }]}>
                    <div className="ms-alert" style={{padding: 15}}>
                        <div className="ms-alert-center text-center">
                            <div>{revGeocodeDisplayName}</div>
                        </div>
                    </div>
                </ResizableModal>
            </Portal>
        </Row>
    ) : null;
};
