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
import { isValidURL } from "../../utils/URLUtils";

function TerrainEditor({
    terrain,
    onHide = () => {},
    handleAddEditTerrainLayer = () => {},
    layer = {},
    isEditing
}, context) {
    const { messages = {} } = context || {};

    const providers = [
        { value: 'cesium', label: getMessageById(messages, "backgroundSelector.terrain.cesiumProvider.label")},
        { value: 'cesium-ion', label: getMessageById(messages, "backgroundSelector.terrain.cesiumIonProvider.label") },
        { value: 'wms', label: getMessageById(messages, "backgroundSelector.terrain.wmsProvider.label") }
    ];
    const TERRAIN_FIELDS_PER_PROVIDER = {
        "cesium": {"title": undefined, "url": undefined},
        "cesium-ion": {"title": undefined, "assetId": undefined, "accessToken": undefined, "server": undefined},
        "wms": {"title": undefined, "url": undefined, "name": undefined, "crs": undefined, "version": undefined}
    };
    const [provider, setProvider] = useState(layer.provider || providers[0].value);
    const [terrainData, setTerrainData] = useState(layer);
    const [hasUrlError, setHasUrlError] = useState();
    const handleChange = (evt) => {
        const value = evt.target.value;
        const name = evt.target.name;
        if (name === 'url') {
            setHasUrlError(isValidURL(value || '') ? false : true);
        }
        setTerrainData(prev => ({...prev, [name]: value}));
    };
    const checkValidTerrainData = () => {
        let terrainFields = TERRAIN_FIELDS_PER_PROVIDER[provider];
        let isAllFormFieldsValuesEntered = Object.keys(terrainFields).every((item) => terrainData[item]);
        return isAllFormFieldsValuesEntered;
    };
    const handleAddEditTerrain = () => {
        let terrainLayer = {
            ...terrainData,
            provider: provider,
            type: 'terrain',
            group: 'background',
            editable: true,
            visibility: true
        };
        if (isEditing) {
            handleAddEditTerrainLayer(terrainLayer);
            onHide();
            return;
        }
        const newId = uuid();
        terrainLayer = {
            ...terrainLayer,
            id: newId
        };
        handleAddEditTerrainLayer(terrainLayer);
        onHide();
    };
    const handleSelect = (name, value) => {
        setTerrainData(prev => ({...prev, [name]: value}));
    };
    return (
        <Modal
            show={!!terrain}
            onHide={onHide}
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
                                setHasUrlError(false);
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
                        onChange={handleChange}
                    />
                </FormGroup>
                {provider === 'cesium' ? <>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumProvider.urlLabel" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.urlLabel")}
                            value={terrainData?.url || ''}
                            name="url"
                            onChange={handleChange}
                        />
                        <div>{hasUrlError && <small className="text-danger"><Message msgId="backgroundSelector.terrain.invalidUrl"/></small>}</div>
                    </FormGroup>
                </> : null}
                {provider === 'cesium-ion' ? <>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumIonProvider.assetId" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.assetId")}
                            value={terrainData?.assetId || ''}
                            name="assetId"
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumIonProvider.accessToken" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.accessToken")}
                            value={terrainData?.accessToken || ''}
                            name="accessToken"
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.cesiumIonProvider.server" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.server")}
                            value={terrainData?.server || ''}
                            name="server"
                            onChange={handleChange}
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
                            onChange={handleChange}
                        />
                        <div>{hasUrlError && <small className="text-danger"><Message msgId="backgroundSelector.terrain.invalidUrl"/></small>}</div>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.layernameLabel" /></ControlLabel>
                        <FormControl
                            placeholder={getMessageById(messages, "backgroundSelector.terrain.placeholders.layernameLabel")}
                            value={terrainData?.name || ''}
                            name="name"
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.projectionLabel" /></ControlLabel>
                        <Select
                            value={terrainData?.crs || ''}
                            options={[{value: "CRS:84", label: 'CRS84'}]}
                            clearable={false}
                            name="crs"
                            onChange={({value}) => handleSelect('crs', value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="backgroundSelector.terrain.wmsProvider.wmsVersionLabel" /></ControlLabel>
                        <Select
                            value={terrainData?.version || ''}
                            options={[{value: "1.3.0", label: '1.3.0'}]}
                            clearable={false}
                            name="version"
                            onChange={({value}) => handleSelect('version', value)}
                        />
                    </FormGroup>
                </> : null}
                <FlexBox centerChildrenVertically gap="sm">
                    <FlexBox.Fill/>
                    <Button variant={'success'}
                        onClick={handleAddEditTerrain}
                        disabled={hasUrlError || !checkValidTerrainData()}
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
