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
import withIntersectionObserver from '../withIntersectionObserver';


describe('withIntersectionObserverEnhancer enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withIntersectionObserverEnhancer usage', (done) => {
        const RATIO = 0.5;
        const CMP = withIntersectionObserver({ threshold: RATIO })(({ inViewRef, inView }) => <div style={{ height: 20 }} ref={inViewRef}>{inView ? "IN VIEW" : "NOT IN VIEW"}</div>);
        // When CMP will be visible, the onVisibilityChange event will be triggered
        const el = ReactDOM.render(<div id="scroll-container-test" style={{ height: 50, overflow: 'auto' }}>
            <div style={{ height: 100 }}></div>
            <CMP onVisibilityChange={(inView, entry) => {
                if (inView) {
                    expect(entry).toExist();
                    expect(entry.intersectionRatio).toBeGreaterThanOrEqualTo(RATIO);
                    done();
                } else {
                    expect(entry.intersectionRatio).toBeLessThanOrEqualTo(RATIO);
                }
            }} />
        </div>, document.getElementById('container'));
        el.scrollBy(0, 120);
    });
});
