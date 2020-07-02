/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Row, Col} = require('react-bootstrap');
const {get, isNil} = require('lodash');
const PropTypes = require('prop-types');
const Toolbar = require('../../misc/toolbar/Toolbar');
const Message = require('../../I18N/Message');
const DockablePanel = require('../../misc/panels/DockablePanel');
const GeocodeViewer = require('./GeocodeViewer');
const ResizableModal = require('../../misc/ResizableModal');
const Portal = require('../../misc/Portal');
const Coordinate = require('./coordinates/Coordinate');
const {responseValidForEdit} = require('../../../utils/IdentifyUtils');
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
class IdentifyContainer extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        requests: PropTypes.array,
        onClose: PropTypes.func,
        responses: PropTypes.array,
        index: PropTypes.number,
        viewerOptions: PropTypes.object,
        format: PropTypes.string,
        dock: PropTypes.bool,
        position: PropTypes.string,
        size: PropTypes.number,
        fluid: PropTypes.bool,
        validResponses: PropTypes.array,
        viewer: PropTypes.func,
        getToolButtons: PropTypes.func,
        getNavigationButtons: PropTypes.func,
        showFullscreen: PropTypes.bool,
        reverseGeocodeData: PropTypes.object,
        point: PropTypes.object,
        dockStyle: PropTypes.object,
        draggable: PropTypes.bool,
        setIndex: PropTypes.func,
        warning: PropTypes.string,
        clearWarning: PropTypes.func,
        zIndex: PropTypes.number,
        showEmptyMessageGFI: PropTypes.bool,
        showEdit: PropTypes.bool,
        isEditingAllowed: PropTypes.bool,
        onEdit: PropTypes.func,
        enabledCoordEditorButton: PropTypes.bool,
        showCoordinateEditor: PropTypes.bool,
        onSubmitClickPoint: PropTypes.func,
        onChangeFormat: PropTypes.func,
        formatCoord: PropTypes.string,
        setDefaultIdentify: PropTypes.func,
        defaultConfiguration: PropTypes.object,
        disabledAlwaysOn: PropTypes.bool
    };

    static defaultProps = {
        enabled: false,
        disabledAlwaysOn: false,
        requests: [],
        onClose: () => {},
        responses: [],
        index: 0,
        viewerOptions: {},
        format: 'text/plain',
        dock: true,
        position: 'right',
        size: 660,
        fluid: false,
        validResponses: [],
        viewer: () => null,
        getToolButtons: () => [],
        getNavigationButtons: () => [],
        showFullscreen: false,
        reverseGeocodeData: {},
        point: {},
        dockStyle: {},
        draggable: true,
        setIndex: () => {},
        warning: "",
        clearWarning: () => {},
        zIndex: 1050,
        showEmptyMessageGFI: false,
        showEdit: false,
        isEditingAllowed: false,
        onEdit: () => {},
        // coord editor props
        enabledCoordEditorButton: true,
        showCoordinateEditor: false,
        onSubmitClickPoint: () => {},
        onChangeFormat: () => {},
        formatCoord: "decimal",
        setDefaultIdentify: () => {},
        defaultConfiguration: {}
    };

    componentDidMount() {
        const { enabled, disabledAlwaysOn } = this.props;
        this.props.setDefaultIdentify({
            enabled: (isNil(enabled) && true) || enabled,
            ...(!isNil(this.props.disabledAlwaysOn) && {disabledAlwaysOn: disabledAlwaysOn}),
            defaultConfiguration: {...this.props.defaultConfiguration}
        });
    }

    render() {
        const latlng = this.props.point && this.props.point.latlng || null;

        const targetResponse = this.props.validResponses[this.props.index];
        const {layer} = targetResponse || {};

        let lngCorrected = null;
        if (latlng) {
        /* lngCorrected is the converted longitude in order to have the value between
         * the range (-180 / +180).
         * Precision has to be >= than the coordinate editor precision
         * especially in the case of aeronautical degree edito which is 12
       */
            lngCorrected = latlng && Math.round(latlng.lng * 100000000000000000) / 100000000000000000;
            /* the following formula apply the converion*/
            lngCorrected = lngCorrected - 360 * Math.floor(lngCorrected / 360 + 0.5);
        }
        const Viewer = this.props.viewer;
        // TODO: put all the header (Toolbar, navigation, coordinate editor) outside the container
        const toolButtons = this.props.getToolButtons({
            ...this.props,
            lngCorrected,
            latlng,
            showEdit: this.props.showEdit && this.props.isEditingAllowed && !!targetResponse && responseValidForEdit(targetResponse),
            onEdit: this.props.onEdit.bind(null, layer && {
                id: layer.id,
                name: layer.name,
                url: get(layer, 'search.url')
            })
        });
        const missingResponses = this.props.requests.length - this.props.responses.length;
        const revGeocodeDisplayName = this.props.reverseGeocodeData.error ? <Message msgId="identifyRevGeocodeError"/> : this.props.reverseGeocodeData.display_name;

        return (
            <div id="identify-container" className={this.props.enabled && this.props.requests.length !== 0 ? "identify-active" : ""}>
                <DockablePanel
                    bsStyle="primary"
                    glyph="map-marker"
                    title={!this.props.viewerOptions.header ? this.props.validResponses[this.props.index] && this.props.validResponses[this.props.index].layerMetadata && this.props.validResponses[this.props.index].layerMetadata.title || '' : <Message msgId="identifyTitle" />}
                    open={this.props.enabled && this.props.requests.length !== 0}
                    size={this.props.size}
                    fluid={this.props.fluid}
                    position={this.props.position}
                    draggable={this.props.draggable}
                    onClose={this.props.onClose}
                    dock={this.props.dock}
                    style={this.props.dockStyle}
                    showFullscreen={this.props.showFullscreen}
                    zIndex={this.props.zIndex}
                    header={[
                        <Coordinate
                            key="coordinate-editor"
                            formatCoord={this.props.formatCoord}
                            enabledCoordEditorButton={this.props.enabledCoordEditorButton}
                            onSubmit={this.props.onSubmitClickPoint}
                            onChangeFormat={this.props.onChangeFormat}
                            edit={this.props.showCoordinateEditor}
                            coordinate={{
                                lat: latlng && latlng.lat,
                                lon: lngCorrected
                            }}
                        />,
                        <GeocodeViewer latlng={latlng} revGeocodeDisplayName={revGeocodeDisplayName} {...this.props}/>,
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
                                    buttons={this.props.getNavigationButtons(this.props)}
                                    transitionProps={null /* same here */}
                                />
                            </div>
                        </Row>
                    ].filter(headRow => headRow)}>
                    <Viewer
                        index={this.props.index}
                        setIndex={this.props.setIndex}
                        format={this.props.format}
                        missingResponses={missingResponses}
                        responses={this.props.responses}
                        showEmptyMessageGFI={this.props.showEmptyMessageGFI}
                        {...this.props.viewerOptions}/>
                </DockablePanel>
                <Portal>
                    <ResizableModal
                        fade
                        title={<Message msgId="warning"/>}
                        size="xs"
                        show={this.props.warning}
                        onClose={this.props.clearWarning}
                        buttons={[{
                            text: <Message msgId="close"/>,
                            onClick: this.props.clearWarning,
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
    }
}

module.exports = IdentifyContainer;
