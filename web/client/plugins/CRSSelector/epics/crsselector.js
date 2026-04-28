import { MAP_CONFIG_LOADED } from '../../../actions/config';
import { setProjectionsConfig } from '../actions/crsselector';

// On MAP_CONFIG_LOADED, restore the plugin's quick-switch projectionList from
// the persisted crsSelector config. Dynamic projection defs themselves are
// restored at framework level by restoreDynamicProjectionDefsEpic.
export const updateCrsSelectorConfigEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .map((action) => {
            const csConfig = action?.config?.crsSelector;
            if (csConfig?.projectionList) {
                return setProjectionsConfig({ projectionList: csConfig.projectionList });
            }
            return setProjectionsConfig(undefined);
        });

export default {
    updateCrsSelectorConfigEpic
};
