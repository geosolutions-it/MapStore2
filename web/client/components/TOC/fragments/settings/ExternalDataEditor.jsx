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
import LoadingSpinner from '../../../misc/LoadingSpinner';
import Fields from '../LayerFields/Fields';
import RowViewer from '../../../data/identify/viewers/row/RowViewer';
import { getVisibleFeatureRow } from '../../../../utils/IdentifyUtils';
import { getCapabilities, describeFeatureType, getFeature, getFeatureURL } from '../../../../api/WFS';
import { isGeometryType } from '../../../../utils/ogc/WFS/base';
import {
    interpolateExternalDataCQL,
    validateExternalDataConfiguration
} from '../../../../utils/mapinfo/ExternalDataUtils';

const URL_VALIDATION_DELAY = 500;
const SAMPLE_RESPONSE_LIMIT = 10;

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

const getErrorDetails = (error) => {
    const responseData = error?.response?.data || error?.data;
    if (responseData) {
        return typeof responseData === 'string'
            ? responseData
            : JSON.stringify(responseData, null, 2);
    }
    return error?.message || `${error}`;
};

/**
 * Uses the runtime external-feature presentation for the sample response.
 */
export const ExternalDataSampleResponse = ({ response = {}, attributes = [] }) => {
    const features = Array.isArray(response?.features) ? response.features : [];
    if (!features.length) {
        return (
            <Alert bsStyle="info">
                <Message msgId="layerProperties.externalData.noResults" />
            </Alert>
        );
    }
    return (
        <div className="ms-external-data-viewer ms-external-data-sample-response">
            {features.map((feature, index) => {
                const row = getVisibleFeatureRow(feature, attributes);
                return (
                    <RowViewer
                        key={feature.id ?? index}
                        feature={row.feature}
                        layer={{ fields: row.fields }}/>
                );
            })}
        </div>
    );
};

ExternalDataSampleResponse.propTypes = {
    response: PropTypes.object,
    attributes: PropTypes.array
};

/**
 * Configures and validates the WFS query used by an External Data view.
 */
