import './styler/styler.css';

import { head } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Glyphicon, Grid, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import Spinner from 'react-spinkit';
import { Combobox } from 'react-widgets';
import { createSelector } from 'reselect';

import { toggleControl } from '../actions/controls';
import { getDescribeLayer, getLayerCapabilities } from '../actions/layerCapabilities';
import { changeLayerProperties } from '../actions/layers';
import { zoomToExtent } from '../actions/map';
import { setRasterLayer } from '../actions/rasterstyler';
import { reset, saveLayerDefaultStyle } from '../actions/styler';
import { setVectorLayer } from '../actions/vectorstyler';
import Dialog from '../components/misc/Dialog';
import rasterstyler from '../reducers/rasterstyler';
import styler from '../reducers/styler';
import vectorstyler from '../reducers/vectorstyler';
import { layersSelector } from '../selectors/layers';
import { getWindowSize } from '../utils/AgentUtils';
import Message from './locale/Message';
import Raster from './RasterStyler';
import Vector from './VectorStyler';
import Button from '../components/misc/Button';

class Styler extends React.Component {
    /** @constructor */
    static propTypes = {
        canSave: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        layers: PropTypes.array,
        layer: PropTypes.object,
        withContainer: PropTypes.bool,
        open: PropTypes.bool,
        closeGlyph: PropTypes.string,
        forceOpen: PropTypes.bool,
        style: PropTypes.object,
        selectVectorLayer: PropTypes.func,
        selectRasterLayer: PropTypes.func,
        toggleControl: PropTypes.func,
        error: PropTypes.string,
        changeLayerProperties: PropTypes.func,
        getDescribeLayer: PropTypes.func,
        getLayerCapabilities: PropTypes.func,
        zoomToExtent: PropTypes.func,
        saveStyle: PropTypes.func,
        reset: PropTypes.func,
        hideLayerSelector: PropTypes.bool

    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        canSave: true,
        hideLayerSelector: false,
        open: false,
        closeGlyph: '1-close',
        layers: [],
        layer: null,
        withContainer: true,
        selectVectorLayer: () => {},
        selectRasterLayer: () => {},
        getDescribeLayer: () => {},
        getLayerCapabilities: () => {},
        toggleControl: () => {},
        style: {},
        saveStyle: () => {},
        changeLayerProperties: () => {},
        zoomToExtent: () => {},
        reset: () => {}
    };

    state = {
        counter: 1
    };

    UNSAFE_componentWillMount() {
        this.props.reset();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        // intial setup
        if (!nextProps.layer && this.props.layers.length === 1) {
            this.props.reset();
            this.setLayer(this.props.layers[0]);
        } else if (nextProps.layer && this.props.layers.length === 1 && this.props.layers[0].id !== nextProps.layer.id) {
            let original = this.findOriginalLayer(this.props, nextProps);
            if (!original) {
                this.props.reset();
            }
        } else if (nextProps.layer && this.props.layer && nextProps.layer.name !== this.props.layer.name ) {
            this.setLayer(nextProps.layer);
        }

    }

    getPanelStyle = () => {
        let size = getWindowSize();
        let maxHeight = size.maxHeight - 20;
        let maxWidth = size.maxWidth - 70;
        let style = {maxHeight: maxHeight, maxWidth: maxWidth};
        if ( maxHeight < 600 ) {
            style.height = maxHeight;
            style.overflowY = "auto";
        }
        return style;
    };

    getStylerStyle = () => {
        let size = getWindowSize();
        let maxHeight = size.maxHeight - 170;
        let maxWidth = size.maxWidth - 70;
        let style = {maxHeight: maxHeight, maxWidth: maxWidth};
        if ( maxHeight < 600 ) {
            style.height = maxHeight;
            style.overflowY = "auto";
        }
        return style;
    };

    getRestURL = (url) => {
        let urlParts = url.split("/geoserver/");
        if (urlParts[0] || urlParts[0] === "") {
            return urlParts[0] + "/geoserver/rest/";
        }
        return null;
    };

    renderError = (error) => {
        return <Alert bsStyle="danger">{error}</Alert>;
    };

    renderStyler = () => {
        switch (this.props.layer.describeLayer && this.props.layer.describeLayer.owsType) {
        case 'WFS':
        {
            return (
                <div style={this.getStylerStyle()}>
                    <Vector forceOpen hideLayerSelector withContainer={false} />
                </div>);
        }
        case 'WCS':
        {
            return (
                <div style={this.getStylerStyle()}>
                    <Raster forceOpen hideLayerSelector withContainer={false}/>
                </div>);
        }
        default: {
            if (this.props.layer.describeLayer && this.props.layer.describeLayer.error) {
                return this.renderError(this.props.layer.describeLayer.error);
            }
            return null;
        }
        }
    };

    renderWait = () => {
        if (this.state.layer) {
            return <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/>;
        }
        return null;
    };

    renderWaitOrError = () => {
        return this.state.layer && this.state.error ? this.renderError(this.state.error) : this.renderWait();
    };

    renderSelector = () => {
        return (<Row style={{marginBottom: "5px", marginLeft: "10px", marginRight: "10px"}}>
            {!this.props.hideLayerSelector && !(this.props.layers.length === 1) ? (<Row>

                <label><Message msgId="styler.layerlabel"/></label>
                <Combobox data={this.props.layers.reverse()}
                    value={(this.props.layer) ? this.props.layer.id : (this.state.layer && this.state.layer.id)}
                    onChange={this.setLayer}
                    valueField={"id"}
                    textField={"title"} />

            </Row>) : null}
        </Row>);
    };

