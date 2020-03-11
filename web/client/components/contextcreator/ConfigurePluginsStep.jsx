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
import {Glyphicon, Button} from 'react-bootstrap';
import {Controlled as Codemirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

import Transfer from '../misc/transfer/Transfer';
import ResizableModal from '../misc/ResizableModal';
import ToolbarButton from '../misc/toolbar/ToolbarButton';
import Message from '../I18N/Message';
import ConfigureMapTemplates from './ConfigureMapTemplates';

import Dropzone from 'react-dropzone';
import Spinner from "react-spinkit";

import JSZip from 'jszip';
import FileUtils from '../../utils/FileUtils';
import LocaleUtils from '../../utils/LocaleUtils';
import PropTypes from 'prop-types';

/**
 * Converts plugin objects to Transform items
 * @param {string} editedPlugin currently edited plugin
 * @param {string} editedCfg text of a configuration of currently edited plugin
 * @param {object} cfgError object describing current cfg editing error
 * @param {function} setEditor editor instance setter
 * @param {string} documentationBaseURL base url for plugin documentation
 * @param {boolean} showMapTemplatesConfig
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
const pluginsToItems = (editedPlugin, editedCfg, cfgError, setEditor, documentationBaseURL, onEditPlugin,
    onEnablePlugins, onDisablePlugins, onUpdateCfg, onShowDialog, changePluginsKey, isRoot, plugins = [],
    processChildren, parentIsEnabled) =>
    plugins.filter(plugin => !plugin.hidden).map(plugin => {
        const enableTools = (isRoot || parentIsEnabled) && plugin.enabled;
        const isMandatory = plugin.forcedMandatory || plugin.mandatory;
        return {
            id: plugin.name,
            title: plugin.title || plugin.label || plugin.name,
            cardSize: 'sm',
            description: plugin.description || 'plugin name: ' + plugin.name,
            mandatory: isMandatory,
            className: !isRoot && parentIsEnabled && !plugin.enabled ? 'plugin-card-disabled' : '',
            tools: enableTools ? [{
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
            }] : [],
            component: enableTools && plugin.name === editedPlugin ?
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
                pluginsToItems(editedPlugin, editedCfg, cfgError, setEditor, documentationBaseURL, onEditPlugin,
                    onEnablePlugins, onDisablePlugins, onUpdateCfg, onShowDialog, changePluginsKey, false, plugin.children,
                    true, plugin.enabled) || []
        };
    });

const pickIds = items => items && items.map(item => item.id);
const ignoreMandatory = items => items && items.filter(item => !item.mandatory);


const renderUploading = (plugin) => {
    const uploadingStatus = plugin.error ? <Glyphicon glyph="remove" />
        : (plugin.uploading ? <Spinner spinnerName = "circle" noFadeIn overrideSpinnerClassName = "spinner" /> : <Glyphicon glyph="ok"/>);
    return <div className="uploading-file">{uploadingStatus}<span className="plugin-name">{plugin.name}</span><span className="upload-error">{plugin.error && plugin.error.message || ""}</span></div>;
};

const configurePluginsStep = ({
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
    uploadEnabled = false,
    uploading = [],
    showDialog = {},
    mapTemplates,
    availableTemplatesFilterText,
    enabledTemplatesFilterText,
    availableTemplatesFilterPlaceholder,
    enabledTemplatesFilterPlaceholder,
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
    onUploadError = () => {},
    onShowDialog = () => {},
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

    const checkUpload = (files) => {
        Promise.all(files.map(file => {
            return FileUtils.readZip(file).then((buffer) => {
                var zip = new JSZip();
                return zip.loadAsync(buffer);
            }).then((zip) => {
                if (zip.files["index.json"]) {
                    return zip.files["index.json"].async("text").then((json) => {
                        try {
                            const index = JSON.parse(json);
                            if (index.plugins && index.plugins[0].name) {
                                return { name: index.plugins[0].name, file };
                            }
                        } catch (e) {
                            throw new Error(LocaleUtils.getMessageById(messages, "contextCreator.configurePlugins.uploadParseError"));
                        }
                        throw new Error(LocaleUtils.getMessageById(messages, "contextCreator.configurePlugins.uploadMissingFileError"));
                    }).catch(e => {
                        throw e;
                    });
                }
                throw new Error(LocaleUtils.getMessageById(messages, "contextCreator.configurePlugins.uploadMissingFileError"));
            }).catch(e => {
                throw e;
            });
        })).then((namedFiles) => {
            onUpload(namedFiles);
        }).catch(e => {
            onUploadError(files.map(f => ({file: f, error: e})));
        });
    };

    const selectedPlugins = allPlugins.filter(plugin => plugin.selected);
    const availablePlugins = allPlugins.filter(plugin => !plugin.enabled);
    const enabledPlugins = allPlugins.filter(plugin => plugin.enabled);

    const pluginsToItemsFunc = pluginsToItems.bind(null, editedPlugin, editedCfg, cfgError, setEditor, documentationBaseURL,
        onEditPlugin, onEnablePlugins, onDisablePlugins, onUpdateCfg, onShowDialog, changePluginsKey, true);

    const selectedItems = pluginsToItemsFunc(selectedPlugins, false);
    const availableItems = pluginsToItemsFunc(availablePlugins, true);
    const enabledItems = pluginsToItemsFunc(enabledPlugins, true);
    if (uploadEnabled) {
        return (<div className="configure-plugins-step-upload">
            <div className="title-header"><Message msgId="contextCreator.configurePlugins.uploadTitle" /><Glyphicon glyph="1-close" style={{ cursor: "pointer" }} onClick={(e) => {
                e.stopPropagation();
                onEnableUpload(false);
            }} /></div>
            <Dropzone
                key="dropzone"
                rejectClassName="alert-danger"
                className="alert alert-info"
                onDrop={checkUpload}>
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
            {uploading.map(plugin => renderUploading(plugin))}
        </div>);
    }
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
                showFullscreen
                title={<Message msgId="contextCreator.configureTemplates.title"/>}
                show={showDialog.mapTemplatesConfig}
                fullscreenType="vertical"
                clickOutEnabled={false}
                size="lg"
                onClose={() => onShowDialog('mapTemplatesConfig', false)}>
                <ConfigureMapTemplates
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
    })
)(configurePluginsStep);
