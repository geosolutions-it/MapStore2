/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import ContentWrapper from '../ContentWrapper';
describe('ContentWrapper component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults and with content', () => {
        const container = document.getElementById('container');
        ReactDOM.render(<ContentWrapper />, document.getElementById("container"));
        expect(container.querySelector('.ms-content')).toExist();
        expect(container.querySelector('.ms-content .ms-content-body')).toExist(); // has body
        ReactDOM.render(<ContentWrapper><div className="TEST"></div></ContentWrapper>, document.getElementById("container"));
        expect(container.querySelector('.ms-content')).toExist();
        expect(container.querySelector('.ms-content .ms-content-body .TEST')).toExist();
    });
    it('rendering with props(type, contentStyleWrapper)', () => {
        const container = document.getElementById('container');
        ReactDOM.render(<ContentWrapper type="text" contentWrapperStyle={{position: "absolute"}}/>, document.getElementById("container"));
        expect(container.querySelector('.ms-content-text')).toExist();
        expect(container.querySelector('.ms-content-text .ms-content-body')).toExist(); // has body
        expect(container.querySelector('.ms-content').style.position).toBe('absolute');
    });
    it('inViewRef applied to the container', done => {
        const callback = ref => {
            if (ref) {
                // check ref is the content object
                expect(ref.className.indexOf("ms-content")).toBeGreaterThanOrEqualTo(0);
                done();
            }
        };
        ReactDOM.render(<ContentWrapper inViewRef={callback} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
    });
    it('test classes generated from default props', () => {
        const DEFAULT_THEME_CLASS_NAME = 'ms-bright';
        const DEFAULT_ALIGN_CLASS_NAME = 'ms-align-center';
        const DEFAULT_SIZE_CLASS_NAME = 'ms-size-large';
        ReactDOM.render(<ContentWrapper type="text"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
        expect(el.getAttribute('class')).toBe(`ms-content ms-content-text ${DEFAULT_THEME_CLASS_NAME} ${DEFAULT_ALIGN_CLASS_NAME} ${DEFAULT_SIZE_CLASS_NAME}`);
    });
    it('test classes generated from theme prop', () => {
        const THEME = 'dark';
        const THEME_CLASS_NAME = `ms-${THEME}`;
        const DEFAULT_ALIGN_CLASS_NAME = 'ms-align-center';
        const DEFAULT_SIZE_CLASS_NAME = 'ms-size-large';
        ReactDOM.render(<ContentWrapper type="text" theme={THEME}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
        expect(el.getAttribute('class')).toBe(`ms-content ms-content-text ${THEME_CLASS_NAME} ${DEFAULT_ALIGN_CLASS_NAME} ${DEFAULT_SIZE_CLASS_NAME}`);
    });
    it('test classes generated from align prop', () => {
        const ALIGN = 'right';
        const DEFAULT_THEME_CLASS_NAME = 'ms-bright';
        const ALIGN_CLASS_NAME = `ms-align-${ALIGN}`;
        const DEFAULT_SIZE_CLASS_NAME = 'ms-size-large';
        ReactDOM.render(<ContentWrapper type="text" align={ALIGN}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
        expect(el.getAttribute('class')).toBe(`ms-content ms-content-text ${DEFAULT_THEME_CLASS_NAME} ${ALIGN_CLASS_NAME} ${DEFAULT_SIZE_CLASS_NAME}`);
    });
    it('test classes generated from size prop', () => {
        const SIZE = 'medium';
        const DEFAULT_THEME_CLASS_NAME = 'ms-bright';
        const DEFAULT_ALIGN_CLASS_NAME = 'ms-align-center';
        const SIZE_CLASS_NAME = `ms-size-${SIZE}`;
        ReactDOM.render(<ContentWrapper type="text" size={SIZE}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
        expect(el.getAttribute('class')).toBe(`ms-content ms-content-text ${DEFAULT_THEME_CLASS_NAME} ${DEFAULT_ALIGN_CLASS_NAME} ${SIZE_CLASS_NAME}`);
    });
    it('test classes generated from size prop', () => {
        const DEFAULT_THEME_CLASS_NAME = 'ms-bright';
        const DEFAULT_ALIGN_CLASS_NAME = 'ms-align-center';
        const SIZE_CLASS_NAME = 'ms-size-large';
        ReactDOM.render(<ContentWrapper type="text"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
        expect(el.getAttribute('class')).toBe(`ms-content ms-content-text ${DEFAULT_THEME_CLASS_NAME} ${DEFAULT_ALIGN_CLASS_NAME} ${SIZE_CLASS_NAME}`);
    });
});
