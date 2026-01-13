/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from "react";
import { ControlLabel, FormControl, FormGroup, Glyphicon } from "react-bootstrap";
import Select from 'react-select';
import uuid from "uuid";
import PropTypes from "prop-types";
import Modal from "../misc/Modal";
import FlexBox from "../layout/FlexBox";
import Button from "../layout/Button";
import Text from "../layout/Text";
import { getMessageById } from "../../utils/LocaleUtils";
import Message from "../I18N/Message";
import set from 'lodash/fp/set';
import { isValidURL } from "../../utils/URLUtils";

const validators = {
    "cesium": (layer) => {
        const url = !!isValidURL(layer?.url || '');
        return {
            valid: !!(layer?.title && url),
            errors: {
                url: !!(layer?.url && !url)
            }
        };
    },
    "cesium-ion": (layer) => {
        return {
            valid: !!(layer?.options?.assetId && layer?.options?.accessToken && layer?.title),
            errors: {}
        };
    },
    "wms": (layer) => {
        const url = !!isValidURL(layer?.url || '');
        return {
            valid: !!(layer?.title && url && layer?.name),
            errors: {
                url: !!(layer?.url && !url)
            }
        };
    }
};

const TERRAIN_FIELDS_PER_PROVIDER = {
    "cesium": { title: '', url: '' },
    "cesium-ion": { title: '', options: { assetId: '', accessToken: '', server: '' }},
    "wms": { title: '', url: '', name: '', version: '1.3.0', options: { crs: 'CRS:84' } }
};
function TerrainEditor({
    terrain,
    onHide = () => {},
    onUpdate = () => {},
    layer = {},
    isEditing
}, context) {
    const { messages = {} } = context || {};

    const providers = [
        { value: 'cesium', label: getMessageById(messages, "backgroundSelector.terrain.cesiumProvider.label")},
        { value: 'cesium-ion', label: getMessageById(messages, "backgroundSelector.terrain.cesiumIonProvider.label") },
        { value: 'wms', label: getMessageById(messages, "backgroundSelector.terrain.wmsProvider.label") }
    ];
    const [provider, setProvider] = useState(layer.provider || providers[0].value);
    const [terrainData, setTerrainData] = useState(layer);

    const handleChange = (key, value) => {
        setTerrainData(prev => set(key, value, prev));
    };

    const { valid, errors } = validators?.[provider] ? validators[provider](terrainData) : { valid: true };

    const handleAddEditTerrain = () => {
        let terrainLayer = {
            type: 'terrain',
            provider,
            ...terrainData,
            group: 'background'
        };
        if (isEditing) {
            onUpdate({...terrainLayer, id: layer?.id});
            onHide();
            return;
        }
        const newId = uuid();
        terrainLayer = {
            ...terrainLayer,
            id: newId
        };
        onUpdate(terrainLayer);
        onHide();
    };
    return (
        <Modal
            show={!!terrain}
        >
            <FlexBox classNames={['_padding-lr-lg', '_padding-tb-md']} column gap="md">
                <FlexBox centerChildrenVertically>
                    <FlexBox.Fill component={Text} fontSize="md" >{getMessageById(messages, "backgroundSelector.terrain.title")}</FlexBox.Fill>
                    <Button className="square-button-md" onClick={onHide} borderTransparent gap="sm">
                        <Glyphicon glyph="1-close" />
                    </Button>
                </FlexBox>
                <FlexBox centerChildrenVertically gap="sm">
                    <Text strong>{getMessageById(messages, "backgroundSelector.terrain.providerLabel")}</Text>
                    <div style={{ width: 150 }}>
                        <Select
                            clearable={false}
                            value={provider}
                            onChange={(op) => {
                                let value = op.value;
                                setProvider(value);
                                setTerrainData(prev => (isEditing ? {id: prev.id, ...TERRAIN_FIELDS_PER_PROVIDER[value]} : {...TERRAIN_FIELDS_PER_PROVIDER[value]}));
                            }}
                            options={providers}
                        />
                    </div>
                </FlexBox>
                <FormGroup>
                    <ControlLabel><Message msgId="backgroundSelector.terrain.titleLabel" /></ControlLabel>
                    <FormControl
                        placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.titleLabel")}
                        value={terrainData?.title || ''}
                        name="title"
                        onChange={(event) => handleChange('title', event?.target?.value)}
                    />
                </FormGroup>
                {provider === 'cesium' ? <>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumProvider.urlLabel" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.urlLabel")}
                            value={terrainData?.url || ''}
                            name="url"
                            onChange={(event) => handleChange('url', event?.target?.value)}
                        />
                        <div>{errors?.url && <small className="text-danger"><Message msgId="backgroundSelector.terrain.invalidUrl"/></small>}</div>
                    </FormGroup>
                </> : null}
                {provider === 'cesium-ion' ? <>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumIonProvider.assetId" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.assetId")}
                            value={terrainData?.options?.assetId || ''}
                            name="options.assetId"
                            onChange={(event) => handleChange('options.assetId', event?.target?.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumIonProvider.accessToken" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.accessToken")}
                            value={terrainData?.options?.accessToken || ''}
                            name="options.accessToken"
                            onChange={(event) => handleChange('options.accessToken', event?.target?.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumIonProvider.server" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.server")}
                            value={terrainData?.options?.server || ''}
                            name="options.server"
                            onChange={(event) => handleChange('options.server', event?.target?.value)}
                        />
                    </FormGroup>
                </> : null}
                {provider === 'wms' ? <>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.urlLabel" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.urlLabel")}
                            value={terrainData?.url || ''}
                            name="url"
                            onChange={(event) => handleChange('url', event?.target?.value)}
                        />
                        <div>{errors?.url && <small className="text-danger"><Message msgId="backgroundSelector.terrain.invalidUrl"/></small>}</div>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.layernameLabel" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.layernameLabel")}
                            value={terrainData?.name || ''}
                            name="name"
                            onChange={(event) => handleChange('name', event?.target?.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.projectionLabel" /></ControlLabel>
                        <Select
                            value={terrainData?.options?.crs || ''}
                            options={[
                                {value: "CRS:84", label: 'CRS:84'},
                                {value: "EPSG:4326", label: 'EPSG:4326'},
                                {value: "EPSG:3857", label: 'EPSG:3857'},
                                {value: "OSGEO:41001", label: 'OSGEO:41001'}
                            ]}
                            name="options.crs"
                            onChange={selected => handleChange('options.crs', selected?.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.wmsVersionLabel" /></ControlLabel>
                        <Select
                            value={terrainData?.version || ''}
                            options={[
                                {value: "1.3.0", label: '1.3.0'},
                                {value: "1.1.1", label: '1.1.1'},
                                {value: "1.1.0", label: '1.1.0'},
                                {value: "1.0.0", label: '1.0.0'}
                            ]}
                            name="version"
                            onChange={(selected) => handleChange('version', selected?.value)}
                        />
                    </FormGroup>
                </> : null}
                <FlexBox centerChildrenVertically gap="sm">
                    <FlexBox.Fill/>
                    <Button variant={'success'}
                        onClick={handleAddEditTerrain}
                        disabled={!valid}
                    >
                        <Message msgId="backgroundSelector.terrain.add" />
                    </Button>
                </FlexBox>
            </FlexBox>
        </Modal>
    );
}
TerrainEditor.contextTypes = {
    messages: PropTypes.object
};

export default TerrainEditor;
