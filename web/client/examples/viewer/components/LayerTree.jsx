/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Panel} = require('react-bootstrap');

var Layers = require('../../../components/Layers/Layers');
var DefaultGroup = require('../../../components/Layers/DefaultGroup');
var DefaultLayer = require('../../../components/Layers/DefaultLayer');

var icon = require('../img/layers.png');

var LayerTree = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        buttonContent: React.PropTypes.node,
        groups: React.PropTypes.array,
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
            <Panel>
                <Layers onSort={this.props.onSort} filter={this.getNoBackgroundLayers}
                    nodes={this.props.groups}>
                    <DefaultGroup onSort={this.props.onSort} expanded={false} onToggle={this.props.onToggleGroup}>
                        <DefaultLayer
                            onToggle={this.props.onToggleLayer}
                            expanded={false}
                            propertiesChangeHandler={this.props.propertiesChangeHandler}
                            />
                    </DefaultGroup>
                </Layers>
            </Panel>
        );
    }
});

module.exports = LayerTree;
