import Rx from 'rxjs';
import { SAVE_RULE, setLoading, RULE_SAVED, DELETE_RULES, CACHE_CLEAN, DELETE_GS_INSTSANCES, GS_INSTSANCE_SAVED, SAVE_GS_INSTANCE } from '../actions/rulesmanager';
import { error, success } from '../actions/notifications';
import { drawSupportReset } from '../actions/draw';
import { updateRule, createRule, deleteRule, cleanCache, deleteGSInstance, createGSInstance, updateGSInstance } from '../observables/rulesmanager';

// To do add Error management
import { get } from 'lodash';

const saveRule = stream$ => stream$
    .mapTo({type: RULE_SAVED})
    .concat(Rx.Observable.of(drawSupportReset()))
    .catch(e => {
        let isDuplicate = false;
        if (e.data) {
            isDuplicate = e.data.indexOf("Duplicat") === 0;
        }
        return Rx.Observable.of(error({title: "rulesmanager.errorTitle", message: isDuplicate ? "rulesmanager.errorDuplicateRule" : "rulesmanager.errorUpdatingRule"}));
    })
    .startWith(setLoading(true))
    .concat(Rx.Observable.of(setLoading(false)));

// for gs instances
const saveGSInstance = stream$ => stream$
    .mapTo({type: GS_INSTSANCE_SAVED})
    .concat(Rx.Observable.of(drawSupportReset()))
    .catch(e => {
        let isDuplicate = false;
        if (e.data) {
            isDuplicate = e.data.indexOf("exists") === 0;
        }
        return Rx.Observable.of(error({title: "rulesmanager.errorTitle", message: isDuplicate ? "rulesmanager.errorDuplicateGSInstance" : "rulesmanager.errorUpdatingGSInstance"}));
    })
    .startWith(setLoading(true))
    .finally(Rx.Observable.of(setLoading(false)));
export default {
    onSave: (action$, {getState}) => action$.ofType(SAVE_RULE)
        .exhaustMap(({rule}) =>
            rule.id ? updateRule(rule, get(getState(), "rulesmanager.activeRule", {})).let(saveRule) : createRule(rule).let(saveRule)
        ),
    onDelete: (action$, {getState}) => action$.ofType(DELETE_RULES)
        .switchMap(({ids = get(getState(), "rulesmanager.selectedRules", []).map(row => row.id)}) => {
            return Rx.Observable.combineLatest(ids.map(id => deleteRule(id))).let(saveRule);
        }),
    onCacheClean: action$ => action$.ofType(CACHE_CLEAN)
        .exhaustMap( () =>
            cleanCache()
                .mapTo(success({title: "rulesmanager.errorTitle", message: "rulesmanager.cacheCleaned"}))
                .startWith(setLoading(true))
                .catch(() => {
                    return Rx.Observable.of(error({title: "rulesmanager.errorTitle", message: "rulesmanager.errorCleaningCache"}));
                })
                .concat(Rx.Observable.of(setLoading(false)))),
    // for gs instances
    onDeleteGSInstance: (action$, {getState}) => action$.ofType(DELETE_GS_INSTSANCES)
        .switchMap(({ids = get(getState(), "rulesmanager.selectedGSInstances", []).map(row => row.id)}) => {
            return Rx.Observable.forkJoin(ids.map(id => deleteGSInstance(id)))
                .catch(() => {
                    const errorMessage = {
                        title: "rulesmanager.delGSInstancetitle",
                        message: "rulesmanager.errorDeleteGSInstance"
                    };
                    return Rx.Observable.of(error(errorMessage));
                })
                .let(saveGSInstance)
                .concat(Rx.Observable.of(success({title: "rulesmanager.delGSInstancetitle", message: "rulesmanager.successDeleteGSInstance"})));
        }),
    onSaveGSInstance: (action$, {getState}) => action$.ofType(SAVE_GS_INSTANCE)
        .exhaustMap(({instance}) =>
            instance.id ? updateGSInstance(instance, get(getState(), "rulesmanager.activeGSInstance", {})).let(saveGSInstance)
                .concat(Rx.Observable.of(success({title: "rulesmanager.saveGSInstancetitle", message: "rulesmanager.successSavedGSInstance"})))
                : createGSInstance(instance).let(saveGSInstance)
                    .concat(Rx.Observable.of(success({title: "rulesmanager.saveGSInstancetitle", message: "rulesmanager.successSavedGSInstance"})))

        )
};

