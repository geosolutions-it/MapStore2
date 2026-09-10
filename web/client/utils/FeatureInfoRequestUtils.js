/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clamp, isNil } from 'lodash';

import { ServerTypes } from './LayersUtils';

export const DEFAULT_FEATURE_COUNT = 10;
export const MAX_FEATURE_INFO_BUFFER = 1000;

const sanitizeInteger = (value, min) => {
    const parsed = value === '' || isNil(value) ? NaN : Number(value);
    return Number.isInteger(parsed) && parsed >= min ? parsed : undefined;
};

export const sanitizeFeatureInfoMaxItems = (value) => sanitizeInteger(value, 1);

export const sanitizeFeatureInfoBuffer = (value) => {
    const buffer = sanitizeInteger(value, 0);
    return buffer === undefined ? undefined : clamp(buffer, 0, MAX_FEATURE_INFO_BUFFER);
};

export const isGeoServerLayer = (layer = {}) => {
    return layer.serverType !== ServerTypes.NO_VENDOR;
};

export const getFeatureInfoMaxItems = (featureInfo = {}, fallback = DEFAULT_FEATURE_COUNT) =>
    sanitizeFeatureInfoMaxItems(featureInfo.maxItems)
    ?? sanitizeFeatureInfoMaxItems(fallback)
    ?? DEFAULT_FEATURE_COUNT;

export const getFeatureInfoBuffer = (featureInfo = {}, layer = {}) =>
    isGeoServerLayer(layer) ? sanitizeFeatureInfoBuffer(featureInfo.buffer) : undefined;
