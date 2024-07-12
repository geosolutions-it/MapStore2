import expect from 'expect';
import {
    setAPILoading, API_LOADING,
    streetViewAPILoaded, API_LOADED,
    setLocation, SET_LOCATION,
    setPov, SET_POV,
    configure, CONFIGURE,
    reset, RESET,
    toggleStreetView,
    updateStreetViewLayer, UPDATE_STREET_VIEW_LAYER,
    resetViewerData, RESET_STREET_VIEW_DATA
} from '../streetView';
import { TOGGLE_CONTROL } from '../../../../actions/controls';
import { CONTROL_NAME } from '../../constants';


describe('StreetView actions', () => {
    it('setAPILoading', () => {
        const loading = true;
        const ret = setAPILoading(loading);
        expect(ret).toExist();
        expect(ret.type).toBe(API_LOADING);
        expect(ret.loading).toBe(loading);
    });
    it('streetViewAPILoaded', () => {
        const provider = "google";
        const ret = streetViewAPILoaded(provider);
        expect(ret).toExist();
        expect(ret.type).toBe(API_LOADED);
        expect(ret.provider).toBe(provider);
    });
    it('setLocation', () => {
        const location = "TEST_LOCATION";
        const ret = setLocation(location);
        expect(ret).toExist();
        expect(ret.type).toBe(SET_LOCATION);
        expect(ret.location).toBe(location);
    });
    it('setPov', () => {
        const pov = "TEST_POV";
        const ret = setPov(pov);
        expect(ret).toExist();
        expect(ret.type).toBe(SET_POV);
        expect(ret.pov).toBe(pov);
    });
    it('configure', () => {
        const configuration = "TEST_CONFIG";
        const ret = configure(configuration);
        expect(ret).toExist();
        expect(ret.type).toBe(CONFIGURE);
        expect(ret.configuration).toBe(configuration);
    });
    it('reset', () => {
        const ret = reset();
        expect(ret).toExist();
        expect(ret.type).toBe(RESET);
    });
    it('toggleStreetView', (done) => {
        const ret = toggleStreetView();
        expect(ret).toExist();
        const dispatch = (action) => {
            switch (action.type) {
            case API_LOADING:
                expect(action).toExist();
                expect(action.type).toBe(API_LOADING);
                expect(action.loading).toBe(true);
                break;
            case API_LOADED:
                expect(action).toExist();
                expect(action.type).toBe(API_LOADED);
                expect(action.provider).toBe("cyclomedia");
                done();
                break;
            case TOGGLE_CONTROL:
                // at the end it opens the effective window
                expect(action).toExist();
                expect(action.type).toBe(TOGGLE_CONTROL);
                expect(action.control).toBe(CONTROL_NAME);
                expect(action.property).toBe("enabled");
                done();
                break;
            default:
                break;
            }


        };
        const getState = () => ({
            streetView: {
                configuration: {provider: "cyclomedia"} // mock
            }
        });
        ret(dispatch, getState);
    });
    it('updateStreetViewLayer', () => {
        const updates = {_v_: 1};
        const ret = updateStreetViewLayer(updates);
        expect(ret).toExist();
        expect(ret.type).toBe(UPDATE_STREET_VIEW_LAYER);
        expect(ret.updates).toBe(updates);
    });
    it('resetViewerData', () => {
        const ret = resetViewerData();
        expect(ret).toExist();
        expect(ret.type).toBe(RESET_STREET_VIEW_DATA);
    });
});
