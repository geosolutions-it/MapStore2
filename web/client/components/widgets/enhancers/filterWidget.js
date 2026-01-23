/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withState, withHandlers, withProps, lifecycle } from 'recompose';
import debounce from 'lodash/debounce';
import { getLayerJSONFeature } from '../../../observables/wfs';
import axios from '../../../libs/ajax';
import { getWpsUrl } from '../../../utils/LayersUtils';
import { getWpsPayload } from '../../../utils/ogc/WPS/autocomplete';
import { executeProcess } from '../../../observables/wps/execute';
import { isFilterValid, composeAttributeFilters } from '../../../utils/FilterUtils';

const CancelToken = axios.CancelToken;
const DEBOUNCE_TIME = 100; // 1 second

/**
 * Fetches filter items from WPS service using distinct values operation
 * @param {object} filterData - The filter.data object containing layer, valueAttribute, etc.
 * @param {object} options - Additional options like cancelToken
 * @returns {Promise} Promise that resolves to filter items array
 */
const fetchWPSFilterData = (filterData, options = {}) => {
    const { layer, valueAttribute, maxFeatures = 20, sortByAttribute, sortOrder = 'ASC' } = filterData || {};

    if (!layer || !valueAttribute) {
        return Promise.resolve([]);
    }

    // Get WPS URL from layer
    const wpsUrl = getWpsUrl(layer);
    if (!wpsUrl) {
        // No WPS URL available, return empty array
        return Promise.resolve([]);
    }

    // Build WPS payload for distinct values
    const wpsPayload = getWpsPayload({
        layerName: layer.name,
        attribute: valueAttribute,
        maxFeatures: maxFeatures,
        startIndex: 0,
        value: undefined, // No search filter - we want all distinct values
        layerFilter: layer.filter, // Include layer filter if available
        sortByAttribute: sortByAttribute, // Use sortByAttribute if provided
        sortOrder: sortOrder // Use sortOrder if provided
    });

    // Execute WPS PagedUnique process using executeProcess
    return executeProcess(
        wpsUrl,
        wpsPayload,
        {}, // executeOptions
        {
            timeout: 60000,
            cancelToken: options.cancelToken
        },
        layer
    )
        .toPromise()
        .then((response) => {
            // Response from WPS is the raw JSON data (because we use RawDataOutput)
            // The structure is: { values: string[], size: number }
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            const { values = [] } = data || {};

            // Map distinct values to items format
            // For grouped values, the value itself is used as both id and label
            const items = values
                .map((value) => ({
                    id: String(value !== undefined && value !== null ? value : ''),
                    label: String(value !== undefined && value !== null ? value : '')
                }))
                .filter((item) => item.id !== '');

            return items;
        })
        .catch((error) => {
            if (!error.__CANCEL__) {
                console.error('Error fetching filter data from WPS:', error);
            }
            return [];
        });
};

/**
 * Fetches filter items from WFS service based on filter.data configuration
 * @param {object} filterData - The filter.data object containing layer, valueAttribute, etc.
 * @param {object} options - Additional options like cancelToken
 * @returns {Promise} Promise that resolves to filter items array
 */
const fetchWFSFilterData = (filterData, options = {}) => {
    const { layer, valueAttribute, labelAttribute, maxFeatures = 20, sortByAttribute, sortOrder = 'ASC' } = filterData || {};

    if (!layer || !valueAttribute) {
        return Promise.resolve([]);
    }

    // Build filter object for WFS request
    const filterObj = {
        featureTypeName: layer.name,
        filterType: 'OGC',
        ogcVersion: '1.1.0',
        pagination: {
            startIndex: 0,
            maxFeatures
        }
    };

    // Add sort options if sort attribute is provided
    if (sortByAttribute) {
        filterObj.sortOptions = {
            sortBy: sortByAttribute,
            sortOrder: sortOrder === 'DESC' ? 'DESC' : 'ASC'
        };
    }

    // Merge layer filter (if any) into filterObj
    if (layer?.filter && isFilterValid(layer.filter)) {
        const mergedFilterParts = composeAttributeFilters([layer.filter, filterObj], "AND");
        // Spread merged filter parts back into filterObj to preserve other properties
        Object.assign(filterObj, mergedFilterParts);
    }

    // Property names to fetch
    const propertyNames = [valueAttribute];
    if (labelAttribute && labelAttribute !== valueAttribute) {
        propertyNames.push(labelAttribute);
    }

    // Call WFS service to fetch features
    return getLayerJSONFeature(
        layer,
        filterObj,
        {
            propertyName: propertyNames,
            requestOptions: {
                cancelToken: options.cancelToken
            }
        }
    )
        .toPromise()
        .then((response) => {
            const { features = [] } = response || {};

            // Map all features to items (server handles sorting)
            const items = features
                .map((feature) => {
                    const value = feature.properties?.[valueAttribute];
                    const label = labelAttribute
                        ? feature.properties?.[labelAttribute]
                        : value;

                    return {
                        id: String(value !== undefined && value !== null ? value : ''),
                        label: String(label !== undefined && label !== null ? label : value || '')
                    };
                })
                .filter((item) => item.id !== '');

            return items;
        })
        .catch((error) => {
            console.error('Error fetching filter data from WFS:', error);
            return [];
        });
};

