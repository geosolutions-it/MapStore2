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
const ToolbarButton = require('../misc/toolbar/ToolbarButton');
const BackgroundDialog = require('./BackgroundDialog');

const PropTypes = require('prop-types');
const {head, get} = require('lodash');
require('./css/background.css');

class BackgroundSelector extends React.Component {
    static propTypes = {
        backgroundList: PropTypes.array,
        backgrounds: PropTypes.array,
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
        onStartChange: PropTypes.func,
        onAdd: PropTypes.func,
        enabledCatalog: PropTypes.bool,
        onRemove: PropTypes.func,
        onBackgroundEdit: PropTypes.func,
        source: PropTypes.string,
        addBackgroundProperties: PropTypes.func,
        onUpdateThumbnail: PropTypes.func,
        removeBackground: PropTypes.func,
        deletedId: PropTypes.string,
        modalParams: PropTypes.object,
        updateNode: PropTypes.func,
        clearModal: PropTypes.func,
        projection: PropTypes.string
    };

    static defaultProps = {
        addBackgroundProperties: () => {},
        onBackgroundEdit: () => {},
        source: 'backgroundSelector',
        start: 0,
        style: {},
        enabled: false,
        layers: [],
        currentLayer: {},
        tempLayer: {},
        size: {width: 0, height: 0},
        dimensions: {},
        thumbs: {
            unknown: require('./img/default.jpg')
        },
        onPropertiesChange: () => {},
        onToggle: () => {},
        onLayerChange: () => {},
        onStartChange: () => {},
        onAdd: () => {},
        onRemove: () => {},
        clearModal: () => {}
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
            return (
                <div
                    style={{
                        width: (vertical ? margin : 0) + (vertical ? 0 : margin) + side + frame,
                        height: margin + side + frame
                    }}
                    className="background-preview-container"
                >
                    <ToolbarButton
                        glyph="remove"
                        className="square-button-md background-remove-button"
                        bsStyle="primary"
                        onClick={() => {
                            this.props.removeBackground(layer.id);
                        }}
                    />
                    <PreviewIcon
                        projection={this.props.projection}
                        vertical={vertical}
                        key={idx}
                        src={thumb}
                        currentLayer={this.props.currentLayer}
                        margin={margin}
                        side={side}
                        frame={frame}
                        layer={layer}
                        onToggle={this.props.onToggle}
                        onPropertiesChange={this.props.onPropertiesChange}
                        onLayerChange={this.props.onLayerChange}/>
                </div>
            );
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
        const editedLayer = layer.id && head(this.props.layers.filter(laa => laa.id === layer.id)) || layer;
        const backgroundDialogParams = {
            title: editedLayer.title,
            format: editedLayer.format,
            style: editedLayer.style,
            additionalParameters: editedLayer.additionalParameters,
            thumbnail: {
                data: get((this.props.backgroundList || []).find(background => background.id === editedLayer.id), 'thumbnail.data'),
                url: this.getThumb(editedLayer)
            }
        };
        return visibleIconsLength <= 0 && this.props.enabled ? null : (
            <span>
                {this.props.modalParams && this.props.modalParams.editing && <BackgroundDialog
                    onClose={this.props.clearModal}
                    onSave={layerToAdd => {
                        this.props.updateNode(layerToAdd.id, 'layers', layerToAdd);
                        this.props.onBackgroundEdit(layerToAdd.id);
                    }}
                    updateThumbnail={this.props.onUpdateThumbnail}
                    {...backgroundDialogParams}
                    {...this.props.modalParams}
                />}
                <div className={'background-plugin-position'} style={this.props.style}>
                    <PreviewButton
                        onEdit={() => {
                            this.props.addBackgroundProperties({
                                layer: editedLayer,
                                editing: true
                            });
                        }}
                        layers={this.props.layers}
                        enabledCatalog={this.props.enabledCatalog}
                        currentLayer={this.props.currentLayer}
                        onAdd={() => this.props.onAdd(this.props.source || 'backgroundSelector')}
                        showLabel={configuration.label}
                        src={this.getThumb(layer)}
                        side={sideButton}
                        frame={frame}
                        margin={margin}
                        labelHeight={labelHeight}
                        label={layer.title}
                        onToggle={this.props.onToggle}/>
                    <div className="background-list-container" style={listContainerStyle}>
                        <PreviewList vertical={configuration.vertical} start={this.props.start} bottom={0} height={previewListStyle.height} width={previewListStyle.width} icons={icons} pagination={pagination} length={visibleIconsLength} onStartChange={this.props.onStartChange} />
                    </div>
                </div>
            </span>
        );
    };

    render() {
        return this.props.layers.length > 0 ? this.renderBackgroundSelector() : null;
    }
}

module.exports = BackgroundSelector;
