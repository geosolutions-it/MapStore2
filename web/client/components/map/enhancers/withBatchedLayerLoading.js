/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { forwardRef, useRef, useCallback, useEffect } from 'react';
import castArray from 'lodash/castArray';

const useBatchedLayerEvent = (onEvent, delay = 0, {
    createState,
    handleEvent,
    flush
}) => {
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    const stateRef = useRef(null);
    if (!stateRef.current) {
        stateRef.current = createState();
    }
    const timerRef = useRef(null);

    useEffect(() => () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    return useCallback((...args) => {
        if (!onEventRef.current) return;

        handleEvent(stateRef.current, ...args);

        if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
                const state = stateRef.current;
                stateRef.current = createState();
                timerRef.current = null;

                flush(state, onEventRef.current);
            }, delay);
        }
    }, [delay, handleEvent, flush, createState]);
};

const LOADING_CONFIG = {
    createState: () => new Set(),
    handleEvent: (ids, layerId) => {
        if (!layerId) return;
        castArray(layerId).forEach(id => ids.add(id));
    },
    flush: (ids, onEvent) => {
        const layerIds = Array.from(ids);
        if (layerIds.length > 0) {
            onEvent(layerIds);
        }
    }
};

const LOAD_CONFIG = {
    createState: () => ({
        successIds: new Set(),
        errorIds: new Set()
    }),
    handleEvent: (state, layerId, error) => {
        if (!layerId) return;
        const ids = castArray(layerId);
        if (error) {
            ids.forEach(id => {
                state.successIds.delete(id);
                state.errorIds.add(id);
            });
        } else {
            ids.forEach(id => {
                if (!state.errorIds.has(id)) {
                    state.successIds.add(id);
                }
            });
        }
    },
    flush: (state, onEvent) => {
        const successIds = Array.from(state.successIds);
        const errorIds = Array.from(state.errorIds);
        if (successIds.length > 0) {
            onEvent(successIds);
        }
        if (errorIds.length > 0) {
            onEvent(errorIds, { error: true });
        }
    }
};

const ERROR_CONFIG = {
    createState: () => ({
        errorIds: new Set(),
        warningIds: new Set()
    }),
    handleEvent: (state, layerId, tilesCount, tilesErrorCount) => {
        if (!layerId) return;
        const ids = castArray(layerId);
        const isError = tilesCount === tilesErrorCount;
        ids.forEach(id => {
            if (isError) {
                state.warningIds.delete(id);
                state.errorIds.add(id);
            } else if (!state.errorIds.has(id)) {
                state.warningIds.add(id);
            }
        });
    },
    flush: (state, onEvent) => {
        const errorIds = Array.from(state.errorIds);
        const warningIds = Array.from(state.warningIds);
        if (errorIds.length > 0) {
            onEvent(errorIds, 1, 1);
        }
        if (warningIds.length > 0) {
            onEvent(warningIds, 2, 1);
        }
    }
};

const useBatchedLayerLoading = (onLayerLoading, delay = 0) =>
    useBatchedLayerEvent(onLayerLoading, delay, LOADING_CONFIG);

const useBatchedLayerLoad = (onLayerLoad, delay = 0) =>
    useBatchedLayerEvent(onLayerLoad, delay, LOAD_CONFIG);

const useBatchedLayerError = (onLayerError, delay = 0) =>
    useBatchedLayerEvent(onLayerError, delay, ERROR_CONFIG);

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
