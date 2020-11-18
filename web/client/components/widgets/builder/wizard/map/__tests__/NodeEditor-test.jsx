/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import NodeEditor from '../NodeEditor';
describe('NodeEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('NodeEditor rendering with defaults', () => {
        ReactDOM.render(<NodeEditor settings={{ nodeType: 'layers' }} tabs={[{
            id: 'general',
            titleId: 'layerProperties.general',
            tooltipId: 'layerProperties.general',
            glyph: 'wrench',
            visible: true,
            Component: createSink(() => {})
        }]} element={{}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        // search the icon rendered
        const el = container.querySelector('.glyphicon-wrench');
        expect(el).toExist();
    });
});
