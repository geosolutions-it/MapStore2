/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {changeLayerProperties, changeGroupProperties, toggleNode,
       sortNode, showSettings, hideSettings, updateSettings, updateNode, removeNode} = require('../actions/layers');
const {groupsSelector} = require('../selectors/layers');

const LayersUtils = require('../utils/LayersUtils');

const Message = require('./locale/Message');
const assign = require('object-assign');

const layersIcon = require('./toolbar/assets/img/layers.png');

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector,
        (state) => state.layers.settings || {expanded: false, options: {opacity: 1}}
    ], (enabled, groups, settings) => ({
        enabled,
        groups,
        settings
    })
);

const TOC = require('../components/TOC/TOC');
const DefaultGroup = require('../components/TOC/DefaultGroup');
const DefaultLayer = require('../components/TOC/DefaultLayer');

const LayerTree = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        buttonContent: React.PropTypes.node,
        groups: React.PropTypes.array,
        settings: React.PropTypes.object,
        groupStyle: React.PropTypes.object,
        groupPropertiesChangeHandler: React.PropTypes.func,
        layerPropertiesChangeHandler: React.PropTypes.func,
        onToggleGroup: React.PropTypes.func,
        onToggleLayer: React.PropTypes.func,
        onSort: React.PropTypes.func,
        onSettings: React.PropTypes.func,
        hideSettings: React.PropTypes.func,
        updateSettings: React.PropTypes.func,
        updateNode: React.PropTypes.func,
        removeNode: React.PropTypes.func,
        activateRemoveLayer: React.PropTypes.bool,
        activateLegendTool: React.PropTypes.bool,
        activateSettingsTool: React.PropTypes.bool,
        visibilityCheckType: React.PropTypes.string,
        settingsOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            groupPropertiesChangeHandler: () => {},
            layerPropertiesChangeHandler: () => {},
            onToggleGroup: () => {},
            onToggleLayer: () => {},
            onSettings: () => {},
            updateNode: () => {},
            removeNode: () => {},
            activateLegendTool: true,
            activateSettingsTool: true,
            activateRemoveLayer: true,
            visibilityCheckType: "checkbox",
            settingsOptions: {}
        };
    },
    getNoBackgroundLayers(group) {
        return group.name !== 'background';
    },
    render() {
        if (!this.props.groups) {
            return <div></div>;
        }

        return (
            <div>
                <TOC onSort={this.props.onSort} filter={this.getNoBackgroundLayers}
                    nodes={this.props.groups}>
                    <DefaultGroup onSort={this.props.onSort}
                                  propertiesChangeHandler={this.props.groupPropertiesChangeHandler}
                                  onToggle={this.props.onToggleGroup}
                                  style={this.props.groupStyle}
                                  groupVisibilityCheckbox={true}
                                  visibilityCheckType={this.props.visibilityCheckType}
                                  >
                    <DefaultLayer
                            settingsOptions={this.props.settingsOptions}
                            onToggle={this.props.onToggleLayer}
                            onSettings={this.props.onSettings}
                            propertiesChangeHandler={this.props.layerPropertiesChangeHandler}
                            hideSettings={this.props.hideSettings}
                            settings={this.props.settings}
                            updateSettings={this.props.updateSettings}
                            updateNode={this.props.updateNode}
                            removeNode={this.props.removeNode}
                            visibilityCheckType={this.props.visibilityCheckType}
                            activateRemoveLayer={this.props.activateRemoveLayer}
                            activateLegendTool={this.props.activateLegendTool}
                            activateSettingsTool={this.props.activateSettingsTool}
                            settingsText={<Message msgId="layerProperties.windowTitle"/>}
                            opacityText={<Message msgId="opacity"/>}
                            saveText={<Message msgId="save"/>}
                            closeText={<Message msgId="close"/>}
                            groups={this.props.groups}/>
                    </DefaultGroup>
                </TOC>
            </div>
        );
    }
});

const TOCPlugin = connect(tocSelector, {
    groupPropertiesChangeHandler: changeGroupProperties,
    layerPropertiesChangeHandler: changeLayerProperties,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode),
    onSettings: showSettings,
    hideSettings,
    updateSettings,
    updateNode,
    removeNode
})(LayerTree);

module.exports = {
    TOCPlugin: assign(TOCPlugin, {
        Toolbar: {
            name: 'toc',
            position: 7,
            exclusive: true,
            panel: true,
            help: <Message msgId="helptexts.layerSwitcher"/>,
            tooltip: "layers",
            wrap: true,
            title: 'layers',
            icon: <img src={layersIcon}/>,
            priority: 1
        },
        DrawerMenu: {
            name: 'toc',
            position: 1,
            icon: <img src={layersIcon}/>,
            title: 'layers',
            priority: 2
        }
    }),
    reducers: {}
};
