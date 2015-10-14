/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Layer = require('./Layer');
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
        onToggleLayer: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            expanded: true
        };
    },
    renderCollapsible() {
        if (this.props.node && this.props.node.type === 'wms') {
            return <WMSLegend position="collapsible"/>;
        }
        return [];
    },
    render() {
        return (
            <Layer {...this.props}>
                <VisibilityCheck propertiesChangeHandler={this.props.propertiesChangeHandler}/>
                <InlineSpinner loadingList={this.props.loadingList} loading={(props) => (props.loadingList || []).indexOf(props.node.name) !== -1}/>
                <Title onClick={this.props.onToggleLayer}/>
                {this.renderCollapsible()}
            </Layer>
        );
    }
});

module.exports = DefaultLayer;
