
const Rx = require('rxjs');
const { ActionsObservable, combineEpics } = require('redux-observable');
const TEST_TIMEOUT = "EPICTEST:TIMEOUT";
module.exports = {
    /**
     * Utility to test an epic
     * @param  {function}   epic       the epic to test
     * @param  {number}   count      the number of actions to wait (note, the stream)
     * @param  {object|object[]}   action     the action(s) to trigger
     * @param  {function} callback   The check function, called after `count` actions received
     * @param  {Object}   [state={}] the state
     */
    testEpic: (epic, count, action, callback, state = {}) => {
        const actions = new Rx.Subject();
        const actions$ = new ActionsObservable(actions);
        const store = { getState: () => state };
        epic(actions$, store)
            .take(count)
            .toArray()
            .subscribe(callback);
        if (action.length) {
            action.map(act => actions.next(act));
        } else {
            actions.next(action);
        }
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
    addTimeoutEpic: (epic, timeout = 1000) => combineEpics(epic, () => Rx.Observable.timer(timeout).map(() => ({type: TEST_TIMEOUT, timeout})))
};
