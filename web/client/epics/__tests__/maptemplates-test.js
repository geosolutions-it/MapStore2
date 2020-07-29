/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { get } from 'lodash';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { testEpic } from './epicTestUtils';

import {
    openMapTemplatesPanelEpic,
    setAllowedTemplatesEpic
} from '../maptemplates';

import {
    openMapTemplatesPanel,
    setAllowedTemplates,
    SET_TEMPLATES,
    SET_MAP_TEMPLATES_LOADED
} from '../../actions/maptemplates';

import {
    SET_CONTROL_PROPERTY
} from '../../actions/controls';

let mockAxios;

describe('maptemplates epics', () => {
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
        mockAxios = null;
    });
    it('openMapTemplatesPanelEpic', (done) => {
        const epicResponse = actions => {
            expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
            done();
        };
        testEpic(openMapTemplatesPanelEpic, 1, openMapTemplatesPanel(), epicResponse);
    });
    it('setAllowedTemplatesEpic', (done) => {
        mockAxios.onPost('/resources/search/list').reply(config => get(config, 'params.includeAttributes', false) ? [200, {
            ResourceList: {
                Resource: [{
                    Attributes: {
                        attribute: {
                            "@type": 'STRING',
                            name: 'thumbnail',
                            value: 'thumbnail'
                        }
                    },
                    id: 1
                }, {
                    Attributes: {
                        attribute: {
                            "@type": 'STRING',
                            name: 'thumbnail',
                            value: 'thumbnail'
                        }
                    },
                    id: 2
                }]
            }
        }] : [404, {}]);
        testEpic(setAllowedTemplatesEpic, 2, setAllowedTemplates(), actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_TEMPLATES);
            expect(actions[0].templates).toExist();
            expect(actions[0].templates.length).toBe(2);
            expect(actions[0].templates[0]).toEqual({
                id: 1,
                thumbnail: 'thumbnail',
                dataLoaded: false,
                loading: false
            });
            expect(actions[0].templates[1]).toEqual({
                id: 2,
                thumbnail: 'thumbnail',
                dataLoaded: false,
                loading: false
            });
            expect(actions[1].type).toBe(SET_MAP_TEMPLATES_LOADED);
            expect(actions[1].loaded).toBe(true);
        }, {
            context: {
                currentContext: {
                    templates: [{
                        id: 1
                    }, {
                        id: 2
                    }]
                }
            },
            maptemplates: {},
            localConfig: {
                plugins: {
                    desktop: [
                        {name: "MapTemplates", cfg: {allowedTemplates: [{ id: 1 }]}}
                    ]
                }
            }
        }, done);
    });
});
