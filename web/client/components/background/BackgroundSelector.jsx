/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const {isEmpty} = require('lodash');

const PreviewButton = require('./PreviewButton');
const PreviewList = require('./PreviewList');
const PreviewIcon = require('./PreviewIcon');

const HYBRID = require('./images/mapthumbs/HYBRID.jpg');
const ROADMAP = require('./images/mapthumbs/ROADMAP.jpg');
const TERRAIN = require('./images/mapthumbs/TERRAIN.jpg');
const Aerial = require('./images/mapthumbs/Aerial.jpg');
const mapnik = require('./images/mapthumbs/mapnik.jpg');
const mapquestOsm = require('./images/mapthumbs/mapquest-osm.jpg');
const empty = require('./images/mapthumbs/none.jpg');
const unknown = require('./images/mapthumbs/dafault.jpg');
const Night2012 = require('./images/mapthumbs/NASA_NIGHT.jpg');
const AerialWithLabels = require('./images/mapthumbs/AerialWithLabels.jpg');
const OpenTopoMap = require('./images/mapthumbs/OpenTopoMap.jpg');

const thumbs = {
    google: {
        HYBRID,
        ROADMAP,
        TERRAIN
    },
    bing: {
        Aerial,
        AerialWithLabels
    },
    osm: {
        mapnik
    },
    mapquest: {
        osm: mapquestOsm
    },
    ol: {
        "undefined": empty
    },
    nasagibs: {
        Night2012
    },
    OpenTopoMap: {
        OpenTopoMap
    },
    unknown
};

require('./css/background.css');

