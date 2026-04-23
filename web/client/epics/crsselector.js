import Rx from 'rxjs';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { setProjectionsConfig } from '../actions/crsselector';
import { addProjectionDef } from '../actions/projections';

// OLD CODE
// export const updateCrsSelectorConfigEpic = (action$) =>
//     action$.ofType(MAP_CONFIG_LOADED)
//         .switchMap((action) => {
//             const crsSelectorConfig = action?.config?.crsSelector;
//             if (crsSelectorConfig) {
//                 return Rx.Observable.of(setProjectionsConfig({ projectionList: crsSelectorConfig.projectionList }));
//             }
//             return Rx.Observable.of(setProjectionsConfig({ projectionList: undefined }));
//         });

// On MAP_CONFIG_LOADED, restore both projectionList and any persisted dynamic defs
export const updateCrsSelectorConfigEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .mergeMap((action) => {
            const csConfig = action?.config?.crsSelector;
            const actions = [];

            if (csConfig?.projectionList) {
                actions.push(setProjectionsConfig({ projectionList: csConfig.projectionList }));
            } else {
                actions.push(setProjectionsConfig(undefined));
            }

            // Restore persisted dynamic defs - registration is handled by
            // registerDynamicProjectionDefEpic which listens to ADD_PROJECTION_DEF
            (csConfig?.dynamicProjectionDefs || []).forEach(def => {
                actions.push(addProjectionDef(def));
            });

            return Rx.Observable.from(actions);
        });

export default {
    updateCrsSelectorConfigEpic
};
