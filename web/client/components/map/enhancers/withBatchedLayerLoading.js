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

const useBatchedLayerLoad = (onLayerLoad, delay = 0) => {
    const onLayerLoadRef = useRef(onLayerLoad);
    onLayerLoadRef.current = onLayerLoad;
    const pendingSuccessIdsRef = useRef(new Set());
    const pendingErrorIdsRef = useRef(new Set());
    const timerRef = useRef(null);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        pendingSuccessIdsRef.current.clear();
        pendingErrorIdsRef.current.clear();
    }, []);

    return useCallback((layerId, error) => {
        if (!onLayerLoadRef.current || !layerId) return;
        const ids = castArray(layerId);
        if (error) {
            ids.forEach(id => {
                pendingSuccessIdsRef.current.delete(id);
                pendingErrorIdsRef.current.add(id);
            });
        } else {
            ids.forEach(id => {
                if (!pendingErrorIdsRef.current.has(id)) {
                    pendingSuccessIdsRef.current.add(id);
                }
            });
        }

        if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
                const successIds = Array.from(pendingSuccessIdsRef.current);
                const errorIds = Array.from(pendingErrorIdsRef.current);
                pendingSuccessIdsRef.current.clear();
                pendingErrorIdsRef.current.clear();
                timerRef.current = null;
                if (successIds.length > 0) {
                    onLayerLoadRef.current(successIds);
                }
                if (errorIds.length > 0) {
                    onLayerLoadRef.current(errorIds, { error: true });
                }
            }, delay);
        }
    }, [delay]);
};

const useBatchedLayerError = (onLayerError, delay = 0) => {
    const onLayerErrorRef = useRef(onLayerError);
    onLayerErrorRef.current = onLayerError;
    const pendingErrorsRef = useRef(new Set());
    const pendingWarningsRef = useRef(new Set());
    const timerRef = useRef(null);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        pendingErrorsRef.current.clear();
        pendingWarningsRef.current.clear();
    }, []);

    return useCallback((layerId, tilesCount, tilesErrorCount) => {
        if (!onLayerErrorRef.current || !layerId) return;
        const ids = castArray(layerId);
        const isError = tilesCount === tilesErrorCount;
        ids.forEach(id => {
            if (isError) {
                pendingWarningsRef.current.delete(id);
                pendingErrorsRef.current.add(id);
            } else {
                if (!pendingErrorsRef.current.has(id)) {
                    pendingWarningsRef.current.add(id);
                }
            }
        });

        if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
                const errorIds = Array.from(pendingErrorsRef.current);
                const warningIds = Array.from(pendingWarningsRef.current);
                pendingErrorsRef.current.clear();
                pendingWarningsRef.current.clear();
                timerRef.current = null;
                if (errorIds.length > 0) {
                    onLayerErrorRef.current(errorIds, 1, 1);
                }
                if (warningIds.length > 0) {
                    onLayerErrorRef.current(warningIds, 2, 1);
                }
            }, delay);
        }
    }, [delay]);
};

const withBatchedLayerLoading = (Component) => forwardRef((props, ref) => {
    const delay = props.layerLoadingBatchDelay ?? 50;
    const batchedLoading = useBatchedLayerLoading(props.onLayerLoading, delay);
    const batchedLoad = useBatchedLayerLoad(props.onLayerLoad, delay);
    const batchedError = useBatchedLayerError(props.onLayerError, delay);
    return (
        <Component
            ref={ref}
            {...props}
            onLayerLoading={batchedLoading}
            onLayerLoad={batchedLoad}
            onLayerError={batchedError}
        />
    );
});

export default withBatchedLayerLoading;
