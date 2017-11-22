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
const {createSelector} = require('reselect');
const OverlayTrigger = require('../components/misc/OverlayTrigger');

const Message = require('./locale/Message');

const {toggleControl, setControlProperty} = require('../actions/controls');

const {changeMapStyle} = require('../actions/map');

const {Button, Glyphicon, Panel, Tooltip} = require('react-bootstrap');

const Section = require('./drawer/Section');

const {partialRight} = require('lodash');

const assign = require('object-assign');

const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const menuSelector = createSelector([
    state => state.controls.drawer && state.controls.drawer.enabled,
    state => state.controls.drawer && state.controls.drawer.menu || "1",
    state => state.controls.queryPanel && state.controls.queryPanel.enabled && state.controls.drawer && state.controls.drawer.width || undefined,
    state => mapLayoutValuesSelector(state, {height: true})
], (show, activeKey, dynamicWidth, layout) => ({
    show,
    activeKey,
    dynamicWidth,
    layout
}));

const Menu = connect(menuSelector, {
    onToggle: toggleControl.bind(null, 'drawer', null),
    onChoose: partialRight(setControlProperty.bind(null, 'drawer', 'menu'), true),
    changeMapStyle: changeMapStyle
})(require('./drawer/Menu'));

require('./drawer/drawer.css');

/**
 * DrawerMenu plugin. Shows a left menu with some pluins rendered inside it (typically the TOC).
 * @prop {string} cfg.glyph glyph icon to use for the button
 * @prop {object} cfg.menuButtonStyle Css inline style for the button. Display property will be overridden by the hideButton/forceDrawer options.
 * @prop {string} cfg.buttonClassName class for the toggle button
 * @prop {object} cfg.menuOptions options for the drawer menu. They can be `docked`, `width.
 * @memberof plugins
 * @class
 * @example
 * {
 *   "name": "DrawerMenu",
 *   "cfg": {
 *     "hideButton": true
 *   }
 * }
 */
class DrawerMenu extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        active: PropTypes.string,
        toggleMenu: PropTypes.func,
        id: PropTypes.string,
        glyph: PropTypes.string,
        buttonStyle: PropTypes.string,
        menuOptions: PropTypes.object,
        singleSection: PropTypes.bool,
        buttonClassName: PropTypes.string,
        menuButtonStyle: PropTypes.object,
        disabled: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-drawermenu",
        items: [],
        toggleMenu: () => {},
        glyph: "1-layer",
        buttonStyle: "primary",
        menuOptions: {},
        singleSection: true,
        buttonClassName: "square-button",
        disabled: false
    };

    getTools = () => {
        const unsorted = this.props.items
            .map((item, index) => assign({}, item, {position: item.position || index}));
        return unsorted.sort((a, b) => a.position - b.position);
    };

    renderItems = () => {
        return this.getTools().map((tool, index) => {
            const Plugin = tool.panel || tool.plugin;
            const plugin = (<Plugin
                isPanel
                {...tool.cfg}
                items={tool.items || []}
                groupStyle={{style: {
                    marginBottom: "0px",
                    cursor: "pointer"
                }}}
                />);
            const header = tool.title ? <div className={'drawer-menu-head drawer-menu-head-' + tool.name}><Message msgId={tool.title}/></div> : null;

            return this.props.singleSection ?
                <Panel icon={tool.icon} glyph={tool.glyph} buttonConfig={tool.buttonConfig} key={tool.name} eventKey={index + 1 + ""} header={header}>
                    {plugin}
                </Panel>
             : <Section key={tool.name} renderInModal={tool.renderInModal || false} eventKey={index + 1 + ""} header={header}>
                {plugin}
            </Section>;
        });
    };

    render() {
        let tooltip = <Tooltip key="drawerButtonTooltip" id="drawerButtonTooltip"><Message msgId={"toc.drawerButton"}/></Tooltip>;
        return (
            <div id={this.props.id}>
                <OverlayTrigger placement="bottom" key="drawerButtonTooltip"
                    overlay={tooltip}>
                    <Button id="drawer-menu-button" style={this.props.menuButtonStyle} bsStyle={this.props.buttonStyle} key="menu-button" className={this.props.buttonClassName} onClick={this.props.toggleMenu} disabled={this.props.disabled}><Glyphicon glyph={this.props.glyph}/></Button>
                </OverlayTrigger>
                <Menu single={this.props.singleSection} {...this.props.menuOptions} title={<Message msgId="menu" />} alignment="left">
                    {this.renderItems()}
                </Menu>
            </div>
        );
    }
}

module.exports = {
    DrawerMenuPlugin: connect((state) => ({
        active: state.controls && state.controls.drawer && state.controls.drawer.active,
        disabled: state.controls && state.controls.drawer && state.controls.drawer.disabled
    }), {
        toggleMenu: toggleControl.bind(null, 'drawer', null)
    })(assign(DrawerMenu, {disablePluginIf: "{state('featuregridmode') === 'EDIT'}"})),
    reducers: {}
};
