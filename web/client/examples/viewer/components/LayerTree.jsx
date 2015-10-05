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
var Group = require('../../../components/Group/Group');
var Layer = require('../../../components/Layer/Layer');

var InlineSpinner = require('../../../components/spinners/InlineSpinner/InlineSpinner');

var icon = require('../img/layers.png');

var LayerTree = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        buttonContent: React.PropTypes.node,
        layers: React.PropTypes.array,
        propertiesChangeHandler: React.PropTypes.func,
        loadingList: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            buttonContent: <img src={icon}/>,
            loadingList: []
        };
    },
    getNoBackgroudLayers(layer) {
        return layer.group !== 'background';
    },
    render() {
        if (!this.props.layers) {
            return <div></div>;
        }

        return (
            <Panel style={{overflow: "auto"}} >
                <Layers useGroups
                    filter={this.getNoBackgroudLayers}
                    layers={this.props.layers}
                    loadingList={this.props.loadingList}>
                    <Group>
                        <Layer
                            propertiesChangeHandler={this.props.propertiesChangeHandler}
                            showSpinner>
                            <InlineSpinner/>
                        </Layer>
                    </Group>
                </Layers>
            </Panel>
        );
    }
});

module.exports = LayerTree;
