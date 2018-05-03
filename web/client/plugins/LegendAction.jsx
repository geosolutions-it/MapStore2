/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {reverse, head, get, isObject} = require('lodash');
const {updateNode} = require('../actions/layers');
const {resizeLegend, expandLegend} = require('../actions/legendaction');
const {layersSelector} = require('../selectors/layers');
const {currentLocaleSelector} = require('../selectors/locale');
const {mapSelector} = require('../selectors/map');
const {boundingMapRectSelector} = require('../selectors/maplayout');
const {isFeatureGridOpen} = require('../selectors/featuregrid');
const {legendSizeSelector, legendExpandedSelector} = require('../selectors/legendaction');
const LegendAction = require('../components/TOC/LegendAction');
const {parseLayoutValue} = require('../utils/CoordinatesUtils');
const MapUtils = require('../utils/MapUtils');

/**
 * LegendAction plugin.
 * This plugin shows a list of layers with visibility and opacity controls.
 * If DrawerMenu is in localConfig it will be integrated with current plugin
 * @memberof plugins
 * @name LegendAction
 * @class
 * @prop {bool} cfg.disableOpacitySlider disable and hide opacity slider
 */

class LegendActionComponent extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        pluginName: PropTypes.string
    };

    static defaultProps = {
        items: [],
        pluginName: 'drawer-menu'
    };

    renderPanel() {
        const Plugin = this.props.items && head(this.props.items.filter(item => item && item.name === this.props.pluginName));
        return Plugin && Plugin.plugin && <Plugin.plugin {...(Plugin.cgf || {})} items={Plugin.items || []} menuButtonStyle={{display: 'none'}}/>;
    }

    renderToggleButton() {
        const Plugin = this.props.items && head(this.props.items.filter(item => item && item.name === this.props.pluginName));
        return Plugin && Plugin.button && <Plugin.button {...(Plugin.cgf || {})}/>;
    }

    render() {
        return (
            <div style={{position: 'absolute', height: '100%'}}>
                <LegendAction
                    {...this.props}
                    toggleButton={this.renderToggleButton()}/>
                {this.renderPanel()}
            </div>
        );
    }
}

const parseTitleObject = (title, currentLocale) => title && isObject(title) && (title[currentLocale] || title.default) || title || '';

const legendActionSelector = createSelector(
    [
        layersSelector,
        currentLocaleSelector,
        legendSizeSelector,
        legendExpandedSelector,
        state => get(state, 'controls.drawer.enabled'),
        mapSelector,
        boundingMapRectSelector,
        isFeatureGridOpen
    ],
    (layers, currentLocale, size, expanded, drawerEnabled, map, boundingMapRect, featuredGridOpen) => ({
        layers: featuredGridOpen && [] || layers && reverse([
            ...layers
                .filter(layer => layer && layer.group !== 'background' && !layer.loadingError)
                .map(({title, ...layer}) => ({...layer, title: parseTitleObject(title, currentLocale)}))
        ]) || [],
        title: map && map.info && map.info.name || '',
        height: size.height || 300,
        expanded,
        disabled: drawerEnabled ? true : false,
        maxHeight: map && map.size && map.size.height - 134 - (boundingMapRect && boundingMapRect.bottom && parseLayoutValue(boundingMapRect.bottom, map && map.size && map.size.height) || 0)
            || 9999,
        currentZoomLvl: map && map.zoom,
        scales: MapUtils.getScales(
            map && map.projection || 'EPSG:3857',
            map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
        )
    })
);

const LegendActionPlugin = connect(legendActionSelector, {
    onChange: updateNode,
    onResize: resizeLegend,
    onExpand: expandLegend
})(LegendActionComponent);

module.exports = {
    LegendActionPlugin: assign(LegendActionPlugin, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}"
    }),
    reducers: {
        legendaction: require('../reducers/legendaction')
    }
};
