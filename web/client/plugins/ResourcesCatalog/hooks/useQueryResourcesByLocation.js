/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import url from 'url';
import axios from '../../../libs/ajax';
import uniq from 'lodash/uniq';
import { clearQueryParams } from '../utils/ResourcesFiltersUtils';
import useIsMounted from '../../../hooks/useIsMounted';
import { isEmpty, isEqual, isArray, omit, castArray } from 'lodash';

const cleanParams = (params, exclude = ['d']) => {
    return Object.keys(params)
        .filter((key) => !exclude.includes(key))
        .reduce((acc, key) =>
            (!params[key] || params[key].length === 0)
                ? acc : { ...acc, [key]: isArray(params[key])
                    ? params[key].map(value => value + '')
                    : `${params[key]}`
                }, {});
};

const getParams = (locationSearch = '', { defaultPage = 1, exclude } = {}) => {
    const { query: locationQuery } = url.parse(locationSearch || '', true);
    const { page, ...cleanedParams } = cleanParams(locationQuery, exclude);
    return [
        cleanedParams,
        page ? parseFloat(page) : defaultPage
    ];
};

const mergeParams = (params, defaultQuery) => {
    const updatedDefaultQuery = Object.keys(defaultQuery || {}).reduce((acc, key) => {
        if (defaultQuery[key] && params[key]) {
            return {
                ...acc,
                [key]: uniq([...castArray(defaultQuery[key]), ...castArray(params[key] )])
            };
        }
        return {
            ...acc,
            [key]: defaultQuery[key]
        };
    }, {});
    return {
        ...params,
        ...updatedDefaultQuery
    };
};

/**
 * contains all the logic to update the resource grids content based on the router location
 * @param {string} props.id resources section identifier
 * @param {func} props.setLoading set the loading state
 * @param {func} props.setResources set the resource items returned by the request
 * @param {func} props.setResourcesMetadata set the resource metadata returned by the request
 * @param {func} props.request function returning the resources request
 * @param {object} props.defaultQuery default query object always applied to the requests
 * @param {number} props.pageSize page size for the request
 * @param {object} props.location current router location
 * @param {func} props.onPush push a new location to the router
 * @param {object} props.user user properties
 * @param {bool} props.queryPage if true adds the page to the location query
 * @param {object} props.search search object action, { id, params }, { id, clear } or { id, refresh }
 * @param {func} props.onReset callback to reset the search action
 * @param {object} props.storedParams query parameter stored in a persisted state (no location query)
 * @return {object} { search, clear } search and clear functions
 */
const useQueryResourcesByLocation = ({
    id,
    setLoading = () => {},
    setResources = () => {},
    setResourcesMetadata = () => {},
    request = () => Promise.resolve({}),
    defaultQuery,
    pageSize,
    customFilters,
    location,
    onPush = () => {},
    user,
    queryPage,
    search,
    onReset = () => {},
    storedParams
}) => {

    const _prevLocation = useRef();
    const requestResources = useRef();
    const requestTimeout = useRef();

    const isMounted = useIsMounted();

    const source = useRef();
    const createToken = () => {
        if (source?.current?.cancel) {
            source.current?.cancel();
            source.current = undefined;
        }
        const cancelToken = axios.CancelToken;
        source.current = cancelToken.source();
    };

    const clearRequestTimeout = () => {
        if (requestTimeout.current) {
            clearTimeout(requestTimeout.current);
            requestTimeout.current = undefined;
        }
    };

    requestResources.current = (params) => {
        clearRequestTimeout();
        createToken();
        setLoading(true, id);
        requestTimeout.current = setTimeout(() => {
            const requestParams = cleanParams(mergeParams(params, defaultQuery));
            request({
                params: {
                    ...requestParams,
                    customFilters,
                    pageSize
                },
                config: {
                    cancelToken: source?.current?.token
                }
            }, { user })
                .then((response) => isMounted(() => {
                    setResources(response.resources, id);
                    setResourcesMetadata({
                        isNextPageAvailable: response.isNextPageAvailable,
                        params,
                        locationSearch: location.search,
                        locationPathname: location.pathname,
                        total: response.total
                    }, id);
                }))
                .catch((error) => isMounted(() => {
                    if (!axios.isCancel(error)) {
                        setResources([], id);
                        setResourcesMetadata({
                            isNextPageAvailable: false,
                            params,
                            locationSearch: location.search,
                            locationPathname: location.pathname,
                            total: 0,
                            error: true
                        }, id);
                    }
                }))
                .finally(() => isMounted(() => {
                    setLoading(false, id);
                }));
        }, 300);
    };

    const _queryPage = useRef();
    _queryPage.current = queryPage;

    const init = useRef();

    useEffect(() => {
        if (init.current) {
            const [currentParams, currentPage] = getParams(location.search);
            requestResources.current({
                ...currentParams,
                ...(_queryPage.current && { page: currentPage })
            });
        }
    }, [pageSize, JSON.stringify(defaultQuery), user]);

    useEffect(() => {
        const prevLocation = _prevLocation.current;
        const [previousParams, previousPage] = getParams(prevLocation?.search);
        const [currentParams, currentPage] = getParams(location.search);
        const isPageUpdated = _queryPage.current
            ? currentPage !== previousPage
            : false;
        const shouldUpdate = prevLocation === undefined
            || isPageUpdated
            || !isEqual(currentParams, previousParams);
        if (shouldUpdate) {
            requestResources.current({
                ...currentParams,
                ...(_queryPage.current && { page: currentPage })
            });
        }
        _prevLocation.current = location;
    }, [location]);

    function handleSearch(nextParams) {
        const { query } = url.parse(location.search, true);
        if (nextParams?.page !== undefined && !queryPage) {
            requestResources.current({
                ...query,
                page: nextParams.page
            });
            return;
        }
        const nextQuery = cleanParams({ ...omit(query, ['page']), ...nextParams }, []);
        const nextSearch = url.format({ query: nextQuery });
        if (location.search !== nextSearch) {
            onPush({
                search: nextSearch
            });
        }
        return;
    }

    function handleClear() {
        const newParams = clearQueryParams(location);
        handleSearch(newParams);
    }

    // restore previous params on initialization
    useEffect(() => {
        if (!init.current) {
            // exclude page to avoid missing page error
            const { page, ...currentParams } = storedParams || {};
            if (!isEmpty(currentParams)) {
                handleSearch(currentParams);
            }
            init.current = true;
        }
    }, [storedParams]);

    useEffect(() => {
        if (search?.id) {
            if (search.clear) {
                handleClear();
            } else if (search.refresh) {
                const { query } = url.parse(location.search, true);
                requestResources.current(query);
            } else {
                handleSearch(search?.params);
            }
            onReset();
        }
    }, [search?.id]);

    useEffect(() => {
        return () => {
            if (source?.current?.cancel) {
                source.current.cancel();
                source.current = undefined;
            }
            clearRequestTimeout();
        };
    }, []);

    return {
        search: handleSearch,
        clear: handleClear
    };
};

export default useQueryResourcesByLocation;
