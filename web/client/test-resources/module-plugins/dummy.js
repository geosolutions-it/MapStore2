import {createPlugin} from "../../utils/PluginsUtils";
import Rx from "rxjs";

const Dummy = createPlugin('Example',
    {
        component: () => {
            return null;
        },
        reducers: {
            example: (state) => { return state;}
        },
        epics: {
            testEpic: (action$) => action$.ofType('FAKE_TYPE')
                .switchMap(() => {
                    return Rx.Observable.empty();
                })
        }
    }
);

export default Dummy;
