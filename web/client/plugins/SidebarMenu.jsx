/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';

import ToolsContainer from './containers/ToolsContainer';
import './sidebarmenu/sidebarmenu.css';
import {createPlugin} from "../utils/PluginsUtils";
import {connect} from "react-redux";
import {setControlProperty} from "../actions/controls";

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
        className: "navbar-dx",
        style: {},
        id: "mapstore-sidebar-menu",
        mapType: "openlayers",
        onInit: () => {},
        onDetach: () => {}
    };

    componentDidMount() {
        const { onInit } = this.props;
        onInit();
    }

    componentWillUnmount() {
        const { onDetach } = this.props;
        onDetach();
    }

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

    getTools = () => {
        return this.props.items.sort((a, b) => a.position - b.position);
    };

    render() {
        return (<ToolsContainer id={this.props.id}
            style={this.props.style}
            className={this.props.className}
            mapType={this.props.mapType}
            container={(props) => <div {...props}>{props.children}</div>}
            toolStyle="default"
            activeStyle="primary"
            stateSelector="sidebarMenu"
            tool={(props) => <div>{props.children}</div>}
            tools={this.getTools()}
            panels={this.getPanels()}
        />);
    }
}

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
        component: connect((state) =>({
            controls: state.controls
        }), {
            onInit: setControlProperty.bind(null, 'sidebarMenu', 'enabled', true),
            onDetach: setControlProperty.bind(null, 'sidebarMenu', 'enabled', false)
        })(SidebarMenu)
    }
);
