/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');

const PreviewButton = require('./PreviewButton');
const PreviewList = require('./PreviewList');
const PreviewIcon = require('./PreviewIcon');

const PropTypes = require('prop-types');

require('./css/background.css');

class BackgroundSelector extends React.Component {
    static propTypes = {
        start: PropTypes.number,
        style: PropTypes.object,
        enabled: PropTypes.bool,
        layers: PropTypes.array,
        currentLayer: PropTypes.object,
        tempLayer: PropTypes.object,
        size: PropTypes.object,
        dimensions: PropTypes.object,
        thumbs: PropTypes.object,
        onPropertiesChange: PropTypes.func,
        onToggle: PropTypes.func,
        onLayerChange: PropTypes.func,
        onStartChange: PropTypes.func
    };

    static defaultProps = {
        start: 0,
        style: {},
        enabled: false,
        layers: [],
        currentLayer: {},
        tempLayer: {},
        size: {width: 0, height: 0},
        dimensions: {},
        thumbs: {
            unknown: require('./img/dafault.jpg')
        },
        onPropertiesChange: () => {},
        onToggle: () => {},
        onLayerChange: () => {},
        onStartChange: () => {}
    };

    componentWillUnmount() {
        this.props.onLayerChange('currentLayer', {});
        this.props.onLayerChange('tempLayer', {});
        this.props.onStartChange(0);
    }

    getThumb = (layer) => {
        return this.props.thumbs[layer.source] && this.props.thumbs[layer.source][layer.name] || layer.thumbURL || this.props.thumbs.unknown;
    };

    getIcons = (side, frame, margin, vertical) => {
        return this.props.enabled ? this.props.layers.map((layer, idx) => {
            let thumb = this.getThumb(layer);
            return <PreviewIcon vertical={vertical} key={idx} src={thumb} currentLayer={this.props.currentLayer} margin={margin} side={side} frame={frame} layer={layer} onToggle={this.props.onToggle} onPropertiesChange={this.props.onPropertiesChange} onLayerChange={this.props.onLayerChange}/>;
        }) : [];
    };

    getDimensions = (side, frame, margin, left, size, iconsLength) => {
        const openPreviewSize = (side + frame * 2 + margin * 2) + (side + frame * 2 + margin) * iconsLength + left;
        const minSize = (size / 2) - (side + frame * 2 + margin * 2) - left;
        const pagination = openPreviewSize > size / 2;
        let visibleIconsLength = Math.floor(minSize / (side + frame * 2 + margin));
        visibleIconsLength = visibleIconsLength > iconsLength ? iconsLength : visibleIconsLength;
        const listSize = this.props.enabled ? (side + frame + margin) * visibleIconsLength + 52 : 0;

        return {pagination, listSize, visibleIconsLength};
    };

    renderBackgroundSelector = () => {
        const configuration = assign({
            side: 78,
            sidePreview: 104,
            frame: 3,
            margin: 5,
            label: true,
            vertical: false
        }, this.props.dimensions);

        const frame = configuration.frame * 2;
        const side = configuration.side - frame;
        const sideButton = this.props.enabled ? configuration.sidePreview - frame : side;
        const margin = configuration.margin;

        const labelHeight = this.props.enabled ? sideButton - frame * 2 : 0;
        const layer = this.props.enabled ? this.props.tempLayer : this.props.currentLayer;
        const src = this.getThumb(layer);
        const icons = this.getIcons(side, frame, margin, configuration.vertical);

        const {pagination, listSize, visibleIconsLength} = this.getDimensions(side, frame, margin, 0, configuration.vertical ? this.props.size.height : this.props.size.width, icons.length);
        const buttonSize = side + frame + margin;
        const buttonSizeWithMargin = side + frame + margin * 2;

        const listContainerStyle = configuration.vertical ? {
            bottom: buttonSizeWithMargin,
            left: 0,
            width: buttonSizeWithMargin,
            height: listSize
        } : {
            left: sideButton + margin * 2 + frame,
            width: listSize,
            height: buttonSize
        };

        const previewListStyle = configuration.vertical ? {
            height: buttonSize * visibleIconsLength,
            width: buttonSize
        } : {
            height: buttonSize,
            width: buttonSize * visibleIconsLength
        };

        return visibleIconsLength <= 0 && this.props.enabled ? null : (
            <div className={'background-plugin-position'} style={this.props.style}>
                <PreviewButton showLabel={configuration.label} src={src} side={sideButton} frame={frame} margin={margin} labelHeight={labelHeight} label={layer.title} onToggle={this.props.onToggle}/>
                <div className="background-list-container" style={listContainerStyle}>
                    <PreviewList vertical={configuration.vertical} start={this.props.start} bottom={0} height={previewListStyle.height} width={previewListStyle.width} icons={icons} pagination={pagination} length={visibleIconsLength} onStartChange={this.props.onStartChange} />
                </div>
            </div>
        );
    };

    render() {
        return this.props.layers.length > 0 ? this.renderBackgroundSelector() : null;
    }
}

module.exports = BackgroundSelector;
