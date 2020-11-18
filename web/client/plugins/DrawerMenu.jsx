/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './drawer/drawer.css';

import { partialRight } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { setControlProperty, toggleControl } from '../actions/controls';
import { changeMapStyle } from '../actions/map';
import tooltip from '../components/misc/enhancers/tooltip';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import MenuComp from './drawer/Menu';
import Section from './drawer/Section';
import Message from './locale/Message';
import ButtonB from '../components/misc/Button';

const Button = tooltip(ButtonB);


const menuSelector = createSelector([
    state => state.controls.drawer && state.controls.drawer.enabled,
    state => state.controls.drawer && state.controls.drawer.menu || "1",
    state => state.controls.queryPanel && state.controls.queryPanel.enabled && state.controls.drawer && state.controls.drawer.width || state.controls.drawer && state.controls.drawer.resizedWidth || undefined,
    state => mapLayoutValuesSelector(state, {height: true})
], (show, activeKey, dynamicWidth, layout) => ({
    show,
    activeKey,
    dynamicWidth,
    layout
}));

const Menu = connect(menuSelector, {
    onToggle: toggleControl.bind(null, 'drawer', null),
    onResize: setControlProperty.bind(null, 'drawer', 'resizedWidth'),
    onChoose: partialRight(setControlProperty.bind(null, 'drawer', 'menu'), true),
    changeMapStyle: changeMapStyle
})(MenuComp);

const DrawerButton = connect(state => ({
    disabled: state.controls && state.controls.drawer && state.controls.drawer.disabled
}), {
    toggleMenu: toggleControl.bind(null, 'drawer', null)
})(({
    id = '',
    menuButtonStyle = {},
    buttonStyle = 'primary',
    buttonClassName = 'square-button ms-drawer-menu-button',
    toggleMenu = () => {},
    disabled = false,
    glyph = '1-layer',
    tooltipId = 'toc.drawerButton',
    tooltipPosition = 'bottom'
}) =>
    <Button
        id={id}
        style={menuButtonStyle}
        bsStyle={buttonStyle}
        key="menu-button"
        className={buttonClassName}
        onClick={toggleMenu}
        disabled={disabled}
        tooltipId={tooltipId}
        tooltipPosition={tooltipPosition}>
        <Glyphicon glyph={glyph}/>
    </Button>
);

/**
 * DrawerMenu plugin. It is a container for other plugins.
 * It shows a collapsible panel on the left with some plugins rendered inside it (typically the {@link #plugins.TOC|TOC})
 * and a button on the top-left corner to open this panel.
 * @prop {string} cfg.glyph glyph icon to use for the button
 * @prop {object} cfg.menuButtonStyle Css inline style for the button. Display property will be overridden by the hideButton/forceDrawer options.
 * @prop {string} cfg.buttonClassName class for the toggle button
 * @prop {object} cfg.menuOptions options for the drawer menu
 * @prop {boolean} cfg.menuOptions.docked
 * @prop {number} cfg.menuOptions.width
 * @prop {boolean} cfg.menuOptions.resizable enables horizontal resizing
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
        buttonClassName: "square-button ms-drawer-menu-button",
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
        return this.getTools().length > 0 ? (
            <div id={this.props.id}>
                <DrawerButton {...this.props} id="drawer-menu-button"/>
                <Menu single={this.props.singleSection} {...this.props.menuOptions} title={<Message msgId="menu" />} alignment="left">
                    {this.renderItems()}
                </Menu>
            </div>
        ) : null;
    }
}

const DrawerMenuPlugin = connect((state) => ({
    active: state.controls && state.controls.drawer && state.controls.drawer.active,
    disabled: state.controls && state.controls.drawer && state.controls.drawer.disabled
}), {
    toggleMenu: toggleControl.bind(null, 'drawer', null)
})(DrawerMenu);

export default {
    DrawerMenuPlugin: assign(DrawerMenuPlugin, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}",
        FloatingLegend: {
            priority: 1,
            name: 'drawer-menu',
            button: DrawerButton
        }
    }),
    reducers: {}
};
