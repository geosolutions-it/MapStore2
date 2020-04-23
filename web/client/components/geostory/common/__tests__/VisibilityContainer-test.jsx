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
import VisibilityContainer from '../VisibilityContainer';
import { act } from 'react-dom/test-utils';

describe('VisibilityContainer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', () => {
        ReactDOM.render(<VisibilityContainer />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-visibility-container');
        expect(el).toExist();
    });
    it('test changing of loading state based on debounce time (out of view)', (done) => {
        const DEBOUNCE_TIME = 5;
        const Loader = () => <div id="loader"></div>;
        const Component = () => <div id="component"></div>;
        act(() => {
            ReactDOM.render(
                <VisibilityContainer
                    id="content-01"
                    loading
                    loaderComponent={Loader}
                    debounceTime={DEBOUNCE_TIME}
                    onLoad={(loadedId) => {
                        try {
                            expect(loadedId).toBe('content-01');
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}>
                    <Component />
                </VisibilityContainer>, document.getElementById("container"));
        });
        // start second render cycle to ensure on load has been called
        act(() => {
            ReactDOM.render(
                <VisibilityContainer
                    id="content-01"
                    loading
                    loaderComponent={Loader}
                    debounceTime={DEBOUNCE_TIME}>
                    <Component />
                </VisibilityContainer>, document.getElementById("container"));
        });
    });
    it('should assign in view prop to children', () => {
        const DEBOUNCE_TIME = 0;
        const Loader = () => <div id="loader"></div>;
        const Component = ({ inView }) => <div id="component" className={inView !== undefined ? 'in-view-prop' : ''}></div>;
        act(() => {
            ReactDOM.render(
                <VisibilityContainer
                    loaderComponent={Loader}
                    debounceTime={DEBOUNCE_TIME}
                    loading={false}>
                    <Component />
                </VisibilityContainer>
                , document.getElementById("container"));
        });
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-visibility-container');
        expect(el).toBeTruthy();
        const component = container.querySelector('#component.in-view-prop');
        expect(component).toBeTruthy();
    });
});
