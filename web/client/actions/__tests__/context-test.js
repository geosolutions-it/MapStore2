import expect from 'expect';
import {
    loadContext, LOAD_CONTEXT,
    setContext, SET_CURRENT_CONTEXT,
    loading, LOADING,
    setResource, SET_RESOURCE,
    contextLoadError, CONTEXT_LOAD_ERROR,
    loadFinished, LOAD_FINISHED
} from '../context';
describe('context actions', () => {
    it('loadContext', () => {
        const mapId = "test";
        const contextName = "contextName";
        const retVal = loadContext({ mapId, contextName });
        expect(retVal).toExist();
        expect(retVal.type).toBe(LOAD_CONTEXT);
        expect(retVal.mapId).toBe(mapId);
        expect(retVal.contextName).toBe(contextName);
    });
    it('setContext', () => {
        const context = {};
        const retVal = setContext(context);
        expect(retVal).toExist();
        expect(retVal.type).toBe(SET_CURRENT_CONTEXT);
        expect(retVal.context).toBe(context);
    });
    it('setResource', () => {
        const resource = {};
        const retVal = setResource(resource);
        expect(retVal).toExist();
        expect(retVal.type).toBe(SET_RESOURCE);
        expect(retVal.resource).toBe(resource);
    });
    it('loading', () => {
        // defaults
        const action = loading(false);
        expect(action.type).toBe(LOADING);
        expect(action.value).toBe(false);
        // with sample values
        const action2 = loading(true, "saving");
        expect(action2.type).toBe(LOADING);
        expect(action2.value).toBe(true);
        expect(action2.name).toBe("saving");
    });
    it('contextLoadError', () => {
        const ERROR = Error("test");
        const retVal = contextLoadError({ error: ERROR });
        expect(retVal).toExist();
        expect(retVal.type).toBe(CONTEXT_LOAD_ERROR);
        expect(retVal.error).toBe(ERROR);
    });
    it('loadFinished', () => {
        const retVal = loadFinished();
        expect(retVal).toExist();
        expect(retVal.type).toBe(LOAD_FINISHED);
    });
});
