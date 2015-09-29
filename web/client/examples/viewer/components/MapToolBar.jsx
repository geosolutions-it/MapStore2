/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var {Collapse, Panel, Button, ButtonGroup, Tooltip, OverlayTrigger} = require('react-bootstrap');

var assign = require('object-assign');

/**
 * This toolbar renders as an accordion for big screens, as a
 * toolbar with small screens, rendering the content as a modal
 * window.
 */
let MapToolBar = React.createClass({
    propTypes: {
        layers: React.PropTypes.array,
        panelStyle: React.PropTypes.object,
        containerStyle: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        onActivateItem: React.PropTypes.func,
        activeKey: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            panelStyle: {
                minWidth: "300px",
                right: "52px",
                position: "absolute",
                overflow: "auto"
            },
            containerStyle: {
                position: "absolute",
                top: 0,
                right: 0,
                marginRight: "5px",
                marginTop: "50px"
            }
        };
    },
    getPanelStyle() {
        var width = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

        var height = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;
        var maxHeight = height - 70; // TODO make it parametric or calculate
        var maxWidth = width - 70; // TODO make it parametric or calculate
        return assign({}, this.props.panelStyle, {maxWidth: maxWidth + "px", maxHeight: maxHeight + "px"});
    },
    render() {
        var children = this.props.children.map((item) => {
            if (item.props.isPanel) {
                return (
                <Collapse in={this.props.activeKey === item.key}>
                    <Panel header={item.props.title} style={this.getPanelStyle()} >
                        {item}
                    </Panel>
                </Collapse>);
            }
            return null;

        }, this);
        var buttons = this.props.children.map((item) => {
            if (item.props.isPanel) {
                let tooltip = <Tooltip id="toolbar-map-layers-button">{item.props.buttonTooltip}</Tooltip>;
                let panelButton = (
                    <OverlayTrigger placement="left" overlay={tooltip}>
                        <Button
                            pressed={this.props.activeKey === item.key}
                            style={{width: "100%"}}
                            onClick={ () => this.handleSelect(item.key)}>
                                {item.props.buttonContent || item.props.icon}
                        </Button>
                    </OverlayTrigger>
                );
                return panelButton;
            }
            return item;

        }, this);
        return (<div style={this.props.containerStyle}>
            {children}
            <ButtonGroup vertical>
                {buttons}
            </ButtonGroup>
            </div>);

    },

    handleSelect(activeKey) {
        if (activeKey === this.props.activeKey) {
            this.props.onActivateItem();
        }else {
            this.props.onActivateItem(activeKey);
        }

    }
});
module.exports = MapToolBar;
