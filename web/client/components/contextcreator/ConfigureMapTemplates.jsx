/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {get, isString, isObject} from 'lodash';
import {Glyphicon} from 'react-bootstrap';
import jsonlint from 'jsonlint-mod';

import FileFormatUtils from '../../utils/FileFormatUtils';
import Transfer from '../misc/transfer/Transfer';
import ConfirmDialog from '../misc/ConfirmDialog';
import Message from '../I18N/Message';
import SaveModal from '../resources/modals/Save';
import handleSaveModal from '../resources/modals/enhancers/handleSaveModal';

const SaveDialog = handleSaveModal(SaveModal);

const templateToItem = (onEditTemplate, onDelete, template) => ({
    id: template.id,
    title: template.name || template.id.toString(),
    description: template.description,
    tools: [{
        glyph: 'pencil',
        tooltipId: 'contextCreator.configureTemplates.tooltips.editTemplate',
        onClick: () => onEditTemplate(template.id)
    }, {
        glyph: 'trash',
        tooltipId: 'contextCreator.configureTemplates.tooltips.deleteTemplate',
        onClick: () => onDelete(template)
    }],
    preview:
        <div className="configure-map-templates-preview">
            {template.thumbnail && template.thumbnail !== 'NODATA' ? <img src={template.thumbnail}/> : <Glyphicon glyph="1-map"/>}
        </div>,
    infoExtra:
        template.format && <div className="configure-map-templates-formaticon">
            <Glyphicon glyph={FileFormatUtils.formatToGlyph[template.format]}/>
            <span>{FileFormatUtils.formatToText[template.format]}</span>
        </div>
});

const pickIds = items => items && items.map(item => item.id);

const processData = (setParsedTemplate, setFileDropStatus, onError, type, fileName, data) => {
    const parseJSON = () => {
        try {
            const mapConfig = jsonlint.parse(data);
            setParsedTemplate(fileName, mapConfig, 'json');
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

    const saveXML = () => {
        setParsedTemplate(fileName, data, 'wmc');
        setFileDropStatus('accepted');
        onError([]);
    };

    if (!isString(type) || !isString(data)) {
        return;
    }
    if (type.indexOf('application/xml') > -1 || type.indexOf('text/xml') > -1 || data.indexOf('<?xml') === 0) {
        saveXML();
    } else {
        parseJSON();
    }
};

const onTemplateDrop = (setParsedTemplate, setFileDropStatus, onError, files) => {
    if (files && files.length > 0) {
        let fileReader = new FileReader;
        fileReader.onload = e => processData(setParsedTemplate, setFileDropStatus, onError, files[0].type, files[0].name, e.target.result);
        fileReader.onerror = () => {
            fileReader.abort();
            setFileDropStatus('clear');
            onError(['contextCreator.configureTemplates.uploadDialog.fileReadError']);
        };
        fileReader.readAsText(files[0]);
    }
};

export default ({
    user,
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
    onDelete = () => {},
    onEditTemplate = () => {},
    onFilterAvailableTemplates = () => {},
    onFilterEnabledTemplates = () => {},
    onShowUploadDialog = () => {}
}) => {
    const [showDeleteConfirm, onShowDeleteConfirm] = React.useState(false);
    const [templateToDelete, setTemplateToDelete] = React.useState();

    const onDeleteTemplate = (template) => {
        setTemplateToDelete(template);
        onShowDeleteConfirm(true);
    };
    const templateToItemFunc = templateToItem.bind(null, onEditTemplate, onDeleteTemplate);

    return (<>
        <Transfer
            className="configure-map-templates-transfer"
            leftColumn={{
                items: mapTemplates.filter(template => !template.enabled).map(templateToItemFunc),
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
                items: mapTemplates.filter(template => template.enabled).map(templateToItemFunc),
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
            selectedItems={mapTemplates.filter(template => template.selected).map(templateToItemFunc)}
            selectedSide={mapTemplates.reduce((result, template) => template.selected && template.enabled || result, false) ?
                'right' :
                'left'
            }
            sortStrategy={items => items.slice().sort((x, y) => x.title < y.title ? -1 : x.title > y.title ? 1 : 0)}
            filter={(text, items) => items.filter(item => item.title.toLowerCase().indexOf(text.toLowerCase()) > -1)}
            onSelect={items => setSelectedTemplates(pickIds(items))}
            onTransfer={(items, direction) => changeTemplatesKey(pickIds(items), 'enabled', direction === 'right')}/>
        <SaveDialog
            user={user}
            loading={loading && (loadFlags.templateSaving || loadFlags.templateLoading)}
            resource={editedTemplate}
            clickOutEnabled={false}
            category="TEMPLATE"
            show={showUploadDialog}
            title={editedTemplate ? undefined : "contextCreator.configureTemplates.uploadDialog.title"}
            data={parsedTemplate.data}
            additionalAttributes={{format: parsedTemplate.format}}
            enableFileDrop
            acceptedDropFileName={parsedTemplate.fileName}
            fileDropStatus={fileDropStatus}
            fileDropLabel="contextCreator.configureTemplates.fileDrop.label"
            fileDropClearMessage={<Message msgId="contextCreator.configureTemplates.fileDrop.clear"/>}
            dialogClassName=" modal-higher"
            onFileDrop={onTemplateDrop.bind(null, setParsedTemplate, setFileDropStatus)}
            onFileDropClear={() => {
                setParsedTemplate();
                setFileDropStatus();
            }}
            onSave={resource => {
                let resourceFormat = resource.attributes.format;

                // try to get format information
                if (!resourceFormat) {
                    if (isString(resource.data)) {
                        processData((fileName, config, type) => {
                            resourceFormat = type;
                        }, () => {}, () => {}, 'application/text', parsedTemplate.fileName, resource.data);
                    } else if (isObject(resource.data)) {
                        resourceFormat = 'json';
                    }
                }

                return onSave({
                    ...resource,
                    metadata: {
                        ...resource.metadata,
                        attributes: {
                            ...(resource.attributes.thumbnail ? {thumbnail: encodeURIComponent(resource.attributes.thumbnail)} : {}),
                            ...(resourceFormat ? {format: resourceFormat} : {})
                        }
                    }
                });
            }}
            onClose={() => onShowUploadDialog(false)}/>
        <ConfirmDialog
            draggable={false}
            modal
            show={showDeleteConfirm}
            onClose={() => {
                setTemplateToDelete();
                onShowDeleteConfirm(false);
            }}
            onConfirm={() => {
                onDelete(templateToDelete);
                setTemplateToDelete();
                onShowDeleteConfirm(false);
            }}
            confirmButtonBSStyle="default"
            confirmButtonContent={<Message msgId="confirm"/>}
            closeText={<Message msgId="cancel"/>}
            closeGlyph="1-close">
            <Message msgId="contextCreator.configureTemplates.deleteConfirm" msgParams={{templateName: get(templateToDelete, 'name')}}/>
        </ConfirmDialog>
    </>);
};
