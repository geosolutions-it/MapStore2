import Rx from 'rxjs';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { setProjectionsConfig } from '../actions/crsselector';

export const updateCrsSelectorConfigEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap((action) => {
            const crsSelectorConfig = action?.config?.crsSelector;
            if (crsSelectorConfig) {
                return Rx.Observable.of(setProjectionsConfig({ projectionList: crsSelectorConfig.projectionList }));
            }
            return Rx.Observable.of(setProjectionsConfig({ projectionList: undefined }));
        });

export default {
    updateCrsSelectorConfigEpic
};
