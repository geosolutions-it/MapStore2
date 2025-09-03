/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './css/backgrounddialog.css';

import { Editor as WYSIWYGEditor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import localizedProps from '../misc/enhancers/localizedProps';
import PropTypes from 'prop-types';
import Select from 'react-select';
import uuidv1 from 'uuid/v1';
import {pick, omit, get, keys, isNumber, isBoolean} from 'lodash';
import Message from '../I18N/Message';
import ResizableModal from '../misc/ResizableModal';
import {Form, FormGroup, ControlLabel, FormControl, Glyphicon} from 'react-bootstrap';
import ButtonRB from '../misc/Button';
import Thumbnail from '../maps/forms/Thumbnail';
import WMSCacheOptions from '../TOC/fragments/settings/WMSCacheOptions';
import { ServerTypes } from '../../utils/LayersUtils';
import {getMessageById} from '../../utils/LocaleUtils';
import tooltip from '../misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);
const Editor = localizedProps("placeholder")(WYSIWYGEditor);


export default class BackgroundDialog extends React.Component {
    static propTypes = {
        loading: PropTypes.bool,
        editing: PropTypes.bool,
        layer: PropTypes.object,
        capabilities: PropTypes.object,
        onAdd: PropTypes.func,
        onClose: PropTypes.func,
        source: PropTypes.string,
        onSave: PropTypes.func,
        addParameters: PropTypes.func,
        updateThumbnail: PropTypes.func,
        thumbURL: PropTypes.string,
        title: PropTypes.string,
        format: PropTypes.string,
        credits: PropTypes.object,
        style: PropTypes.string,
        thumbnail: PropTypes.object,
        additionalParameters: PropTypes.object,
        addParameter: PropTypes.func,
        defaultFormat: PropTypes.string,
        formatOptions: PropTypes.array,
        parameterTypeOptions: PropTypes.array,
        booleanOptions: PropTypes.array,
        projection: PropTypes.string,
        disableTileGrids: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        updateThumbnail: () => {},
        onClose: () => {},
        onSave: () => {},
        addParameters: () => {},
        addParameter: () => {},
        loading: false,
        editing: false,
        layer: {},
        capabilities: {},
        title: '',
        thumbnail: {},
        additionalParameters: {},
        formatOptions: [{
            label: 'image/png',
            value: 'image/png'
        }, {
            label: 'image/png8',
            value: 'image/png8'
        }, {
            label: 'image/jpeg',
            value: 'image/jpeg'
        }, {
            label: 'image/vnd.jpeg-png',
            value: 'image/vnd.jpeg-png'
        }, {
            label: 'image/gif',
            value: 'image/gif'
        }],
        parameterTypeOptions: [{
            label: "backgroundDialog.string",
            value: 'string'
        }, {
            label: "backgroundDialog.number",
            value: 'number'
        }, {
            label: "backgroundDialog.boolean",
            value: 'boolean'
        }],
        booleanOptions: [{
            label: 'True',
            value: true
        }, {
            label: 'False',
            value: false
        }]
    };

    constructor(props) {
        super(props);
        const pickedProps = pick(this.props, 'title', 'format', 'style', 'thumbnail', 'credits');
        const creditsTitleHtml = pickedProps?.credits?.title || '';
        const contentBlock = htmlToDraft(creditsTitleHtml);
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        const newState = Object.assign({}, pickedProps, {additionalParameters: this.assignParameters(this.props.additionalParameters), editorState});
        this.state = newState;
    }

    state = {title: '', format: 'image/png', thumbnail: {}, additionalParameters: [], credits: {}};

    onEditorStateChange(editorState) {
        this.setState({
            ...this.state,
            editorState
        });
    }

    renderStyleSelector() {
        return this.props.capabilities ? (
            <FormGroup>
                <ControlLabel><Message msgId="layerProperties.style"/></ControlLabel>
                <Select
                    onChange={event => this.setState({style: event ? event.value : undefined})}
                    clearable
                    value={this.state.style}
                    options={(this.props.capabilities.availableStyles || []).map(({name}) => ({label: name, value: name}))}/>
            </FormGroup>
        ) : null;
    }

    renderThumbnailErrors() {
        const errorMessages = {
            "FORMAT": <Message msgId="map.errorFormat" />,
            "SIZE": <Message msgId="map.errorSize" />
        };
        return this.state.thumbnailErrors && this.state.thumbnailErrors.length > 0 ? (
            <div className="dropzone-errorBox alert-danger">
                <p><Message msgId="map.error"/></p>
                {(this.state.thumbnailErrors.map(err =>
                    <div id={"error" + err} key={"error" + err} className={"error" + err}>
                        {errorMessages[err]}
                    </div>
                ))}
            </div>
        ) : null;
    }
    renderSpecificTypeForm() {
        if (this.props.layer.type === "wms") {
            return (<React.Fragment>
                <FormGroup controlId="formControlsSelect">
                    <ControlLabel><Message msgId="layerProperties.format.title" /></ControlLabel>
                    <Select
                        onChange={event => this.setState({ format: event && event.value })}
                        value={this.state.format || this.props.defaultFormat}
                        clearable
                        isLoading={!this.props.capabilities}
                        options={
                            (this.props.capabilities?.capabilities?.layerOptions?.imageFormats || this.props.formatOptions || [])
                                .map((format) => format?.value ? format : ({ value: format, label: format }))
                        }
                    />
                </FormGroup>
                {this.renderStyleSelector()}
                {this.props.layer?.serverType !== ServerTypes.NO_VENDOR && <FormGroup>
                    <WMSCacheOptions
                        layer={{ ...this.props.layer, ...this.state }}
                        projection={this.props.projection}
                        onChange={value => this.setState(value)}
                        disableTileGrids={this.props.disableTileGrids}
                    />
                </FormGroup>}
                <Button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ControlLabel style={{ flex: 1 }}><Message msgId="backgroundDialog.additionalParameters" /></ControlLabel>
                        <Button
                            className="square-button-md"
                            tooltipId="backgroundDialog.addAdditionalParameterTooltip"
                            style={{ borderColor: 'transparent' }}
                            onClick={() => {
                                const cnt = Math.max(...(this.state.additionalParameters.length > 0 ?
                                    this.state.additionalParameters.map(p => p.id) : [-1])) + 1;
                                this.setState({
                                    additionalParameters:
                                        [...this.state.additionalParameters, { id: cnt, type: 'string', param: '', val: '' }]
                                });
                            }}>
                            <Glyphicon glyph="plus" />
                        </Button>
                    </div>
                    {this.state.additionalParameters.map((val) => (<div key={'val:' + val.id} style={{ display: 'flex', marginTop: 8 }}>
                        <div style={{ display: 'flex', flex: 1, marginRight: 8 }}>
                            <FormControl
                                style={{ width: '50%', marginRight: 8, minWidth: 0 }}
                                placeholder={getMessageById(this.context.messages, "backgroundDialog.parameter")}
                                value={val.param}
                                onChange={e => this.addAdditionalParameter(e.target.value, 'param', val.id, val.type)} />
                            {val.type === 'boolean' ?
                                <div style={{ width: '50%' }}>
                                    <Select
                                        onChange={e => this.addAdditionalParameter(e.value, 'val', val.id, val.type)}
                                        clearable={false}
                                        value={val.val}
                                        options={this.props.booleanOptions} />
                                </div> :
                                <FormControl
                                    style={{ width: '50%', minWidth: 0 }}
                                    placeholder={getMessageById(this.context.messages, "backgroundDialog.value")}
                                    value={val.val.toString()}
                                    onChange={e => this.addAdditionalParameter(e.target.value, 'val', val.id, val.type)} />}
                        </div>
                        <Select
                            style={{ flex: 1, width: 90 }}
                            onChange={event => this.addAdditionalParameter(val.val, 'val', val.id, event.value)}
                            clearable={false}
                            value={val.type}
                            options={this.props.parameterTypeOptions.map(({ label, ...other }) => ({
                                ...other,
                                label: getMessageById(this.context.messages, label)
                            }))} />
                        <Button
                            onClick={() => this.setState({
                                additionalParameters: this.state.additionalParameters.filter((aa) => val.id !== aa.id)
                            })}
                            tooltipId="backgroundDialog.removeAdditionalParameterTooltip"
                            className="square-button-md"
                            style={{ borderColor: 'transparent' }}>
                            <Glyphicon glyph="trash" />
                        </Button>
                    </div>))}
                </Button>
            </React.Fragment>);
        }
        if (this.props.layer.type === "wmts") {
            return (
                <React.Fragment>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel><Message msgId="backgroundDialog.editAttribution" /></ControlLabel>
                        <Editor
                            editorState={this.state.editorState}
                            editorClassName="ms2 form-control"
                            toolbarClassName="bg-dialog-attribution-toolbar"
                            onEditorStateChange={this.onEditorStateChange.bind(this)}
                            placeholder="backgroundDialog.editAttributionPlaceholder"
                            toolbar={{
                                options: ['inline', 'blockType', 'link', 'remove'],
                                inline: {
                                    options: ['bold', 'italic', 'underline', 'strikethrough']
                                },
                                blockType: {
                                    inDropDown: true,
                                    options: ['Normal', 'H5']
                                },
                                link: {
                                    inDropDown: true,
                                    options: ['link', 'unlink']
                                }
                            }}
                        />
                    </FormGroup>
                </React.Fragment>
            );
        }
        return null;
    }

    render() {
        return (<ResizableModal
            fitContent
            title={<Message msgId={this.props.editing ? 'backgroundDialog.editTitle' : 'backgroundDialog.addTitle'}/>}
            show
            fade
            clickOutEnabled={false}
            bodyClassName="ms-flex modal-properties-container background-dialog"
            loading={this.props.loading}
            onClose={() => { this.props.onClose(); this.resetParameters(); }}
            buttons={this.props.loading ? [] : [
                {
                    text: <Message msgId={this.props.editing ? 'save' : 'backgroundDialog.add'}/>,
                    bsStyle: 'primary',
                    onClick: () => {
                        const backgroundId = this.props.editing ? this.props.layer.id : uuidv1();
                        const curThumbURL = this.props.layer.thumbURL || '';
                        const format = this.state.format || this.props.defaultFormat;
                        const creditsTitle = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
                        this.props.updateThumbnail(this.state.thumbnail.data, backgroundId);
                        this.props.onSave(Object.assign({}, this.props.layer, omit(this.state, 'thumbnail'), this.props.editing ? {} : {id: backgroundId},
                            {
                                params: omit(
                                    this.state.additionalParameters.reduce((accum, p) => Object.assign(accum, {[p.param]: p.val}), {}),
                                    ['source', 'title']
                                ),
                                format,
                                credits: {
                                    ...this.state.credits,
                                    title: creditsTitle
                                },
                                group: 'background'
                            }, !curThumbURL && !this.state.thumbnail.data ? {} : {thumbURL: this.state.thumbnail.url}));
                        this.resetParameters();
                    }
                }
            ]}>
            {<Form style={{width: '100%'}}>
                {this.renderThumbnailErrors()}
                <Thumbnail
                    checkOriginalFileSize
                    onUpdate={(data, url) => this.setState({thumbnail: {data, url}})}
                    onError={(errors) => this.setState({thumbnailErrors: errors})}
                    message={<Message msgId="backgroundDialog.thumbnailMessage"/>}
                    suggestion=""
                    map={{
                        newThumbnail: get(this.state.thumbnail, 'url') || "NODATA"
                    }}
                    thumbnailOptions={{
                        width: 128,
                        height: 128,
                        type: 'image/jpeg',
                        quality: 0.8,
                        contain: false
                    }}
                />
                <FormGroup>
                    <ControlLabel><Message msgId="layerProperties.title"/></ControlLabel>
                    <FormControl
                        value={this.state.title}
                        placeholder={getMessageById(this.context.messages, "backgroundDialog.titlePlaceholder")}
                        onChange={event => this.setState({title: event.target.value})}/>
                </FormGroup>
                {this.renderSpecificTypeForm()}
            </Form>}
        </ResizableModal>);
    }
    // assign the additional parameters from the layers (state) to the modal component state
    assignParameters = (parameters) =>
        keys(parameters).map((key, index) => {
            const value = parameters[key];
            const type = isNumber(value) ? 'number' : isBoolean(value) ? 'boolean' : 'string';
            return {
                id: index,
                param: key,
                type,
                val: type === 'string' ? value ? value.toString() : "" : value
            };
        });
    addAdditionalParameter = (event, key, id, type)=> {
        this.setState({
            additionalParameters:
            this.state.additionalParameters.map(v => {
                if (v.id === id) {
                    let modifiedKey;
                    if (key === 'val') {
                        switch (type) {
                        case 'number':
                            modifiedKey = Number(event);
                            if (!modifiedKey || isNaN(modifiedKey)) {
                                modifiedKey = 0;
                            }
                            break;
                        case 'boolean':
                            modifiedKey = isBoolean(event) ? event : true;
                            break;
                        default:
                            modifiedKey = event ? event.toString() : '';
                            break;
                        }
                    } else {
                        modifiedKey = event;
                    }
                    return Object.assign({}, v, {[key]: modifiedKey, type});
                }
                return v;
            })
        });
    }
    resetParameters = () => this.setState({additionalParameters: []});
}
