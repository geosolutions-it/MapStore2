/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, ControlLabel, FormControl, FormGroup, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import { castArray, get } from 'lodash';

import Message from '../../../I18N/Message';
import localizedProps from '../../../misc/enhancers/localizedProps';
import Spinner from '../../../layout/Spinner';
import Fields from '../LayerFields/Fields';
import { getCapabilities, getFeature } from '../../../../api/WFS';
import { describeFeatureType } from '../../../../observables/wfs';
import { isGeometryType } from '../../../../utils/ogc/WFS/base';
import {
    interpolateExternalDataCQL,
    validateExternalDataConfiguration
} from '../../../../utils/mapinfo/ExternalDataUtils';

const LocalizedFormControl = localizedProps('placeholder')(FormControl);

const URL_VALIDATION_DELAY = 500;

const IDLE_VALIDATION = {
    status: 'idle',
    messageId: null,
    messageParams: null,
    cqlFilter: null
};

const INTERPOLATION_MESSAGE_IDS = {
    MISSING_SOURCE_PROPERTY: 'layerProperties.externalData.missingProperty',
    UNSAFE_SOURCE_VALUE: 'layerProperties.externalData.validation.unquotedPlaceholder',
    INVALID_INTERPOLATED_CQL: 'layerProperties.externalData.invalidInterpolatedCql'
};

/**
 * Normalizes the feature-type list returned by different WFS versions.
 */
export const getWFSFeatureTypes = (capabilities = {}) => {
    const root = capabilities['wfs:WFS_Capabilities']
        || capabilities.WFS_Capabilities
        || capabilities;
    return castArray(get(root, 'FeatureTypeList.FeatureType', []))
        .map((featureType) => ({
            name: featureType?.Name?._ || featureType?.Name,
            title: featureType?.Title?._ || featureType?.Title || featureType?.Name?._ || featureType?.Name
        }))
        .filter(({ name }) => !!name);
};

/**
 * Creates display settings for non-geometry attributes from DescribeFeatureType.
 */
export const getExternalAttributes = (description = {}, previousAttributes = []) =>
    (description?.featureTypes?.[0]?.properties || [])
        .filter((attribute) => !isGeometryType(attribute))
        .map((attribute) => {
            const previous = previousAttributes.find(({ name }) => name === attribute.name) || {};
            return {
                ...previous,
                name: attribute.name,
                type: attribute.localType || attribute.type,
                alias: previous.alias || '',
                visible: previous.visible !== false
            };
        });

const parseResponse = (data) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }
    return data;
};

/**
 * Configures and validates the WFS query used by an External Data view.
 */
