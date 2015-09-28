/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

var assign = require('object-assign');
var Legend = require('../Legend/Legend');
var {Glyphicon, Panel} = require('react-bootstrap');

let LayerTree = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        layers: React.PropTypes.array,
        propertiesChangeHandler: React.PropTypes.func
    },
    renderGroup(group, layerObjs) {
        var groupTitle = group === "_default" ? "Default" : group;

        return (<div style={{borderBottom: "1px solid lightgray", margin: '6px'}} >
            <div>
                <Glyphicon glyph="folder-open" /> {groupTitle}
                </div>
                    <div style={{marginLeft: "15px"}}>{layerObjs.map((layerObj) => {return this.renderLayer(layerObj.layer, layerObj.position); } )}
                    </div>
                </div>);
    },
    renderLayer(layer, position) {
        return (<div>
                    <div>
                        <input data-position={position} type="checkbox" checked={layer.visibility ? "checked" : ""} onChange={this.changeLayerVisibility} />{layer.title || layer.name}
                    </div>
                    {this.renderLayerLegend(layer)}
            </div>);
    },
    renderLayerLegend(layer) {
        if (layer && layer.visibility && layer.type === "wms" && layer.group !== "background") {
            return <div style={{marginLeft: "15px"}}><Legend layer={layer}/></div>;
        }
        return null;
    },
    render() {
        if (!this.props.layers) {
            return <div></div>;
        }
        // group layers
        let groups = {
            _default: []
        };
        let revLayers = [];
        for (let i = this.props.layers.length - 1; i >= 0; i-- ) {
            revLayers.push(this.props.layers[i]);
        }
        revLayers.map( (layer, index) => {
            var layerObj = {
                layer: layer,
                position: (this.props.layers.length - 1 - index)
            };
            if (layer.group && !groups[layer.group]) {
                groups[layer.group] = [];
            }
            if (layer.group) {
                groups[layer.group].push(layerObj);
            } else {
                groups._default.push(layerObj);
            }
        } );
        return <Panel style={{overflow: "auto", height: "400px"}} >{Object.keys(groups).map(groupName => {return this.renderGroup(groupName, groups[groupName]); })}</Panel>;
    },
    changeLayerVisibility(eventObj) {
        let position = parseInt(eventObj.currentTarget.dataset.position, 10);
        var layer = this.props.layers[position];
        var newLayer = assign({}, layer, {visibility: !layer.visibility});
        this.props.propertiesChangeHandler(newLayer, position);
    }
});

module.exports = LayerTree;
