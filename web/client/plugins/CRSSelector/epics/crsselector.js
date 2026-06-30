import { MAP_CONFIG_LOADED } from '../../../actions/config';
import { setProjectionsConfig } from '../actions/crsselector';
import Rx from 'rxjs';
import isEqual from 'lodash/isEqual';
import {
    CHANGE_MAP_CRS,
    setMapResolutions,
    updateMapOptions
} from '../../../actions/map';
import { mapSelector } from '../../../selectors/map';
import { getResolutionsForProjection } from '../../../utils/MapUtils';
import { customResolutionsForCrsSelector } from '../selectors/crsselector';

/**
 * Returns the resolutions to apply for a given CRS, using the custom resolutions configured for that CRS when available, and falling back
 * to the resolutions derived from the projection extent otherwise.
 */
const resolveResolutionsForCrs = (state, crs) => {
    const custom = customResolutionsForCrsSelector(state, crs);
    if (custom && custom.length) {
        return custom;
    }
    return getResolutionsForProjection(crs);
};

const omitProjectionFromView = (view = {}) => {
    const viewOptions = { ...view };
    delete viewOptions.projection;
    return viewOptions;
};

/**
 * When a map is loaded, restore the plugin configuration that was saved with it (the available projection list and any per-CRS custom
 * resolutions). For maps saved before per-CRS custom resolutions were supported, align the active map resolutions with the configured ones
 * so the map stays consistent on reload and on the next save.
 */
export const updateCrsSelectorConfigEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap((action) => {
            const csConfig = action?.config?.crsSelector;
            const mapConfig = action?.config?.map;
            const projection = mapConfig?.projection;
            const view = mapConfig?.mapOptions?.view || {};
            const customResolutions = csConfig?.customResolutions || {};

            const setConfigAction = csConfig?.projectionList || csConfig?.customResolutions
                ? setProjectionsConfig({ ...csConfig })
                : setProjectionsConfig(undefined);

            const customForCrs = projection ? customResolutions[projection] : undefined;
            const resolutionsAreAlignedToCrs = !!view.resolutions
                && isEqual(view.resolutions, customForCrs);
            const canUpdateMapOptions = !!customForCrs && customForCrs.length > 0 && !resolutionsAreAlignedToCrs;

            if (canUpdateMapOptions) {
                return Rx.Observable.of(
                    setConfigAction,
                    updateMapOptions({ view: { ...omitProjectionFromView(view), resolutions: customForCrs } }),
                    setMapResolutions(customForCrs)
                );
            }
            return Rx.Observable.of(setConfigAction);
        });

/**
 * When the user changes the map CRS, update the map's resolutions to match: use the custom resolutions configured for the new CRS when
 * available, otherwise compute them from the projection extent. The resolutions applied here are kept in sync with the active CRS so the
 * map can be saved and reopened without misalignment.
 */
export const updateMapResolutionsOnCrsChangeEpic = (action$, store) =>
    action$.ofType(CHANGE_MAP_CRS)
        .switchMap(({ crs }) => {
            if (!crs) {
                return Rx.Observable.empty();
            }
            const state = store.getState();
            const resolutions = resolveResolutionsForCrs(state, crs);
            const currentView = mapSelector(state)?.mapOptions?.view || {};
            return Rx.Observable.of(
                updateMapOptions({ view: { ...omitProjectionFromView(currentView), resolutions } }),
                setMapResolutions(resolutions)
            );
        });

export default {
    updateCrsSelectorConfigEpic,
    updateMapResolutionsOnCrsChangeEpic
};
