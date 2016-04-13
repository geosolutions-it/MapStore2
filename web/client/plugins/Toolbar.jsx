/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const tools = require('./toolbar/index');

const {setControlProperty} = require('../actions/controls');
const {changeHelpText, changeHelpwinVisibility} = require('../actions/help');

const MapToolbar = connect((state) => ({
    activeKey: state.controls && state.controls.toolbar && state.controls.toolbar.active || null
}),
{
    onActivateItem: setControlProperty.bind(null, 'toolbar', 'active')
})(require('../components/toolbar/MapToolbar'));

const HelpBadge = connect((state) => ({
    isVisible: state.controls && state.controls.help && state.controls.help.enabled
}), {
    changeHelpText,
    changeHelpwinVisibility
})(require('../components/help/HelpBadge'));

const Toolbar = React.createClass({
    propTypes: {
        tools: React.PropTypes.array,
        mapType: React.PropTypes.string
    },
    getPanels() {
        return this.getTools().filter((tool) => tool.panel).map((tool) => tool.panel);
    },
    getTools() {
        return this.props.tools && this.props.tools.reduce((previous, current) => {
            return previous.concat(tools.filter((tool) => tool.name === current)[0]);
        }, []) || tools;
    },
    renderTools() {
        return this.getTools().map((tool) => {
            const Tool = tool.tool;
            const help = tool.help ? {help: <HelpBadge className="mapstore-tb-helpbadge" helpText={tool.help}/>} : {};
            return <Tool key={tool.name} {...help} mapType={this.props.mapType} {...(tool.props || {})}/>;
        });
    },
    renderPanels() {
        return this.getPanels().map((panel) => {
            const Panel = panel.panel;
            return <Panel key={panel.name} mapType={this.props.mapType} {...(panel.props || {})}/>;
        });
    },
    render() {
        return (
            <span>
            <MapToolbar>
                {this.renderTools()}
            </MapToolbar>
                {this.renderPanels()}
            </span>
        );
    }
});

module.exports = Toolbar;
