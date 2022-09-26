import {createPlugin} from "../../utils/PluginsUtils";
import Rx from "rxjs";

const Dummy2 = createPlugin('Example2',
    {
        component: () => {
            return null;
        },
        reducers: {
            example2: (state) => { return state;}
        },
        epics: {
            anotherTestEpic: (action$) => action$.ofType('FAKE_TYPE')
                .switchMap(() => {
                    return Rx.Observable.empty();
                })
        }
    }
);

export default Dummy2;
