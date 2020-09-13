/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {compose, withState, lifecycle, getContext} from 'recompose';
import {get} from 'lodash';
import {Glyphicon, Button, Tooltip, OverlayTrigger, Alert} from 'react-bootstrap';
import {Controlled as Codemirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

import Transfer from '../misc/transfer/Transfer';
import ResizableModal from '../misc/ResizableModal';
import ToolbarButton from '../misc/toolbar/ToolbarButton';
import Message from '../I18N/Message';
import ConfigureMapTemplates from './ConfigureMapTemplates';
import tutorialEnhancer from './enhancers/tutorialEnhancer';

import Dropzone from 'react-dropzone';
import Spinner from "react-spinkit";

import LocaleUtils from '../../utils/LocaleUtils';
import PropTypes from 'prop-types';
import ConfirmModal from '../resources/modals/ConfirmModal';

import {ERROR, checkZipBundle} from '../../utils/ExtensionsUtils';
import Modal from "../misc/Modal";

const getEnabledTools = (plugin, isMandatory, editedPlugin, documentationBaseURL, onEditPlugin,
    onShowDialog, changePluginsKey) => {
    return [{
        visible: plugin.name === 'MapTemplates',
        glyph: '1-map',
        tooltipId: 'contextCreator.configurePlugins.tooltips.mapTemplatesConfig',
        onClick: () => onShowDialog('mapTemplatesConfig', true)
    }, {
        visible: !isMandatory && !plugin.denyUserSelection,
        glyph: '1-user-mod',
        tooltipId: plugin.isUserPlugin ?
            'contextCreator.configurePlugins.tooltips.disableUserPlugin' :
            'contextCreator.configurePlugins.tooltips.enableUserPlugin',
        bsStyle: plugin.isUserPlugin ? 'success' : undefined,
        onClick: () => changePluginsKey([plugin.name], 'isUserPlugin', !plugin.isUserPlugin)
    }, {
        visible: plugin.isUserPlugin && !plugin.denyUserSelection,
        glyph: plugin.active ? 'check' : 'unchecked',
        tooltipId: plugin.active ?
            'contextCreator.configurePlugins.tooltips.deactivatePlugin' :
            'contextCreator.configurePlugins.tooltips.activatePlugin',
        onClick: () => changePluginsKey([plugin.name], 'active', !plugin.active)
    }, {
        glyph: 'wrench',
        tooltipId: 'contextCreator.configurePlugins.tooltips.editConfiguration',
        active: plugin.name === editedPlugin,
        onClick: () => onEditPlugin(plugin.name === editedPlugin ? undefined : plugin.name)
    }, {
        visible: !!documentationBaseURL,
        glyph: 'question-sign',
        tooltipId: 'contextCreator.configurePlugins.tooltips.pluginDocumentation',
        Element: (props) =>
            <a target="_blank" rel="noopener noreferrer"
                href={documentationBaseURL && documentationBaseURL + '#plugins.' + (plugin.docName || plugin.name)}>
                <ToolbarButton {...props}/>
            </a>
    }, {
        visible: plugin.isExtension,
        glyph: 'trash',
        tooltipId: 'contextCreator.configurePlugins.tooltips.removePlugin',
        onClick: () => onShowDialog('confirmRemovePlugin', true, plugin.name)
    }];
};

const getAvailableTools = (plugin, onShowDialog) => {
    return [{
        visible: plugin.isExtension,
        glyph: 'trash',
        tooltipId: 'contextCreator.configurePlugins.tooltips.removePlugin',
        onClick: () => onShowDialog('confirmRemovePlugin', true, plugin.name)
    }];
};

/**
 * Converts plugin objects to Transform items
 * @param {string} editedPlugin currently edited plugin
 * @param {string} editedCfg text of a configuration of currently edited plugin
 * @param {object} cfgError object describing current cfg editing error
 * @param {function} setEditor editor instance setter
 * @param {string} documentationBaseURL base url for plugin documentation
 * @param {boolean} showDescriptionTooltip show a tooltip when hovering over plugin's description
 * @param {number} descriptionTooltipDelay description tooltip show delay
 * @param {function} onEditPlugin edit plugin configuration callback
 * @param {function} onEnablePlugins enable plugins callback
 * @param {function} onDisablePlugins disable plugins callback
 * @param {function} onUpdateCfg update currently edited configuration callback
 * @param {function} onShowMapTemplatesConfig
 * @param {function} changePluginsKey callback to change properties of plugin objects
 * @param {boolean} isRoot true if plugin objects in plugins argument are at the root level of a tree hierarchy
 * @param {object[]} plugins plugin objects to convert
 * @param {boolean} processChildren if true this function will recursively convert the children
 * @param {boolean} parentIsEnabled true if 'enabled' property of parent plugin object is true
 */
const pluginsToItems = (editedPlugin, editedCfg, cfgError, setEditor, documentationBaseURL, showDescriptionTooltip, descriptionTooltipDelay,
    onEditPlugin, onEnablePlugins, onDisablePlugins, onUpdateCfg, onShowDialog, changePluginsKey, isRoot, plugins = [],
    processChildren, parentIsEnabled) =>
    plugins.filter(plugin => !plugin.hidden).map(plugin => {
        const enableTools = (isRoot || parentIsEnabled);
        const isMandatory = plugin.forcedMandatory || plugin.mandatory;
        return {
            id: plugin.name,
            title: plugin.title || plugin.label || plugin.name,
            cardSize: 'sm',
            description: plugin.description || 'plugin name: ' + plugin.name,
            showDescriptionTooltip,
            descriptionTooltipDelay,
            mandatory: isMandatory,
            className: !isRoot && parentIsEnabled && !plugin.enabled ? 'plugin-card-disabled' : '',
            tools: enableTools ? (plugin.enabled ? getEnabledTools(plugin, isMandatory, editedPlugin, documentationBaseURL, onEditPlugin,
                onShowDialog, changePluginsKey) : getAvailableTools(plugin, onShowDialog)) : [],
            component: (enableTools && plugin.enabled) && plugin.name === editedPlugin ?
                <div className="plugin-configuration-editor">
                    <Codemirror
                        value={editedCfg}
                        editorDidMount={editor => setEditor(editor)}
                        onBeforeChange={(editor, data, cfg) => onUpdateCfg(cfg)}
                        options={{
                            theme: 'lesser-dark',
                            mode: 'application/json',
                            lineNumbers: true,
                            styleSelectedText: true,
                            indentUnit: 2,
                            tabSize: 2
                        }}/>
                    {cfgError && <div className="plugin-configuration-errorarea">
                        <div className="plugin-configuration-errorarea-header">
                            <Message msgId="contextCreator.configurePlugins.cfgParsingError.title"/>
                        </div>
                        <div className="plugin-configuration-errorarea-body">
                            <Message msgId="contextCreator.configurePlugins.cfgParsingError.body" msgParams={{error: cfgError.message}}>
                                {msg => <pre className="plugin-configuration-errormsg">{msg}</pre>}
                            </Message>
                        </div>
                    </div>}
                </div> : null,
            preview:
                (<React.Fragment>
                    {!isRoot && parentIsEnabled && !isMandatory && <Button
                        style={{left: '-4px', position: 'relative'}}
                        key="checkbox"
                        className="square-button-md no-border"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (!isMandatory) {
                                (plugin.enabled ? onDisablePlugins : onEnablePlugins)([plugin.name]);
                            }
                        }}>
                        <Glyphicon glyph={plugin.enabled ? 'check' : 'unchecked'} />
                    </Button>}
                    {plugin.glyph ? <Glyphicon key="icon" glyph={plugin.glyph} /> : <Glyphicon key="icon" glyph="plug" />}
                </React.Fragment>),
            children: processChildren &&
                pluginsToItems(editedPlugin, editedCfg, cfgError, setEditor, documentationBaseURL, showDescriptionTooltip,
                    descriptionTooltipDelay, onEditPlugin, onEnablePlugins, onDisablePlugins, onUpdateCfg, onShowDialog,
                    changePluginsKey, false, plugin.children, true, plugin.enabled) || []
        };
    });

