/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {isString} from 'lodash';
import {Glyphicon} from 'react-bootstrap';
import jsonlint from 'jsonlint-mod';

import Transfer from '../misc/transfer/Transfer';
import Message from '../I18N/Message';
import SaveModal from '../resources/modals/Save';
import handleSaveModal from '../resources/modals/enhancers/handleSaveModal';

const SaveDialog = handleSaveModal(SaveModal);

const templateToItem = (onEditTemplate, template) => ({
    id: template.id,
    title: template.name || template.id.toString(),
    description: template.description,
    tools: [{
        glyph: 'pencil',
        tooltipId: 'contextCreator.configureTemplates.tooltips.editTemplate',
        onClick: () => onEditTemplate(template.id)
    }],
    preview:
        <div className="configure-map-templates-preview">
            {template.thumbnail && template.thumbnail !== 'NODATA' ? <img src={template.thumbnail}/> : <Glyphicon glyph="1-map"/>}
        </div>
});

const pickIds = items => items && items.map(item => item.id);

const onTemplateDrop = (setParsedTemplate, setFileDropStatus, onError, files) => {
    const parseJSON = (fileName, data) => {
        try {
            const mapConfig = jsonlint.parse(data);
            setParsedTemplate(fileName, mapConfig);
            setFileDropStatus('accepted');
            onError([]);
        } catch (e) {
            setFileDropStatus('clear');
            onError([{
                statusText: 'contextCreator.configureTemplates.uploadDialog.jsonParsingError',
                error: e.message
            }]);
        }
    };

    const saveXML = (fileName, data) => {
        setParsedTemplate(fileName, data);
        setFileDropStatus('accepted');
        onError([]);
    };

    const processData = (type, fileName, data) => {
        if (!isString(type) || !isString(data)) {
            return;
        }
        if (type.indexOf('application/xml') > -1 || type.indexOf('text/xml') > -1 || data.indexOf('<?xml') === 0) {
            saveXML(fileName, data);
        } else {
            parseJSON(fileName, data);
        }
    };

    if (files && files.length > 0) {
        let fileReader = new FileReader;
        fileReader.onload = e => processData(files[0].type, files[0].name, e.target.result);
        fileReader.onerror = () => {
            fileReader.abort();
            setFileDropStatus('clear');
            onError(['contextCreator.configureTemplates.uploadDialog.fileReadError']);
        };
        fileReader.readAsText(files[0]);
    }
};

export default ({
    loading,
    loadFlags,
    mapTemplates = [],
    availableTemplatesFilterText = "",
    enabledTemplatesFilterText = "",
    availableTemplatesFilterPlaceholder = "contextCreator.configureTemplates.templatesFilterPlaceholder",
    enabledTemplatesFilterPlaceholder = "contextCreator.configureTemplates.templatesFilterPlaceholder",
    showUploadDialog = false,
    parsedTemplate = {},
    editedTemplate,
    fileDropStatus,
    changeTemplatesKey = () => {},
    setSelectedTemplates = () => {},
    setParsedTemplate = () => {},
    setFileDropStatus = () => {},
    onSave = () => {},
    onEditTemplate = () => {},
    onFilterAvailableTemplates = () => {},
    onFilterEnabledTemplates = () => {},
    onShowUploadDialog = () => {}
}) => (
    <>
        <Transfer
            className="configure-map-templates-transfer"
            leftColumn={{
                items: mapTemplates.filter(template => !template.enabled).map(templateToItem.bind(null, onEditTemplate)),
                title: 'contextCreator.configureTemplates.availableTemplates',
                tools: [{
                    id: 'upload-tool',
                    glyph: 'upload',
                    tooltipId: 'contextCreator.configureTemplates.tooltips.uploadTool',
                    onClick: () => onEditTemplate()
                }],
                filterText: availableTemplatesFilterText,
                filterPlaceholder: availableTemplatesFilterPlaceholder,
                emptyStateProps: {
                    glyph: '1-map',
                    title: 'contextCreator.configureTemplates.availableTemplatesEmpty'
                },
                emptyStateSearchProps: {
                    glyph: 'info-sign',
                    title: 'contextCreator.configureTemplates.searchResultsEmpty'
                },
                onFilter: onFilterAvailableTemplates
            }}
            rightColumn={{
                items: mapTemplates.filter(template => template.enabled).map(templateToItem.bind(null, onEditTemplate)),
                title: 'contextCreator.configureTemplates.enabledTemplates',
                filterText: enabledTemplatesFilterText,
                filterPlaceholder: enabledTemplatesFilterPlaceholder,
                emptyStateProps: {
                    glyph: '1-map',
                    title: 'contextCreator.configureTemplates.enabledTemplatesEmpty'
                },
                emptyStateSearchProps: {
                    glyph: 'info-sign',
                    title: 'contextCreator.configureTemplates.searchResultsEmpty'
                },
                onFilter: onFilterEnabledTemplates
            }}
            allowCtrlMultiSelect
            selectedItems={mapTemplates.filter(template => template.selected).map(templateToItem.bind(null, onEditTemplate))}
            selectedSide={mapTemplates.reduce((result, template) => template.selected && template.enabled || result, false) ?
                'right' :
                'left'
            }
            sortStrategy={items => items.slice().sort((x, y) => x.title < y.title ? -1 : x.title > y.title ? 1 : 0)}
            filter={(text, items) => items.filter(item => item.title.toLowerCase().indexOf(text.toLowerCase()) > -1)}
            onSelect={items => setSelectedTemplates(pickIds(items))}
            onTransfer={(items, direction) => changeTemplatesKey(pickIds(items), 'enabled', direction === 'right')}/>
        <SaveDialog
            loading={loading && (loadFlags.templateSaving || loadFlags.templateLoading)}
            resource={editedTemplate}
            canSave
            clickOutEnabled={false}
            category="TEMPLATE"
            show={showUploadDialog}
            title={editedTemplate ? undefined : "contextCreator.configureTemplates.uploadDialog.title"}
            data={parsedTemplate.data}
            enableFileDrop={!editedTemplate}
            acceptedDropFileName={parsedTemplate.fileName}
            fileDropStatus={fileDropStatus}
            fileDropLabel="contextCreator.configureTemplates.fileDrop.label"
            fileDropClearMessage={<Message msgId="contextCreator.configureTemplates.fileDrop.clear"/>}
            onFileDrop={onTemplateDrop.bind(null, setParsedTemplate, setFileDropStatus)}
            onFileDropClear={() => {
                setParsedTemplate();
                setFileDropStatus();
            }}
            onSave={onSave}
            onClose={() => onShowUploadDialog(false)}/>
    </>
);
