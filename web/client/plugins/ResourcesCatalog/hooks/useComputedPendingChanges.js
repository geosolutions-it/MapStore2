/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import { isEqual } from 'lodash';
import { computePendingChanges } from '../../../utils/GeostoreUtils';

/**
 * Hook to compute pending changes with debouncing
 * @param {Object} params - The parameters object
 * @param {Function} params.setPendingChanges - Function to set pending changes
 * @param {Object} params.initialResource - The initial resource state
 * @param {Object} params.resource - The current resource state
 * @param {Object} params.data - The resource data
 * @returns {null} This hook doesn't return anything
 */
const useComputedPendingChanges = ({
    setPendingChanges,
    initialResource,
    resource,
    data,
    disabled,
    debounceTime = 500
}) => {

    const previousPendingChanges = useRef();
    const timeout = useRef();

    useEffect(() => {
        if (!disabled) {
            if (timeout.current) {
                clearTimeout(timeout.current);
                timeout.current = undefined;
            }
            timeout.current = setTimeout(() => {
                const newPendingChanges = computePendingChanges(initialResource, resource, data);
                if (!isEqual(previousPendingChanges.current, newPendingChanges)) {
                    previousPendingChanges.current = newPendingChanges;
                    setPendingChanges(newPendingChanges);
                }
            }, debounceTime);
        }
    }, [initialResource, resource, data, disabled]);

    useEffect(() => {
        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
                timeout.current = undefined;
            }
            setPendingChanges({});
        };
    }, []);
    return null;
};

export default useComputedPendingChanges;
