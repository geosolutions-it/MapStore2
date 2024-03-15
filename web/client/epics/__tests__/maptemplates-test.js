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
    mergeTemplateEpic,
    openMapTemplatesPanelEpic,
    replaceTemplateEpic,
    setAllowedTemplatesEpic
} from '../maptemplates';

import {
    openMapTemplatesPanel,
    setAllowedTemplates,
    SET_TEMPLATES,
    SET_MAP_TEMPLATES_LOADED,
    mergeTemplate,
    SET_TEMPLATE_LOADING,
    SET_TEMPLATE_DATA,
    replaceTemplate
} from '../../actions/maptemplates';

import {
    SET_CONTROL_PROPERTY
} from '../../actions/controls';
import { MAP_CONFIG_LOADED, MAP_INFO_LOADED } from '../../actions/config';

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
            maptemplates: {}
        }, done);
    });
    it('setAllowedTemplatesEpic with no allowed templates', (done) => {
        mockAxios.onPost('/resources/search/list').reply(config => get(config, 'params.includeAttributes', false) ? [200, {
            ResourceList: {
                Resource: []
            }
        }] : [404, {}]);
        testEpic(setAllowedTemplatesEpic, 2, setAllowedTemplates(), actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_TEMPLATES);
            expect(actions[0].templates).toExist();
            expect(actions[0].templates.length).toBe(0);
            expect(actions[1].type).toBe(SET_MAP_TEMPLATES_LOADED);
            expect(actions[1].loaded).toBe(true);
        }, {
            context: {
                currentContext: {
                    templates: []
                }
            },
            maptemplates: {}
        }, done);
    });
    it('mergeTemplateEpic with map data', (done) => {
        mockAxios.onGet().reply(200, {
            map: {}
        });
        testEpic(mergeTemplateEpic, 5, mergeTemplate("1"), actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(SET_TEMPLATE_LOADING);
            expect(actions[0].id).toBe("1");
            expect(actions[0].loadingValue).toBeTruthy();
            expect(actions[1].type).toBe(SET_TEMPLATE_DATA);
            expect(actions[1].id).toBe("1");
            expect(actions[1].data).toBeTruthy();
            expect(actions[2].type).toBe(MAP_CONFIG_LOADED);
            expect(actions[2].config).toBeTruthy();
            expect(actions[2].legacy).toBeTruthy();
            expect(actions[2].mapId).toBe("map1");
            expect(actions[3].type).toBe(MAP_INFO_LOADED);
            expect(actions[3].info).toEqual({id: "map1"});
            expect(actions[3].mapId).toBe("map1");
            expect(actions[4].type).toBe(SET_TEMPLATE_LOADING);
            expect(actions[4].id).toBe("1");
            expect(actions[4].loadingValue).toBeFalsy();
        }, {
            map: {
                present: {
                    zoom: 1,
                    info: {
                        id: "map1"
                    }
                }
            },
            layers: {
                flat: [{
                    id: "1",
                    visibility: true,
                    name: "test"
                }],
                groups: [{
                    id: "Default",
                    name: "Default",
                    title: "Default",
                    nodes: ["1"]
                }]
            },
            maptemplates: {templates: [{id: "1"}]}
        }, done);
    });
    it('mergeTemplateEpic - set setTemplateData when no map data in response', (done) => {
        mockAxios.onGet().reply(200, {});
        testEpic(mergeTemplateEpic, 3, mergeTemplate("1"), actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(SET_TEMPLATE_LOADING);
            expect(actions[0].id).toBe("1");
            expect(actions[0].loadingValue).toBeTruthy();
            expect(actions[1].type).toBe(SET_TEMPLATE_DATA);
            expect(actions[1].id).toBe("1");
            expect(actions[1].data).toBeTruthy();
            expect(actions[2].type).toBe(SET_TEMPLATE_LOADING);
            expect(actions[2].id).toBe("1");
            expect(actions[2].loadingValue).toBeFalsy();
        }, {
            map: {
                present: {
                    zoom: 1,
                    info: {
                        id: "map1"
                    }
                }
            },
            layers: {
                flat: [{
                    id: "1",
                    visibility: true,
                    name: "test"
                }],
                groups: [{
                    id: "Default",
                    name: "Default",
                    title: "Default",
                    nodes: ["1"]
                }]
            },
            maptemplates: {templates: [{id: "1"}]}
        }, done);
    });
    it('replaceTemplateEpic', (done) => {
        mockAxios.onGet().reply(200, {
            map: {}
        });
        testEpic(replaceTemplateEpic, 5, replaceTemplate("1"), actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(SET_TEMPLATE_LOADING);
            expect(actions[0].id).toBe("1");
            expect(actions[0].loadingValue).toBeTruthy();
            expect(actions[1].type).toBe(SET_TEMPLATE_DATA);
            expect(actions[1].id).toBe("1");
            expect(actions[1].data).toBeTruthy();
            expect(actions[2].type).toBe(MAP_CONFIG_LOADED);
            expect(actions[2].config).toBeTruthy();
            expect(actions[2].legacy).toBeTruthy();
            expect(actions[2].mapId).toBe("map1");
            expect(actions[3].type).toBe(MAP_INFO_LOADED);
            expect(actions[3].info).toEqual({id: "map1"});
            expect(actions[3].mapId).toBe("map1");
            expect(actions[4].type).toBe(SET_TEMPLATE_LOADING);
            expect(actions[4].id).toBe("1");
            expect(actions[4].loadingValue).toBeFalsy();
        }, {
            map: {
                present: {
                    zoom: 1,
                    info: {
                        id: "map1"
                    }
                }
            },
            layers: {
                flat: [{
                    id: "1",
                    visibility: true,
                    name: "test"
                }],
                groups: [{
                    id: "Default",
                    name: "Default",
                    title: "Default",
                    nodes: ["1"]
                }]
            },
            maptemplates: {templates: [{id: "1"}]}
        }, done);
    });
});
