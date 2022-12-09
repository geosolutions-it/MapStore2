/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import {Row} from 'react-bootstrap';
import { get } from 'lodash';
import Toolbar from '../../misc/toolbar/Toolbar';
import Message from '../../I18N/Message';
import GeocodeViewer from './GeocodeViewer';
import ResizableModal from '../../misc/ResizableModal';
import Portal from '../../misc/Portal';
import Coordinate from './coordinates/Coordinate';
import { responseValidForEdit } from '../../../utils/IdentifyUtils';
import LayerSelector from './LayerSelector';
import ResponsivePanel from "../../misc/panels/ResponsivePanel";

/**
 * Component for rendering Identify Container inside a Dockable container
 * @memberof components.data.identify
 * @name IdentifyContainer
 * @class
 * @prop {dock} dock switch between Dockable Panel and Resizable Modal, default true (DockPanel)
 * @prop {function} viewer component that will be used as viewer of Identify
 * @prop {object} viewerOptions options to use with the viewer, eg { header: MyHeader, container: MyContainer }
 * @prop {function} getToolButtons must return an array of object representing the toolbar buttons, eg (props) => [{ glyph: 'info-sign', tooltip: 'hello!'}]
 * @prop {function} getFeatureButtons must return an array of buttons relating to feature interaction, eg (props) => [{ glyph: 'zoom-to', tooltip: 'Zoom to Extent'}]
 */
export default props => {
    const {
        enabled,
        requests = [],
        onClose = () => {},
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
        getFeatureButtons = () => [],
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
        showEdit,
        isEditingAllowed,
        onEdit = () => {},
        // coord editor props
        enabledCoordEditorButton,
        showCoordinateEditor,
        onSubmitClickPoint,
        onChangeFormat,
        formatCoord,
        loaded,
        validator = () => null,
        toggleHighlightFeature = () => {},
        disableCoordinatesRow,
        disableInfoAlert
    } = props;
    const latlng = point && point.latlng || null;

    // Layer selector allows only selection of valid response's index, so target response will always be valid.
    const targetResponse = responses[index];
    const {layer} = targetResponse || {};

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
    const toolButtons = getToolButtons({
        ...props,
        lngCorrected,
        validResponses,
        latlng,
        showEdit: showEdit && isEditingAllowed && !!targetResponse && responseValidForEdit(targetResponse),
        onEdit: onEdit.bind(null, layer && {
            id: layer.id,
            name: layer.name,
            url: get(layer, 'search.url')
        })
    });
    const emptyResponses = requests.length === validator(format)?.getNoValidResponses(responses)?.length || 0;
    const missingResponses = requests.length - responses.length;
    const revGeocodeDisplayName = reverseGeocodeData.error ? <Message msgId="identifyRevGeocodeError"/> : reverseGeocodeData.display_name;
    return (
        <ResponsivePanel
            containerStyle={dockStyle}
            containerId="identify-container"
            containerClassName={enabled && requests.length !== 0 ? "identify-active" : ""}
            bsStyle="primary"
            glyph="map-marker"
            open={enabled && requests.length !== 0}
            size={size}
            fluid={fluid}
            position={position}
            draggable={draggable}
            onClose={() => {
                onClose();
                toggleHighlightFeature(false);
            }}
            dock={dock}
            style={dockStyle}
            showFullscreen={showFullscreen}
            zIndex={zIndex}
            header={[
                <Row className="layer-select-row">
                    <div className="layer-col">
                        <span className="identify-icon glyphicon glyphicon-1-layer"/>
                        <LayerSelector
                            responses={responses}
                            index={index}
                            loaded={loaded}
                            setIndex={setIndex}
                            missingResponses={missingResponses}
                            emptyResponses={emptyResponses}
                            validator={validator}
                            format={format}
                        />
                        <Toolbar
                            btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                            buttons={getFeatureButtons(props)}
                            transitionProps={null}
                        />
                    </div>
                </Row>,
                !disableCoordinatesRow &&
                (<Row className="coordinates-edit-row">
                    <span className="identify-icon glyphicon glyphicon-point"/>
                    <div style={showCoordinateEditor ? {zIndex: 1} : {}} className={"coordinate-editor"}>
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
                        />
                    </div>
                    <GeocodeViewer latlng={latlng} revGeocodeDisplayName={revGeocodeDisplayName} {...props}/>
                    <Toolbar
                        btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                        buttons={toolButtons}
                        transitionProps={null
                            /* transitions was causing a bad rendering of toolbar present in the identify panel
                                 * for this reason they ahve been disabled
                                */
                        }/>
                </Row>)
            ].filter(headRow => headRow)}
            siblings={
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
            }
        >
            <Viewer
                index={index}
                setIndex={setIndex}
                format={format}
                missingResponses={missingResponses}
                responses={responses}
                requests={requests}
                showEmptyMessageGFI={showEmptyMessageGFI}
                disableInfoAlert={disableInfoAlert}
                {...viewerOptions}/>
        </ResponsivePanel>
    );
};
