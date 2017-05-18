
const Rx = require('rxjs');
const { ActionsObservable } = require('redux-observable');

module.exports = {
    /**
     * Utility to test an epic
     * @param  {epic}   epic       the epic to test
     * @param  {number}   count      the number of actions to wait (note, the stream)
     * @param  {object|object[]}   action     the action(s) to trigger
     * @param  {Function} callback   The check function, called after `count` actions received
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
    }
};
