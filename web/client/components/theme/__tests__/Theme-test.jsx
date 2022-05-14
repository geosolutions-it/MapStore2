/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import url from 'url';
import Theme from '../Theme';
import { act } from 'react-dom/test-utils';

describe('Theme', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        const stylesheet = document.getElementById('theme_stylesheet');
        if (stylesheet) {
            stylesheet.parentNode.removeChild(stylesheet);
        }
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test add theme with no version', () => {
        const version = 'no-version';
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        });
        const style = document.getElementById('theme_stylesheet');
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test add theme with base template', () => {
        const version = '${mapstore2.version}';
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        });
        const style = document.getElementById('theme_stylesheet');
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test add theme with version', () => {
        const version = 'DEV';
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        });
        const style = document.getElementById('theme_stylesheet');
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css?DEV');
    });

    it('test change theme', () => {
        const version = 'DEV';
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        });
        let style = document.getElementById('theme_stylesheet');

        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css?DEV');
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" theme="custom" themeElement="theme_stylesheet" version={version}/>, document.getElementById("container"));
        });
        style = document.getElementById('theme_stylesheet');
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/custom.css?DEV');

    });

    it('test after load', (done) => {
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet" version="no-version" onLoad={() => {
                done();
            }}/>, document.getElementById("container"));
        });
        let style = document.getElementById('theme_stylesheet');
        expect(style).toBeTruthy();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test after load with existing theme', (done) => {
        // add a style with the same id in the page
        const themeElement = 'theme_stylesheet';
        const link = document.createElement('link');
        link.setAttribute('id', 'theme_stylesheet');
        link.setAttribute('href', '/base/web/client/test-resources/themes/default.css');
        document.head.appendChild(link);
        act(() => {
            ReactDOM.render(<Theme
                path="/base/web/client/test-resources/themes"
                themeElement={themeElement}
                version="no-version"
                onLoad={() => {
                    done();
                }}/>,
            document.getElementById("container"));
        });
        let style = document.getElementById('theme_stylesheet');
        expect(style).toBeTruthy();
        expect(url.parse(style.href).path).toBe('/base/web/client/test-resources/themes/default.css');
    });

    it('test undefined version', () => {
        act(() => {
            ReactDOM.render(<Theme path="/base/web/client/test-resources/themes" themeElement="theme_stylesheet"/>, document.getElementById("container"));
        });
        let style = document.getElementById('theme_stylesheet');
        expect(style).toBeFalsy();
    });

});
