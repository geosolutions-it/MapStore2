/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const {Grid, Row, Panel, Glyphicon} = require('react-bootstrap');

const Combobox = require('react-widgets').Combobox;

const {getWindowSize} = require('../utils/AgentUtils');
const {setVectorLayer} = require('../actions/vectorstyler');
const {setRasterLayer} = require('../actions/rasterstyler');

const {layersSelector} = require('../selectors/layers');

const Vector = require("./VectorStyler").VectorStylerPlugin;
const Raster = require("./RasterStyler").RasterStylerPlugin;

const {createSelector} = require('reselect');

const assign = require('object-assign');

require('./styler/styler.css');

const Message = require('./locale/Message');

const Styler = React.createClass({
    propTypes: {
        layers: React.PropTypes.array,
        layer: React.PropTypes.object,
        withContainer: React.PropTypes.bool,
        open: React.PropTypes.bool,
        style: React.PropTypes.object,
        selectVectorLayer: React.PropTypes.func,
        selectRasterLayer: React.PropTypes.func,
        error: React.PropTypes.string,
        changeLayerProperties: React.PropTypes.func,
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
            hideLayerSelector: false,
            open: false,
            layers: [],
            layer: null,
            withContainer: true,
            selectVectorLayer: () => {},
            selectRasterLayer: () => {},
            style: {},
            changeLayerProperties: () => {}
        };
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
    renderStyler() {
        switch (this.props.layer.describeLayer.owsType) {
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
                return null;
            }
        }
    },
    renderSelector() {
        return (<Row style={{marginBottom: "5px", marginLeft: "10px", marginRight: "10px"}}>
                    {!this.props.hideLayerSelector ? (<Row>

                        <label><Message msgId="styler.layerlabel"/></label>
                            <Combobox data={this.props.layers.reverse()}
                                value={(this.props.layer) ? this.props.layer.id : null}
                                onChange={this.setLayer}
                                valueField={"id"}
                                textField={"title"} />

                    </Row>) : null}
                </Row>);
    },
    renderBody() {

        return (<Grid fluid>
                {this.renderSelector()}
                {this.props.layer ? this.renderStyler() : null}
                </Grid>);
    },
    render() {
        if (this.props.open) {
            return this.props.withContainer ?
                (<Panel className="mapstore-styler-panel"
                        style={this.getPanelStyle()}
                        header={<label><Message msgId="styler.paneltitle"/></label>}>
                        {this.renderBody()}
                </Panel>) : this.renderBody();
        }
        return null;
    },
    setLayer(l) {
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
    }
});
const selector = createSelector([
    (state) => (state.controls.toolbar && state.controls.toolbar.active === 'styler'),
    (state) => state.styler && state.styler.layer,
    layersSelector
], (open, layer, layers) => ({
    open,
    layer,
    layers: layers.filter((l) => { return (l.group !== 'background' && l.describeLayer && l.describeLayer.owsType); })
}));

const StylerPlugin = connect(selector, {
        selectVectorLayer: setVectorLayer,
        selectRasterLayer: setRasterLayer
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
            panel: true,
            exclusive: true
        }
    }),
    reducers: {
        styler: require('../reducers/styler'),
        vectorstyler: require('../reducers/vectorstyler'),
        rasterstyler: require('../reducers/rasterstyler')
    }
};
