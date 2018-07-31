
const Rx = require('rxjs');
const { SELECT_TIME } = require('../actions/timeline');
const { setCurrentTime } = require('../actions/timemanager');
const { timeSequenceSelector } = require('../selectors/timemanager');
const { getNearestDate } = require('../utils/TimeUtils');


const snapTime = (state, time) => {
    timeSequenceSelector(state);
    return Rx.Observable.of(getNearestDate(timeSequenceSelector(state), time) || time);
};
const snap = true; // TODO: externalize to make this configurable.
module.exports = {
    setTimelineCurrentTime: (action$, {getState = () => {}} = {}) => action$.ofType(SELECT_TIME)
        .switchMap( ({time}) => {

            if (snap) {
                return snapTime(getState(), time).map( t => setCurrentTime(t));
            }
            return Rx.Observable.of(setCurrentTime(time));
        })
};
