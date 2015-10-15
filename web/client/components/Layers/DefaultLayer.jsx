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
var InlineSpinner = require('../spinners/InlineSpinner/InlineSpinner');
var WMSLegend = require('./fragments/WMSLegend');

var DefaultLayer = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        expanded: React.PropTypes.bool,
        propertiesChangeHandler: React.PropTypes.func,
        loadingList: React.PropTypes.array,
        onToggle: React.PropTypes.func,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            style: {},
            expanded: false,
            propertiesChangeHandler: () => {},
            onToggle: () => {},
            loadingList: []
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
                <InlineSpinner loadingList={this.props.loadingList} loading={(props) => (props.loadingList || []).indexOf(props.node.name) !== -1}/>
                <Title onClick={this.props.onToggle}/>
                {this.renderCollapsible()}
            </Node>
        );
    }
});

module.exports = DefaultLayer;
