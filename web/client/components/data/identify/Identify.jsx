/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel, Glyphicon} = require('react-bootstrap');

const Draggable = require('react-draggable');

const MapInfoUtils = require('../../../utils/MapInfoUtils');
const Spinner = require('../../misc/spinners/BasicSpinner/BasicSpinner');
const Message = require('../../I18N/Message');
const DefaultViewer = require('./DefaultViewer');

const Identify = React.createClass({
    propTypes: {
        enabled: React.PropTypes.bool,
        draggable: React.PropTypes.bool,
        collapsible: React.PropTypes.bool,
        style: React.PropTypes.object,
        point: React.PropTypes.object,
        format: React.PropTypes.string,
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        requests: React.PropTypes.array,
        responses: React.PropTypes.array,
        viewerOptions: React.PropTypes.object,
        viewer: React.PropTypes.object,
        purgeResults: React.PropTypes.func,
        queryableLayersFilter: React.PropTypes.func,
        buildRequest: React.PropTypes.func,
        sendRequest: React.PropTypes.func,
        showMarker: React.PropTypes.func,
        hideMarker: React.PropTypes.func,
        changeMousePointer: React.PropTypes.func,
        maxItems: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            enabled: false,
            draggable: true,
            collapsible: false,
            format: MapInfoUtils.getDefaultInfoFormatValue(),
            requests: [],
            responses: [],
            viewerOptions: {},
            viewer: DefaultViewer,
            purgeResults: () => {},
            buildRequest: MapInfoUtils.buildIdentifyRequest,
            sendRequest: () => {},
            showMarker: () => {},
            hideMarker: () => {},
            changeMousePointer: () => {},
            queryableLayersFilter: MapInfoUtils.defaultQueryableFilter,
            style: {
                position: "absolute",
                maxWidth: "500px",
                top: "56px",
                left: "45px",
                zIndex: 1010,
                boxShadow: "2px 2px 4px #A7A7A7"
            },
            point: {},
            map: {},
            layers: [],
            maxItems: 10
        };
    },
    componentWillReceiveProps(newProps) {
        if (this.needsRefresh(newProps)) {
            this.props.purgeResults();
            const queryableLayers = newProps.layers.filter(newProps.queryableLayersFilter);
            queryableLayers.forEach((layer) => {
                const {url, request, metadata} = this.props.buildRequest(layer, newProps);
                this.props.sendRequest(url, request, metadata, layer);
            });
            this.props.showMarker();
        }

        if (newProps.enabled && !this.props.enabled) {
            this.props.changeMousePointer('pointer');
        } else if (!newProps.enabled && this.props.enabled) {
            this.props.changeMousePointer('auto');
            this.props.hideMarker();
            this.props.purgeResults();
        }
    },
    onModalHiding() {
        this.props.hideMarker();
        this.props.purgeResults();
    },
    renderHeader(missing) {
        return (
            <span>
                { (missing !== 0 ) ? <Spinner value={missing} sSize="sp-small" /> : null }
                <Glyphicon glyph="info-sign" />&nbsp;<Message msgId="identifyTitle" />
                <button onClick={this.onModalHiding} className="close"><span>×</span></button>
            </span>
        );
    },
    renderResults(missingResponses) {
        const Viewer = this.props.viewer;
        return (<Viewer format={this.props.format} missingResponses={missingResponses} responses={this.props.responses} {...this.props.viewerOptions}/>);
    },
    renderContent() {
        let missingResponses = this.props.requests.length - this.props.responses.length;
        return (
            <Panel
                defaultExpanded={true}
                collapsible={this.props.collapsible}
                id="mapstore-getfeatureinfo"
                header={this.renderHeader(missingResponses)}
                style={this.props.style}>
                {this.renderResults(missingResponses)}
            </Panel>
        );
    },
    render() {
        if (this.props.requests.length !== 0) {
            return this.props.draggable ? (
                    <Draggable>
                        {this.renderContent()}
                    </Draggable>
                ) : this.renderContent();
        }
        return null;
    },
    needsRefresh(props) {
        if (props.enabled && props.point && props.point.pixel) {
            if (!this.props.point.pixel || this.props.point.pixel.x !== props.point.pixel.x ||
                    this.props.point.pixel.y !== props.point.pixel.y ) {
                return true;
            }
            if (!this.props.point.pixel || props.point.pixel && this.props.format !== props.format) {
                return true;
            }
        }
        return false;
    }
});

module.exports = Identify;
