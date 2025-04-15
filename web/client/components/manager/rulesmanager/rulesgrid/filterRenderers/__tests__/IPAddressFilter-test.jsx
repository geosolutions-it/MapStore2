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
import IPAddressFilter from '../IPAddressFilter';
import { Provider } from 'react-redux';

describe('IPAddressFilter', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Load ipaddress filter', () => {
        const store = {
            getState: () => ({
                maptype: {
                    mapType: 'sink'
                }
            }),
            subscribe: () => { }
        };
        ReactDOM.render(<Provider store={store}><IPAddressFilter /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input).toExist();
        expect(input.placeholder).toEqual('rulesmanager.placeholders.ipRange');
    });
});
