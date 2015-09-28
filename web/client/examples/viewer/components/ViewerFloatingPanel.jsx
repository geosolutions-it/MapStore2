/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var {Panel, PanelGroup} = require('react-bootstrap');
var LayerSwitcher = require('../../../components/LayerTree/LayerTree');
var {Button, Tooltip, OverlayTrigger} = require('react-bootstrap');
var {Message} = require('../../../components/I18N/I18N');
var icon = require('../../../components/LayerTree/images/layers.png');

require("./mapPanel.css");

let ViewerFloatingPanel = React.createClass({
    propTypes: {
        layers: React.PropTypes.array,
        panelStyle: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        onActivateItem: React.PropTypes.func,
        activeKey: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            panelStyle: {
                position: "absolute",
                bottom: "0px",
                right: "75px",
                maxWidth: "100%",
                marginTop: "50px",
                maxHeight: "700px",
                transition: "width 5s"
            }
        };
    },
    render() {

        var tooltip = <Tooltip><Message msgId="layers" /></Tooltip>;
        var layerSwitcherButton = (
            <OverlayTrigger placement="top" overlay={tooltip}>
                <Button style={{width: "100%"}}><img src={icon} /></Button>
            </OverlayTrigger>
        );
        return (
        <PanelGroup accordion activeKey={this.props.activeKey} style={this.props.panelStyle} className="MainMapPanel" onSelect={this.handleSelect} accordion>
            <Panel header={layerSwitcherButton} eventKey="1" activeKey="1" className="MapPanel" collapsible={true}>
                <LayerSwitcher key="layetSwitcher" layers={this.props.layers} propertiesChangeHandler={this.props.propertiesChangeHandler}/>
            </Panel>
        </PanelGroup>);
    },
    handleSelect(activeKey) {
        if (activeKey === this.props.activeKey) {
            this.props.onActivateItem();
        }else {
            this.props.onActivateItem(activeKey);
        }

    }
});
module.exports = ViewerFloatingPanel;
