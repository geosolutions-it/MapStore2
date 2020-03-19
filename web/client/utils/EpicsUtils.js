/**
 * default wrapper for the epics.
 * @memberof utils.EpicsUtils
 * @param {epic} epic the epic to wrap
 * @return {epic} epic wrapped with error catch and re-subscribe functionalities.S
 */
const defaultEpicWrapper = k => epic => (...args) =>
    epic(...args).catch((error, source) => {
        setTimeout(() => {
            // eslint-disable-next-line
            console.error(`Error in epic ${k}. Source`, error);
            // throw anyway error to allow catch.
            throw error;
        }, 0);
        return source;
    });

/**
 * Wraps a key-value epics with the given wrapper.
 * @memberof utils.EpicsUtils
 * @param {object} epics the epics set to wrap
 * @param {function} wrapper the wrapper to use (by default the defaultEpicWrapper is used)
 * @return {array} the wrapped epics list as an array (usable as an input to redux-observable combineEpics function).
 */
export const wrapEpics = (epics, wrapper = defaultEpicWrapper) =>
    Object.keys(epics).map(k => wrapper(k)(epics[k]) );