const pickIds = items => items && items.map(item => item.id);
const ignoreMandatory = items => items && items.filter(item => !item.mandatory);

const renderPluginError = (error) => {
    const tooltip = (<Tooltip>
        {error.message}
    </Tooltip>);
    return (
        <OverlayTrigger placement="top" overlay={tooltip}>
            <Glyphicon glyph="warning-sign"/>
        </OverlayTrigger>
    );
};

const renderPluginsToUpload = (plugin, onRemove = () => {}) => {
    const uploadingStatus = plugin.error ? <Glyphicon glyph="remove" /> : <Glyphicon glyph="ok"/>;
    return (<div className="uploading-file">
        {uploadingStatus}<span className="plugin-name">{plugin.name}</span>
        <span className="upload-remove" onClick={onRemove}><Glyphicon glyph="trash" /></span>
        <span className="upload-error">{plugin.error && renderPluginError(plugin.error)}</span>
    </div>);
};

const renderUploadModal = ({
    toUpload,
    onClose,
    onUpload,
    onInstall,
    onRemove,
    isUploading,
    uploadStatus
}) => {
    return (<Modal
        show>
        <Modal.Header key="dialogHeader">
            <Modal.Title><Message msgId="contextCreator.configurePlugins.uploadTitle" /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {isUploading ? <Spinner/> : <div className="configure-plugins-step-upload">
                <Dropzone
                    key="dropzone"
                    rejectClassName="dropzone-danger"
                    className="dropzone"
                    activeClassName="active"
                    onDrop={onUpload}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        justifyContent: "center"
                    }}>
                        <span style={{
                            textAlign: "center"
                        }}>
                            <Message msgId="contextCreator.configurePlugins.uploadLabel"/>
                        </span>
                    </div>
                </Dropzone>
                <div className="uploads-list">{toUpload.map((plugin, idx) => renderPluginsToUpload(plugin, () => onRemove(idx)))}</div>
                {uploadStatus && uploadStatus.result === "error" && <Alert bsStyle="danger"><Message msgId="contextCreator.configurePlugins.uploadError"/>{uploadStatus.error.message}</Alert>}
                {uploadStatus && uploadStatus.result === "ok" && <Alert bsStyle="info"><Message msgId="contextCreator.configurePlugins.uploadOk"/></Alert>}
            </div>}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose}><Message msgId="contextCreator.configurePlugins.cancelUpload"/></Button>
            <Button bsStyle="primary" onClick={onInstall} disabled={toUpload.filter(f => !f.error).length === 0}><Message msgId="contextCreator.configurePlugins.install"/></Button>
        </Modal.Footer>
    </Modal>);
};