    renderSave = () => {
        let layer = this.findOriginalLayer(this.props, this.props);

        if (layer && layer.params && layer.params.SLD_BODY && this.props.layer && this.getRestURL(this.props.layer.url)) {
            return (
                <Button style={{marginRight: "4px"}} onClick={this.saveStyle}>Save</Button>
            );
        }
        return null;
    };

    renderReset = () => {
        if (this.props.layer) {
            return (
                <Button key="reset-btn" onClick={this.reset}>Reset</Button>
            );
        }
        return null;
    };

    renderZoom = () => {
        let originalLayer = this.findOriginalLayer(this.props, this.props);
        if (originalLayer && originalLayer.capabilities) {
            return (<Button key="zoom-btn" style={{
                "float": "right"
            }}onClick={this.zoomToLayerExtent} ><Glyphicon glyph="zoom-in" />Zoom To Layer</Button>);
        }
        return null;
    };

    renderBody = () => {

        return (<Grid fluid>
            {this.renderSelector()}
            {this.props.layer ? this.renderStyler() : this.renderWaitOrError()}
            <Row style={{margin: "4px 0"}}>
                {this.props.layer && this.props.canSave ? this.renderSave() : null}
                {this.renderReset()}{this.renderZoom()}
            </Row>
        </Grid>);
    };

    render() {
        if (this.props.open || this.props.forceOpen) {
            return this.props.withContainer ?
                <Dialog id="wms-styler-dialog" className="mapstore-styler-panel"
                    style={this.getPanelStyle()}
                >
                    <span role="header"><span className="metadataexplorer-panel-title">
                        <Message msgId="styler.paneltitle"/></span><button onClick={this.props.toggleControl.bind(null, 'styler', null)} className="print-panel-close close">
                        {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}
                    </button></span>
                    <div role="body">
                        {this.renderBody()}
                    </div>
                </Dialog> : this.renderBody();
        }
        return null;
    }

    /*
     * add a incremental value as layer parameter (to force invalidation of the cache) and clear the sldbody
     */
    clearLayerStyle = () => {
        this.props.changeLayerProperties(this.props.layer.id, { params: assign({}, this.props.layer.params, {SLD_BODY: null, _dc: this.state.counter})});
        this.setState({counter: this.state.counter + 1});
    };

    reset = () => {
        this.clearLayerStyle();
        this.props.reset();
    };

    setLayer = (l) => {
        if (l.describeLayer && l.describeLayer.owsType) {
            switch (l.describeLayer && l.describeLayer.owsType) {
            case "WFS": {
                this.props.selectVectorLayer(l);
                break;
            }
            case "WCS": {
                this.props.selectRasterLayer(l);
                break;
            }
            default:
                break;
            }
            if (!l.capabilities || !l.capabilities.error) {
                this.props.getLayerCapabilities(l);
            }
        } else if (!l.describeLayer || !l.describeLayer.error) {
            this.props.getDescribeLayer(l.url, l);
        }

    };

    findOriginalLayer = (props, state) => {
        return head(props.layers.filter((l) => l && state.layer && l.id === state.layer.id));
    };

    saveStyle = () => {
        let layer = this.findOriginalLayer(this.props, this.props);
        if (layer.params && layer.params.SLD_BODY) {
            this.props.saveStyle(this.getRestURL(layer.url), layer.name, layer.params.SLD_BODY);
            setTimeout(this.clearLayerStyle, 2000);
        }
    };

    zoomToLayerExtent = () => {
        let originalLayer = this.findOriginalLayer(this.props, this.props);
        if (originalLayer && originalLayer.capabilities ) {
            let extent = originalLayer.capabilities.latLonBoundingBox;
            if (extent && !this.state.zoomed) {
                this.props.zoomToExtent([extent.minx, extent.miny, extent.maxx, extent.maxy], "EPSG:4326");
                this.setState({zoomed: true});
            }
        }
    };
}

const selector = createSelector([
    (state) => state.controls.styler && state.controls.styler.enabled === true,
    (state) => state.vectorstyler,
    (state) => state.rasterstyler,
    (state) => state.styler && state.styler.type,
    layersSelector
], (open, vectorstate, rasterstate, type, layers) => {
    let layer = type === "vector" ? vectorstate.layer : rasterstate.layer;
    return {
        open,
        layer,
        layers: layers.filter((l) => { return l.group !== 'background'; })
    };
});

const StylerPlugin = connect(selector, {
    selectVectorLayer: setVectorLayer,
    selectRasterLayer: setRasterLayer,
    getDescribeLayer,
    getLayerCapabilities,
    changeLayerProperties,
    saveStyle: saveLayerDefaultStyle,
    toggleControl,
    zoomToExtent,
    reset
})(Styler);

export default {
    StylerPlugin: assign( StylerPlugin,
        {
            Toolbar: {
                name: 'styler',
                help: <Message msgId="helptexts.styler"/>,
                tooltip: "styler.tooltip",
                icon: <Glyphicon glyph="pencil"/>,
                position: 9,
                action: toggleControl.bind(null, 'styler', null)
            }
        }),
    reducers: {
        styler,
        rasterstyler,
        vectorstyler
    }
};
