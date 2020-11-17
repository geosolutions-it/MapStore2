/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

import { isFeatureGridOpen } from './featuregrid';
import { wfsFilter } from './query';

export const layerDonwloadControlEnabledSelector = state => state?.controls?.layerdownload?.enabled;
export const downloadOptionsSelector = state => state?.layerdownload?.downloadOptions;
export const loadingSelector = state => state?.layerdownload?.loading;
export const checkingWPSAvailabilitySelector = state => state?.layerdownload?.checkingWPSAvailability;
export const wfsFormatsSelector = state => state?.layerdownload?.wfsFormats;
export const formatsLoadingSelector = state => state?.layerdownload?.formatsLoading;
export const serviceSelector = state => state?.layerdownload?.service;
export const wfsFilterSelector = createSelector(isFeatureGridOpen, wfsFilter, (featureGridOpen, wfsFilterObj) => featureGridOpen ? wfsFilterObj : null);
