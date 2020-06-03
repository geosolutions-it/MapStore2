/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

import { testEpic } from './epicTestUtils';

import {
    onDetailsControlEnabledChangeEpic,
    mapCloseDetailsEpic,
    mapSaveDetailsEpic
} from '../details';
import {
    setControlProperty,
    SET_CONTROL_PROPERTY
} from '../../actions/controls';
import {
    save,
    close,
    LOADING,
    EDIT,
    SET_EDITED_SETTINGS,
    SET_CONTENT,
    SET_SETTINGS,
    SAVE_SUCCESS
} from '../../actions/details';
import {
    CLOSE_FEATURE_GRID
} from '../../actions/featuregrid';
import {
    SHOW_NOTIFICATION
} from '../../actions/notifications';

describe('details epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('onDetailsControlEnabledChangeEpic enable no content', (done) => {
        const startActions = [setControlProperty('details', 'enabled', true)];

        mockAxios.onGet('/rest/geostore/data/12383').reply(200, 'detailsContent');

        testEpic(onDetailsControlEnabledChangeEpic, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(EDIT);
            expect(actions[0].active).toNotExist();
            expect(actions[1].type).toBe(SET_EDITED_SETTINGS);
            expect(actions[2].type).toBe(CLOSE_FEATURE_GRID);
            expect(actions[3].type).toBe(SET_CONTENT);
            expect(actions[3].content).toBe('detailsContent');
        }, {
            map: {
                present: {
                    info: {
                        details: 'rest%2Fgeostore%2Fdata%2F12383%2Fraw%3Fdecode%3Ddatauri'
                    }
                }
            },
            controls: {
                details: {
                    enabled: true
                }
            }
        }, done);
    });
    it('onDetailsControlEnabledChangeEpic enable with content', (done) => {
        const startActions = [setControlProperty('details', 'enabled', true)];

        testEpic(onDetailsControlEnabledChangeEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(EDIT);
            expect(actions[0].active).toNotExist();
            expect(actions[1].type).toBe(SET_EDITED_SETTINGS);
            expect(actions[2].type).toBe(CLOSE_FEATURE_GRID);
        }, {
            map: {
                present: {
                    info: {
                        details: 'rest%2Fgeostore%2Fdata%2F12383%2Fraw%3Fdecode%3Ddatauri'
                    }
                }
            },
            details: {
                content: 'content'
            },
            controls: {
                details: {
                    enabled: true
                }
            }
        }, done);
    });
    it('onDetailsControlEnabledChangeEpic disable', (done) => {
        const startActions = [setControlProperty('details', 'enabled', false)];

        testEpic(onDetailsControlEnabledChangeEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(SET_EDITED_SETTINGS);
            expect(actions[0].settings).toNotExist();
        }, {
            map: {
                present: {
                    info: {
                        details: 'rest%2Fgeostore%2Fdata%2F12383%2Fraw%3Fdecode%3Ddatauri'
                    }
                }
            },
            details: {
                content: 'content'
            },
            controls: {
                details: {
                    enabled: false
                }
            }
        }, done);
    });
    it('mapCloseDetailsEpic', (done) => {
        const startActions = [close()];

        mockAxios.onPut().reply(config => {
            try {
                expect(config.url).toMatch(/.*\/resource\/10\/.*/);
                const dataJSON = JSON.parse(config.data);
                expect(dataJSON).toExist();
                expect(dataJSON.restAttribute?.name).toBe('detailsSettings');
            } catch (e) {
                done(e);
            }
            return [200, {}];
        });

        testEpic(mapCloseDetailsEpic, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[2].type).toBe(SET_SETTINGS);
            expect(actions[2].settings).toEqual({
                setting: false
            });
            expect(actions[3].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[3].control).toBe('details');
            expect(actions[3].property).toBe('enabled');
            expect(actions[3].value).toBe(false);
            expect(actions[4].type).toBe(LOADING);
        }, {
            map: {
                present: {
                    mapId: 10
                }
            },
            details: {
                settings: {
                    setting: true
                },
                editedSettings: {
                    setting: false
                }
            }
        }, done);
    });
    it('mapSaveDetailsEpic existing details', (done) => {
        const startActions = [save()];

        mockAxios.onGet('/resources/resource/10/permissions').reply(200, {SecurityRuleList: {SecurityRule: []}});
        mockAxios.onPut('/data/12383').reply(200, 12383);
        mockAxios.onPost('/resources/resource/12383/permissions').reply(200, {});

        testEpic(mapSaveDetailsEpic, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[2].type).toBe(SET_CONTENT);
            expect(actions[3].type).toBe(SAVE_SUCCESS);
            expect(actions[4].type).toBe(LOADING);
        }, {
            map: {
                present: {
                    info: {
                        details: 'rest%2Fgeostore%2Fdata%2F12383%2Fraw%3Fdecode%3Ddatauri'
                    },
                    mapId: 10
                }
            },
            details: {
                editing: true,
                editedContent: 'editedContent'
            }
        }, done);
    });
    it('mapSaveDetailsEpic new details', (done) => {
        const startActions = [save()];

        mockAxios.onGet('/resources/resource/10/permissions').reply(200, {SecurityRuleList: {SecurityRule: []}});
        mockAxios.onPost('/resources/').reply(200, 12383);
        mockAxios.onPut('/resources/resource/10/attributes/').reply(config => {
            try {
                const dataJSON = JSON.parse(config.data);
                expect(dataJSON).toExist();
                expect(dataJSON.restAttribute?.name).toBe('details');
            } catch (e) {
                done(e);
            }
            return [200, {}];
        });
        mockAxios.onPost('/resources/resource/12383/permissions').reply(200, {});

        testEpic(mapSaveDetailsEpic, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[2].type).toBe(SET_CONTENT);
            expect(actions[3].type).toBe(SAVE_SUCCESS);
            expect(actions[4].type).toBe(LOADING);
        }, {
            map: {
                present: {
                    info: {},
                    mapId: 10
                }
            },
            details: {
                editing: true,
                editedContent: 'editedContent'
            }
        }, done);
    });
});
