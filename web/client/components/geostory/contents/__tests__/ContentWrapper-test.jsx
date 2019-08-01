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
        }
        ReactDOM.render(<ContentWrapper inViewRef={callback} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
    });

});
