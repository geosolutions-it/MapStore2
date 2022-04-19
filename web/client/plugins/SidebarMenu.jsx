/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';

import {createPlugin} from "../utils/PluginsUtils";
import {connect} from "react-redux";
import {setControlProperty} from "../actions/controls";
import SidebarElement from "../components/sidebarmenu/SidebarElement";
import assign from "object-assign";

import './sidebarmenu/sidebarmenu.less';
import ToolsContainer from "./containers/ToolsContainer";
import {createSelector} from "reselect";
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import {omit, pick} from "lodash";

class SidebarMenu extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        id: PropTypes.string,
        mapType: PropTypes.string,
        onInit: PropTypes.func,
        onDetach: PropTypes.func
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
        toolCfg: {}
    };

    constructor() {
        super();
        this.defaultTool = SidebarElement;
        this.defaultTarget = 'sidebar';
    }

    componentDidMount() {
        const { onInit } = this.props;
        onInit();
    }

    componentWillUnmount() {
        const { onDetach } = this.props;
        onDetach();
    }

    getStyle = (container = true) => {
        const method = container ? pick : omit;
        return method(this.props.style, ['height']);
    };

    getPanels = items => {
        return items.filter((item) => item.panel)
            .map((item) => assign({}, item, {panel: item.panel === true ? item.plugin : item.panel})).concat(
                items.filter((item) => item.tools).reduce((previous, current) => {
                    return previous.concat(
                        current.tools.map((tool, index) => ({
                            name: current.name + index,
                            panel: tool,
                            cfg: current.cfg.toolsCfg ? current.cfg.toolsCfg[index] : {}
                        }))
                    );
                }, [])
            );
    };

    getItems = (_target) => {
        const target = _target ? _target : this.defaultTarget;
        const targetMatch = (elementTarget) => elementTarget === target || !elementTarget && target === this.defaultTarget;
        const filtered = this.props.items.reduce(( prev, current) => {
            if (!current?.components && targetMatch(current.target)) {
                prev.push({
                    ...current,
                    target
                });
                return prev;
            }
            if (current?.components && Array.isArray(current.components)) {
                current.components.forEach((component) => {
                    if (targetMatch(component?.target)) {
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
        return filtered.sort((i1, i2) => (i1.position ?? 0) - (i2.position ?? 0));
    };

    getTools = (namespace = 'sidebar') => {
        return this.getItems(namespace).sort((a, b) => a.position - b.position);
    };


    render() {
        return (
            <>
                <ToolsContainer id={this.props.id}
                    containerWrapperStyle={this.getStyle()}
                    className={this.props.className}
                    mapType={this.props.mapType}
                    container={(props) => <div {...props}>{props.children}</div>}
                    toolStyle="tray"
                    activeStyle="primary"
                    stateSelector="sidebarMenu"
                    tool={SidebarElement}
                    tools={this.getTools()}
                    panels={[]}
                />
                <ToolsContainer id="sidebar-panel"
                    style={this.getStyle(false)}
                    containerWrapperStyle={this.getStyle()}
                    mapType={this.props.mapType}
                    container={(props) => <div {...props}>{props.children}</div>}
                    toolStyle="tray"
                    activeStyle="primary"
                    stateSelector="sidebarMenu"
                    tools={this.getTools('panel')}
                    panels={this.getPanels(this.props.items)}
                />
            </>
        );
    }
}

const sidebarMenuSelector = createSelector([
    state => mapLayoutValuesSelector(state, {bottom: true, height: true})
], (style) => ({
    style
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
        component: connect(sidebarMenuSelector, {
            onInit: setControlProperty.bind(null, 'sidebarMenu', 'enabled', true),
            onDetach: setControlProperty.bind(null, 'sidebarMenu', 'enabled', false)
        })(SidebarMenu)
    }
);
