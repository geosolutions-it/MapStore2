/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

var TOC = require('../../../components/TOC/TOC');
var DefaultGroup = require('../../../components/TOC/DefaultGroup');
var DefaultLayer = require('../../../components/TOC/DefaultLayer');

var icon = require('../../assets/img/layers.png');

var LayerTree = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        buttonContent: React.PropTypes.node,
        groups: React.PropTypes.array,
        groupStyle: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        onToggleGroup: React.PropTypes.func,
        onToggleLayer: React.PropTypes.func,
        onSort: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            buttonContent: <img src={icon}/>,
            propertiesChangeHandler: () => {},
            onToggleGroup: () => {},
            onToggleLayer: () => {}
        };
    },
    getNoBackgroundLayers(group) {
        return group.name !== 'background';
    },
    render() {
        if (!this.props.groups) {
            return <div></div>;
        }

        return (
            <div>
                <TOC onSort={this.props.onSort} filter={this.getNoBackgroundLayers}
                    nodes={this.props.groups}>
                    <DefaultGroup onSort={this.props.onSort} onToggle={this.props.onToggleGroup} style={this.props.groupStyle}>
                        <DefaultLayer
                            onToggle={this.props.onToggleLayer}
                            propertiesChangeHandler={this.props.propertiesChangeHandler}
                            />
                    </DefaultGroup>
                </TOC>
            </div>
        );
    }
});

module.exports = LayerTree;
