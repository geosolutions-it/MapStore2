/**
* Copyright 2026, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

export const staticProjectionDefsSelector = (state) => state.projections?.staticDefs ?? [];
export const dynamicProjectionDefsSelector = (state) => state.projections?.dynamicDefs ?? [];

// Single merged list, deduplicated - dynamic overrides static for the same code
export const allProjectionDefsSelector = (state) => {
    const staticDefs = staticProjectionDefsSelector(state);
    const dynamicDefs = dynamicProjectionDefsSelector(state);
    const dynamicCodes = new Set(dynamicDefs.map(d => d.code));
    return [
        ...staticDefs.filter(d => !dynamicCodes.has(d.code)),
        ...dynamicDefs
    ];
};

export const projectionSearchResultsSelector = (state) => state.projections?.search.results ?? [];
export const projectionSearchLoadingSelector = (state) => state.projections?.search.loading ?? false;
export const projectionSearchErrorSelector = (state) => state.projections?.search.error ?? null;
export const projectionSearchTotalSelector = (state) => state.projections?.search.total ?? 0;
export const projectionSearchPageSelector = (state) => state.projections?.search.page ?? 1;
export const projectionSearchPageSizeSelector = (state) => state.projections?.search.pageSize ?? 10;
export const projectionLoadingDefsSelector = (state) => state.projections?.search.loadingDefs ?? [];

// projectionDefsSelector in selectors/map.js becomes a re-export for backward compat:
// export { allProjectionDefsSelector as projectionDefsSelector } from './projections';
