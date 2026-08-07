/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Glyphicon } from 'react-bootstrap';

import Message from '../../../I18N/Message';
import LoadingSpinner from '../../../misc/LoadingSpinner';
import { getFeature } from '../../../../api/WFS';
import { interpolateExternalDataCQL, validateExternalDataConfiguration } from '../../../../utils/mapinfo/ExternalDataUtils';
import RowViewer from './row/RowViewer';
import { getVisibleFeatureRow } from '../../../../utils/IdentifyUtils';
import {
    createExternalDataCacheKey,
    deleteExternalDataCacheEntry,
    getExternalDataCacheEntry,
    setExternalDataCacheEntry
} from '../../../../utils/mapinfo/ExternalDataCache';

const EXTERNAL_RESPONSE_LIMIT = 10;

const parseResponse = (response) => {
    if (typeof response === 'string') {
        try {
            return JSON.parse(response);
        } catch (e) {
            return response;
        }
    }
    return response || {};
};

/**
 * Ensures the external service returned a GeoJSON FeatureCollection.
 */
const normalizeExternalResponse = (data) => {
    const response = parseResponse(data);
    if (!Array.isArray(response?.features)) {
        const error = new Error('The external WFS did not return a GeoJSON FeatureCollection');
        error.code = 'INVALID_EXTERNAL_RESPONSE';
        error.data = response;
        throw error;
    }
    return response;
};

// the response of an external service must not be rendered to map viewers
const getErrorPresentation = (error) => {
    console.error('External data view could not be loaded', error);
    if (error?.code === 'MISSING_SOURCE_PROPERTY') {
        return {
            messageId: 'layerProperties.externalData.missingProperty',
            messageParams: { property: error.propertyName }
        };
    }
    if (error?.code === 'UNSAFE_SOURCE_VALUE') {
        return {
            messageId: 'layerProperties.externalData.unsafeSourceValue',
            messageParams: { property: error.propertyName }
        };
    }
    if (error?.code === 'INVALID_INTERPOLATED_CQL') {
        return {
            messageId: 'layerProperties.externalData.invalidInterpolatedCql'
        };
    }
    if (error?.code === 'INVALID_EXTERNAL_RESPONSE') {
        return {
            messageId: 'layerProperties.externalData.invalidResponse'
        };
    }
    return {
        messageId: 'layerProperties.externalData.requestError'
    };
};

/**
 * Queries and renders related WFS features for every identified source feature.
 */
