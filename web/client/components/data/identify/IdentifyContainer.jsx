/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Row, Col} = require('react-bootstrap');
const Toolbar = require('../../misc/toolbar/Toolbar');
const Message = require('../../I18N/Message');
const MapInfoUtils = require('../../../utils/MapInfoUtils');
const DockablePanel = require('../../misc/panels/DockablePanel');
const GeocodeViewer = require('./GeocodeViewer');
const ResizableModal = require('../../misc/ResizableModal');
const Portal = require('../../misc/Portal');

/**
 * Component for rendering Identify Container inside a Dockable contanier
 * @memberof components.data.identify
 * @name IdentifyContainer
 * @class
 * @prop {dock} dock switch between Dockable Panel and Resizable Modal, default true (DockPanel)
 * @prop {function} viewer component that will be used as viewer of Identify
 * @prop {object} viewerOptions options to use with the viewer, eg { header: MyHeader, container: MyContainer }
 * @prop {function} getButtons must return an array of object representing the toolbar buttons, eg (props) => [{ glyph: 'info-sign', tooltip: 'hello!'}]
 */

module.exports = props => {
    const {
        enabled,
        requests = [],
        onClose,
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
        setIndex,
        warning,
        clearWarning,
        zIndex
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
        <div>
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
                zIndex={zIndex}
                header={[
                    <GeocodeViewer latlng={latlng} revGeocodeDisplayName={revGeocodeDisplayName} {...props}/>,
                    buttons.length > 0 ? (
                    <Row className="text-center">
                        <Col xs={12}>
                            <Toolbar
                                btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                                buttons={buttons}/>
                        </Col>
                    </Row>) : null
                ].filter(headRow => headRow)}>
                <Viewer
                    index={index}
                    setIndex={setIndex}
                    format={format}
                    missingResponses={missingResponses}
                    responses={responses}
                    {...viewerOptions}/>
            </DockablePanel>
            <Portal>
                <ResizableModal
                    fade
                    title={<Message msgId="warning"/>}
                    size="xs"
                    show={warning}
                    onClose={clearWarning}
                    buttons={[{
                        text: <Message msgId="close"/>,
                        onClick: clearWarning,
                        bsStyle: 'primary'
                    }]}>
                    <div className="ms-alert" style={{padding: 15}}>
                        <div className="ms-alert-center text-center">
                            <Message msgId="identifyNoQueryableLayers"/>
                        </div>
                    </div>
                </ResizableModal>
            </Portal>
        </div>
    );
};