const ExternalDataEditor = ({ value = {}, onChange = () => {}, sourceLayer, currentLocale }) => {
    const [state, setState] = useState({
        featureTypes: [],
        capabilitiesStatus: value.url ? 'idle' : 'empty',
        attributesStatus: value.typeName ? 'idle' : 'empty',
        validation: IDLE_VALIDATION
    });
    const [capabilitiesRequest, setCapabilitiesRequest] = useState({
        url: value.url,
        delay: value.url ? 0 : URL_VALIDATION_DELAY,
        key: 0
    });
    const describeRequestId = useRef(0);
    const validationRequestId = useRef(0);
    const valueRef = useRef(value);
    // Async callbacks read the latest committed value instead of stale closures.
    useEffect(() => {
        valueRef.current = value;
    });

    const updateState = (changes) => {
        setState((previousState) => ({ ...previousState, ...changes }));
    };

    const updateValue = (changes) => {
        validationRequestId.current += 1;
        updateState({ validation: IDLE_VALIDATION });
        onChange({
            type: 'wfs',
            ...valueRef.current,
            ...changes
        });
    };

    const requestCapabilities = (url, delay = URL_VALIDATION_DELAY) => {
        setCapabilitiesRequest((previousRequest) => ({
            url,
            delay,
            key: previousRequest.key + 1
        }));
    };

    useEffect(() => {
        const { url, delay } = capabilitiesRequest;
        if (!url?.trim()) {
            updateState({ featureTypes: [], capabilitiesStatus: 'empty' });
            return () => {};
        }
        let cancelled = false;
        const timer = setTimeout(() => {
            updateState({ capabilitiesStatus: 'loading', featureTypes: [] });
            getCapabilities(url)
                .then((capabilities) => {
                    if (!cancelled) {
                        const featureTypes = getWFSFeatureTypes(capabilities);
                        updateState({
                            featureTypes,
                            capabilitiesStatus: featureTypes.length ? 'valid' : 'error'
                        });
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        updateState({ featureTypes: [], capabilitiesStatus: 'error' });
                    }
                });
        }, delay);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [capabilitiesRequest]);

    useEffect(() => {
        return () => {
            describeRequestId.current += 1;
            validationRequestId.current += 1;
        };
    }, []);

    const onUrlChange = (event) => {
        const url = event.target.value;
        describeRequestId.current += 1;
        updateValue({ url, typeName: '', attributes: [] });
        updateState({
            attributesStatus: 'empty',
            featureTypes: [],
            capabilitiesStatus: url?.trim() ? 'loading' : 'empty'
        });
        requestCapabilities(url);
    };

    const loadAttributes = (typeName, previousAttributes) => {
        const currentRequestId = describeRequestId.current + 1;
        describeRequestId.current = currentRequestId;
        updateState({ attributesStatus: 'loading' });
        describeFeatureType({ layer: { url: valueRef.current.url, name: typeName } })
            .toPromise()
            .then(({ data }) => {
                if (currentRequestId === describeRequestId.current) {
                    updateValue({
                        typeName,
                        attributes: getExternalAttributes(data, previousAttributes)
                    });
                    updateState({ attributesStatus: 'valid' });
                }
            })
            .catch(() => {
                if (currentRequestId === describeRequestId.current) {
                    updateState({ attributesStatus: 'error' });
                }
            });
    };

    const onLayerChange = (selected) => {
        const typeName = selected?.value || '';
        const previousAttributes = valueRef.current.typeName === typeName
            ? valueRef.current.attributes || []
            : [];
        updateValue({ typeName, attributes: [] });
        if (!typeName) {
            updateState({ attributesStatus: 'empty' });
            return;
        }
        loadAttributes(typeName, previousAttributes);
    };

    const updateAttribute = (name, changes) => {
        updateValue({
            attributes: (valueRef.current.attributes || []).map((attribute) =>
                attribute.name === name ? { ...attribute, ...changes } : attribute)
        });
    };

    const updateAllAttributes = (property, nextValue) => {
        updateValue({
            attributes: (valueRef.current.attributes || []).map((attribute) =>
                ({ ...attribute, [property]: nextValue }))
        });
    };

    const getSourceRequest = () => {
        const currentSourceLayer = sourceLayer || {};
        const sourceUrl = currentSourceLayer.search?.url
            || currentSourceLayer.describeFeatureTypeURL
            || currentSourceLayer.url;
        const url = Array.isArray(sourceUrl) ? sourceUrl[0] : sourceUrl;
        const layerName = currentSourceLayer.search?.name || currentSourceLayer.name;
        return { url, layerName };
    };

    const validate = () => {
        const configuration = valueRef.current;
        const configurationMessage = validateExternalDataConfiguration(configuration);
        if (configurationMessage) {
            updateState({
                validation: { ...IDLE_VALIDATION, status: 'error', messageId: configurationMessage }
            });
            return;
        }
        const sourceRequest = getSourceRequest();
        if (!sourceRequest.url || !sourceRequest.layerName) {
            updateState({
                validation: {
                    ...IDLE_VALIDATION,
                    status: 'error',
                    messageId: 'layerProperties.externalData.validation.sourceUnavailable'
                }
            });
            return;
        }
        const currentValidationRequestId = validationRequestId.current + 1;
        validationRequestId.current = currentValidationRequestId;
        updateState({ validation: { ...IDLE_VALIDATION, status: 'loading' } });
        // First get a source feature, then use it to test the external WFS query.
        getFeature(sourceRequest.url, sourceRequest.layerName, {
            maxFeatures: 1,
            outputFormat: 'application/json'
        }, {
            _msAuthSourceId: sourceLayer?.security?.sourceId
        })
            .then(({ data }) => {
                const sourceResponse = parseResponse(data);
                const sampleFeature = sourceResponse?.features?.[0];
                if (!sampleFeature) {
                    const error = new Error('No sample feature was returned by the source layer');
                    error.messageId = 'layerProperties.externalData.validation.sampleNotFound';
                    throw error;
                }
                const cqlFilter = interpolateExternalDataCQL(
                    configuration.cqlFilter,
                    sampleFeature
                );
                return getFeature(configuration.url, configuration.typeName, {
                    CQL_FILTER: cqlFilter,
                    maxFeatures: 1,
                    outputFormat: 'application/json'
                }).then(({ data: externalResponse }) => ({
                    cqlFilter,
                    response: parseResponse(externalResponse)
                }));
            })
            .then(({ cqlFilter, response }) => {
                if (!Array.isArray(response?.features)) {
                    const error = new Error('The external WFS did not return a GeoJSON FeatureCollection');
                    error.cqlFilter = cqlFilter;
                    throw error;
                }
                if (currentValidationRequestId === validationRequestId.current) {
                    updateState({
                        validation: { ...IDLE_VALIDATION, status: 'success', cqlFilter }
                    });
                }
            })
            .catch((error) => {
                if (currentValidationRequestId === validationRequestId.current) {
                    updateState({
                        validation: {
                            ...IDLE_VALIDATION,
                            status: 'error',
                            messageId: INTERPOLATION_MESSAGE_IDS[error.code]
                                || error.messageId
                                || 'layerProperties.externalData.validation.testRequestFailed',
                            messageParams: error.propertyName ? { property: error.propertyName } : null,
                            cqlFilter: error.cqlFilter || null
                        }
                    });
                }
            });
    };

    const { url = '', typeName = '', cqlFilter = '', attributes = [] } = value;
    const { capabilitiesStatus, attributesStatus, validation } = state;
    return (
        <div className="ms-external-data-editor">
            <FormGroup validationState={capabilitiesStatus === 'error' ? 'error' : null}>
                <ControlLabel><Message msgId="layerProperties.externalData.wfsUrl" /> *</ControlLabel>
                <div className="ms-external-data-url-row">
                    <LocalizedFormControl
                        data-qa="external-data-url"
                        type="text"
                        value={url}
                        placeholder="layerProperties.externalData.wfsUrl"
                        onChange={onUrlChange}
                        onBlur={() => requestCapabilities(url, 0)}/>
                    <Button
                        disabled={!url?.trim() || capabilitiesStatus === 'loading'}
                        onClick={() => requestCapabilities(url, 0)}>
                        {capabilitiesStatus === 'loading'
                            ? <Spinner />
                            : <Glyphicon glyph="refresh"/>}
                    </Button>
                </div>
                {capabilitiesStatus === 'error' ? (
                    <span className="help-block"><Message msgId="layerProperties.externalData.invalidWfsUrl" /></span>
                ) : null}
            </FormGroup>

            <FormGroup validationState={attributesStatus === 'error' ? 'error' : null}>
                <ControlLabel><Message msgId="layerProperties.externalData.layerName" /> *</ControlLabel>
                <Select
                    className="ms-external-data-layer-select"
                    clearable
                    disabled={capabilitiesStatus !== 'valid'}
                    isLoading={attributesStatus === 'loading'}
                    value={typeName}
                    options={state.featureTypes.map((featureType) => ({
                        value: featureType.name,
                        label: featureType.title === featureType.name
                            ? featureType.name
                            : `${featureType.title} (${featureType.name})`
                    }))}
                    onChange={onLayerChange}/>
            </FormGroup>

            <FormGroup>
                <ControlLabel><Message msgId="layerProperties.externalData.cqlFilter" /> *</ControlLabel>
                <FormControl
                    data-qa="external-data-cql"
                    componentClass="textarea"
                    rows={2}
                    value={cqlFilter}
                    placeholder="target_id = '${properties['source_id']}'"
                    onChange={(event) => updateValue({ cqlFilter: event.target.value })}/>
                <span className="help-block">
                    <Message msgId="layerProperties.externalData.cqlFilterHelp" />
                </span>
            </FormGroup>

            <div className="ms-external-data-validation">
                <Button
                    bsStyle="primary"
                    disabled={validation.status === 'loading'}
                    onClick={validate}>
                    {validation.status === 'loading'
                        ? <Spinner />
                        : <Glyphicon glyph="ok" />}&nbsp;
                    <Message msgId="layerProperties.externalData.validate" />
                </Button>
                {validation.messageId ? (
                    <Alert bsStyle="danger">
                        <Message msgId={validation.messageId} msgParams={validation.messageParams} />
                    </Alert>
                ) : null}
                {validation.status === 'success' ? (
                    <Alert bsStyle="success">
                        <Message msgId="layerProperties.externalData.validation.valid" />
                    </Alert>
                ) : null}
                {validation.cqlFilter ? (
                    <div className="ms-external-data-generated-cql">
                        <ControlLabel>
                            <Message msgId="layerProperties.externalData.validation.generatedCql" />
                        </ControlLabel>
                        <pre>{validation.cqlFilter}</pre>
                    </div>
                ) : null}
            </div>

            {typeName ? (
                <div className="ms-external-data-attributes">
                    <Fields
                        title={<Message msgId="layerProperties.externalData.attributes" />}
                        fields={attributes}
                        currentLocale={currentLocale}
                        loading={attributesStatus === 'loading'}
                        error={attributesStatus === 'error'}
                        showVisibility
                        showFieldSettings
                        onChange={(name, property, nextValue) => updateAttribute(name, {
                            [property]: nextValue
                        })}
                        onChangeAll={updateAllAttributes}
                        onLoadFields={() => loadAttributes(typeName, attributes)}
                        onClear={() => loadAttributes(typeName, [])}/>
                </div>
            ) : null}
        </div>
    );
};

ExternalDataEditor.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    sourceLayer: PropTypes.object,
    currentLocale: PropTypes.string
};

export default ExternalDataEditor;
