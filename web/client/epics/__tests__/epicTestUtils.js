
const Rx = require('rxjs');
const { isFunction } = require('lodash');
const { ActionsObservable, combineEpics } = require('redux-observable');
const TEST_TIMEOUT = "EPICTEST:TIMEOUT";
module.exports = {
    /**
     * Utility to test an epic
     * @param  {function}   epic       the epic to test
     * @param  {number|function}   count      the number of actions to wait. If a function, it represents a check to do on the next action to stop.
     * @param  {object|object[]}   action     the action(s) to trigger
     * @param  {function} callback   The check function, called after `count` actions received
     * @param  {Object|function}   [state={}] the state or a function that return it
     */
    testEpic: (epic, count, action, callback, state = {}, done, withCompleteAction = false) => {
        const actions = new Rx.Subject();
        const actions$ = new ActionsObservable(actions);
        const store = {
            getState: () => isFunction(state) ? state() : state,
            // subscribes to the actions and allow to react to them.
            dispatch: (a) => {
                actions.next(a);
            }
        };
        epic(actions$, store)
            [isFunction(count) ? "takeWhile" : "take"](count, true).concat( withCompleteAction ? Rx.Observable.of({ type: "EPIC_COMPLETED"}) : [])
            .toArray()
            .subscribe((x) => {
                try {
                    callback(x);
                    done && done();
                } catch (e) {
                    done && done(e);
                }
            }, done ? e => done(e) : undefined);
        if (action.length) {
            action.map(act => actions.next(act));
        } else {
            actions.next(action);
        }
        return store;
    },
    /**
     * The action emitted by the addTimeoutEpic
     * @type {string}
     */
    TEST_TIMEOUT,
    /**
     * Combine the epic with another than emits TEST_TIMEOUT action.
     * @param {function} epic         The epic to combine
     * @param {Number} [timeout=1000] milliseconds to wait after emit the TEST_TIMEOUT action.
     */
    addTimeoutEpic: (epic, timeout = 1000) => combineEpics(epic, () => Rx.Observable.timer(timeout).map(() => ({type: TEST_TIMEOUT, timeout}))),
    /**
     * More general, but more complicated, test utility that allows to test epics combined.
     * Differently from the testEpic, this function allow to combine and test more epics at once.
     * You can add your own epics to the list in order to intercept events and simulate the real world
     * interaction or to check the interactions between the two or more epics at the same time
     * @param {function[]} epics the epics array to test.Typically you can pass the epic you want to test plus all epics for control
     * (emit actions/check correct action emitted)
     * @param {function} stopEpic function that returns an observable. When this observable returned emits 1 value the whole stream will complete.
     * note: the name "epic" is because of the signature that is the the same of an epic, but it returns an observable, more in general.
     * @param {object} handlers contains handlers `onNext` `onError` `onComplete` to associate to the events happened
     * @param {object} store. A mock of a redux store.
     * @example
     * let actions = [];
     * testcombinedEpicStream(
     *     [myEpic1, myEpic2, myMockEpicToSimulateControl],
     *     action$ => a$.filter(a => if(conditionOfEnd(e))),
     *     {
     *        onNext: a => actions.push(a), // note: here all the actions are included.
     *        onError: e => done(e),
     *        onComplete: () => {testActions(actions); done();}
     *     }
     * )
     */
    testCombinedEpicStream: (
        epics,
        stopEpic,
        {
            onNext = () => {},
            onError = () => {},
            onComplete = () => {}
        } = {},
        store = {getState: () => {}}, ) => {
        const actions = new Rx.Subject();
        const actions$ = new ActionsObservable(actions);
        return combineEpics(...epics)(actions$, store)
            .takeUntil(stopEpic(actions, store))
            .subscribe(
                e => {
                    onNext(e);
                    actions.next(e);
                },
                e => onError(e),
                () => onComplete()
            );
    }
};
