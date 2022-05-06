/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import ContainerDimensions from 'react-container-dimensions';
import {DropdownButton, Glyphicon, MenuItem} from "react-bootstrap";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {bindActionCreators} from "redux";

import ToolsContainer from "./containers/ToolsContainer";
import SidebarElement from "../components/sidebarmenu/SidebarElement";
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import tooltip from "../components/misc/enhancers/tooltip";
import {setControlProperty} from "../actions/controls";
import {createPlugin} from "../utils/PluginsUtils";
import sidebarMenuReducer from "../reducers/sidebarmenu";
import sidebarMenuEpics from "../epics/sidebarmenu";

import './sidebarmenu/sidebarmenu.less';
import {lastActiveToolSelector, sidebarIsActiveSelector} from "../selectors/sidebarmenu";
import {setLastActiveItem} from "../actions/sidebarmenu";
import Message from "../components/I18N/Message";

const TDropdownButton = tooltip(DropdownButton);

class SidebarMenu extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        id: PropTypes.string,
        mapType: PropTypes.string,
        onInit: PropTypes.func,
        onDetach: PropTypes.func,
        sidebarWidth: PropTypes.number,
        state: PropTypes.object,
        setLastActiveItem: PropTypes.func,
        lastActiveTool: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        items: [],
        style: {},
        id: "mapstore-sidebar-menu",
        mapType: "openlayers",
        onInit: () => {},
        onDetach: () => {},
        eventSelector: "onClick",
        toolStyle: "default",
        activeStyle: "primary",
        stateSelector: 'sidebarMenu',
        tool: SidebarElement,
        toolCfg: {},
        sidebarWidth: 40
    };

    constructor() {
        super();
        this.defaultTool = SidebarElement;
        this.defaultTarget = 'sidebar';
        this.state = {
            lastVisible: false,
            hidden: false
        };
    }

    componentDidMount() {
        const { onInit } = this.props;
        onInit();
    }

    shouldComponentUpdate(nextProps) {
        const markedAsInactive = nextProps.isActive === false;
        const newSize = nextProps.state.map?.present?.size?.height !== this.props.state.map?.present?.size?.height;
        const newHeight = nextProps.style.bottom !== this.props.style.bottom;
        const newItems = nextProps.items !== this.props.items;
        const burgerMenuState = nextProps.state?.controls?.burgermenu?.enabled !== this.props.state?.controls?.burgermenu?.enabled;
        const newVisibleItems = !newItems ? nextProps.items.reduce((prev, cur, idx) => {
            if (this.isNotHidden(cur, nextProps.state) !== this.isNotHidden(this.props.items[idx], this.props.state)) {
                prev.push(cur);
            }
            return prev;
        }, []).length > 0 : false;
        return newSize || newItems || newVisibleItems || newHeight || burgerMenuState || markedAsInactive;
    }

    componentDidUpdate(prevProps) {
        const { onInit, onDetach } = this.props;
        const { hidden } = this.state;
        const visibleElements = this.visibleItems('sidebar').length;
        visibleElements && prevProps.isActive === false && onInit();

        if (visibleElements === 0 && !hidden) {
            onDetach();
            this.setState((state) => ({ ...state, hidden: true}));
        } else if (visibleElements > 0 && hidden) {
            onInit();
            this.setState((state) => ({ ...state, hidden: false}));
        }
    }

    componentWillUnmount() {
        const { onDetach } = this.props;
        onDetach();
    }

    getStyle = (style) => {
        const hasBottomOffset = parseInt(style?.bottom, 10) !== 0;
        return { ...style, height: hasBottomOffset ? 'auto' : '100%', maxHeight: style?.height ?? null, bottom: hasBottomOffset ? `calc(${style.bottom} + 30px)` : null };
    };

    getPanels = () => {
        return this.props.items.filter((item) => item.tools).reduce((previous, current) => {
            return previous.concat(
                current.tools.map((tool, index) => ({
                    name: current.name + index,
                    panel: tool,
                    cfg: current?.cfg?.toolsCfg?.[index] || {}
                }))
            );
        }, []);

    };

    visibleItems = (target) => {
        return this.props.items.reduce(( prev, current) => {
            if (!current?.components && this.targetMatch(target, current.target)
                && this.isNotHidden(current, this.props.state)
            ) {
                prev.push({
                    ...current,
                    target
                });
                return prev;
            }
            if (current?.components && Array.isArray(current.components)) {
                current.components.forEach((component) => {
                    if (this.targetMatch(target, component?.target)
                        && this.isNotHidden(component?.selector ? component : current, this.props.state)
                    ) {
                        prev.push({
                            plugin: current?.plugin || this.defaultTool,
                            position: current?.position,
                            cfg: current?.cfg,
                            name: current.name,
                            help: current?.help,
                            items: current?.items,
                            ...component
                        });
                    }
                    return prev;
                });
            }
            return prev;
        }, []);
    }

    getItems = (_target, height) => {
        const itemsToRender = Math.floor(height / this.props.sidebarWidth) - 1;
        const target = _target ? _target : this.defaultTarget;
        const filtered = this.visibleItems(target);

        if (itemsToRender < filtered.length) {
            const sorted = filtered.sort((i1, i2) => (i1.position ?? 0) - (i2.position ?? 0));
            this.swapLastActiveItem(sorted, itemsToRender);
            const toRender = sorted.slice(0, itemsToRender);
            const extra = {
                name: "moreItems",
                position: 9999,
                icon: <Glyphicon glyph="option-horizontal" />,
                tool: () => this.renderExtraItems(filtered.slice(itemsToRender)),
                priority: 1
            };
            toRender.splice(itemsToRender, 0, extra);
            return toRender;
        }

        return filtered.sort((i1, i2) => (i1.position ?? 0) - (i2.position ?? 0));
    };

    targetMatch = (target, elementTarget) => elementTarget === target || !elementTarget && target === this.defaultTarget;

    getTools = (namespace = 'sidebar', height) => {
        return this.getItems(namespace, height).sort((a, b) => a.position - b.position);
    };

    renderExtraItems = (items) => {
        const dummySelector = () => {};
        const menuItems = items.map((item) => {
            const ConnectedItem = connect((item?.selector ?? dummySelector),
                (dispatch, ownProps) => {
                    const actions = {};
                    if (ownProps.action) {
                        actions.onClick = () => {
                            this.props.setLastActiveItem(item?.name ?? item?.toggleProperty);
                            bindActionCreators(ownProps.action, dispatch)();
                        };
                    }
                    return actions;
                })(MenuItem);
            return <ConnectedItem action={item.action}>{item?.icon}{item?.text}</ConnectedItem>;
        });
        return (
            <TDropdownButton
                dropup
                pullRight
                bsStyle="tray"
                id="extra-items"
                tooltip={<Message msgId="sidebarMenu.showMoreItems" />}
                tooltipPosition="left"
                title={<Glyphicon glyph="option-horizontal" />}
            >
                {menuItems}
            </TDropdownButton>);
    };

    render() {
        return this.state.hidden ? false : (
            <div id="mapstore-sidebar-menu-container" className="shadow-soft" style={this.getStyle(this.props.style)}>
                <ContainerDimensions>
                    { ({ height }) =>
                        <ToolsContainer id={this.props.id}
                            className={this.props.className}
                            mapType={this.props.mapType}
                            container={(props) => <>{props.children}</>}
                            toolStyle="tray"
                            activeStyle="primary"
                            stateSelector="sidebarMenu"
                            tool={SidebarElement}
                            tools={this.getTools('sidebar', height)}
                            panels={this.getPanels(this.props.items)}
                        /> }
                </ContainerDimensions>
            </div>

        );
    }

    swapLastActiveItem = (items, itemsToRender) => {
        const name = this.props.lastActiveTool;
        if (name) {
            const idx = items.findIndex((el) => el?.name === name || el?.toggleProperty === name);
            if (idx !== -1 && idx > (itemsToRender - 1)) {
                const item = items[idx];
                items[idx] = items[itemsToRender - 1];
                items[itemsToRender - 2] = item;
            }
        }
    }


    isNotHidden = (element, state) => {
        return element?.selector ? element.selector(state)?.style?.display !== 'none' : true;
    };
}

const sidebarMenuSelector = createSelector([
    state => state,
    state => lastActiveToolSelector(state),
    state => mapLayoutValuesSelector(state, {bottom: true, height: true}),
    sidebarIsActiveSelector
], (state, lastActiveTool, style, isActive) => ({
    style,
    lastActiveTool,
    state,
    isActive
}));

/**
 * Generic bar that can contains other plugins.
 * used by {@link #plugins.Login|Login}, {@link #plugins.Home|Home},
 * {@link #plugins.Login|Login} and many other, on map viewer pages.
 * @name SidebarMenu
 * @class
 * @memberof plugins
 */
export default createPlugin(
    'SidebarMenu',
    {
        cfg: {},
        component: connect(sidebarMenuSelector, {
            onInit: setControlProperty.bind(null, 'sidebarMenu', 'enabled', true),
            onDetach: setControlProperty.bind(null, 'sidebarMenu', 'enabled', false),
            setLastActiveItem
        })(SidebarMenu),
        epics: sidebarMenuEpics,
        reducers: {
            sidebarmenu: sidebarMenuReducer
        }
    }
);
