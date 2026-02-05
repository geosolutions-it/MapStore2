/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useRef, useCallback } from 'react';
import GeoStoreDAO from '../../../api/GeoStoreDAO';
import { castArray } from 'lodash';

/**
 * Custom hook to manage IP ranges fetching and caching
 *
 * Provides:
 * - request: Function for PermissionsAddEntriesPanel
 * - isLoading: Loading state
 * - error: Error state
 * - refresh: Function to clear cache and refetch
 *
 * @returns {Object} Hook API
 */
const useIPRanges = () => {
    const [allIPRanges, setAllIPRanges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const ipRangesFetched = useRef(false);
    const ipRangesFetchPromise = useRef(null);

    /**
     * Fetches IP ranges from API (lazy fetch on first call)
     * @returns {Promise<Array>} Array of IP ranges
     */
    const fetchIPRanges = useCallback(() => {
        if (ipRangesFetched.current) {
            // Already fetched, return resolved promise with cached data
            return Promise.resolve(allIPRanges);
        }

        if (ipRangesFetchPromise.current) {
            // Fetch already in progress, return the same promise
            return ipRangesFetchPromise.current;
        }

        // Start fetching
        ipRangesFetched.current = true;
        setIsLoading(true);
        setError(null);

        ipRangesFetchPromise.current = GeoStoreDAO.getIPRanges()
            .then((response) => {
                const ipRanges = castArray(response?.IPRangeList?.IPRange || []);
                setAllIPRanges(ipRanges);
                setIsLoading(false);
                return ipRanges;
            })
            .catch((err) => {
                console.error('Error fetching IP ranges:', err);
                setError(err);
                setIsLoading(false);
                ipRangesFetched.current = false; // Reset on error to allow retry
                ipRangesFetchPromise.current = null;
                return [];
            })
            .finally(() => {
                ipRangesFetchPromise.current = null;
            });

        return ipRangesFetchPromise.current;
    }, [allIPRanges]);

    /**
     * Request function for PermissionsAddEntriesPanel
     * Handles filtering, pagination, and formatting
     */
    const request = useCallback(({ q, page: pageParam, pageSize }) => {
        // Fetch IP ranges on first call (when IP tab is opened)
        return fetchIPRanges().then((fetchedIPRanges) => {
            const page = pageParam - 1;
            let ipRanges = [...fetchedIPRanges];

            // Client-side filtering
            if (q) {
                const lowerQ = q.toLowerCase();
                ipRanges = ipRanges.filter(ip =>
                    ip.cidr?.toLowerCase().includes(lowerQ) ||
                    ip.description?.toLowerCase().includes(lowerQ)
                );
            }

            // Client-side pagination
            const start = page * pageSize;
            const end = start + pageSize;
            const paginatedRanges = ipRanges.slice(start, end);

            // Return paginated results with formatted labels
            return {
                ips: paginatedRanges.map((ip) => ({
                    ...ip,
                    filterValue: ip.cidr,
                    value: ip.cidr
                })),
                isNextPageAvailable: end < ipRanges.length
            };
        });
    }, [fetchIPRanges]);

    /**
     * Clears cache and re-fetches IP ranges
     */
    const refresh = useCallback(() => {
        ipRangesFetched.current = false;
        ipRangesFetchPromise.current = null;
        setAllIPRanges([]);
        setError(null);
        fetchIPRanges();
    }, [fetchIPRanges]);

    return {
        request,
        isLoading,
        error,
        refresh
    };
};

export default useIPRanges;

