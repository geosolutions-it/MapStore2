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
const ResizableModal = require('../misc/ResizableModal');
const {head} = require('lodash');
const {Form, FormGroup, ControlLabel, FormControl, Button, Glyphicon} = require('react-bootstrap');
const Thumbnail = require('../maps/forms/Thumbnail');
const ModalMock = require('./ModalMock');

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
        onStartChange: PropTypes.func,
        onAdd: PropTypes.func,
        enabledCatalog: PropTypes.bool,
        onRemove: PropTypes.func
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
        onStartChange: () => {},
        onAdd: () => {},
        onRemove: () => {}
    };

    state = {
        additionalParameters: [],
        id: 0,
        showAlert: true
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
            return <PreviewIcon onEdit={(iconLayer) => this.setState({showModal: iconLayer, additionalParameters: []})} vertical={vertical} key={idx} src={thumb} currentLayer={this.props.currentLayer} margin={margin} side={side} frame={frame} layer={layer} onToggle={this.props.onToggle} onPropertiesChange={this.props.onPropertiesChange} onLayerChange={this.props.onLayerChange}/>;
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
            <span>
                <div className={'background-plugin-position'} style={this.props.style}>
                    <PreviewButton
                    onEdit={(lay) => this.setState({showModal: lay})}
                    onRemove={(id, type, lay) => {
                        const nextLayer = head(this.props.layers.filter(laa => laa.id !== lay.id && !laa.invalid));
                        this.props.onRemove(id, type, lay);
                        this.props.onPropertiesChange(nextLayer.id, {visibility: true});
                        this.props.onLayerChange('currentLayer', {...nextLayer});
                        this.props.onLayerChange('tempLayer', {...nextLayer});
                    }} layers={this.props.layers} enabledCatalog={this.props.enabledCatalog} currentLayer={this.props.currentLayer} onAdd={() => this.props.onAdd()} showLabel={configuration.label} src={src} side={sideButton} frame={frame} margin={margin} labelHeight={labelHeight} label={layer.title} onToggle={this.props.onToggle}/>
                    <div className="background-list-container" style={listContainerStyle}>
                        <PreviewList vertical={configuration.vertical} start={this.props.start} bottom={0} height={previewListStyle.height} width={previewListStyle.width} icons={icons} pagination={pagination} length={visibleIconsLength} onStartChange={this.props.onStartChange} />
                    </div>
                </div>
                <ResizableModal
                    title={"Mockup info"}
                    show={this.state.showAlert}
                    fade
                    onClose={() => this.setState({showAlert: false})}
                    >
                    <div style={{padding: 8}}>
                        <h4 className="text-danger">Don't add this modal!! (Mockup info) </h4>
                        <p>
                            Current mockup shows only the workflow for the following background actions edit, add and remove.
                            The Metadaexplorer will contain Map Backgrounds catalog and 'Add Background' button only if open by plus button of Background Selector.  
                        </p>
                    </div>
                </ResizableModal>
                <ModalMock
                    showModal={this.state.showModal}
                    onClose={() => this.setState({showModal: false})}
                    onSave={() => {
                        this.props.onPropertiesChange(this.state.showModal.id, {...this.state.showModal});
                        this.setState({showModal: false});
                        this.props.onLayerChange('currentLayer', {...this.state.showModal});
                        this.props.onLayerChange('tempLayer', {...this.state.showModal});
                        this.props.onPropertiesChange(this.state.showModal.id, {visibility: true});
                    }}
                    onUpdate={showModal => this.setState({showModal})}/>
                {/*<ResizableModal
                    title={"Edit Current Background"}
                    show={this.state.showModal}
                    fade
                    onClose={() => this.setState({showModal: false, additionalParameters: []})}
                    buttons={[
                        {
                            text: 'Save',
                            bsStyle: 'primary',
                            onClick: () => {
                                this.props.onPropertiesChange(this.state.showModal.id, {...this.state.showModal});
                                this.setState({showModal: false, additionalParameters: []});
                                this.props.onLayerChange('currentLayer', {...this.state.showModal});
                                this.props.onLayerChange('tempLayer', {...this.state.showModal});
                                this.props.onPropertiesChange(this.state.showModal.id, {visibility: true});
                            }
                        }
                    ]}>
                    <Form style={{padding: 8}}>
                        <FormGroup>
                            <ControlLabel>Thumbnail</ControlLabel>
                            <div className="shadow-soft" style={{width: 180, margin: 'auto'}}>
                                <Thumbnail maps={{
                                    newThumbnail: this.state.showModal && this.state.showModal.thumbURL
                                }}/>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Title</ControlLabel>
                            <FormControl
                                value={this.state.showModal && this.state.showModal.title}
                                placeholder="Enter displayed name"
                                onChange={event => this.setState({showModal: {...this.state.showModal, title: event.target.value} })}/>
                        </FormGroup>
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>Format</ControlLabel>
                            <FormControl componentClass="select" placeholder="Select format"
                                onChange={event => this.setState({showModal: {...this.state.showModal, format: event.target.value} })}>
                                <option value="image/png">image/png</option>
                                <option value="image/png8">image/png8</option>
                                <option value="image/jpeg">image/jpeg</option>
                                <option value="image/vnd.jpeg-png">image/vnd.jpeg-png</option>
                                <option value="image/gif">image/gif</option>
                            </FormControl>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Style</ControlLabel>
                            <FormControl componentClass="select" value={this.state.showModal && this.state.showModal.style}
                                onChange={event => this.setState({showModal: {...this.state.showModal, style: event.target.value} })}
                                placeholder="Enter custom style name">
                                <option value="default">default</option>
                                <option value="image/png8">my style</option>
                            </FormControl>
                        </FormGroup>
                        <FormGroup>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <ControlLabel style={{flex: 1}}>Additional Parameters </ControlLabel>
                                <Button
                                    className="square-button-md"
                                    style={{borderColor: 'transparent'}}
                                    onClick={() => this.setState({id: this.state.id + 1, additionalParameters:
                                    [...this.state.additionalParameters, {id: this.state.id, param: '', val: ''}]})}>
                                    <Glyphicon glyph="plus"/>
                                </Button>
                            </div>
                            {this.state.additionalParameters.map((val) => (<div key={'val:' + val.id} style={{display: 'flex', marginTop: 8}}>
                            <FormControl style={{flex: 1, marginRight: 8}} placeholder="Parameter"/>
                            <FormControl style={{flex: 1, marginRight: 8}} placeholder="Value"/>
                            <Button onClick={() => this.setState({ additionalParameters: this.state.additionalParameters.filter((aa) => val.id !== aa.id)})} className="square-button-md" style={{borderColor: 'transparent'}}><Glyphicon glyph="trash"/></Button>
                            </div>))}
                        </FormGroup>
                    </Form>
                </ResizableModal>*/}
            </span>
        );
    };

    render() {
        return this.props.layers.length > 0 ? this.renderBackgroundSelector() : null;
    }
}

module.exports = BackgroundSelector;
