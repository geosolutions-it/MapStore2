import expect from 'expect';
import { testEpic } from '../../../../epics/__tests__/epicTestUtils';
import { CONTROL_NAME } from '../../constants';

import { UPDATE_ADDITIONAL_LAYER } from '../../../../actions/additionallayers';
import { setControlProperty } from '../../../../actions/controls';

import { streetViewSyncLayer, streetViewSetupTearDown } from '../streetView';
import { updateStreetViewLayer } from '../../actions/streetView';
import { REGISTER_EVENT_LISTENER } from '../../../../actions/map';

describe('StreetView epics', () => {
    it('updateStreetViewLayer', (done) => {
        let action = updateStreetViewLayer({_v_: 1});
        const NUM_ACTIONS = 1;
        testEpic(streetViewSyncLayer, NUM_ACTIONS, action, ([update]) => {
            expect(update).toExist();
            expect(update.type).toBe(UPDATE_ADDITIONAL_LAYER);
            expect(update.options._v_).toEqual(1); // the update is applied to the default layer.
            done();
        });
    });
    it('streetViewSetupTearDown', (done) => {
        let action = setControlProperty(CONTROL_NAME, 'enabled', false);
        const NUM_ACTIONS = 2;
        testEpic(streetViewSetupTearDown, NUM_ACTIONS, action, ([
            register,
            updateAdditionalLayers
        ]) => {
            expect(register.type).toBe(REGISTER_EVENT_LISTENER);
            expect(register.eventName).toBe('click');
            expect(register.toolName).toBe(CONTROL_NAME);
            expect(updateAdditionalLayers.type).toBe(UPDATE_ADDITIONAL_LAYER);
            done();
        }, {
            streetView: {
                location: {
                    latLng: {
                        lat: 1,
                        lng: 2
                    }
                }
            },
            controls: {
                [CONTROL_NAME]: {
                    enabled: true
                }
            }
        });
    });
    it('streetViewSetupTearDown for mapillary', (done) => {
        let action = setControlProperty(CONTROL_NAME, 'enabled', false);
        const NUM_ACTIONS = 2;
        testEpic(streetViewSetupTearDown, NUM_ACTIONS, action, ([
            register,
            updateAdditionalLayers
        ]) => {
            try {
                expect(register.type).toBe(REGISTER_EVENT_LISTENER);
                expect(register.eventName).toBe('click');
                expect(register.toolName).toBe(CONTROL_NAME);
                expect(updateAdditionalLayers.type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(updateAdditionalLayers.options.id).toBe('street-view-data');
                expect(updateAdditionalLayers.options.features.length).toBe(2);
            } catch (e) {
                done(e);
            }
            done();
        }, {
            streetView: {
                location: {
                    latLng: {
                        lat: 1,
                        lng: 2
                    }
                },
                configuration: {
                    provider: 'mapillary',
                    providerSettings: {
                        ApiURL: "base/web/client/test-resources/mapillary/output/run_04/"
                    }
                }
            },
            controls: {
                [CONTROL_NAME]: {
                    enabled: true
                }
            }
        });
    });
});
