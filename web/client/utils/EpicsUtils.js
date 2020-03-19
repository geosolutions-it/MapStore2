/**
 * Default wrapper for the epics. This avoids to close all epics system for unhandled exceptions.
 * It allows also to identify the error showing in console the name of the epic that triggered the exception and the error.
 * At the end, it throws the exception again so it can be automatically intercepted in dev tools.
 * @memberof utils.EpicsUtils
 * @param {epic} the epic to wrap
 * @param {string} [key] the name of the epic
 * @returns {epic} the epic with error handling functionalities
 */
const defaultEpicWrapper = (epic, k = "--unknown--") => (...args) =>
    epic(...args).catch((error, source) => {
        // eslint-disable-next-line
        console.error(`Error in epic "${k}". Original error:`, error);
        setTimeout(() => {
            // throw anyway error
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
    Object.keys(epics).map(k => wrapper(epics[k], k));
