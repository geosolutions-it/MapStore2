/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import LayersFilter from '../LayersFilter';
import { Provider } from 'react-redux';

describe('LayersFilter', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Load Layer', () => {
        const store = {
            getState: () => ({
                maptype: {
                    mapType: 'sink'
                }
            }),
            subscribe: () => { }
        };
        ReactDOM.render(<Provider store={store}><LayersFilter /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input).toExist();
    });
    it('test Layer with no filter value of instanace in case stand-alone "geofence"', () => {
        const store = {
            getState: () => ({
                maptype: {
                    mapType: 'sink'
                },
                rulesmanager: {
                    filters: {
                        instance: undefined
                    }
                }
            }),
            subscribe: () => { }
        };
        ReactDOM.render(<Provider store={store}><LayersFilter /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input).toExist();
        expect(input.disabled).toBeTruthy();
    });
    it('test Layer with filter value of instanace in case stand-alone "geofence"', () => {
        const store = {
            getState: () => ({
                maptype: {
                    mapType: 'sink'
                },
                rulesmanager: {
                    filters: {
                        instance: "instnace1"
                    }
                }
            }),
            subscribe: () => { }
        };
        ReactDOM.render(<Provider store={store}><LayersFilter /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input).toExist();
        expect(input.disabled).toBeFalsy();
    });
});
