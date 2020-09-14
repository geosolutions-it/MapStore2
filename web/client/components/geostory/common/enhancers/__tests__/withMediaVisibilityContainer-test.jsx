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
import ReactTestUtils from 'react-dom/test-utils';
import withMediaVisibilityContainer from '../withMediaVisibilityContainer';
import Media from '../../../../../components/geostory/media';

describe('withMediaVisibilityContainer HOC', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should show actual component when not lazy', (done) => {
        const DEBOUNCE_TIME = 1;
        const TestComponentWithVisibility = withMediaVisibilityContainer(() => <div className="test-component"></div>);
        ReactDOM.render(
            <div
                id="scroll-container"
                style={{ width: 512, height: 512, overflow: 'scroll' }}>
                <div style={{ height: 1024 }}></div>
                <TestComponentWithVisibility
                    lazy={false}
                    debounceTime={DEBOUNCE_TIME} />
            </div>,
            document.getElementById("container"));

        let container = document.getElementById('container');
        expect(container.querySelector('.ms-visibility-container')).toBeFalsy();
        expect(container.querySelector('.test-component')).toBeTruthy();
        done();
    });
    it('should not show actual component when lazy loading', (done) => {
        const DEBOUNCE_TIME = 1;
        const TestComponentWithVisibility = withMediaVisibilityContainer(() => <div className="test-component"></div>);
        ReactDOM.render(
            <div
                id="scroll-container"
                style={{ width: 512, height: 512, overflow: 'scroll' }}>
                <div style={{ height: 1024 }}></div>
                <TestComponentWithVisibility
                    lazy
                    debounceTime={DEBOUNCE_TIME} />
            </div>,
            document.getElementById("container"));

        let container = document.getElementById('container');
        expect(container.querySelector('.ms-visibility-container')).toBeTruthy();
        expect(container.querySelector('.ms-media-loader')).toBeTruthy();
        done();
    });

    it('scroll in view should render the actual component (lazy loading)', (done) => {
        const DEBOUNCE_TIME = 1;
        ReactDOM.render(
            <div
                id="scroll-container"
                style={{ width: 512, height: 512, overflow: 'scroll' }}>
                <div style={{ height: 1024 }}></div>
                <Media mediaViewer={withMediaVisibilityContainer(() => <div className="test-component"></div>)} debounceTime={DEBOUNCE_TIME}/>
            </div>,
            document.getElementById("container"));
        try {
            let container = document.getElementById('container');
            expect(container.querySelector('.ms-visibility-container')).toBeTruthy();
            expect(container.querySelector('.ms-media-loader')).toBeTruthy();
            const scrollContainer =  document.getElementById('scroll-container');
            ReactTestUtils.act(() => {
                scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
            });
            setTimeout(() => {
                try {
                    container = document.getElementById('container');
                    expect(container.querySelector('.ms-media-loader')).toBeFalsy();
                    expect(container.querySelector('.test-component')).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            }, 50);
        } catch (e) {
            done(e);
        }
    });

    it('scroll in and out from view faster than debounce time should not render the actual component (lazy loading)', (done) => {
        const DEBOUNCE_TIME = 50;
        const TestComponentWithVisibility = withMediaVisibilityContainer(() => <div className="test-component"></div>);
        ReactDOM.render(
            <div
                id="scroll-container"
                style={{ width: 512, height: 512, overflow: 'scroll' }}>
                <div style={{ height: 1024 }}></div>
                <TestComponentWithVisibility
                    lazy
                    debounceTime={DEBOUNCE_TIME} />
            </div>,
            document.getElementById("container"));
        try {
            let container = document.getElementById('container');
            expect(container.querySelector('.ms-visibility-container')).toExist();
            expect(container.querySelector('.ms-media-loader')).toExist();
            const scrollContainer =  document.getElementById('scroll-container');
            ReactTestUtils.act(() => {
                scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
            });
            setTimeout(() => {
                scrollContainer.scrollTo(0, 0);
                expect(container.querySelector('.ms-media-loader')).toBeTruthy();
                expect(container.querySelector('.test-component')).toBeFalsy();
                done();
            }, DEBOUNCE_TIME / 2);
        } catch (e) {
            done(e);
        }
    });
});
