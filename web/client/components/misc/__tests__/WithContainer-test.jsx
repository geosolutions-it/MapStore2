/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const withContainer = require('../WithContainer');
const Portal = withContainer(require('react-overlays').Portal);
const expect = require('expect');
const ConfigUtils = require('../../../utils/ConfigUtils');

describe('WithContainer Overlay', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="main-conatiner" class="custom"><div id="container"><div><div id="old-container"></div></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test with default custom class', () => {
        ConfigUtils.setConfigProp('themePrefix', 'custom');
        const cmp = ReactDOM.render(<div id="old-portal-container"><Portal><div className="portal-child"/></Portal></div>, document.getElementById("old-container"));
        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        expect(document.getElementById('container').querySelector('.portal-child')).toExist();
        expect(document.getElementById('old-portal-container').querySelector('.portal-child')).toBe(null);
    });
});
