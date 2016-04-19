/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const {setControlProperty} = require('../actions/controls');
const {changeHelpText, changeHelpwinVisibility} = require('../actions/help');

const {ButtonGroup, Button, Tooltip, OverlayTrigger, Panel, Collapse} = require('react-bootstrap');

require('./toolbar/assets/css/toolbar.css');

const Message = require('./Message');

const {toggleControl} = require('../actions/controls');

const HelpBadge = connect((state) => ({
    isVisible: state.controls && state.controls.help && state.controls.help.enabled
}), {
    changeHelpText,
    changeHelpwinVisibility
})(require('../components/help/HelpBadge'));

let tools;

const Toolbar = React.createClass({
    propTypes: {
        tools: React.PropTypes.array,
        mapType: React.PropTypes.string,
        panelStyle: React.PropTypes.object,
        active: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object,
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            panelStyle: {
                minWidth: "300px",
                right: "52px",
                position: "absolute",
                overflow: "auto"
            }
        };
    },
    componentWillMount() {
        tools = require('./toolbar/index')(this.context);
    },
    getPanels() {
        return this.getTools()
            .filter((tool) => tool.panel)
            .map((tool) => ({name: tool.name, title: tool.title, panel: tool.panel, wrap: tool.wrap || false}));
    },
    getTools() {
        return this.props.tools && this.props.tools.reduce((previous, current) => {
            return previous.concat(tools.filter((tool) => tool.name === current)[0]);
        }, []) || tools;
    },
    getTool(tool) {
        let selector = () => ({});
        const actions = {};
        if (tool.exclusive) {
            selector = (state) => ({
                active: state.controls && state.controls.toolbar && state.controls.toolbar.active === tool.name
            });
            actions.onClick = setControlProperty.bind(null, 'toolbar', 'active', tool.name, true);
        } else if (tool.toggle) {
            selector = (state) => ({
                bsStyle: state.controls[tool.name] && state.controls[tool.name].enabled ? 'primary' : 'default'
            });
            actions.onClick = toggleControl.bind(null, tool.name, null);
        } else if (tool.action) {
            actions.onClick = tool.action;
        }
        return connect(selector, actions)(Button);
    },
    renderButtons() {
        return this.getTools().map((tool) => {
            const help = tool.help ? <HelpBadge className="mapstore-tb-helpbadge" helpText={tool.help}/> : null;
            const tooltip = tool.tooltip ? <Message msgId={tool.tooltip}/> : null;

            const ToolbarButton = tool.tool || this.getTool(tool);

            return this.addTooltip(
                <ToolbarButton tooltip={tooltip} help={help} key={tool.name} mapType={this.props.mapType}>
                    {help}{tool.icon}
                </ToolbarButton>,
            tool);
        });
    },
    renderPanels() {
        return this.getPanels().map((panel) => {
            const ToolPanelComponent = panel.panel;
            const ToolPanel = <ToolPanelComponent key={panel.name} mapType={this.props.mapType} {...(panel.props || {})}/>;
            const title = panel.title ? <Message msgId={panel.title}/> : null;
            if (panel.wrap) {
                return (
                    <Collapse key={"mapToolBar-item-collapse-" + panel.name} in={this.props.active === panel.name}>
                        <Panel header={title} style={this.props.panelStyle}>
                            {ToolPanel}
                        </Panel>
                    </Collapse>
                    );
            }
            return ToolPanel;
        });
    },
    render() {
        return (
            <span>
                <ButtonGroup vertical className="mapToolbar">
                    {this.renderButtons()}
                </ButtonGroup>
                {this.renderPanels()}
            </span>
        );
    },
    addTooltip(button, spec) {
        if (spec.tooltip) {
            let tooltip = <Tooltip id={"toolbar-map-" + spec.name + "-button"}><Message msgId={spec.tooltip}/></Tooltip>;
            return (
                <OverlayTrigger key={"mapToolBar-item-OT-" + spec.name} rootClose placement="left" overlay={tooltip}>
                    {button}
                </OverlayTrigger>
            );
        }
        return button;
    }
});

module.exports = {
    ToolbarPlugin: connect((state) => ({
        active: state.controls && state.controls.toolbar && state.controls.toolbar.active
    }))(Toolbar),
    reducers: {}
};
