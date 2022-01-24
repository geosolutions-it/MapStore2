import expect from 'expect';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from '../../../epics/__tests__/epicTestUtils';

import { UPDATE_ADDITIONAL_LAYER } from '../../../actions/additionallayers';

import { streetViewSyncLayer } from '../epics/streetView';
import { setPov, setLocation } from '../actions/streetView';

describe('StreetView epics', () => {
    it('update layer on setLocation', (done) => {
        let action = setLocation({});
        const NUM_ACTIONS = 1;
        const LAT = 1;
        const LNG = 2;
        testEpic(streetViewSyncLayer, NUM_ACTIONS, action, ([update]) => {
            expect(update).toExist();
            expect(update.type).toBe(UPDATE_ADDITIONAL_LAYER);
            expect(update.options.features[0].geometry.coordinates).toEqual([LNG, LAT]);
            done();
        }, {streetView: {location: {latLng: {lat: LAT, lng: LNG}}}});
    });
    it('update layer on setPov', (done) => {
        let action = setPov({});
        const NUM_ACTIONS = 1;
        const LAT = 1;
        const LNG = 2;
        const rotation = 42;
        testEpic(streetViewSyncLayer, NUM_ACTIONS, action, ([update]) => {
            expect(update).toExist();
            expect(update.type).toBe(UPDATE_ADDITIONAL_LAYER);
            expect(update.options.features[0].geometry.coordinates).toEqual([LNG, LAT]);
            expect(decodeURIComponent(update.options.features[0].style[0].symbolUrl).includes(`rotate(${rotation})`)).toBeTruthy();
            done();
        }, {streetView: {pov: {heading: rotation}, location: {latLng: {lat: LAT, lng: LNG}}}});
    });
    it('prevent layer to be updated if location is not set', (done) => {
        let action = setPov({});
        const NUM_ACTIONS = 1;
        testEpic(addTimeoutEpic(streetViewSyncLayer, 50), NUM_ACTIONS, action, ([timeout]) => {
            expect(timeout).toExist();
            expect(timeout.type).toBe(TEST_TIMEOUT);
            done();
        }, {layers: {flat: [{name: "layerName", url: "clearlyNotAUrl", visibility: true, queryable: false, type: "wms"}]}});
    });
});
