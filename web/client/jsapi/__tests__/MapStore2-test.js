/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ReactDOM from 'react-dom';

import { findIndex } from 'lodash';
import ConfigUtils from '../../utils/ConfigUtils';
import { INIT_MAP } from '../../actions/map';
import { MAP_CONFIG_LOADED } from '../../actions/config';
import { CHANGE_BROWSER_PROPERTIES } from '../../actions/browser';
import { LOCAL_CONFIG_LOADED } from '../../actions/localConfig';
import expect from 'expect';
import MapStore2 from '../MapStore2';
import { getApi, setApi } from '../../api/userPersistedStorage';

const testConfig = {
    versionURL: 'base/web/client/test-resources/version.txt',
    configUrl: 'base/web/client/test-resources/geostore/data/1#',
    originalUrl: 'base/web/client/test-resources/geostore/extjs/search/category/MAP/1.json#'
};

describe('MapStore2 API', () => {
    describe('loadConfigFromStorage', () => {
        let api = null;
        beforeEach(() => {
            api = getApi();
            setApi("localStorage");
            api.removeItem("mapstore.embedded");
        });
        it('not found mapstore.embedded in default storage', (done) => {
            const cfg = MapStore2.loadConfigFromStorage();
            expect(cfg).toBe(null);
            done();
        });
        it('found a result mapstore.embedded in default storage', (done) => {
            api.setItem("mapstore.embedded", JSON.stringify({"key": 2}));
            const cfg = MapStore2.loadConfigFromStorage();
            expect(cfg).toEqual({ key: 2 });
            done();
        });
        it('found a result mapstore.embedded in default storage', (done) => {
            expect(api.getItem("mapstore.embedded")).toBeFalsy();
            setApi("memoryStorage");
            api = getApi();
            api.setAccessDenied(true);
            const cfg = MapStore2.loadConfigFromStorage();
            expect(cfg).toEqual(null);
            api.setAccessDenied(false);
            done();
        });
    });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        ConfigUtils.setLocalConfigurationFile('base/web/client/test-resources/localConfig.json');
        ConfigUtils.setConfigProp('translationsPath', "base/web/client/translations");
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        ConfigUtils.setLocalConfigurationFile('localConfig.json');
        ConfigUtils.setConfigProp('translationsPath', "translations");
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapStore2 rendering with defaults', (done) => {

        MapStore2.create('container', {
            epics: {
                testEpic1: action$ => action$
                    .filter(a => a.type === CHANGE_BROWSER_PROPERTIES).do( () => {
                        //  CHANGE BROWSER PROPERTIES IS THE FIRST ACTION
                        done();
                    }).ignoreElements()
            },
            ...testConfig
        });
    });
    it.skip('initMap action called before map load action', (done) => {

        MapStore2.create('container', {
            epics: {
                testEpic1: action$ => action$
                    .bufferCount(6).do((actions) => {
                        expect(findIndex(actions, a => a.type === INIT_MAP)).toBeLessThan(findIndex(actions, a => a.type === MAP_CONFIG_LOADED));
                        done();
                    }).ignoreElements()
            },
            ...testConfig
        });
    });
    it('onAction', (done) => {

        MapStore2.create('container', {
            ...testConfig
        });
        MapStore2.onAction(MAP_CONFIG_LOADED, () => done());
    });
    it('offAction', (done) => {
        MapStore2.create('container', {
            epics: {
                testEpic1: action$ => action$
                    .bufferCount(5).do((actions) => {
                        // the action has been emitted but the listener has not been called
                        expect(findIndex(actions, a => a.type === LOCAL_CONFIG_LOADED)).toBeLessThan(5);
                        done();
                    }).ignoreElements()
            },
            ...testConfig
        });
        const listenerToDeactivate = () => expect(true).toBe(false);
        MapStore2.onAction(LOCAL_CONFIG_LOADED, listenerToDeactivate);
        MapStore2.offAction(LOCAL_CONFIG_LOADED, listenerToDeactivate);
    });
    it('onStateChange', (done) => {

        MapStore2.create('container', {
            ...testConfig
        });
        let counter = 0;
        MapStore2.onStateChange( state => {
            if (state.map) {
                // this has been triggered more than once before the map to be loaded
                expect(counter).toBeGreaterThan(0);
                done();
            } else {
                counter++;
            }
        });
    });
});
