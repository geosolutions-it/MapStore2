/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const NodeEditor = require('../NodeEditor');
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
