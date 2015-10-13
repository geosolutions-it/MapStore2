/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Legend = require('../Legend/Legend');
var assign = require('object-assign');

var Layer = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        loadingList: React.PropTypes.array,
        showSpinner: React.PropTypes.bool,
        expanded: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            showSpinner: false,
            loadingList: [],
            expanded: true,
            onClick: () => {}
        };
    },
    renderLayerLegend(layer) {
        if (layer && layer.visibility && layer.type === "wms" && layer.group !== "background") {
            return <div style={{marginLeft: "15px"}}><Legend layer={layer}/></div>;
        }
        return null;
    },
    renderSpinner() {
        if (this.props.showSpinner && this.props.loadingList.indexOf(this.props.node.name) !== -1 && this.props.children) {
            return React.cloneElement(this.props.children, {loading: true});
        }
        return null;

    },
    render() {
        let expanded = this.props.node.expanded || this.props.expanded;
        return (
            <div key={this.props.node.name}>
                <div style={{display: 'flex'}}>
                    <input style={{marginRight: "2px"}} data-position={this.props.node.storeIndex} type="checkbox" checked={this.props.node.visibility ? "checked" : ""} onChange={this.changeLayerVisibility} />
                    {this.renderSpinner()}
                    <span onClick={() => this.props.onClick(this.props.node.name, expanded)}>{this.props.node.title || this.props.node.name}</span>
                </div>
                {expanded ? this.renderLayerLegend(this.props.node) : []}
            </div>
        );
    },
    changeLayerVisibility(eventObj) {
        let position = parseInt(eventObj.currentTarget.dataset.position, 10);
        var newLayer = assign({}, this.props.node, {visibility: !this.props.node.visibility});
        this.props.propertiesChangeHandler(newLayer, position);
    }
});

module.exports = Layer;
