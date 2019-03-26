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
const BackgroundDialog = require('./BackgroundDialog');

const PropTypes = require('prop-types');
const {head, omit} = require('lodash');
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
        source: PropTypes.string,
        thumbURL: PropTypes.string,
        onEditBackgroundProperties: PropTypes.func,
        addBackgroundProperties: PropTypes.func,
        onUpdateThumbnail: PropTypes.func,
        editing: PropTypes.bool,
        removeThumbnail: PropTypes.func,
        deletedId: PropTypes.string,
        CurrentModalParams: PropTypes.object,
        updateNode: PropTypes.func,
        clearModal: PropTypes.func
    };

    static defaultProps = {
        onEditBackgroundProperties: ()=> {},
        addBackgroundProperties: ()=> {},
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

    state = {
        additionalParameters: [],
        id: 0
    };

    componentWillUnmount() {
        this.props.onLayerChange('currentLayer', {});
        this.props.onLayerChange('tempLayer', {});
        this.props.onStartChange(0);
    }

    getThumbById = (id, backgrounds) => {
        const thumb = head(backgrounds.filter( background => background.id === id));
        if (thumb && thumb.hasOwnProperty('CurrentNewThumbnail') && thumb.CurrentNewThumbnail === undefined) {
            return this.props.thumbs.unknown;
        }
        return thumb && thumb.CurrentNewThumbnail && decodeURIComponent(thumb.CurrentNewThumbnail) || thumb && thumb.source;
    };
    // get the associated thumbnail for the Modal
    getThumb = (layer) => {
        return this.props.thumbURL || this.props.thumbs[layer.source] && this.props.thumbs[layer.source][layer.name] || (this.props.backgroundList && this.getThumbById(layer.id, this.props.backgroundList)) ||
        (this.props.backgrounds && this.getThumbById(layer.id, this.props.backgrounds)) ||
        layer.source || (this.props.thumbURL && decodeURIComponent(this.props.thumbURL)) || this.props.thumbs.unknown;
    };

    // get the thumbnail of the BackgroundSelector list and the BackgroundSelector Button
    getListThumb = (layer) => {
        return this.props.thumbs[layer.source] && this.props.thumbs[layer.source][layer.name] || (this.props.backgroundList && this.getThumbById(layer.id, this.props.backgroundList)) ||
        (this.props.backgrounds && this.getThumbById(layer.id, this.props.backgrounds)) ||
        layer.source || this.props.thumbs.unknown;
    };

    getIcons = (side, frame, margin, vertical) => {
        return this.props.enabled ? this.props.layers.map((layer, idx) => {
            let thumb = this.getListThumb(layer);
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
updatedLayer = (layer) => {
    if (this.props.deletedId && layer.CurrentNewThumbnail === undefined) {
        return omit(layer, ['source', 'CurrentThumbnailData']);
    }
    // add the newly created Thumbnail url (if existed)
    const output = assign({}, layer, {source: this.props.CurrentModalParams.CurrentNewThumbnail || this.props.CurrentModalParams.source } );
    return omit(output, ['CurrentThumbnailData', 'CurrentNewThumbnail']);
}
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
        const editedLayer = layer.id && head(this.props.layers.filter(laa => laa.id === layer.id)) || layer;
        return visibleIconsLength <= 0 && this.props.enabled ? null : (
            <span>
                 <BackgroundDialog
                    deletedId = {this.props.deletedId}
                    editing = {this.props.editing}
                    add = {false}
                    thumbURL= {src}
                    onUpdate= { parameter => this.props.addBackgroundProperties(parameter, false)}
                    modalParams={editedLayer}
                    onClose={() => {
                        this.props.onEditBackgroundProperties(false);
                        this.props.removeThumbnail(undefined);
                        this.props.clearModal();
                    }}
                    onSave={(layerModal, extra) => {

                        if (this.props.deletedId && layerModal.CurrentNewThumbnail === undefined) {
                            this.props.updateNode(layerModal.id, "layers", {source: undefined});
                        }
                        // clear thumbnail data
                        this.props.removeThumbnail(this.props.deletedId ? editedLayer.id : undefined);
                        // adding new properties to backgroundSelector state
                        this.props.addBackgroundProperties( assign({}, editedLayer, this.props.CurrentModalParams), false);
                        // updating layer properties in layer state
                        let cleanedExtra = extra && omit(extra, ['source', 'title', 'format', 'style']);
                        const layerProps = assign({}, layerModal, cleanedExtra ? {additionalParams: cleanedExtra} : {});
                        this.props.updateNode(this.props.CurrentModalParams.id, "layers", this.updatedLayer(layerProps));
                        // clear state objects for modal and backgroundSelector properties
                        this.props.onEditBackgroundProperties(false);
                        this.props.clearModal();
                        this.forceUpdate();
                    }}
                    updateThumbnail={(data, url) => !data && !url ? this.props.removeThumbnail(editedLayer.id) : this.props.onUpdateThumbnail(data, url, false, editedLayer.id)}
                   />
                <div className={'background-plugin-position'} style={this.props.style}>
                    <PreviewButton
                    onEdit={() => {
                        this.props.onUpdateThumbnail(null, editedLayer.source, false, editedLayer.id);
                        this.props.onEditBackgroundProperties(true);
                    }}
                    onRemove={(id, type, lay) => {
                        const nextLayer = head(this.props.layers.filter(laa => laa.id !== lay.id && !laa.invalid));
                        this.props.onRemove(id, type, lay);
                        this.props.removeThumbnail(id);
                        this.props.onPropertiesChange(nextLayer.id, {visibility: true});
                        this.props.onLayerChange('currentLayer', {...nextLayer});
                        this.props.onLayerChange('tempLayer', {...nextLayer});
                    }} layers={this.props.layers} enabledCatalog={this.props.enabledCatalog} currentLayer={this.props.currentLayer} onAdd={() => this.props.onAdd(this.props.source || 'backgroundSelector')} showLabel={configuration.label} src={this.getListThumb(layer)} side={sideButton} frame={frame} margin={margin} labelHeight={labelHeight} label={layer.title} onToggle={this.props.onToggle}/>
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
