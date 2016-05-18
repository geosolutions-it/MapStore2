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
const {changeLayerProperties, toggleNode, sortNode} = require('../actions/layers');
const {groupsSelector} = require('../selectors/layers');

const LayersUtils = require('../utils/LayersUtils');

const Message = require('./locale/Message');
const assign = require('object-assign');

const layersIcon = require('./toolbar/assets/img/layers.png');

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector
    ], (enabled, groups) => ({
        enabled,
        groups
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
        groupStyle: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        onToggleGroup: React.PropTypes.func,
        onToggleLayer: React.PropTypes.func,
        onSort: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            propertiesChangeHandler: () => {},
            onToggleGroup: () => {},
            onToggleLayer: () => {}
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
                    <DefaultGroup onSort={this.props.onSort} onToggle={this.props.onToggleGroup} style={this.props.groupStyle}>
                        <DefaultLayer
                            onToggle={this.props.onToggleLayer}
                            propertiesChangeHandler={this.props.propertiesChangeHandler}
                            />
                    </DefaultGroup>
                </TOC>
            </div>
        );
    }
});

const TOCPlugin = connect(tocSelector, {
    propertiesChangeHandler: changeLayerProperties,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode)
})(LayerTree);

module.exports = {
    TOCPlugin: assign(TOCPlugin, {
        Toolbar: {
            name: 'toc',
            position: 4,
            exclusive: true,
            panel: true,
            help: <Message msgId="helptexts.layerSwitcher"/>,
            tooltip: "layers",
            wrap: true,
            title: 'layers',
            icon: <img src={layersIcon}/>,
            hide: true
        },
        DrawerMenu: {
            name: 'toc',
            position: 1,
            title: 'layers'
        }
    }),
    reducers: {}
};
