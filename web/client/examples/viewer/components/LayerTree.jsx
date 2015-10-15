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
        loadingList: React.PropTypes.array,
        groups: React.PropTypes.array,
        propertiesChangeHandler: React.PropTypes.func,
        onToggleGroup: React.PropTypes.func,
        onToggleLayer: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            buttonContent: <img src={icon}/>,
            loadingList: [],
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
            <Panel style={{overflow: "auto"}} >
                <Layers filter={this.getNoBackgroundLayers}
                    nodes={this.props.groups}>
                    <DefaultGroup expanded={false} onToggle={this.props.onToggleGroup}>
                        <DefaultLayer
                            onToggle={this.props.onToggleLayer}
                            expanded={false}
                            propertiesChangeHandler={this.props.propertiesChangeHandler}
                            loadingList={this.props.loadingList}
                            />
                    </DefaultGroup>
                </Layers>
            </Panel>
        );
    }
});

module.exports = LayerTree;
