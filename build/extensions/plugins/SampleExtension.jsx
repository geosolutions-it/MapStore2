import {connect} from "react-redux";

import Extension from "../components/Extension";
import Rx from "rxjs";
import { changeZoomLevel } from "../../../web/client/actions/map";
import { set } from "../../../web/client/utils/ImmutableUtils";

export default {
    name: "SampleExtension",
    component: connect(state => ({
        value: state.sampleExtension && state.sampleExtension.value
    }), {
        onIncrease: () => {
            return {
                type: 'INCREASE_COUNTER'
            };
        }, changeZoomLevel
    })(Extension),
    reducers: {
        sampleExtension: (state = { value: 1 }, action) => {
            if (action.type === 'INCREASE_COUNTER') {
                return { value: state.value + 1 };
            }
            return state;
        }
    },
    epics: {
        logCounterValue: (action$, store) => action$.ofType('INCREASE_COUNTER').switchMap(() => {
            /* eslint-disable */
            console.log('CURRENT VALUE: ' + store.getState().sampleExtension.value);
            /* eslint-enable */
            return Rx.Observable.empty();
        })
    },
    containers: {
        Toolbar: {
            name: "sampleExtension",
            position: 10,
            text: "INC",
            doNotHide: true,
            action: () => {
                return {
                    type: 'INCREASE_COUNTER'
                };
            },
            priority: 1
        }
    },
    configuration: {
        main: ({cfg = {}}) => ({
            cfg: {
                customProp: cfg.customProp?.toString() || 'none',
                validatedProp: (cfg.validatedProp?.toString() || '').replace('removeme', '')
            }
        }),
        desktop: (config) => set('cfg.customProp', config.cfg.customProp + ' |desktop|', config),
        mobile: (config) => set('cfg.customProp', config.cfg.customProp + ' |mobile|', config),
        embedded: (config) => set('cfg.customProp', config.cfg.customProp + ' |embedded|', config)
    }
};
