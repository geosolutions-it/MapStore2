/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Node = require('./Node');
var VisibilityCheck = require('./fragments/VisibilityCheck');
var Title = require('./fragments/Title');
var InlineSpinner = require('../misc/spinners/InlineSpinner/InlineSpinner');
var WMSLegend = require('./fragments/WMSLegend');

var DefaultLayer = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        onToggle: React.PropTypes.func,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            style: {},
            propertiesChangeHandler: () => {},
            onToggle: () => {}
        };
    },
    renderCollapsible() {
        if (this.props.node && this.props.node.type === 'wms') {
            return <WMSLegend position="collapsible"/>;
        }
        return [];
    },
    render() {
        let {children, propertiesChangeHandler, onToggle, ...other } = this.props;
        return (
            <Node type="layer" {...other}>
                <VisibilityCheck propertiesChangeHandler={this.props.propertiesChangeHandler}/>
                <Title onClick={this.props.onToggle}/>
                <InlineSpinner loading={this.props.node.loading}/>
                {this.renderCollapsible()}
            </Node>
        );
    }
});

module.exports = DefaultLayer;