const BackgroundSelector = React.createClass({
    propTypes: {
        drawerWidth: React.PropTypes.number,
        start: React.PropTypes.number,
        bottom: React.PropTypes.number,
        isMobile: React.PropTypes.bool,
        enabled: React.PropTypes.bool,
        drawerEnabled: React.PropTypes.bool,
        layers: React.PropTypes.array,
        currentLayer: React.PropTypes.object,
        tempLayer: React.PropTypes.object,
        size: React.PropTypes.object,
        desktop: React.PropTypes.object,
        mobile: React.PropTypes.object,
        onToggle: React.PropTypes.func,
        propertiesChangeHandler: React.PropTypes.func,
        setControlProperty: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            drawerWidth: 0,
            start: 0,
            bottom: 0,
            isMobile: false,
            enabled: false,
            drawerEnabled: false,
            layers: [],
            currentLayer: {},
            tempLayer: {},
            size: {width: 0, height: 0},
            desktop: {},
            mobile: {},
            onToggle: () => {},
            propertiesChangeHandler: () => {},
            setControlProperty: () => {}
        };
    },
    componentWillUnmount() {
        this.props.setControlProperty('backgroundSelector', 'currentLayer', {});
        this.props.setControlProperty('backgroundSelector', 'tempLayer', {});
        this.props.setControlProperty('backgroundSelector', 'start', 0);
    },
    componentWillUpdate(nextProps) {
        if (this.props.size.width !== nextProps.size.width
        || this.props.size.height !== nextProps.size.height
        || this.props.drawerEnabled !== nextProps.drawerEnabled) {
            this.props.setControlProperty('backgroundSelector', 'start', 0);
        }
    },
    getThumb(layer) {
        return thumbs[layer.source] && thumbs[layer.source][layer.name] || layer.thumbURL || thumbs.unknown;
    },
    getLayer() {
        const tempLyr = isEmpty(this.props.tempLayer) ? this.props.layers.filter((layer) => { return layer.visibility === true; })[0] : this.props.tempLayer;
        const currentLyr = isEmpty(this.props.currentLayer) ? this.props.layers.filter((layer) => { return layer.visibility === true; })[0] : this.props.currentLayer;
        return this.props.enabled ? tempLyr : currentLyr;
    },
    getIcons(side, frame, margin, vertical) {
        return this.props.enabled ? this.props.layers.map((layer, idx) => {
            let thumb = this.getThumb(layer);
            return <PreviewIcon vertical={vertical} key={idx} src={thumb} currentLayer={this.props.currentLayer} margin={margin} side={side} frame={frame} layer={layer} onClose={this.props.onToggle} onToggle={this.props.propertiesChangeHandler} setLayer={this.props.setControlProperty}/>;
        }) : [];
    },
    getDimensions(side, frame, margin, left, size, iconsLength) {
        const openPreviewSize = (side + frame * 2 + margin * 2) + (side + frame * 2 + margin) * iconsLength + left;
        const minSize = (size / 2) - (side + frame * 2 + margin * 2) - left;
        const pagination = openPreviewSize > size / 2;
        let visibleIconsLength = Math.floor(minSize / (side + frame * 2 + margin));
        visibleIconsLength = visibleIconsLength > iconsLength ? iconsLength : visibleIconsLength;
        const listSize = this.props.enabled ? (side + frame + margin) * visibleIconsLength + 52 : 0;

        return {pagination, listSize, visibleIconsLength};
    },
    renderDesktop() {

        const desktop = assign({
            side: 78,
            sidePreview: 104,
            frame: 3,
            margin: 5
        }, this.props.desktop);

        const frame = desktop.frame * 2;
        const side = desktop.side - frame;
        const sideButton = this.props.enabled ? desktop.sidePreview - frame : side;
        const margin = desktop.margin;

        const labelHeight = this.props.enabled ? sideButton - frame * 2 : 0;
        const layer = this.getLayer();
        const src = this.getThumb(layer);
        const icons = this.getIcons(side, frame, margin, false);
        let left = this.props.drawerWidth !== 0 ? this.props.drawerWidth : 300;
        left = this.props.drawerEnabled ? left : 0;
        const {pagination, listSize, visibleIconsLength} = this.getDimensions(side, frame, margin, left, this.props.size.width, icons.length);
        const buttonSize = side + frame + margin;

        return visibleIconsLength <= 0 && this.props.enabled
        || !this.props.enabled && this.props.size.width / 2 < left + sideButton + frame + margin * 2 ? null : (
            <div className="background-plugin-position" style={{left, bottom: this.props.bottom}}>
                <PreviewButton src={src} side={sideButton} frame={frame} margin={margin} labelHeight={labelHeight} label={layer.title} onToggle={this.props.onToggle}/>
                <div className="background-list-container" style={{bottom: this.props.bottom, left: left + sideButton + margin * 2 + frame, width: listSize, height: buttonSize}}>
                    <PreviewList start={this.props.start} bottom={0} height={buttonSize} width={buttonSize * visibleIconsLength} icons={icons} pagination={pagination} length={visibleIconsLength} onClick={this.props.setControlProperty} />
                </div>
            </div>
        );
    },
    renderMobile() {

        const mobile = assign({
            side: 65,
            frame: 3,
            margin: 5
        }, this.props.mobile);

        const frame = mobile.frame * 2;
        const side = mobile.side - frame;
        const margin = mobile.margin;

        const layer = this.getLayer();
        const src = this.getThumb(layer);
        const icons = this.getIcons(side, frame, margin, true);
        const {pagination, listSize, visibleIconsLength} = this.getDimensions(side, frame, margin, 0, this.props.size.height, icons.length);
        const buttonSizeWithMargin = side + frame + margin * 2;
        const buttonSize = side + frame + margin;

        return this.props.drawerEnabled || visibleIconsLength <= 0 && this.props.enabled ? null : (
            <div className="background-plugin-position" style={{bottom: this.props.bottom}}>
                <PreviewButton showLabel={false} src={src} side={side} frame={frame} margin={margin} label={layer.title} onToggle={this.props.onToggle}/>
                <div className="background-list-container" style={{bottom: this.props.bottom + buttonSizeWithMargin, height: listSize, width: buttonSizeWithMargin}}>
                    <PreviewList vertical={true} start={this.props.start} bottom={0} height={buttonSize * visibleIconsLength} width={buttonSize} icons={icons} pagination={pagination} length={visibleIconsLength} onClick={this.props.setControlProperty} />
                </div>
            </div>
        );
    },
    checkDevice() {
        return this.props.isMobile ? this.renderMobile() : this.renderDesktop();
    },
    render() {
        return this.props.layers.length > 0 ? this.checkDevice() : null;
    }
});

module.exports = BackgroundSelector;
