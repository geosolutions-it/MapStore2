/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import './omnibar/omnibar.css';
import assign from 'object-assign';
import ToolsContainer from './containers/ToolsContainer';

class OmniBar extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        id: PropTypes.string,
        mapType: PropTypes.string
    };

    static defaultProps = {
        items: [],
        className: "navbar-dx shadow",
        style: {},
        id: "mapstore-navbar",
        mapType: "leaflet"
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

    getTools = () => {
        return this.props.items.sort((a, b) => a.position - b.position);
    };

    render() {
        return (<ToolsContainer id={this.props.id}
            style={this.props.style}
            className={this.props.className}
            mapType={this.props.mapType}
            container={(props) => <div {...props}>{props.children}</div>}
            toolStyle="primary"
            activeStyle="default"
            stateSelector="omnibar"
            tool={(props) => <div>{props.children}</div>}
            tools={this.getTools()}
            panels={this.getPanels()}
        />);
    }
}

/**
 * Generic bar that can contains other plugins.
 * used by {@link #plugins.SearchBar|SearchBar}, {@link #plugins.BurgerMenu|BurgerMenu},
 * {@link #plugins.Login|Login} and many other, in different pages.
 * @name OmniBar
 * @class
 * @memberof plugins
 */
export default {
    OmniBarPlugin: assign(
        OmniBar,
        {
            disablePluginIf: "{state('featuregridmode') === 'EDIT' || (state('router') && state('router').includes('/geostory/shared') && state('geostorymode') !== 'edit')}"
        }
    ),
    reducers: {}
};
