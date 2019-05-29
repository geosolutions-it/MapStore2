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
const {reverse, head, get} = require('lodash');
const {updateNode} = require('../actions/layers');
const {resizeLegend, expandLegend} = require('../actions/floatinglegend');
const {layersSelector} = require('../selectors/layers');
const {currentLocaleSelector} = require('../selectors/locale');
const {mapSelector} = require('../selectors/map');
const {boundingMapRectSelector} = require('../selectors/maplayout');
const {isFeatureGridOpen} = require('../selectors/featuregrid');
const {legendSizeSelector, legendExpandedSelector} = require('../selectors/floatinglegend');
const FloatingLegend = require('../components/TOC/FloatingLegend');
const {parseLayoutValue, getScales} = require('../utils/MapUtils');
const {getLocalizedProp} = require('../utils/LocaleUtils');

/**
 * FloatingLegend plugin.
 * This plugin shows a list of layers with visibility and opacity controls.
 * If DrawerMenu is in localConfig it will be integrated with current plugin
 * @memberof plugins
 * @name FloatingLegend
 * @class
 * @prop {boolean} cfg.disableOpacitySlider disable and hide opacity slider
 * @prop {boolean} cfg.expandedOnMount show expanded legend when component did mount
 * @prop {number} cfg.width width dimension of legend
 * @prop {boolean} cfg.hideOpacityTooltip hide toolip on opacity sliders
 */

class FloatingLegendComponent extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        pluginName: PropTypes.string,
        tooltipId: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object
    };

    static defaultProps = {
        items: [],
        pluginName: 'drawer-menu',
        tooltipId: 'floatinglegend.showTOC',
        className: 'ms-floatinglegend-container',
        style: {
            top: 0,
            left: 0,
            position: 'absolute',
            height: '100%'
        }
    };

    renderPanel() {
        const Plugin = this.props.items && head(this.props.items.filter(item => item && item.name === this.props.pluginName));
        return Plugin && Plugin.plugin && <Plugin.plugin {...(Plugin.cfg || {})} items={Plugin.items || []} menuButtonStyle={{display: 'none'}}/>;
    }

    renderToggleButton() {
        const Plugin = this.props.items && head(this.props.items.filter(item => item && item.name === this.props.pluginName));
        return Plugin && Plugin.button && <Plugin.button {...(Plugin.cfg || {})} tooltipId={this.props.tooltipId}/>;
    }

    render() {
        return (
            <div
                className={this.props.className}
                style={this.props.style}>
                <FloatingLegend
                    {...this.props}
                    toggleButton={this.renderToggleButton()}/>
                {this.renderPanel()}
            </div>
        );
    }
}

const floatingLegendSelector = createSelector(
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
                .map(({title, ...layer}) => ({...layer, title: getLocalizedProp(currentLocale, title)}))
        ]) || [],
        title: map && map.info && map.info.name || '',
        height: size.height || 300,
        expanded,
        disabled: drawerEnabled ? true : false,
        maxHeight: map && map.size && map.size.height - 134 - (boundingMapRect && boundingMapRect.bottom && parseLayoutValue(boundingMapRect.bottom, map && map.size && map.size.height) || 0)
            || 9999,
        currentZoomLvl: map && map.zoom,
        scales: getScales(
            map && map.projection || 'EPSG:3857',
            map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
        )
    })
);

const FloatingLegendPlugin = connect(floatingLegendSelector, {
    onChange: updateNode,
    onResize: resizeLegend,
    onExpand: expandLegend
})(FloatingLegendComponent);

module.exports = {
    FloatingLegendPlugin: assign(FloatingLegendPlugin, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}"
    }),
    reducers: {
        floatinglegend: require('../reducers/floatinglegend')
    }
};
