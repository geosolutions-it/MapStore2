/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Glyphicon } from 'react-bootstrap';

import Message from '../../../I18N/Message';
import LoadingSpinner from '../../../misc/LoadingSpinner';
import { getFeature } from '../../../../api/WFS';
import { interpolateExternalDataCQL, validateExternalDataConfiguration } from '../../../../utils/mapinfo/ExternalDataUtils';
import useIsMounted from '../../../../hooks/useIsMounted';
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
    const isMounted = useIsMounted();
    const loadGeneration = useRef(0);

    const { identifyRequestId, featuresService = {} } = layer?.featureInfo || {};
    const { url, typeName, cqlFilter, attributes = [] } = featuresService;
    const configurationError = validateExternalDataConfiguration(featuresService);

    const sourceFeatures = useMemo(
        () => parseResponse(response)?.features || [],
        [response]
    );

    const updateResult = useCallback((index, result, generation) => {
        if (generation !== loadGeneration.current) {
            return;
        }
        isMounted(() => setResults((currentResults) =>
            currentResults.map((currentResult, resultIndex) =>
                resultIndex === index ? result : currentResult)
        ));
    }, []);

    const loadSourceFeature = useCallback((
        sourceFeature,
        index,
        { force = false, generation = loadGeneration.current } = {}
    ) => {
        updateResult(index, { status: 'loading' }, generation);
        let interpolatedCql;
        try {
            interpolatedCql = interpolateExternalDataCQL(cqlFilter, sourceFeature);
        } catch (error) {
            updateResult(index, {
                status: 'error',
                ...getErrorPresentation(error)
            }, generation);
            return;
        }
        const cacheKey = createExternalDataCacheKey({
            identifyRequestId,
            sourceFeatureId: sourceFeature?.id,
            sourceFeatureIndex: index,
            url,
            typeName,
            cqlFilter: interpolatedCql
        });
        if (force) {
            deleteExternalDataCacheEntry(cacheKey);
        }
        const cachedRequest = getExternalDataCacheEntry(cacheKey);
        // Reuse both completed and still-running requests when the view rerenders.
        const request = cachedRequest || setExternalDataCacheEntry(cacheKey,
            getFeature(url, typeName, {
                CQL_FILTER: interpolatedCql,
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
    }, [url, typeName, cqlFilter, identifyRequestId, updateResult]);

    const load = useCallback((generation) => {
        setResults(sourceFeatures.map(() => ({ status: 'loading' })));
        sourceFeatures.forEach((sourceFeature, index) =>
            loadSourceFeature(sourceFeature, index, { generation }));
    }, [sourceFeatures, loadSourceFeature]);

    useEffect(() => {
        if (configurationError) {
            console.error(`External data view is not configured: ${configurationError}`);
            return () => {};
        }
        loadGeneration.current += 1;
        load(loadGeneration.current);
        return () => {
            loadGeneration.current += 1;
        };
    }, [load, configurationError]);

    const retry = useCallback((index) => {
        const sourceFeature = sourceFeatures[index];
        if (sourceFeature) {
            loadSourceFeature(sourceFeature, index, {
                force: true,
                generation: loadGeneration.current
            });
        }
    }, [sourceFeatures, loadSourceFeature]);

    const renderResult = (result, index) => {
        const sourceFeatureId = sourceFeatures[index]?.id;
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
