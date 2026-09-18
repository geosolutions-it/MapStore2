/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { forwardRef, useRef, useCallback, useEffect } from 'react';
import castArray from 'lodash/castArray';

const useBatchedLayerLoading = (onLayerLoading, delay = 0) => {
    const onLayerLoadingRef = useRef(onLayerLoading);
    onLayerLoadingRef.current = onLayerLoading;
    const pendingIdsRef = useRef(new Set());
    const timerRef = useRef(null);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        pendingIdsRef.current.clear();
    }, []);

    return useCallback((layerId) => {
        if (!onLayerLoadingRef.current || !layerId) return;
        castArray(layerId).forEach(id => pendingIdsRef.current.add(id));

        if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
                const batchedIds = Array.from(pendingIdsRef.current);
                pendingIdsRef.current.clear();
                timerRef.current = null;
                onLayerLoadingRef.current(batchedIds);
            }, delay);
        }
    }, [delay]);
};

const withBatchedLayerLoading = (Component) => forwardRef((props, ref) => {
    const batchedLoading = useBatchedLayerLoading(
        props.onLayerLoading || (() => {}),
        props.layerLoadingBatchDelay ?? 50
    );
    return (
        <Component
            ref={ref}
            {...props}
            onLayerLoading={batchedLoading}
        />
    );
});

export default withBatchedLayerLoading;
