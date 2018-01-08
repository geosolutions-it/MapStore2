const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel, Glyphicon, Modal} = require('react-bootstrap');
const {findIndex} = require('lodash');

require('./css/identify.css');

const Draggable = require('react-draggable');

const MapInfoUtils = require('../../../utils/MapInfoUtils');
const Spinner = require('../../misc/spinners/BasicSpinner/BasicSpinner');
const Message = require('../../I18N/Message');
const DefaultViewer = require('./DefaultViewer');
const GeocodeViewer = require('./GeocodeViewer');
const Dialog = require('../../misc/Dialog');

class Identify extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        draggable: PropTypes.bool,
        collapsible: PropTypes.bool,
        style: PropTypes.object,
        point: PropTypes.object,
        layer: PropTypes.string,
        format: PropTypes.string,
        map: PropTypes.object,
        layers: PropTypes.array,
        buffer: PropTypes.number,
        requests: PropTypes.array,
        responses: PropTypes.array,
        viewerOptions: PropTypes.object,
        viewer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        purgeResults: PropTypes.func,
        noQueryableLayers: PropTypes.func,
        clearWarning: PropTypes.func,
        queryableLayersFilter: PropTypes.func,
        buildRequest: PropTypes.func,
        sendRequest: PropTypes.func,
        localRequest: PropTypes.func,
        showMarker: PropTypes.func,
        hideMarker: PropTypes.func,
        changeMousePointer: PropTypes.func,
        maxItems: PropTypes.number,
        excludeParams: PropTypes.array,
        includeOptions: PropTypes.array,
        showRevGeocode: PropTypes.func,
        hideRevGeocode: PropTypes.func,
        showModalReverse: PropTypes.bool,
        reverseGeocodeData: PropTypes.object,
        enableRevGeocode: PropTypes.bool,
        wrapRevGeocode: PropTypes.bool,
        panelClassName: PropTypes.string,
        headerClassName: PropTypes.string,
        bodyClassName: PropTypes.string,
        asPanel: PropTypes.bool,
        headerGlyph: PropTypes.string,
        closeGlyph: PropTypes.string,
        allowMultiselection: PropTypes.bool,
        warning: PropTypes.string,
        currentLocale: PropTypes.string,
        fullscreen: PropTypes.bool
    };

    static defaultProps = {
        enabled: false,
        draggable: true,
        collapsible: false,
        format: MapInfoUtils.getDefaultInfoFormatValue(),
        requests: [],
        responses: [],
        buffer: 2,
        viewerOptions: {},
        viewer: DefaultViewer,
        purgeResults: () => {},
        buildRequest: MapInfoUtils.buildIdentifyRequest,
        localRequest: () => {},
        sendRequest: () => {},
        showMarker: () => {},
        hideMarker: () => {},
        noQueryableLayers: () => {},
        clearWarning: () => {},
        changeMousePointer: () => {},
        showRevGeocode: () => {},
        hideRevGeocode: () => {},
        containerProps: {
            continuous: false
        },
        showModalReverse: false,
        reverseGeocodeData: {},
        enableRevGeocode: true,
        wrapRevGeocode: false,
        queryableLayersFilter: MapInfoUtils.defaultQueryableFilter,
        style: {},
        point: {},
        layer: null,
        map: {},
        layers: [],
        maxItems: 10,
        excludeParams: ["SLD_BODY"],
        includeOptions: [
            "buffer",
            "cql_filter",
            "filter",
            "propertyName"
        ],
        panelClassName: "modal-dialog info-panel modal-content",
        headerClassName: "modal-header",
        bodyClassName: "modal-body info-wrap",
        asPanel: false,
        headerGlyph: "",
        closeGlyph: "1-close",
        className: "square-button",
        allowMultiselection: false,
        currentLocale: 'en-US',
        fullscreen: false
    };

    state = {
        fullClass: ''
    };
    componentDidMount() {
        if (this.props.enabled) {
            this.props.changeMousePointer('pointer');
        }
    }
    componentWillReceiveProps(newProps) {
        if (this.needsRefresh(newProps)) {
            if (!newProps.point.modifiers || newProps.point.modifiers.ctrl !== true || !newProps.allowMultiselection) {
                this.props.purgeResults();
            }
            const queryableLayers = newProps.layers
                .filter(newProps.queryableLayersFilter)
                .filter(newProps.layer ? l => l.id === newProps.layer : () => true);
            queryableLayers.forEach((layer) => {
                const {url, request, metadata} = this.props.buildRequest(layer, newProps);
                if (url) {
                    this.props.sendRequest(url, request, metadata, this.filterRequestParams(layer));
                } else {
                    this.props.localRequest(layer, request, metadata);
                }

            });
            if (queryableLayers.length === 0) {
                this.props.noQueryableLayers();
            } else {
                if (!newProps.layer) {
                    this.props.showMarker();
                } else {
                    this.props.hideMarker();
                }
            }

        }

        if (newProps.enabled && !this.props.enabled) {
            this.props.changeMousePointer('pointer');
        } else if (!newProps.enabled && this.props.enabled) {
            this.props.changeMousePointer('auto');
            this.props.hideMarker();
            this.props.purgeResults();
        }
    }

    onModalHiding = () => {
        this.props.hideMarker();
        this.props.purgeResults();
    };

    renderHeader = (missing) => {
        return (
            <div role="header">
                { missing !== 0 ? <Spinner value={missing} sSize="sp-small" /> : null }
                {this.props.fullscreen ? <Glyphicon className="m-fullscreen-btn" onClick={() => { this.setFullscreen(); }} glyph={this.state.fullscreen ? 'chevron-down' : 'chevron-up'} /> : null}&nbsp;
                {this.props.headerGlyph ? <Glyphicon glyph={this.props.headerGlyph} /> : null}&nbsp;<Message msgId="identifyTitle" />
                <button onClick={this.onModalHiding} className="close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
            </div>
        );
    };

    renderResults = (missingResponses) => {
        const Viewer = this.props.viewer;
        return <Viewer format={this.props.format} missingResponses={missingResponses} responses={this.props.responses} {...this.props.viewerOptions}/>;
    };

    renderReverseGeocode = (latlng) => {
        if (this.props.enableRevGeocode) {
            let reverseGeocodeData = this.props.reverseGeocodeData;
            const Viewer = (<GeocodeViewer
                latlng={latlng}
                showRevGeocode={this.props.showRevGeocode}
                showModalReverse={this.props.showModalReverse}
                identifyRevGeocodeModalTitle={<Message msgId="identifyRevGeocodeModalTitle" />}
                revGeocodeDisplayName={reverseGeocodeData.error ? <Message msgId="identifyRevGeocodeError" /> : this.props.reverseGeocodeData.display_name}
                hideRevGeocode={this.props.hideRevGeocode}
                identifyRevGeocodeSubmitText={<Message msgId="identifyRevGeocodeSubmitText" />}
                identifyRevGeocodeCloseText={<Message msgId="identifyRevGeocodeCloseText" />}
                modalOptions={{bsClass: 'mapstore-identify-modal modal'}} />);
            return this.props.wrapRevGeocode ?
                <Panel
                    header={<span><Glyphicon glyph="globe" />&nbsp;<Message msgId="identifyRevGeocodeHeader" /></span>}>
                    {Viewer}
                </Panel>
             : <div id="mapstore-identify-revgeocoder">{Viewer}</div>;
        }
        return null;
    };

    renderContent = () => {
        let missingResponses = this.props.requests.length - this.props.responses.length;
        let latlng = this.props.point.latlng;
        return this.props.asPanel ?
            <Panel
                defaultExpanded
                collapsible={this.props.collapsible}
                id="mapstore-getfeatureinfo"
                style={this.props.style}
                className={this.props.panelClassName + this.state.fullClass}>
                <div className={this.props.headerClassName ? this.props.headerClassName : "panel-heading"}>
                    {this.renderHeader(missingResponses)}
                </div>
                {this.renderReverseGeocode(latlng)}
                {this.renderResults(missingResponses)}
            </Panel>
         :
            <Dialog id="mapstore-getfeatureinfo"
                style={this.props.style}
                className={this.props.panelClassName + this.state.fullClass}
                headerClassName={this.props.headerClassName}
                bodyClassName={this.props.bodyClassName}
                draggable={this.props.draggable}
                >
                {this.renderHeader(missingResponses)}
                <div role="body">
                    {this.renderReverseGeocode(latlng)}
                    {this.renderResults(missingResponses)}
                </div>
            </Dialog>
        ;
    };

    render() {
        if (this.props.enabled && this.props.requests.length !== 0) {
            return this.props.draggable && this.props.asPanel ?
                    <Draggable>
                        {this.renderContent()}
                    </Draggable>
                 : this.renderContent();
        }
        if (this.props.warning) {
            return (<Modal show bsSize="small" onHide={() => {
                this.props.clearWarning();
            }}>
                <Modal.Header className="dialog-error-header-side" closeButton>
                    <Modal.Title><Message msgId="warning"/></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mapstore-error"><Message msgId="identifyNoQueryableLayers"/></div>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>);
        }
        return null;
    }

    needsRefresh = (props) => {
        if (props.enabled && props.point && props.point.pixel) {
            if (!this.props.point || !this.props.point.pixel ||
                this.props.point.pixel.x !== props.point.pixel.x ||
                this.props.point.pixel.y !== props.point.pixel.y ) {
                return true;
            }
            if (!this.props.point || !this.props.point.pixel || props.point.pixel && this.props.format !== props.format) {
                return true;
            }
        }
        return false;
    };

    filterRequestParams = (layer) => {
        let includeOpt = this.props.includeOptions || [];
        let excludeList = this.props.excludeParams || [];
        let options = Object.keys(layer).reduce((op, next) => {
            if (next !== "params" && includeOpt.indexOf(next) !== -1) {
                op[next] = layer[next];
            } else if (next === "params" && excludeList.length > 0) {
                let params = layer[next];
                Object.keys(params).forEach((n) => {
                    if (findIndex(excludeList, (el) => {return el === n; }) === -1) {
                        op[n] = params[n];
                    }
                }, {});
            }
            return op;
        }, {});
        return options;
    };

    setFullscreen = () => {
        const fullscreen = !this.state.fullscreen;
        this.setState({
            fullscreen,
            fullClass: fullscreen ? ' fullscreen' : ''
        });
    };
}

module.exports = Identify;
