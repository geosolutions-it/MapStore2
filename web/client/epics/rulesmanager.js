import Rx from 'rxjs';
import { SAVE_RULE, setLoading, RULE_SAVED, DELETE_RULES, CACHE_CLEAN, DELETE_GS_INSTSANCES, GS_INSTSANCE_SAVED, SAVE_GS_INSTANCE, CACHE_CLEAN_MULTI } from '../actions/rulesmanager';
import { error, success } from '../actions/notifications';
import { drawSupportReset } from '../actions/draw';
import { updateRule, createRule, deleteRule, cleanCache, deleteGSInstance, createGSInstance, updateGSInstance } from '../observables/rulesmanager';

// To do add Error management
import { get } from 'lodash';
import { expandInstancesWithSlaves } from '../utils/RuleServiceUtils';

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
    .mapTo({ type: GS_INSTSANCE_SAVED })
    .concat(Rx.Observable.of(drawSupportReset()))
    .concat(Rx.Observable.of(success({ title: "rulesmanager.saveGSInstancetitle", message: "rulesmanager.successSavedGSInstance" })))
    .catch(e => {
        let isDuplicate = false;
        if (e && e.data) {
            isDuplicate = e.data.indexOf("exists") !== -1;
        }
        return Rx.Observable.of(error({
            title: "rulesmanager.errorTitle",
            message: isDuplicate ? "rulesmanager.errorDuplicateGSInstance" : "rulesmanager.errorUpdatingGSInstance"
        }));
    })
    .startWith(setLoading(true))
    .concat(Rx.Observable.of(setLoading(false)));

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
        .exhaustMap((action) =>{
            return cleanCache(action?.gsInstanceUrl)
                .mapTo(success({title: "rulesmanager.errorTitle", message: "rulesmanager.cacheCleaned"}))
                .startWith(setLoading(true))
                .catch(() => {
                    return Rx.Observable.of(error({title: "rulesmanager.errorTitle", message: "rulesmanager.errorCleaningCache"}));
                })
                .concat(Rx.Observable.of(setLoading(false)));
        }),
    onCacheCleanMulti: action$ => action$.ofType(CACHE_CLEAN_MULTI)
        .exhaustMap((action) => {
        // Create an array of observables, one for each instance
            let gsInstances = action.gsInstances || [];
            const allInstances = expandInstancesWithSlaves(gsInstances);
            if (allInstances.length === 0) {
                return Rx.Observable.of(setLoading(false));
            }
            const cleanRequests = allInstances.map(instance =>
                cleanCache(instance.url)
                    .map(() => ({ success: true, name: instance.name }))
                    .catch(() => {
                        return Rx.Observable.of({ success: false, name: instance.name });
                    })
            );

            // forkJoin waits for all requests to finish
            return Rx.Observable.forkJoin(cleanRequests)
                .switchMap(results => {
                    const successfulNames = results.filter(r => r.success).map(r => r.name);
                    const failedNames = results.filter(r => !r.success).map(r => r.name);

                    const actions = [];

                    // 1. If there are successes, add a success notification
                    if (successfulNames.length > 0) {
                        actions.push(success({
                            title: "rulesmanager.errorTitle",
                            message: "rulesmanager.cacheCleanedFor",
                            values: { instancesNames: successfulNames.join(', ') },
                            uid: "cacheCleanedFor"
                        }));
                    }

                    // 2. If there are failures, add an error notification
                    if (failedNames.length > 0) {
                        actions.push(error({
                            title: "rulesmanager.errorTitle",
                            message: "rulesmanager.errorCleaningCacheFor",
                            values: { instancesNames: failedNames.join(', ') },
                            uid: "errorCleaningCacheFor"
                        }));
                    }

                    return Rx.Observable.from(actions);
                })
                .startWith(setLoading(true))
                .concat(Rx.Observable.of(setLoading(false)));
        }),
    // for gs instances
    onDeleteGSInstance: (action$, { getState }) => action$.ofType(DELETE_GS_INSTSANCES)
        .switchMap(({ ids = get(getState(), "rulesmanager.selectedGSInstances", []).map(row => ({id: row.id, title: row.name})) }) => {

            return Rx.Observable.from(ids)
                .mergeMap(({id, title}) =>
                    deleteGSInstance(id)
                        .map(result => ({ id, status: 'success', result }))
                        .catch(err => Rx.Observable.of({ id, status: 'failed', err, title }))
                )
                .reduce((acc, result) => {
                    if (result.status === 'success') {
                        acc.successes.push(result);
                    } else {
                        acc.failures.push(result);
                    }
                    return acc;
                }, { successes: [], failures: [] })
                .mergeMap(({ successes, failures }) => {

                    const actions = [];

                    // Always dispatch reset & saved action
                    actions.push({ type: GS_INSTSANCE_SAVED });
                    actions.push(drawSupportReset());

                    // Success message with partial info
                    if (successes.length > 0) {
                        actions.push(success({
                            uid: Date.now() + '_success',
                            title: "rulesmanager.delGSInstancetitle",
                            message: "rulesmanager.successDeleteGSInstance",
                            values: {successfulNum: successes.length, successItemLabel: successes.length > 1 ? 'items' : 'item', failureMsg: failures.length > 0 ? `, ${failures.length} failed` : ''}
                        }));
                    }

                    // Error messages for each failure
                    failures.forEach(({ err, title }, idx) => {
                        let errorMessage = {
                            title: "rulesmanager.delGSInstancetitle",
                            message: "rulesmanager.errorDeleteGSInstance",
                            uid: Date.now() + 'fail' + idx
                        };

                        if (err?.data?.includes("Existing rules reference")) {
                            errorMessage.message = "rulesmanager.errorDeleteGSInstanceWithExistRelRules";
                            errorMessage.values = {gsInstanceTitle: title};
                        }

                        actions.push(error(errorMessage));
                    });

                    return Rx.Observable.concat(...actions.map(action => Rx.Observable.of(action)));
                })
                .startWith(setLoading(true))
                .concat(Rx.Observable.of(setLoading(false)))
                .catch(() => {

                    // Generic fallback error
                    return Rx.Observable.of(
                        error({
                            title: "rulesmanager.delGSInstancetitle",
                            message: "rulesmanager.errorDeleteGSInstance"
                        }),
                        setLoading(false)
                    );
                });
        }),
    onSaveGSInstance: (action$, { getState }) =>
        action$.ofType(SAVE_GS_INSTANCE)
            .exhaustMap(({ instance }) => {
                const base$ = instance.id
                    ? updateGSInstance(instance, get(getState(), "rulesmanager.activeGSInstance", {}))
                    : createGSInstance(instance);
                return base$.let(saveGSInstance);
            })

};

