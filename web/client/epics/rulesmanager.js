const Rx = require("rxjs");

const {SAVE_RULE, setLoading, RULE_SAVED, DELETE_RULES} = require("../actions/rulesmanager");
const {error} = require("../actions/notifications");
const {updateRule, createRule, deleteRule} = require("../observables/rulesmanager");
// To do add Error management
const {get} = require("lodash");
const saveRule = stream$ => stream$
                .mapTo({type: RULE_SAVED})
                .catch(() => {
                    return Rx.Observable.of(error({title: "rulesmanager.errorTitle", message: "rulesmanager.errorUpdatingRule"}));
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
            })
};

