/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const url = require('url');
const Theme = require('../Theme');

describe('Theme', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test add theme with no version', () => {
        const version = 'no-version';
        const theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        const style = document.getElementById('theme_stylesheet');
        expect(theme).toExist();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test add theme with base template', () => {
        document.head.removeChild(document.getElementById('theme_stylesheet'));
        const version = '${mapstore2.version}';
        const theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        const style = document.getElementById('theme_stylesheet');
        expect(theme).toExist();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test add theme with version', () => {
        document.head.removeChild(document.getElementById('theme_stylesheet'));
        const version = 'DEV';
        const theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        const style = document.getElementById('theme_stylesheet');
        expect(theme).toExist();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css?DEV');
    });

    it('test change theme', () => {
        document.head.removeChild(document.getElementById('theme_stylesheet'));
        const version = 'DEV';
        let theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        let style = document.getElementById('theme_stylesheet');
        expect(theme).toExist();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css?DEV');

        theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" theme="custom" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        style = document.getElementById('theme_stylesheet');
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/custom.css?DEV');

    });

    it('test after load', (done) => {
        document.head.removeChild(document.getElementById('theme_stylesheet'));
        let theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version="no-version" onLoad={() => {
            done();
        }}/>, document.getElementById("container"));
        expect(theme).toExist();
        let style = document.getElementById('theme_stylesheet');
        expect(style).toExist();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test after load with existing theme', (done) => {
        document.getElementById('theme_stylesheet').onload = null;
        // theme_stylesheet has not been removed from header for current test
        let theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version="no-version" onLoad={() => {
            done();
        }}/>, document.getElementById("container"));
        expect(theme).toExist();
        let style = document.getElementById('theme_stylesheet');
        expect(style).toExist();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test undefined version', () => {
        document.head.removeChild(document.getElementById('theme_stylesheet'));
        let theme = ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet"/>, document.getElementById("container"));
        expect(theme).toExist();
        let style = document.getElementById('theme_stylesheet');
        expect(style).toNotExist();
    });

});
