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
<<<<<<< HEAD
            return Rx.Observable.of(setProjectionsConfig({ projectionList: undefined }));
=======
            return Rx.Observable.empty();
>>>>>>> d05e604 (Fix #11879 Improve CRS selector component (#11880))
        });

export default {
    updateCrsSelectorConfigEpic
};