const ExternalDataViewer = ({ response, layer }) => {
    const [results, setResults] = useState([]);
    const mounted = useRef(false);
    const loadGeneration = useRef(0);
    const propsRef = useRef({ response, layer });
    const loadRef = useRef();
    propsRef.current = { response, layer };

    const getSourceFeatures = () =>
        parseResponse(propsRef.current.response)?.features || [];

    const getConfiguration = () =>
        propsRef.current.layer?.featureInfo?.featuresService || {};

    const getCacheKey = (sourceFeature, index, cqlFilter) => {
        const featureInfo = propsRef.current.layer?.featureInfo || {};
        const configuration = getConfiguration();
        return createExternalDataCacheKey({
            identifyRequestId: featureInfo.identifyRequestId,
            sourceFeatureId: sourceFeature?.id,
            sourceFeatureIndex: index,
            url: configuration.url,
            typeName: configuration.typeName,
            cqlFilter
        });
    };

    const updateResult = (index, result, generation = loadGeneration.current) => {
        // Ignore responses from an unmounted viewer or an older load cycle.
        if (!mounted.current || generation !== loadGeneration.current) {
            return;
        }
        setResults((currentResults) =>
            currentResults.map((currentResult, resultIndex) =>
                resultIndex === index ? result : currentResult)
        );
    };

    const loadSourceFeature = (
        sourceFeature,
        index,
        { force = false, generation = loadGeneration.current } = {}
    ) => {
        const configuration = getConfiguration();
        const identifyRequestId = propsRef.current.layer?.featureInfo?.identifyRequestId;
        updateResult(index, { status: 'loading' }, generation);
        let cqlFilter;
        try {
            cqlFilter = interpolateExternalDataCQL(configuration.cqlFilter, sourceFeature);
        } catch (error) {
            updateResult(index, {
                status: 'error',
                ...getErrorPresentation(error)
            }, generation);
            return;
        }
        const cacheKey = getCacheKey(sourceFeature, index, cqlFilter);
        if (force) {
            deleteExternalDataCacheEntry(cacheKey);
        }
        const cachedRequest = getExternalDataCacheEntry(cacheKey);
        // Reuse both completed and still-running requests when the view rerenders.
        const request = cachedRequest || setExternalDataCacheEntry(cacheKey,
            getFeature(configuration.url, configuration.typeName, {
                CQL_FILTER: cqlFilter,
                maxFeatures: EXTERNAL_RESPONSE_LIMIT,
                outputFormat: 'application/json'
            }).then(({ data }) => normalizeExternalResponse(data)),
            identifyRequestId
        );
        request
            .then((data) => updateResult(index, {
                status: 'success',
                features: data.features
            }, generation))
            .catch((error) => {
                deleteExternalDataCacheEntry(cacheKey);
                updateResult(index, {
                    status: 'error',
                    ...getErrorPresentation(error)
                }, generation);
            });
    };

    const load = (generation) => {
        const sourceFeatures = getSourceFeatures();
        setResults(sourceFeatures.map(() => ({ status: 'loading' })));
        sourceFeatures.forEach((sourceFeature, index) =>
            loadSourceFeature(sourceFeature, index, { generation }));
    };
    loadRef.current = load;

    const featureInfo = layer?.featureInfo || {};
    const configuration = featureInfo.featuresService || {};
    const configurationError = validateExternalDataConfiguration(configuration);
    useEffect(() => {
        if (configurationError) {
            console.error(`External data view is not configured: ${configurationError}`);
            return () => {};
        }
        mounted.current = true;
        loadGeneration.current += 1;
        loadRef.current(loadGeneration.current);
        return () => {
            mounted.current = false;
            loadGeneration.current += 1;
        };
    }, [
        response,
        configurationError,
        featureInfo.identifyRequestId,
        featureInfo.id,
        configuration.url,
        configuration.typeName,
        configuration.cqlFilter
    ]);

    const retry = (index) => {
        const sourceFeature = getSourceFeatures()[index];
        if (sourceFeature) {
            loadSourceFeature(sourceFeature, index, {
                force: true,
                generation: loadGeneration.current
            });
        }
    };

    const renderResult = (result, index) => {
        const { attributes = [] } = getConfiguration();
        const sourceFeatureId = getSourceFeatures()[index]?.id;
        return (
            <section className="ms-external-data-result" key={index}>
                {sourceFeatureId !== undefined && sourceFeatureId !== null
                    ? <h4>{sourceFeatureId}</h4>
                    : null}
                {result.status === 'loading' ? (
                    <div className="ms-external-data-runtime-loading">
                        <LoadingSpinner /> <Message msgId="loading" />
                    </div>
                ) : null}
                {result.status === 'error' ? (
                    <Alert bsStyle="danger">
                        <div className="ms-external-data-runtime-error-header">
                            <Message msgId={result.messageId} msgParams={result.messageParams} />
                            <Button
                                bsSize="small"
                                onClick={() => retry(index)}>
                                <Glyphicon glyph="refresh" />&nbsp;
                                <Message msgId="layerProperties.externalData.retry" />
                            </Button>
                        </div>
                    </Alert>
                ) : null}
                {result.status === 'success' && !result.features.length ? (
                    <Alert bsStyle="info">
                        <Message msgId="layerProperties.externalData.noResults" />
                    </Alert>
                ) : null}
                {result.status === 'success'
                    ? result.features.map((feature, featureIndex) => {
                        const row = getVisibleFeatureRow(feature, attributes);
                        return (
                            <RowViewer
                                key={feature.id ?? featureIndex}
                                feature={row.feature}
                                layer={{ fields: row.fields }}/>
                        );
                    })
                    : null}
            </section>
        );
    };

    if (configurationError) {
        return (
            <Alert bsStyle="warning">
                <Message msgId="layerProperties.externalData.notConfigured" />
            </Alert>
        );
    }
    const sourceFeatures = getSourceFeatures();
    if (!sourceFeatures.length) {
        return (
            <Alert bsStyle="info">
                <Message msgId="layerProperties.externalData.noSourceFeatures" />
            </Alert>
        );
    }
    return (
        <div className="ms-external-data-viewer">
            {results.map(renderResult)}
        </div>
    );
};

ExternalDataViewer.propTypes = {
    response: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    layer: PropTypes.object
};

export default ExternalDataViewer;
