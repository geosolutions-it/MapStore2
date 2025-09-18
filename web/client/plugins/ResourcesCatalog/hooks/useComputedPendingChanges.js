/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect, useMemo } from 'react';
import { isEqual, debounce } from 'lodash';
import { computePendingChanges } from '../../../utils/GeostoreUtils';

/**
 * Hook to compute pending changes with debouncing
 * @param {Object} params - The parameters object
 * @param {Function} params.setPendingChanges - Function to set pending changes
 * @param {Object} params.initialResource - The initial resource state
 * @param {Object} params.resource - The current resource state
 * @param {Object} params.data - The resource data
 * @param {boolean} params.disabled - disable compare computation
 * @param {Object} params.debounceConfig - Debounce configuration options
 * @param {number} params.debounceConfig.wait - Wait time in milliseconds (default: 500)
 * @param {boolean} params.debounceConfig.leading - Execute immediately on leading edge (default: false)
 * @param {boolean} params.debounceConfig.trailing - Execute after wait time (default: true)
 * @param {number} params.debounceConfig.maxWait - Force execution after max wait time (default: 5000)
 * @returns {null} This hook doesn't return anything
 */

const useComputedPendingChanges = ({
    setPendingChanges,
    initialResource,
    resource,
    data,
    disabled,
    debounceConfig = {}
}) => {
    const previousPendingChanges = useRef();

    // Default debounce configuration
    const {
        wait = 500,
        leading = false,
        trailing = true,
        maxWait = 5000
    } = debounceConfig;

    // Create debounced function with configurable options - stable reference
    const debouncedComputeChanges = useMemo(() => {
        return debounce(
            (initResource, res, resData) => {
                if (!initResource || !res) return;
                const newPendingChanges = computePendingChanges(initResource, res, resData);
                if (!isEqual(previousPendingChanges.current, newPendingChanges)) {
                    previousPendingChanges.current = newPendingChanges;
                    setPendingChanges(newPendingChanges);
                }
            },
            wait,
            {
                leading,
                trailing,
                maxWait
            }
        );
    }, [wait, leading, trailing, maxWait]);

    useEffect(() => {
        if (!disabled) {
            debouncedComputeChanges(initialResource, resource, data);
        }
    }, [debouncedComputeChanges, initialResource, resource, data, disabled]);

    useEffect(() => {
        return () => {
            debouncedComputeChanges.cancel();
            setPendingChanges({});
        };
    }, [debouncedComputeChanges, disabled]);
    return null;
};

export default useComputedPendingChanges;
