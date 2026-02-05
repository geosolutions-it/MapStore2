/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useCallback } from 'react';

/**
 * Custom hook to batch multiple updates into a single callback execution.
 *
 * @param {function} callback - The function to call with batched updates
 * @param {object} options - Configuration options
 * @param {number} options.delay - Delay in milliseconds before flushing (default: 0)
 * @param {function} options.reducer - Function to merge updates: (accumulated, ...args) => newAccumulated
 * @returns {Array} [batchedUpdate, forceFlush] - Batched update function and manual flush
 *
 * @example
 * const [batchedUpdate] = useBatchedUpdates(
 *   (result) => onChange(result),
 *   { reducer: (accumulated, update) => ({ ...accumulated, ...update }) }
 * );
 */
const useBatchedUpdates = (callback, { delay = 0, reducer } = {}) => {
    const timeoutRef = useRef(null);
    const accumulatedRef = useRef(null);

    if (!reducer) {
        throw new Error('useBatchedUpdates: reducer function is required');
    }


    // Flushes all accumulated updates by calling the callback
    const flush = useCallback(() => {
        if (accumulatedRef.current !== null) {
            callback(accumulatedRef.current);
            accumulatedRef.current = null;
        }
    }, [callback]);


    // Batched update function that accumulates updates and schedules a flush
    const batchedUpdate = useCallback((...args) => {
        // Accumulate the update using the reducer
        accumulatedRef.current = reducer(accumulatedRef.current, ...args);

        // Clear existing timeout and schedule new flush
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            flush();
            timeoutRef.current = null;
        }, delay);
    }, [reducer, delay, flush]);


    // Force an immediate flush (useful for cleanup or manual flushing)
    const forceFlush = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        flush();
    }, [flush]);

    return [batchedUpdate, forceFlush];
};

export default useBatchedUpdates;

