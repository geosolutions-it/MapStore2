import Rx from 'rxjs';

import { TIME_SERIES_PLOTS } from '../../../actions/layers';
import { TOGGLE_CONTROL, toggleControl } from '../../../actions/controls';

export const openTimeSeriesPlotsPlugin = (action$) =>
    action$.ofType(TIME_SERIES_PLOTS)
        .switchMap((action) => {
            return Rx.Observable.from([
                toggleControl("timeSeriesPlots"),
                // onDownloadOptionChange("singlePage", false),
                // ...(action.layer.search?.url ? [createQuery(action.layer.url, {featureTypeName: action.layer.name})] : [])
            ]);
        });