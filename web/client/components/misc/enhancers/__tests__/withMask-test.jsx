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
        expect(document.querySelector('#test')).toExist();
        expect(document.querySelector('.ms2-mask-container')).toExist();
        expect(document.querySelector('.ms2-mask')).toNotExist();
    });
    it('withMask rendering mask', () => {
        const Sink = withMask(({test}) => test, () => <div id="mask"></div>)(() => <div id="test">test</div>);
        ReactDOM.render(<Sink test/>, document.getElementById("container"));
        expect(document.querySelector('#test')).toExist();
        expect(document.querySelector('.ms2-mask-container')).toExist();
        expect(document.querySelector('.ms2-mask')).toExist();
        expect(document.querySelector('#mask')).toExist();
        ReactDOM.render(<Sink test={false} />, document.getElementById("container"));
        expect(document.querySelector('.ms2-mask-container')).toExist();
        expect(document.querySelector('.ms2-mask')).toNotExist();
        expect(document.querySelector('#mask')).toNotExist();
    });
    it('withMask alwaysWrap option', () => {
        const Sink = withMask(
            ({ test }) => test,
            () => <div id="mask"></div>,
            {
                alwaysWrap: false
            })(() => <div id="test">test</div>);
        ReactDOM.render(<Sink test />, document.getElementById("container"));
        expect(document.querySelector('#test')).toExist();
        expect(document.querySelector('.ms2-mask-container')).toExist();
        expect(document.querySelector('.ms2-mask')).toExist();
        expect(document.querySelector('#mask')).toExist();
        ReactDOM.render(<Sink test={false} />, document.getElementById("container"));
        expect(document.querySelector('#test')).toExist();
        expect(document.querySelector('.ms2-mask-container')).toNotExist();
        expect(document.querySelector('.ms2-mask')).toNotExist();
        expect(document.querySelector('#mask')).toNotExist();
    });
    it('withMask add custom className', () => {
        const Sink = withMask(undefined, undefined, {className: 'custom-class'})(() => <div id="test">test</div>);
        ReactDOM.render(<Sink />, document.getElementById("container"));
        expect(document.querySelector('#test')).toExist();
        expect(document.querySelector('.ms2-mask-container')).toExist();
        expect(document.querySelector('.ms2-mask')).toNotExist();
        expect(document.querySelector('.custom-class')).toExist();
    });
});
