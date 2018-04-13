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

module.exports = class MainForm extends React.Component {
    render() {
        const {
            resource,
            linkedResources={},
            metadata,
            onError = () => { },
            onUpdate = () => { },
            onUpdateLinkedResource = () => { }
        } = this.props;
        return (<Row>
            <Col xs={12}>
                <Thumbnail
                    resource={resource}
                    thumbnail={linkedResources.thumbnail && linkedResources.thumbnail.data}
                    onError={onError}
                    onRemove={() => onUpdateLinkedResource("thumbnail", "NODATA", "THUMBNAIL", {
                        tail: '/raw?decode=datauri'
                    })}
                    onUpdate={(data) => onUpdateLinkedResource("thumbnail", data, "THUMBNAIL", {
                        tail: '/raw?decode=datauri'
                    })} />
            </Col>
            <Col xs={12}>
                <Metadata role="body" ref="mapMetadataForm"
                    onChange={onUpdate}
                    resource={resource}
                    metadata={metadata}
                    nameFieldText={<Message msgId="map.name" />}
                    descriptionFieldText={<Message msgId="map.description" />}
                    namePlaceholderText={"map.namePlaceholder"}
                    descriptionPlaceholderText={"map.descriptionPlaceholder"}
                />
            </Col>
        </Row>);
    }
};


