/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

require('./omnibar/omnibar.css');

const ToolsContainer = require('./containers/ToolsContainer');

const OmniBar = React.createClass({
    propTypes: {
        items: React.PropTypes.array,
        id: React.PropTypes.string,
        mapType: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            items: [],
            id: "mapstore-navbar",
            mapType: "leaflet"
        };
    },
    getTool(tool) {
        if (tool.tool) {
            const Tool = tool.tool === true ? tool.plugin : tool.tool;
            return <li key={tool.name}><Tool {...tool.cfg} items={tool.items || []}/></li>;
        }
        return <li key={tool.name}><span/></li>;
    },
    getPanels() {
        return this.props.items.filter((item) => item.tools).reduce((previous, current) => {
            return previous.concat(
                current.tools.map((tool, index) => ({
                    name: current.name + index,
                    panel: tool,
                    cfg: current.cfg.toolsCfg ? current.cfg.toolsCfg[index] : {}
                }))
            );
        }, []);

    },
    getTools() {
        return this.props.items.sort((a, b) => a.position - b.position);
    },
    render() {
        return (<ToolsContainer id={this.props.id} className="navbar-dx shadow"
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
});

module.exports = {
    OmniBarPlugin: OmniBar,
    reducers: {}
};
