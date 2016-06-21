/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = React.PropTypes;
const {Modal, Button} = require('react-bootstrap');

const GeocodeViewer = (props) => {
    return (
        <div>
            <span>Lat: {Math.round(props.latlng.lat * 100000) / 100000 } - Long: {Math.round(props.latlng.lng * 100000) / 100000}</span>
            <Button
                style={{"float": "right"}}
                bsStyle="primary"
                bsSize="small"
                onClick={() => props.showRevGeocode(props.latlng)} >
                {props.identifyRevGeocodeSubmitText}
            </Button>
            <Modal {...props.modalOptions} show={props.showModalReverse} bsSize="large" container={document.getElementById("body")}>
                <Modal.Header>
                    <Modal.Title>{props.identifyRevGeocodeModalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <p>{props.revGeocodeDisplayName}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsSize="small" style={{"float": "right"}} bsStyle="primary" onClick={props.hideRevGeocode}>{props.identifyRevGeocodeCloseText}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

GeocodeViewer.propTypes = {
    latlng: PropTypes.object.isRequired,
    showRevGeocode: PropTypes.func.isRequired,
    showModalReverse: PropTypes.bool.isRequired,
    identifyRevGeocodeModalTitle: PropTypes.string.isRequired,
    revGeocodeDisplayName: PropTypes.object.isRequired,
    hideRevGeocode: PropTypes.func.isRequired,
    identifyRevGeocodeSubmitText: PropTypes.string.isRequired,
    identifyRevGeocodeCloseText: PropTypes.string.isRequired,
    modalOptions: React.PropTypes.object
};

GeocodeViewer.defaultProps = {
    modalOptions: {}
};

module.exports = GeocodeViewer;
