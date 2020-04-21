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
const DockablePanel = require('../../misc/panels/DockablePanel');
const GeocodeViewer = require('./GeocodeViewer');
const ResizableModal = require('../../misc/ResizableModal');
const Portal = require('../../misc/Portal');
const Coordinate = require('./coordinates/Coordinate');
/**
 * Component for rendering Identify Container inside a Dockable container
 * @memberof components.data.identify
 * @name IdentifyContainer
 * @class
 * @prop {dock} dock switch between Dockable Panel and Resizable Modal, default true (DockPanel)
 * @prop {function} viewer component that will be used as viewer of Identify
 * @prop {object} viewerOptions options to use with the viewer, eg { header: MyHeader, container: MyContainer }
 * @prop {function} getToolButtons must return an array of object representing the toolbar buttons, eg (props) => [{ glyph: 'info-sign', tooltip: 'hello!'}]
 * @prop {function} getNavigationButtons must return an array of navigation buttons, eg (props) => [{ glyph: 'info-sign', tooltip: 'hello!'}]
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
        validResponses = [],
        viewer = () => null,
        getToolButtons = () => [],
        getNavigationButtons = () => [],
        showFullscreen,
        reverseGeocodeData = {},
        point,
        dockStyle = {},
        draggable,
        setIndex,
        warning,
        clearWarning,
        zIndex,
        showEmptyMessageGFI,
        // coord editor props
        enabledCoordEditorButton,
        showCoordinateEditor,
        onSubmitClickPoint,
        onChangeFormat,
        formatCoord
    } = props;

    const latlng = point && point.latlng || null;

    let lngCorrected = null;
    if (latlng) {
        /* lngCorrected is the converted longitude in order to have the value between
         * the range (-180 / +180).
         * Precision has to be >= than the coordinate editor precision
         * especially in the case of aeronautical degree edito which is 12
        */
        lngCorrected = latlng && Math.round(latlng.lng * 100000000000000000) / 100000000000000000;
        /* the following formula apply the converion */
        lngCorrected = lngCorrected - 360 * Math.floor(lngCorrected / 360 + 0.5);
    }
    const Viewer = viewer;
    // TODO: put all the header (Toolbar, navigation, coordinate editor) outside the container
    const toolButtons = getToolButtons({...props, lngCorrected, validResponses, latlng});
    const missingResponses = requests.length - responses.length;
    const revGeocodeDisplayName = reverseGeocodeData.error ? <Message msgId="identifyRevGeocodeError"/> : reverseGeocodeData.display_name;
    return (
        <div id="identify-container" className={enabled && requests.length !== 0 ? "identify-active" : ""}>
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
                    <Coordinate
                        key="coordinate-editor"
                        formatCoord={formatCoord}
                        enabledCoordEditorButton={enabledCoordEditorButton}
                        onSubmit={onSubmitClickPoint}
                        onChangeFormat={onChangeFormat}
                        edit={showCoordinateEditor}
                        coordinate={{
                            lat: latlng && latlng.lat,
                            lon: lngCorrected
                        }}
                    />,
                    <GeocodeViewer latlng={latlng} revGeocodeDisplayName={revGeocodeDisplayName} {...props}/>,
                    <Row key="button-row" className="text-center" style={{position: 'relative'}}>
                        <Col key="tools" xs={12}>
                            <Toolbar
                                btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                                buttons={toolButtons}
                                transitionProps={null
                                    /* transitions was causing a bad rendering of toolbar present in the identify panel
                                         * for this reason they ahve been disabled
                                        */
                                }/>
                        </Col>
                        <div key="navigation" style={{
                            zIndex: 1,
                            position: "absolute",
                            right: 0,
                            top: 0,
                            margin: "0 10px"
                        }}>
                            <Toolbar
                                btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                                buttons={getNavigationButtons(props)}
                                transitionProps={null /* same here */}
                            />
                        </div>
                    </Row>
                ].filter(headRow => headRow)}>
                <Viewer
                    index={index}
                    setIndex={setIndex}
                    format={format}
                    missingResponses={missingResponses}
                    responses={responses}
                    showEmptyMessageGFI={showEmptyMessageGFI}
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
