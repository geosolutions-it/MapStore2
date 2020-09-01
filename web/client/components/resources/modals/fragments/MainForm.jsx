/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Message = require('../../../I18N/Message');
const {Row, Col} = require('react-bootstrap');
const Metadata = require('../../forms/Metadata');
const Thumbnail = require('../../forms/Thumbnail');
const FileDrop = require('../../forms/FileDrop').default;
const uuid = require('uuid/v1');

module.exports = class MainForm extends React.Component {
    render() {
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
                    descriptionFieldText={<Message msgId="saveDialog.description" />}
                    nameFieldFilter={nameFieldFilter}
                    createdAtFieldText={<Message msgId="saveDialog.createdAt" />}
                    modifiedAtFieldText={<Message msgId="saveDialog.modifiedAt" />}
                    namePlaceholderText={"saveDialog.namePlaceholder"}
                    descriptionPlaceholderText={"saveDialog.descriptionPlaceholder"}
                />
            </Col>
        </Row>);
    }
};


