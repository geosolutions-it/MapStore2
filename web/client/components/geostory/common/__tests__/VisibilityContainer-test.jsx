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
    it('test changing of loading state based on debounce time (in view)', (done) => {
        const DEBOUNCE_TIME = 50;
        const Loader = () => <div id="loader"></div>;
        const Component = () => <div id="component"></div>;
        ReactDOM.render(
            <VisibilityContainer
                loaderComponent={Loader}
                debounceTime={DEBOUNCE_TIME}>
                <Component />
            </VisibilityContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-visibility-container');
        expect(el).toExist();
        let loader = container.querySelector('#loader');
        expect(loader).toExist();
        let component = container.querySelector('#component');
        expect(component).toBe(null);
        done();
        setTimeout(() => {
            loader = container.querySelector('#loader');
            expect(loader).toBe(null);
            component = container.querySelector('#component');
            expect(component).toExist();
            done();
        }, DEBOUNCE_TIME * 2);
    });
    it('test changing of loading state based on debounce time (out of view)', (done) => {
        const DEBOUNCE_TIME = 50;
        const Loader = () => <div id="loader"></div>;
        const Component = () => <div id="component"></div>;
        ReactDOM.render(
            <div
                id="scroll-container"
                style={{ width: 512, height: 512, overflow: 'scroll' }}>
                <div style={{ height: 1024 }}></div>
                <VisibilityContainer
                    loaderComponent={Loader}
                    debounceTime={DEBOUNCE_TIME}>
                    <Component />
                </VisibilityContainer>
            </div>
            , document.getElementById("container"));

        const container = document.getElementById('container');
        const el = container.querySelector('.ms-visibility-container');
        expect(el).toExist();
        let loader = container.querySelector('#loader');
        expect(loader).toExist();
        let component = container.querySelector('#component');
        expect(component).toBe(null);
        setTimeout(() => {
            loader = container.querySelector('#loader');
            expect(loader).toExist();
            component = container.querySelector('#component');
            expect(component).toBe(null);
            done();
        }, DEBOUNCE_TIME * 2);
    });
});
