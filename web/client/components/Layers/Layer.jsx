/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');
var {isFunction} = require('lodash');

var Layer = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        loadingList: React.PropTypes.array,
        showSpinner: React.PropTypes.bool,
        expanded: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        spinner: React.PropTypes.element,
        collapsible: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.object])
    },
    getDefaultProps() {
        return {
            showSpinner: false,
            loadingList: [],
            expanded: true,
            onClick: () => {},
            spinner: null,
            collapsible: null
        };
    },
    renderCollapsiblePanel(layer) {
        if (this.props.collapsible) {
            if (isFunction(this.props.collapsible)) {
                return React.cloneElement(this.props.collapsible(layer), {node: layer});
            }
            return React.cloneElement(this.props.collapsible, {node: layer});
        }
        return null;
    },
    renderSpinner() {
        if (this.props.spinner && this.props.showSpinner && this.props.loadingList.indexOf(this.props.node.name) !== -1) {
            return React.cloneElement(this.props.spinner, {loading: true});
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
                {expanded ? this.renderCollapsiblePanel(this.props.node) : []}
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
