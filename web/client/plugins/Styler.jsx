/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const {Grid, Row, Glyphicon, Alert, Button} = require('react-bootstrap');
const Spinner = require('react-spinkit');
const Dialog = require('../components/misc/Dialog');

const Combobox = require('react-widgets').Combobox;
const {head} = require('lodash');

const {getWindowSize} = require('../utils/AgentUtils');
const {setVectorLayer} = require('../actions/vectorstyler');
const {setRasterLayer} = require('../actions/rasterstyler');
const {toggleControl} = require('../actions/controls');
const {getDescribeLayer, changeLayerProperties} = require('../actions/layers');
const {saveLayerDefaultStyle} = require('../actions/styler');

const {layersSelector} = require('../selectors/layers');

const Vector = require("./VectorStyler").VectorStylerPlugin;
const Raster = require("./RasterStyler").RasterStylerPlugin;

const {createSelector} = require('reselect');

const assign = require('object-assign');

require('./styler/styler.css');

const Message = require('./locale/Message');

const Styler = React.createClass({
    propTypes: {
        canSave: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.func]),
        layers: React.PropTypes.array,
        layer: React.PropTypes.object,
        withContainer: React.PropTypes.bool,
        open: React.PropTypes.bool,
        closeGlyph: React.PropTypes.string,
        forceOpen: React.PropTypes.bool,
        style: React.PropTypes.object,
        selectVectorLayer: React.PropTypes.func,
        selectRasterLayer: React.PropTypes.func,
        toggleControl: React.PropTypes.func,
        error: React.PropTypes.string,
        changeLayerProperties: React.PropTypes.func,
        getDescribeLayer: React.PropTypes.func,
        saveStyle: React.PropTypes.func,
        hideLayerSelector: React.PropTypes.bool

    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getInitialState() {
        return {

        };
    },
    getDefaultProps() {
        return {
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
            toggleControl: () => {},
            style: {},
            saveStyle: () => {},
            changeLayerProperties: () => {}
        };
    },
    componentWillReceiveProps(nextProps) {

        if (this.state.layer) {
            let originalLayer = head(nextProps.layers.filter((l) => (l.id === this.state.layer.id)));
            if (originalLayer && originalLayer.describeLayer && !originalLayer.describeLayer.error) {
                this.setState({layer: null});
                this.setLayer(originalLayer);
            } else if (originalLayer && originalLayer.describeLayer && originalLayer.describeLayer.error ) {
                this.setState({error: originalLayer.describeLayer.error});
            }
        } else if (!nextProps.layer && this.props.layers.length === 1) {
            this.setLayer(this.props.layers[0]);
        }
    },
    getPanelStyle() {
        let size = getWindowSize();
        let maxHeight = size.maxHeight - 20;
        let maxWidth = size.maxWidth - 70;
        let style = {maxHeight: maxHeight, maxWidth: maxWidth};
        if ( maxHeight < 600 ) {
            style.height = maxHeight;
            style.overflowY = "auto";
        }
        return style;
    },
    getStylerStyle() {
        let size = getWindowSize();
        let maxHeight = size.maxHeight - 170;
        let maxWidth = size.maxWidth - 70;
        let style = {maxHeight: maxHeight, maxWidth: maxWidth};
        if ( maxHeight < 600 ) {
            style.height = maxHeight;
            style.overflowY = "auto";
        }
        return style;
    },
    getRestURL(url) {
        let urlParts = url.split("/geoserver/");
        if (urlParts[0] || urlParts[0] === "") {
            return urlParts[0] + "/geoserver/rest/";
        }
        return null;
    },
    renderError(error) {
        return <Alert bsStyle="danger">{error}</Alert>;
    },
    renderStyler() {
        switch (this.props.layer.describeLayer && this.props.layer.describeLayer.owsType) {
            case 'WFS':
            {
                return (
                    <div style={this.getStylerStyle()}>
                    <Vector forceOpen={true} hideLayerSelector={true} withContainer={false} />
                    </div>);
            }
            case 'WCS':
            {
                return (
                    <div style={this.getStylerStyle()}>
                    <Raster forceOpen={true} hideLayerSelector={true} withContainer={false}/>
                    </div>);
            }
            default: {
                if (this.props.layer.describeLayer && this.props.layer.describeLayer.error) {
                    return this.renderError(this.props.layer.describeLayer.error);
                }
                break;
            }
        }
    },
    renderWait() {
        if (this.state.layer) {
            return <Spinner spinnerName="circle" noFadeIn/>;
        }
        return null;
    },
    renderWaitOrError() {
        return (this.state.layer && this.state.error ? this.renderError(this.state.error) : this.renderWait());
    },
    renderSelector() {
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
    },
    renderSave() {
        let layer = head(this.props.layers.filter((l) => (l.id === this.props.layer.id)));

        if (layer && layer.params && layer.params.SLD_BODY && this.props.layer && this.getRestURL(this.props.layer.url)) {
            return (
                <Button onClick={this.saveStyle}>Save</Button>
            );
        }

    },
    renderReset() {
        if (this.props.layer) {
            return (
                <Button onClick={this.reset}>Reset</Button>
            );
        }
    },
    renderBody() {

        return (<Grid fluid>
                {this.renderSelector()}
                {this.props.layer ? this.renderStyler() : this.renderWaitOrError()}
                <Row>
                    {this.props.layer && this.props.canSave ? this.renderSave() : null}
                    {this.renderReset()}
                </Row>
                </Grid>);
    },
    render() {
        if (this.props.open || this.props.forceOpen) {
            return this.props.withContainer ?
                (<Dialog className="mapstore-styler-panel"
                        style={this.getPanelStyle()}
                        >
                        <span role="header"><span className="metadataexplorer-panel-title">
                            <Message msgId="styler.paneltitle"/></span><button onClick={this.props.toggleControl.bind(null, 'styler', null)} className="print-panel-close close">
                                {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}
                            </button></span>
                            <div role="body">
                                {this.renderBody()}
                            </div>
                </Dialog>) : this.renderBody();
        }
        return null;
    },
    reset() {
        this.props.changeLayerProperties(this.props.layer.id, { params: assign({}, this.props.layer.params, {SLD_BODY: null})});
    },
    setLayer(l) {
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
        } else if (!l.describeLayer || !l.describeLayer.error) {
            this.props.getDescribeLayer(l.url, l);
            this.setState({layer: l});
        }

    },

    saveStyle() {
        let layer = head(this.props.layers.filter((l) => (l.id === this.props.layer.id)));
        if (layer.params && layer.params.SLD_BODY) {
            this.props.saveStyle(this.getRestURL(layer.url), layer.name, layer.params.SLD_BODY);
        }
    }
});
const selector = createSelector([
    (state) => (state.controls.styler && state.controls.styler.enabled === true),
    (state) => state.styler && state.styler.layer,
    layersSelector
], (open, layer, layers) => {
    return {
        open,
        layer,
        layers: layers.filter((l) => { return (l.group !== 'background' ); })
    };
});

const StylerPlugin = connect(selector, {
        selectVectorLayer: setVectorLayer,
        selectRasterLayer: setRasterLayer,
        getDescribeLayer,
        changeLayerProperties,
        saveStyle: saveLayerDefaultStyle,
        toggleControl
    })(Styler);

module.exports = {
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
        styler: require('../reducers/styler'),
        vectorstyler: require('../reducers/vectorstyler'),
        rasterstyler: require('../reducers/rasterstyler')
    }
};
