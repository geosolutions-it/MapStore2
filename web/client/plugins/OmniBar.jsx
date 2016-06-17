/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

require('./omnibar/omnibar.css');

const OmniBar = React.createClass({
    propTypes: {
        items: React.PropTypes.array,
        id: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            items: [],
            id: "mapstore-navbar"
        };
    },
    getTool(tool) {
        if (tool.tool) {
            const Tool = tool.tool === true ? tool.plugin : tool.tool;
            return <li key={tool.name}><Tool {...tool.cfg} items={tool.items || []}/></li>;
        }
        return <li key={tool.name}><span/></li>;
    },
    renderExtraTools() {
        return this.props.items.map((item) => this.renderExtraTool(item));
    },
    renderExtraTool(tool) {
        if (tool.tools) {
            return tool.tools.map((Tool, index) => <Tool key={name + index}/>);
        }
        return null;
    },
    renderPlugins() {
        return this.props.items.sort((a, b) => a.position - b.position).map((item) => this.getTool(item));
    },
    /* {this.renderUserMenu()} {this.renderMenu()}*/
    render() {
        return (<div id={this.props.id} className="navbar-dx shadow">
            <ul>
                {this.renderPlugins()}
            </ul>
            {this.renderExtraTools()}
            </div>);
    }
});

module.exports = {
    OmniBarPlugin: OmniBar,
    reducers: {}
};
