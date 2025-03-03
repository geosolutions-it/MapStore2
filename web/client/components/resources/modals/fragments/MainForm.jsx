/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Col, Row} from 'react-bootstrap';
import uuid from 'uuid/v1';

import Message from '../../../I18N/Message';
import FileDrop from '../../forms/FileDrop';
import Metadata from '../../forms/Metadata';
import Thumbnail from '../../forms/Thumbnail';
/**
 * @deprecated
 */
class MainForm extends React.Component {
    render() {
        /* eslint-disable */
        const {
            resource,
            linkedResources = {},
            enableFileDrop = false,
            acceptedDropFileName,
            fileDropLabel,
            fileDropStatus,
            fileDropErrorMessage,
            fileDropClearMessage,
            onFileDrop = () => { },
            onFileDropClear = () => { },
            onError = () => { },
            onUpdate = () => { },
            nameFieldFilter = () => { },
            onUpdateLinkedResource = () => { }
        } = this.props;
        /* eslint-enable */
        return (<Row>
            {enableFileDrop && <Col xs={12}>
                <FileDrop
                    acceptedFileName={acceptedDropFileName}
                    label={fileDropLabel}
                    status={fileDropStatus}
                    errorMessage={fileDropErrorMessage}
                    clearMessage={fileDropClearMessage}
                    onDrop={onFileDrop}
                    onClear={onFileDropClear}
                    onError={onError}/>
            </Col>}
            <Col xs={12}>
                <Thumbnail
                    resource={resource}
                    thumbnail={
                        (linkedResources && linkedResources.thumbnail && linkedResources.thumbnail.data)
                        || resource && resource.attributes && resource.attributes.thumbnail
                    }
                    onError={onError}
                    onRemove={() => onUpdateLinkedResource("thumbnail", "NODATA", "THUMBNAIL", {
                        tail: `/raw?decode=datauri&v=${uuid()}`
                    })}
                    onUpdate={(data) => onUpdateLinkedResource("thumbnail", data || "NODATA", "THUMBNAIL", {
                        tail: `/raw?decode=datauri&v=${uuid()}`
                    })} />
            </Col>
            <Col xs={12}>
                <Metadata role="body" ref="mapMetadataForm"
                    onChange={onUpdate}
                    resource={resource}
                    nameFieldText={<Message msgId="saveDialog.name" />}
                    titleFieldText={<Message msgId="saveDialog.titleInput" />}
                    descriptionFieldText={<Message msgId="saveDialog.description" />}
                    nameFieldFilter={nameFieldFilter}
                    createdAtFieldText={<Message msgId="saveDialog.createdAt" />}
                    modifiedAtFieldText={<Message msgId="saveDialog.modifiedAt" />}
                    namePlaceholderText={"saveDialog.namePlaceholder"}
                    descriptionPlaceholderText={"saveDialog.descriptionPlaceholder"}
                    titlePlaceholderText={"saveDialog.titlePlaceholder"}
                    unadvertisedText={<Message msgId="saveDialog.unadvertised" />}
                    creatorFieldText={<Message msgId="saveDialog.creator" />}
                    editorFieldText={<Message msgId="saveDialog.editor" />}
                />
            </Col>
        </Row>);
    }
}

export default MainForm;
