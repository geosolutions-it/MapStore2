
import { Observable } from "rxjs";
import { SET_ENABLED } from "../actions/autorefresh";


export const autorefreshSetEnabledEpic = (action$, store) =>
    action$.ofType(SET_ENABLED)
        .switchMap(({enabled}) => {
            // TODO: this epic should be responsible for starting and stopping the autorefresh service,
            // but for now the service is always active and the epic only returns an empty observable

            return Observable.empty();
        });