/**
 * Checks if filter data has changed and should trigger a new fetch
 */
const shouldFetch = (prevFilterData, nextFilterData) => {
    const prevData = prevFilterData?.data || {};
    const nextData = nextFilterData?.data || {};

    return (
        prevData.layer !== nextData.layer ||
        prevData.valueAttribute !== nextData.valueAttribute ||
        prevData.labelAttribute !== nextData.labelAttribute ||
        prevData.maxFeatures !== nextData.maxFeatures ||
        prevData.sortByAttribute !== nextData.sortByAttribute ||
        prevData.sortOrder !== nextData.sortOrder ||
        prevData.dataSource !== nextData.dataSource ||
        prevData.valuesFrom !== nextData.valuesFrom ||
        prevFilterData?.items !== nextFilterData?.items
    );
};

/**
 * Enhancer that fetches filter items from WFS based on filter.data
 * and updates the filter config with the fetched items
 */
const filterWidgetEnhancer = compose(
    withState('fetchedItems', 'setFetchedItems', () => []),
    withState('loading', 'setLoading', false),
    withState('cancelTokenSource', 'setCancelTokenSource', null),
    withHandlers({
        performFetch: ({
            filterData,
            setFetchedItems,
            setLoading,
            cancelTokenSource,
            setCancelTokenSource
        }) => () => {
            const data = filterData?.data;
            const valuesFrom = data?.valuesFrom;

            // If valuesFrom is undefined, do not fetch anything
            if (valuesFrom === undefined || valuesFrom === null) {
                // Use static items if available
                if (filterData?.items) {
                    setFetchedItems(filterData.items);
                }
                setLoading(false);
                return;
            }

            // Only fetch if we have the required data
            if (!data || !data.layer || !data.valueAttribute) {
                // If no data source config, use static items from filterData
                if (filterData?.items) {
                    setFetchedItems([]);
                }
                setLoading(false);
                return;
            }

            // Check if dataSource is 'features' (WFS or WPS)
            if (data.dataSource !== 'features') {
                // For other data sources, use static items
                if (filterData?.items) {
                    setFetchedItems(filterData.items);
                }
                setLoading(false);
                return;
            }

            // Cancel previous request if any
            if (cancelTokenSource) {
                cancelTokenSource.cancel();
            }

            setLoading(true);

            // Create cancel token for this request
            const source = CancelToken.source();
            setCancelTokenSource(source);

            // Route to WPS or WFS based on valuesFrom
            let fetchPromise;
            const valuesFromStr = String(valuesFrom).trim();
            if (valuesFromStr === 'grouped') {
                // Use WPS for grouped values (distinct values)
                fetchPromise = fetchWPSFilterData(data, { cancelToken: source.token });
            } else if (valuesFromStr === 'single') {
                // Use WFS for single values (full features)
                fetchPromise = fetchWFSFilterData(data, { cancelToken: source.token });
            } else {
                // Unknown valuesFrom - don't fetch
                fetchPromise = Promise.resolve([]);
            }

            fetchPromise
                .then((fetchedItems) => {
                    setFetchedItems(fetchedItems);
                    setLoading(false);
                    setCancelTokenSource(null);
                })
                .catch((error) => {
                    if (!error.__CANCEL__) {
                        console.error('Error in filterWidget enhancer:', error);
                        setFetchedItems([]);
                        setLoading(false);
                    }
                    setCancelTokenSource(null);
                });
        }
    }),
    lifecycle({
        componentDidMount() {
            // Create debounced function on mount
            this.debouncedFetch = debounce(() => {
                this.props.performFetch();
            }, DEBOUNCE_TIME);
            // Call immediately on mount
            this.props.performFetch();
        },
        componentDidUpdate(prevProps) {
            if (shouldFetch(prevProps.filterData, this.props.filterData)) {
                // Cancel any pending debounced call
                if (this.debouncedFetch) {
                    this.debouncedFetch.cancel();
                }
                // Create new debounced function with latest props
                this.debouncedFetch = debounce(() => {
                    this.props.performFetch();
                }, DEBOUNCE_TIME);
                // Trigger debounced fetch
                this.debouncedFetch();
            }
        },
        componentWillUnmount() {
            const { cancelTokenSource } = this.props;
            if (cancelTokenSource) {
                cancelTokenSource.cancel();
            }
            if (this.debouncedFetch && this.debouncedFetch.cancel) {
                this.debouncedFetch.cancel();
            }
        }
    }),
    withProps(({ filterData, fetchedItems, loading }) => {
        const { data = {} } = filterData || {};
        let selectableItems = [];
        // For userDefined data source, transform userDefinedItems into items format
        // Only include items that have a valid filter
        if (data.dataSource === 'userDefined' && data.userDefinedItems) {
            selectableItems = data.userDefinedItems
                .filter(item => data.userDefinedType === "filterList" && item.filter && isFilterValid(item.filter) || data.userDefinedType === "styleList" && item.style)
                .map(item => ({
                    id: item.id,
                    label: item.label || ''
                }));
        } else {
            selectableItems = fetchedItems || [];
        }

        return {
            loading,
            selectableItems
        };
    })
);

export default filterWidgetEnhancer;
