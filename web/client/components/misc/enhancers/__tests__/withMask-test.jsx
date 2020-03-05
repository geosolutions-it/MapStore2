/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const withMask = require('../withMask');

describe('withMask enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withMask rendering with defaults', () => {
        const Sink = withMask()(() => <div id="test">test</div>);
        ReactDOM.render(<Sink />, document.getElementById("container"));
        expect(document.querySelector('#test')).toBeTruthy();
        expect(document.querySelector('.ms2-mask-container')).toBeTruthy();
        expect(document.querySelector('.ms2-mask')).toBeFalsy();
    });
    it('withMask rendering mask', () => {
        const Sink = withMask(({test}) => test, () => <div id="mask"></div>)(() => <div id="test">test</div>);
        ReactDOM.render(<Sink test/>, document.getElementById("container"));
        expect(document.querySelector('#test')).toBeTruthy();
        expect(document.querySelector('.ms2-mask-container')).toBeTruthy();
        expect(document.querySelector('.ms2-mask')).toBeTruthy();
        expect(document.querySelector('#mask')).toBeTruthy();
        ReactDOM.render(<Sink test={false} />, document.getElementById("container"));
        expect(document.querySelector('.ms2-mask-container')).toBeTruthy();
        expect(document.querySelector('.ms2-mask')).toBeFalsy();
        expect(document.querySelector('#mask')).toBeFalsy();
    });
    it('withMask alwaysWrap option', () => {
        const Sink = withMask(
            ({ test }) => test,
            () => <div id="mask"></div>,
            {
                alwaysWrap: false
            })(() => <div id="test">test</div>);
        ReactDOM.render(<Sink test />, document.getElementById("container"));
        expect(document.querySelector('#test')).toBeTruthy();
        expect(document.querySelector('.ms2-mask-container')).toBeTruthy();
        expect(document.querySelector('.ms2-mask')).toBeTruthy();
        expect(document.querySelector('#mask')).toBeTruthy();
        ReactDOM.render(<Sink test={false} />, document.getElementById("container"));
        expect(document.querySelector('#test')).toBeTruthy();
        expect(document.querySelector('.ms2-mask-container')).toBeFalsy();
        expect(document.querySelector('.ms2-mask')).toBeFalsy();
        expect(document.querySelector('#mask')).toBeFalsy();
    });
    it('withMask add custom className', () => {
        const Sink = withMask(undefined, undefined, {className: 'custom-class'})(() => <div id="test">test</div>);
        ReactDOM.render(<Sink />, document.getElementById("container"));
        expect(document.querySelector('#test')).toBeTruthy();
        expect(document.querySelector('.ms2-mask-container')).toBeTruthy();
        expect(document.querySelector('.ms2-mask')).toBeFalsy();
        expect(document.querySelector('.custom-class')).toBeTruthy();
    });
});
