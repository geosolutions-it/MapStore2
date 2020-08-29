/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import LayerInfo from '../LayerInfo';

describe('LayerInfo component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('default rendering', () => {
        ReactDOM.render(<LayerInfo/>, document.getElementById('container'));
        expect(document.getElementsByClassName('layerinfo-content')[0]).toExist();
    });
    it('rendering with a layer with title translations', () => {
        const testLayer = {
            id: 'layerId',
            title: {
                'default': 'default title',
                'en-US': 'english title'
            },
            name: 'layername',
            url: 'url'
        };
        ReactDOM.render(<LayerInfo layers={[testLayer]} currentLocale="en-US"/>, document.getElementById('container'));
        expect(document.getElementsByClassName('layerinfo-content')[0]).toExist();
        expect(document.getElementsByClassName('mapstore-side-card')?.length).toBe(1);
        expect(document.querySelector('.mapstore-side-card-title > span')?.textContent).toBe('english title');
    });
});
