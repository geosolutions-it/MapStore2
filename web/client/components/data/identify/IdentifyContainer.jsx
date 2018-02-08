/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon, Row, Col} = require('react-bootstrap');
const Toolbar = require('../../misc/toolbar/Toolbar');
const ResizableModal = require('../../misc/ResizableModal');
const Portal = require('../../misc/Portal');
const Message = require('../../I18N/Message');
const MapInfoUtils = require('../../../utils/MapInfoUtils');
const DockablePanel = require('../../misc/panels/DockablePanel');

module.exports = props => {
    const {
        enableRevGeocode,
        enabled,
        requests = [],
        onClose,
        showModalReverse,
        hideRevGeocode,
        responses = [],
        index,
        viewerOptions = {},
        format,
        dock = true,
        position,
        size,
        fluid,
        validator = MapInfoUtils.getValidator,
        viewer = () => null,
        getButtons = () => [],
        showFullscreen,
        reverseGeocodeData = {},
        point,
        dockStyle = {},
        draggable,
        setIndex
    } = props;

    const latlng = point && point.latlng || null;

    let lngCorrected = null;
    if (latlng) {
        /* lngCorrected is the converted longitude in order to have the value between
        the range (-180 / +180).*/
        lngCorrected = latlng && Math.round(latlng.lng * 100000) / 100000;
        /* the following formula apply the converion */
        lngCorrected = lngCorrected - 360 * Math.floor(lngCorrected / 360 + 0.5);
    }

    const validatorFormat = validator(format);
    const validResponses = validatorFormat.getValidResponses(responses);
    const Viewer = viewer;
    const buttons = getButtons({...props, lngCorrected, validResponses, latlng});
    const missingResponses = requests.length - responses.length;
    const revGeocodeDisplayName = reverseGeocodeData.error ? <Message msgId="identifyRevGeocodeError"/> : reverseGeocodeData.display_name;

    return (
        <span>
            <DockablePanel
                bsStyle="primary"
                glyph="map-marker"
                title={!viewerOptions.header ? validResponses[index] && validResponses[index].layerMetadata && validResponses[index].layerMetadata.title || '' : <Message msgId="identifyTitle" />}
                open={enabled && requests.length !== 0}
                size={size}
                fluid={fluid}
                position={position}
                draggable={draggable}
                onClose={onClose}
                dock={dock}
                style={dockStyle}
                showFullscreen={showFullscreen}
                header={[
                    // verify if header or geocode exists to add toolbar header
                    viewerOptions.header && !enableRevGeocode ? null :
                    // geocode viewer
                    <Row key="ms-geocode-coords" className="text-center">
                        {enableRevGeocode && <Col xs={12}>
                            <div className="ms-geocode-coords">{latlng ? 'Lat: ' + (Math.round(latlng.lat * 100000) / 100000) + '- Long: ' + lngCorrected : null}</div>
                        </Col>}
                        {buttons.length > 0 && <Col xs={12}>
                            <Toolbar
                                btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                                buttons={buttons}/>
                        </Col>}
                    </Row>].filter(headRow => headRow)}>
                    <Viewer
                        index={index}
                        setIndex={setIndex}
                        format={format}
                        missingResponses={missingResponses}
                        responses={responses}
                        {...viewerOptions}/>
            </DockablePanel>
            {enableRevGeocode &&
            // geocode modal
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
            </Portal>}
        </span>
    );
};
