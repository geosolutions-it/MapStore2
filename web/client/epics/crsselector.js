import Rx from 'rxjs';
import { MAP_CONFIG_LOADED, MAP_INFO_LOADED } from '../actions/config';
import { setCanEditProjection, setProjectionsConfig } from '../actions/crsselector';

export const updateCrsSelectorConfigEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap((action) => {
            const crsSelectorConfig = action?.config?.crsSelector;
            if (crsSelectorConfig) {
                return Rx.Observable.of(setProjectionsConfig({ projectionList: crsSelectorConfig.projectionList }));
            }
            return Rx.Observable.empty();
        });

export const updateCanEditProjectionEpic = (action$) =>
    action$.ofType(MAP_INFO_LOADED)
        .switchMap((action) => {
            return Rx.Observable.of(setCanEditProjection(action.info?.attributes?.canEdit));
        });

export default {
    updateCrsSelectorConfigEpic,
    updateCanEditProjectionEpic
};
