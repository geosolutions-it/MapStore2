import { get } from 'lodash';

export const filterLayerForSelect = layer => layer && layer.group !== 'background' && ['wms', 'wfs', 'arcgis'].includes(layer.type);

export const selectLayersSelector = state => (get(state, 'layers.flat') || []).filter(filterLayerForSelect);

export const isSelectEnabled = state => get(state, "controls.select.enabled");

export const hasSelectQueriableProp = node => Object.hasOwn(node, 'isSelectQueriable');
export const isSelectQueriable = node => hasSelectQueriableProp(node) ? node.isSelectQueriable : !!node?.visibility;

export const getSelectObj = state => get(state, 'select') ?? {};
export const getSelectQueryOptions = state => getSelectObj(state).cfg?.queryOptions ?? {};
export const getSelectQueryMaxFeatureCount = state => {
    const queryOptions = getSelectQueryOptions(state);
    return Number.isInteger(queryOptions.maxCount) ? queryOptions.maxCount : -1;
};
export const getSelectHighlightOptions = state => getSelectObj(state).cfg?.highlightOptions ?? {};
export const getSelectSelections = state => getSelectObj(state).selections ?? {};