const ExternalDataEditor = ({ value = {}, onChange = () => {}, sourceLayer, currentLocale }) => {
    const [state, setState] = useState({
        featureTypes: [],
        capabilitiesStatus: value.url ? 'idle' : 'empty',
        attributesStatus: value.layerName ? 'idle' : 'empty',
        validationMessage: null,
        validationSuccess: false,
        validationStatus: 'idle',
        validationDetails: null,
        validationErrorDetails: null
    });
    const [capabilitiesRequest, setCapabilitiesRequest] = useState({
        url: value.url,
        delay: value.url ? 0 : URL_VALIDATION_DELAY,
        key: 0
    });
    const describeRequestId = useRef(0);
    const validationRequestId = useRef(0);
    const valueRef = useRef(value);
    // Async callbacks read the latest controlled value instead of stale closures.
    valueRef.current = value;

    const updateState = (changes) => {
        setState((previousState) => ({ ...previousState, ...changes }));
    };

    const updateValue = (changes) => {
        validationRequestId.current += 1;
        updateState({
            validationMessage: null,
            validationSuccess: false,
            validationStatus: 'idle',
            validationDetails: null,
            validationErrorDetails: null
        });
        onChange({
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
        updateValue({ url, layerName: '', attributes: [] });
        updateState({
            attributesStatus: 'empty',
            featureTypes: [],
            capabilitiesStatus: url?.trim() ? 'loading' : 'empty'
        });
        requestCapabilities(url);
    };

    const onLayerChange = (selected) => {
        const layerName = selected?.value || '';
        updateValue({ layerName, attributes: [] });
        if (!layerName) {
            updateState({ attributesStatus: 'empty' });
            return;
        }
        const currentRequestId = describeRequestId.current + 1;
        describeRequestId.current = currentRequestId;
        updateState({ attributesStatus: 'loading' });
        describeFeatureType(valueRef.current.url, layerName)
            .then((description) => {
                if (currentRequestId === describeRequestId.current) {
                    const attributes = getExternalAttributes(
                        description,
                        valueRef.current.layerName === layerName ? valueRef.current.attributes : []
                    );
                    updateValue({
                        layerName,
                        attributes
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

    const updateAttribute = (name, changes) => {
        updateValue({
            attributes: (valueRef.current.attributes || []).map((attribute) =>
                attribute.name === name ? { ...attribute, ...changes } : attribute)
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
        const validationMessage = validateExternalDataConfiguration(configuration);
        if (validationMessage) {
            updateState({
                validationMessage,
                validationSuccess: false,
                validationStatus: 'idle',
                validationDetails: null,
                validationErrorDetails: null
            });
            return;
        }
        const sourceRequest = getSourceRequest();
        if (!sourceRequest.url || !sourceRequest.layerName) {
            updateState({
                validationMessage: 'layerProperties.externalData.validation.sourceUnavailable',
                validationSuccess: false,
                validationStatus: 'error',
                validationDetails: null,
                validationErrorDetails: null
            });
            return;
        }
        const currentValidationRequestId = validationRequestId.current + 1;
        validationRequestId.current = currentValidationRequestId;
        updateState({
            validationMessage: null,
            validationSuccess: false,
            validationStatus: 'loading',
            validationDetails: null,
            validationErrorDetails: null
        });
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
                const params = {
                    CQL_FILTER: cqlFilter,
                    maxFeatures: SAMPLE_RESPONSE_LIMIT,
                    outputFormat: 'application/json'
                };
                const requestUrl = getFeatureURL(
                    configuration.url,
                    configuration.layerName,
                    params
                );
                return getFeature(
                    configuration.url,
                    configuration.layerName,
                    params
                ).then(({ data: externalData }) => ({
                    cqlFilter,
                    requestUrl,
                    response: parseResponse(externalData),
                    sampleFeature
                }));
            })
            .then((details) => {
                if (!Array.isArray(details.response?.features)) {
                    const error = new Error('The external WFS did not return a GeoJSON FeatureCollection');
                    error.data = details.response;
                    throw error;
                }
                if (currentValidationRequestId === validationRequestId.current) {
                    updateState({
                        validationMessage: null,
                        validationSuccess: true,
                        validationStatus: 'success',
                        validationDetails: details,
                        validationErrorDetails: null
                    });
                }
            })
            .catch((error) => {
                if (currentValidationRequestId === validationRequestId.current) {
                    updateState({
                        validationMessage: error.messageId
                            || 'layerProperties.externalData.validation.testRequestFailed',
                        validationSuccess: false,
                        validationStatus: 'error',
                        validationDetails: null,
                        validationErrorDetails: getErrorDetails(error)
                    });
                }
            });
    };

    const { url = '', layerName = '', cqlFilter = '', attributes = [] } = value;
    const { capabilitiesStatus, attributesStatus } = state;
    return (
        <div className="ms-external-data-editor">
            <FormGroup validationState={capabilitiesStatus === 'error' ? 'error' : null}>
                <ControlLabel><Message msgId="layerProperties.externalData.wfsUrl" /> *</ControlLabel>
                <div className="ms-external-data-url-row">
                    <FormControl
                        data-qa="external-data-url"
                        type="text"
                        value={url}
                        placeholder="WFS URL"
                        onChange={onUrlChange}
                        onBlur={() => requestCapabilities(url, 0)}/>
                    <Button
                        disabled={!url?.trim() || capabilitiesStatus === 'loading'}
                        onClick={() => requestCapabilities(url, 0)}>
                        {capabilitiesStatus === 'loading'
                            ? <LoadingSpinner />
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
                    value={layerName}
                    options={state.featureTypes.map(({ name, title }) => ({
                        value: name,
                        label: title === name ? name : `${title} (${name})`
                    }))}
                    onChange={onLayerChange}/>
                {attributesStatus === 'error' ? (
                    <span className="help-block"><Message msgId="layerProperties.externalData.attributesError" /></span>
                ) : null}
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

            {attributesStatus === 'loading' ? (
                <div className="ms-external-data-loading"><LoadingSpinner /> <Message msgId="loading" /></div>
            ) : null}
            {attributes.length ? (
                <div className="ms-external-data-attributes">
                    <ControlLabel><Message msgId="layerProperties.externalData.attributes" /></ControlLabel>
                    <Fields
                        fields={attributes}
                        currentLocale={currentLocale}
                        showToolbar={false}
                        showVisibility
                        onChange={(name, property, nextValue) => updateAttribute(name, {
                            [property]: nextValue
                        })}/>
                </div>
            ) : null}

            <div className="ms-external-data-validation">
                <Button
                    bsStyle="primary"
                    disabled={state.validationStatus === 'loading'}
                    onClick={validate}>
                    {state.validationStatus === 'loading'
                        ? <LoadingSpinner />
                        : <Glyphicon glyph="ok" />}&nbsp;
                    <Message msgId="layerProperties.externalData.validate" />
                </Button>
                {state.validationMessage ? (
                    <Alert bsStyle="danger"><Message msgId={state.validationMessage} /></Alert>
                ) : null}
                {state.validationSuccess ? (
                    <Alert bsStyle="success"><Message msgId="layerProperties.externalData.validation.valid" /></Alert>
                ) : null}
                {state.validationErrorDetails ? (
                    <pre className="ms-external-data-validation-details">
                        {state.validationErrorDetails}
                    </pre>
                ) : null}
                {state.validationDetails ? (
                    <div className="ms-external-data-validation-result">
                        <ControlLabel>
                            <Message msgId="layerProperties.externalData.validation.generatedCql" />
                        </ControlLabel>
                        <pre>{state.validationDetails.cqlFilter}</pre>
                        <ControlLabel>
                            <Message msgId="layerProperties.externalData.validation.requestUrl" />
                        </ControlLabel>
                        <pre>{state.validationDetails.requestUrl}</pre>
                        <ControlLabel>
                            <Message msgId="layerProperties.externalData.validation.response" />
                        </ControlLabel>
                        <ExternalDataSampleResponse
                            response={state.validationDetails.response}
                            attributes={attributes}/>
                    </div>
                ) : null}
            </div>
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
