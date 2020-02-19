/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const {connect} = require('react-redux');
const {compose} = require('redux');

const {changeHelpText, changeHelpwinVisibility} = require('../../actions/help');

const HelpBadge = connect((state) => ({
    isVisible: state.controls && state.controls.help && state.controls.help.enabled
}), {
    changeHelpText,
    changeHelpwinVisibility
})(require('../../components/help/HelpBadge'));

const Message = require('../../components/I18N/Message');

const {Button, Tooltip, Panel, Collapse, Glyphicon} = require('react-bootstrap');
const OverlayTrigger = require('../../components/misc/OverlayTrigger');

const {setControlProperty, toggleControl} = require('../../actions/controls');
const {partial} = require('lodash');

const assign = require('object-assign');

/**
 * A container for tools.
 * @memberof plugins.containers.ToolsContainer
 * @class ToolsContainer
 * @static
 * @prop {object[]} tools An array of tools. Each tool have this shape. the first in order wins:
 * ```
 * {
 *    tool: {boolean|node} if boolean and true, renders the plugins itself, if object, renders this object as a react component,
 *    exclusive: if true, gets a selector to make it active or not, setting active property of the tool. tool.toggleControl | tool.name is used from controls state to retrieve the status of the tool
 *    toggle: same as above, but sets also bsStyle
 *    action: if present, this action will be binded to the context and associated to the tool as eventSelector (default onClick)
 * }
 * ```
 *
 */
class ToolsContainer extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        container: PropTypes.func,
        containerWrapperStyle: PropTypes.object,
        tool: PropTypes.func,
        className: PropTypes.string,
        style: PropTypes.object,
        tools: PropTypes.array,
        panels: PropTypes.array,
        mapType: PropTypes.string,
        toolStyle: PropTypes.string,
        activeStyle: PropTypes.string,
        toolSize: PropTypes.string,
        stateSelector: PropTypes.string.isRequired,
        eventSelector: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        activePanel: PropTypes.string,
        toolCfg: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        container: Panel,
        className: "tools-container",
        style: {},
        toolStyle: "default",
        activeStyle: "primary",
        tools: [],
        panels: [],
        tool: Button,
        mapType: "leaflet",
        eventSelector: "onClick",
        panelStyle: {},
        panelClassName: "tools-container-panel",
        toolSize: null,
        toolCfg: {}
    };

    getToolConfig = (tool) => {
        if (tool.tool) {
            return {};
        }
        return this.props.toolCfg;
    };

    getTool = (tool) => {
        // tool attribute, if boolean, tells to render directly the plugin
        // otherwise tool is the component to render inside this container
        if (tool.tool) {
            return tool.tool === true ? tool.plugin : tool.tool;
        }
        let selector = () => ({});
        const actions = {};
        if (tool.exclusive) {
            selector = (state) => ({
                active: state.controls && state.controls[this.props.stateSelector] && state.controls[this.props.stateSelector].active === tool.name
            });
            actions[this.props.eventSelector] = setControlProperty.bind(null, this.props.stateSelector, 'active', tool.name, true);
        } else if (tool.toggle) {
            selector = (state) => ({
                bsStyle: state.controls[tool.toggleControl || tool.name] && state.controls[tool.toggleControl || tool.name][tool.toggleProperty || "enabled"] ? this.props.activeStyle : this.props.toolStyle,
                active: state.controls[tool.toggleControl || tool.name] && state.controls[tool.toggleControl || tool.name][tool.toggleProperty || "enabled"] || false
            });
            actions[this.props.eventSelector] = toggleControl.bind(null, tool.toggleControl || tool.name, tool.toggleProperty || null);
        } else if (tool.action) {
            actions[this.props.eventSelector] = partial(tool.action, this.context);
            // action tools can define their own selector
            selector = tool.selector || selector;
        }
        return connect(selector, actions, (stateProps, dispatchProps, parentProps) => {
            return this.mergeHandlers({
                ...parentProps,
                ...stateProps
            }, dispatchProps);
        })(this.props.tool);
    };

    renderTool = (tool, i) => {
        if (tool.element) {
            return tool.element;
        }
        const help = tool.help ? <HelpBadge className="mapstore-helpbadge" helpText={tool.help}/> : <span/>;
        const tooltip = tool.tooltip ? <Message msgId={tool.tooltip}/> : null;

        const Tool = this.getTool(tool);
        const toolCfg = this.getToolConfig(tool);
        const toolChildren = tool.childTools || [];

        return this.addTooltip(
            <Tool {...toolCfg} pluginCfg={tool.cfg} tooltip={tooltip} style={tool.style} btnSize={this.props.toolSize} bsStyle={this.props.toolStyle} help={help} key={tool.name || "tool" + i} mapType={this.props.mapType}
                {...tool.cfg} items={tool.items || []}>
                {tool.cfg && tool.cfg.glyph ? <Glyphicon glyph={tool.cfg.glyph}/> : tool.icon}{help} {tool.text}
                {toolChildren.length > 0 && <ToolsContainer
                    {...tool.innerProps}
                    mapType={this.props.mapType}
                    tools={toolChildren}
                    panels={tool.childPanels}/>}
            </Tool>,
            tool
        );
    }

    renderTools = () => {
        return this.props.tools.map(this.renderTool);
    };

    renderPanels = () => {
        return this.props.panels
            .filter((panel) => !panel.panel.loadPlugin).map((panel) => {
                const ToolPanelComponent = panel.panel;
                const ToolPanel = (<ToolPanelComponent
                    key={panel.name} mapType={this.props.mapType} {...panel.cfg} {...(panel.props || {})}
                    items={panel.items || []}/>);
                const title = panel.title ? <Message msgId={panel.title}/> : null;
                if (panel.wrap) {
                    return (
                        <Collapse key={"mapToolBar-item-collapse-" + panel.name} in={this.props.activePanel === panel.name}>
                            <Panel header={title} style={this.props.panelStyle} className={this.props.panelClassName}>
                                {ToolPanel}
                            </Panel>
                        </Collapse>
                    );
                }
                return ToolPanel;
            });
    };

    render() {
        const Container = this.props.container;
        return (
            <span id={this.props.id} style={this.props.containerWrapperStyle}>
                <Container id={this.props.id + "-container"} style={this.props.style} className={this.props.className}>
                    {this.renderTools()}
                </Container>
                {this.renderPanels()}
            </span>
        );
    }

    mergeHandlers = (props, handlers) => {
        return Object.keys(handlers).reduce((previous, event) => {
            return assign(previous, {[event]: props[event] ? compose(props[event], handlers[event]) : handlers[event]});
        }, props);
    };

    addTooltip = (button, spec) => {
        if (spec.tooltip) {
            let tooltip = <Tooltip id={this.props.id + "-" + spec.name + "-tooltip"}><Message msgId={spec.tooltip}/></Tooltip>;
            return (
                <OverlayTrigger key={this.props.id + "-" + spec.name + "-overlay"} rootClose placement="left" overlay={tooltip}>
                    {button}
                </OverlayTrigger>
            );
        }
        return button;
    };
}

module.exports = ToolsContainer;