const configurePluginsStep = ({
    user,
    loading,
    loadFlags,
    allPlugins = [],
    editedPlugin,
    editedCfg,
    cfgError,
    parsedTemplate,
    editedTemplate,
    fileDropStatus,
    availablePluginsFilterText = "",
    enabledPluginsFilterText = "",
    availablePluginsFilterPlaceholder = "contextCreator.configurePlugins.pluginsFilterPlaceholder",
    enabledPluginsFilterPlaceholder = "contextCreator.configurePlugins.pluginsFilterPlaceholder",
    documentationBaseURL,
    showDescriptionTooltip = true,
    descriptionTooltipDelay = 600,
    uploadEnabled = false,
    pluginsToUpload = [],
    uploading = [],
    uploadResult,
    showDialog = {},
    mapTemplates,
    availableTemplatesFilterText,
    enabledTemplatesFilterText,
    availableTemplatesFilterPlaceholder,
    enabledTemplatesFilterPlaceholder,
    disablePluginSort = false,
    onFilterAvailablePlugins = () => {},
    onFilterEnabledPlugins = () => {},
    onEditPlugin = () => {},
    onEnablePlugins = () => {},
    onDisablePlugins = () => {},
    onUpdateCfg = () => {},
    setSelectedPlugins = () => {},
    changePluginsKey = () => {},
    setEditor = () => {},
    onEnableUpload = () => {},
    onUpload = () => {},
    onAddUpload = () => {},
    onRemoveUpload = () => {},
    onShowDialog = () => {},
    onRemovePlugin = () => {},
    onSaveTemplate,
    onDeleteTemplate,
    onEditTemplate,
    onFilterAvailableTemplates,
    onFilterEnabledTemplates,
    changeTemplatesKey,
    setSelectedTemplates,
    setParsedTemplate,
    setFileDropStatus,
    messages = {}
}) => {
    const uploadErrors = {
        [ERROR.WRONG_FORMAT]: "contextCreator.configurePlugins.uploadWrongFileFormatError",
        [ERROR.MISSING_INDEX]: "contextCreator.configurePlugins.uploadMissingIndexError",
        [ERROR.MALFORMED_INDEX]: "contextCreator.configurePlugins.uploadParseError",
        [ERROR.MISSING_PLUGIN]: "contextCreator.configurePlugins.uploadMissingPluginError",
        [ERROR.MISSING_BUNDLE]: "contextCreator.configurePlugins.uploadMissingBundleError",
        [ERROR.TOO_MANY_BUNDLES]: "contextCreator.configurePlugins.uploadTooManyBundlesError",
        [ERROR.ALREADY_INSTALLED]: "contextCreator.configurePlugins.uploadAlreadyInstalledError"
    };
    const checkUpload = (files) => {
        Promise.all(files.map(file => {
            return checkZipBundle(file, allPlugins.map(p => p.name)).catch(e => {
                throw new Error(LocaleUtils.getMessageById(messages, uploadErrors[e]));
            });
        })).then((namedFiles) => {
            onAddUpload(namedFiles);
        }).catch(e => {
            onAddUpload(files.map(f => ({name: f.name, file: f, error: e})));
        });
    };
    const installUploads = () => {
        const uploads = pluginsToUpload.filter(f => !f.error);
        onUpload(uploads);
    };
    const selectedPlugins = allPlugins.filter(plugin => plugin.selected);
    const availablePlugins = allPlugins.filter(plugin => !plugin.enabled);
    const enabledPlugins = allPlugins.filter(plugin => plugin.enabled);

    const pluginsToItemsFunc = pluginsToItems.bind(null, editedPlugin, editedCfg, cfgError, setEditor, documentationBaseURL,
        showDescriptionTooltip, descriptionTooltipDelay,
        onEditPlugin, onEnablePlugins, onDisablePlugins, onUpdateCfg, onShowDialog, changePluginsKey, true);

    const selectedItems = pluginsToItemsFunc(selectedPlugins, false);
    const availableItems = pluginsToItemsFunc(availablePlugins, true);
    const enabledItems = pluginsToItemsFunc(enabledPlugins, true);

    return (
        <div className="configure-plugins-step">
            <Transfer
                leftColumn={{
                    items: availableItems,
                    title: 'contextCreator.configurePlugins.availablePlugins',
                    filterText: availablePluginsFilterText,
                    filterPlaceholder: availablePluginsFilterPlaceholder,
                    emptyStateProps: {
                        glyph: 'wrench',
                        title: 'contextCreator.configurePlugins.availablePluginsEmpty'
                    },
                    emptyStateSearchProps: {
                        glyph: 'info-sign',
                        title: 'contextCreator.configurePlugins.searchResultsEmpty'
                    },
                    onFilter: onFilterAvailablePlugins,
                    tools: [{
                        id: "upload", glyph: "upload", onClick: () => onEnableUpload(true), tooltipId: 'contextCreator.configurePlugins.tooltips.uploadPlugin'
                    }]
                }}
                rightColumn={{
                    items: enabledItems,
                    title: 'contextCreator.configurePlugins.enabledPlugins',
                    filterText: enabledPluginsFilterText,
                    filterPlaceholder: enabledPluginsFilterPlaceholder,
                    emptyStateProps: {
                        glyph: 'wrench',
                        title: 'contextCreator.configurePlugins.enabledPluginsEmpty'
                    },
                    emptyStateSearchProps: {
                        glyph: 'info-sign',
                        title: 'contextCreator.configurePlugins.searchResultsEmpty'
                    },
                    emptyTest: items => !items.filter(item => !item.mandatory).length,
                    onFilter: onFilterEnabledPlugins
                }}
                allowCtrlMultiSelect
                selectedItems={selectedItems}
                selectedSide={allPlugins.reduce((result, plugin) => plugin.selected && plugin.enabled || result, false) ?
                    'right' :
                    'left'
                }
                sortStrategy={items => {
                    if (disablePluginSort) {
                        return items;
                    }

                    const recursiveSort = curItems => curItems && curItems.map(item => ({...item, children: recursiveSort(item.children)}))
                        .sort((x, y) => x.title < y.title ? -1 : 1);
                    return recursiveSort(items);
                }}
                filter={(text, items) => {
                    const loweredText = text.toLowerCase();
                    const recursiveFilter = (curItems = []) =>
                        curItems.map(item => ({...item, children: recursiveFilter(item.children)}))
                            .filter(item => item.children.length > 0 || item.title.toLowerCase().indexOf(loweredText) > -1);
                    return recursiveFilter(items);
                }}
                onSelect={items => setSelectedPlugins(pickIds(ignoreMandatory(items)))}
                onTransfer={(items, direction) => (direction === 'right' ? onEnablePlugins : onDisablePlugins)(pickIds(ignoreMandatory(items)))}/>
            <ResizableModal
                loading={loading && loadFlags.templateDataLoading}
                showFullscreen
                title={<Message msgId="contextCreator.configureTemplates.title"/>}
                show={showDialog.mapTemplatesConfig}
                fullscreenType="vertical"
                clickOutEnabled={false}
                size="lg"
                onClose={() => onShowDialog('mapTemplatesConfig', false)}>
                <ConfigureMapTemplates
                    user={user}
                    loading={loading}
                    loadFlags={loadFlags}
                    mapTemplates={mapTemplates}
                    parsedTemplate={parsedTemplate}
                    editedTemplate={editedTemplate}
                    fileDropStatus={fileDropStatus}
                    availableTemplatesFilterText={availableTemplatesFilterText}
                    enabledTemplatesFilterText={enabledTemplatesFilterText}
                    availableTemplatesFilterPlaceholder={availableTemplatesFilterPlaceholder}
                    enabledTemplatesFilterPlaceholder={enabledTemplatesFilterPlaceholder}
                    showUploadDialog={showDialog.uploadTemplate}
                    changeTemplatesKey={changeTemplatesKey}
                    setSelectedTemplates={setSelectedTemplates}
                    setParsedTemplate={setParsedTemplate}
                    setFileDropStatus={setFileDropStatus}
                    onSave={onSaveTemplate}
                    onDelete={onDeleteTemplate}
                    onEditTemplate={onEditTemplate}
                    onFilterAvailableTemplates={onFilterAvailableTemplates}
                    onFilterEnabledTemplates={onFilterEnabledTemplates}
                    onShowUploadDialog={onShowDialog.bind(null, 'uploadTemplate')}/>
            </ResizableModal>
            <ConfirmModal onClose={onShowDialog.bind(null, 'confirmRemovePlugin', false)} onConfirm={onRemovePlugin.bind(null, showDialog.confirmRemovePluginPayload)} show={showDialog.confirmRemovePlugin} buttonSize="large">
                <Message msgId="contextCreator.configurePlugins.confirmRemovePlugin"/>
            </ConfirmModal>
            {uploadEnabled && renderUploadModal({
                toUpload: pluginsToUpload,
                onClose: () => onEnableUpload(false),
                onUpload: checkUpload,
                onInstall: installUploads,
                onRemove: onRemoveUpload,
                isUploading: uploading.filter(u => u.uploading).length > 0,
                uploadStatus: uploadResult
            })}
        </div>
    );
};

export default compose(
    withState('errorLineNumber', 'setErrorLineNumber'),
    withState('editor', 'setEditor'),
    getContext({
        messages: PropTypes.object
    }),
    lifecycle({
        componentDidUpdate() {
            const {cfgError, editor, errorLineNumber, setErrorLineNumber} = this.props;
            const cfgErrorLineNumber = get(cfgError, 'lineNumber');
            if (editor && cfgErrorLineNumber !== errorLineNumber) {
                if (errorLineNumber) {
                    editor.removeLineClass(errorLineNumber - 1, 'background', 'plugin-configuration-line-error');
                }
                setErrorLineNumber(cfgErrorLineNumber);
                if (cfgErrorLineNumber) {
                    editor.addLineClass(cfgErrorLineNumber - 1, 'background', 'plugin-configuration-line-error');
                }
            }
        }
    }),
    tutorialEnhancer('configureplugins-initial')
)(configurePluginsStep);
