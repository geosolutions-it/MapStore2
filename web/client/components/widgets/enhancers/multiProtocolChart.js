/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import { castArray, isObject, isNil, sortBy, debounce } from 'lodash';
import wpsAggregate from '../../../observables/wps/aggregate';
import { getLayerJSONFeature } from '../../../observables/wfs';
import { getWpsUrl, getSearchUrl } from '../../../utils/LayersUtils';
import axios from '../../../libs/ajax';
const CancelToken = axios.CancelToken;

export const wfsToChartData = ({ features } = {}, { groupByAttributes }) => {
    return sortBy(features.map(({properties}) => properties), groupByAttributes); // TODO: sort
};

export const wpsAggregateToChartData = ({AggregationResults = [], GroupByAttributes = [], AggregationAttribute, AggregationFunctions} = {}) =>
    AggregationResults.map((res) => ({
        ...GroupByAttributes.reduce((a, p, i) => {
            let value = res[i];
            if (isObject(value)) {
                if (!isNil(value.time)) {
                    value = (new Date(value.time)).toISOString();
                } else {
                    throw new Error('Unknown response format from server');
                }
            }
            return {
                ...a,
                [p]: value
            };
        }, {}),
        [`${AggregationFunctions[0]}(${AggregationAttribute})`]: res[res.length - 1]
    })).sort( (e1, e2) => {
        const n1 = parseFloat(e1[GroupByAttributes]);
        const n2 = parseFloat(e2[GroupByAttributes]);
        if (!isNaN(n1) && !isNaN(n2) ) {
            return n1 - n2;
        }
        if (e1 < e2) {
            return -1;
        }
        if (e1 > e2) {
            return 1;
        }
        return 0;
    });

const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.aggregateFunction === o2.aggregateFunction
    && o1.aggregationAttribute === o2.aggregationAttribute
    && o1.groupByAttributes === o2.groupByAttributes
    && o1.classificationAttribute === o2.classificationAttribute
    && o1.viewParams === o2.viewParams;

const dataServiceRequests = {
    wfs: ({ layer, options, filter }, { cancelToken }) => getLayerJSONFeature(
        layer,
        filter,
        {
            propertyName: options.classificationAttribute
                ? [
                    ...castArray(options.aggregationAttribute),
                    ...castArray(options.groupByAttributes),
                    ...castArray(options.classificationAttribute)
                ]
                : [
                    ...castArray(options.aggregationAttribute),
                    ...castArray(options.groupByAttributes)
                ],
            requestOptions: {
                cancelToken
            }
        }
    )
        .toPromise()
        .then((response) => wfsToChartData(response, options)),
    wps: ({ layer, options, filter }, { cancelToken }) => wpsAggregate(
        getWpsUrl(layer),
        {featureType: layer.name, ...options, filter}, {
            timeout: 15000,
            cancelToken
        })
        .toPromise()
        .then((data) => wpsAggregateToChartData(data))
};

const getDataServiceType = ({ layer, options }) => {
    if (!options) {
        return '';
    }
    if (!options.aggregateFunction || options.aggregateFunction === "None") {
        return layer.name && getSearchUrl(layer)
            // maybe another attribute
            && options?.aggregationAttribute
            // TODO: not needed
            && options?.groupByAttributes ? 'wfs' : '';
    }
    if (layer.name && getWpsUrl(layer) && options && options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes || options.classificationAttribute) {
        return 'wps';
    }
    return '';
};

const arePropsEqual = (prevProps, nextProps) =>
    (nextProps.layer && prevProps.layer.name === nextProps.layer.name && prevProps.layer.loadingError === nextProps.layer.loadingError)
    && sameOptions(prevProps.options, nextProps.options)
    && sameFilter(prevProps.filter, nextProps.filter);

const multiProtocolChart = (Component) => {
    function MultiProtocolChart({ traces = [], ...props }) {
        const [state, setState] = useState({ loading: true });
        const prevTraces = useRef([]);
        const cancelTokens = useRef([]);
        const isMounted = useRef(true);
        const updateRequest = useRef();

        function handleLoad(newState) {
            setState(newState);
            if (props.onLoad) {
                props.onLoad(newState);
            }
        }

        function handleLoadError(newState) {
            setState(newState);
            if (props.onLoadError) {
                props.onLoadError(newState);
            }
        }
        function clearRequests() {
            cancelTokens.current.forEach((cancel) => {
                cancel();
            });
            cancelTokens.current = [];
            updateRequest.current.cancel();
        }

        useEffect(() => {
            isMounted.current = true;
            updateRequest.current = debounce((dataRequests) => {
                axios.all(
                    dataRequests.map(({ dataServiceRequest, trace }) =>
                        dataServiceRequest(trace, {
                            cancelToken: new CancelToken((cancel) => {
                                cancelTokens.current.push(cancel);
                            })
                        })
                    )
                )
                    .then((data) => {
                        if (isMounted.current) {
                            handleLoad({
                                data,
                                loading: false,
                                isAnimationActive: false,
                                error: undefined
                            });
                        }
                    })
                    .catch((error) => {
                        if (isMounted.current && !error.__CANCEL__) {
                            handleLoadError({
                                loading: false,
                                error,
                                data: []
                            });
                        }
                    })
                    .finally(() => {
                        cancelTokens.current = [];
                    });
            }, props.debounceTime || 300);
            return () => {
                isMounted.current = false;
                clearRequests();
            };
        }, []);
        useEffect(() => {
            if (traces.length !== prevTraces.current.length || traces.some((trace, idx) => {
                const prevTrace = prevTraces.current[idx];
                return !prevTrace || !arePropsEqual(prevTrace, trace);
            })) {
                const dataRequests = traces.map((trace) => {
                    const serviceType = getDataServiceType(trace);
                    // return an empty data array if the single trace is not correctly configured
                    const notSupportedService = () => Promise.resolve([]);
                    const dataServiceRequest = dataServiceRequests[serviceType] || notSupportedService;
                    return { trace, dataServiceRequest };
                });
                clearRequests();
                setState({ loading: true, error: undefined });
                updateRequest.current(dataRequests);
            }
            prevTraces.current = [...traces];
        });
        return (<Component
            {...props}
            {...state}
            traces={traces}
        />);
    }
    // it's not possible to use hook without adding the memo
    // probably the chain of recompose enhancers
    // provide a react component not compatible with hooks
    // we can remove this memo once we remove the chain of recompose enhancers
    return memo(MultiProtocolChart);
};

export default multiProtocolChart;

