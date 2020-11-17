/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const exportDataResultsControlEnabledSelector = state => state?.controls?.exportDataResults?.enabled;
export const exportDataResultsSelector = state => state?.exportdataresults?.results;
export const showInfoBubbleSelector = state => state?.exportdataresults?.showInfoBubble;
export const infoBubbleMessageSelector = state => state?.exportdataresults?.infoBubbleMessage;
export const checkingExportDataEntriesSelector = state => state?.exportdataresults?.checkingExportDataEntries;
