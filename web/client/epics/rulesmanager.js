const Rx = require("rxjs");

const {SAVE_RULE, setLoading, RULE_SAVED, DELETE_RULES, CACHE_CLEAN} = require("../actions/rulesmanager");
const {error, success} = require("../actions/notifications");
const {drawSupportReset} = require("../actions/draw");
const {updateRule, createRule, deleteRule, cleanCache } = require("../observables/rulesmanager");
// To do add Error management
const {get} = require("lodash");
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
module.exports = {
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
                .concat(Rx.Observable.of(setLoading(false))))
};

