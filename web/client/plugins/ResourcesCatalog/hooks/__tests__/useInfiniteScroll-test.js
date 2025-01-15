/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useInfiniteScroll from '../useInfiniteScroll';
import { act } from 'react-dom/test-utils';

const Component = (props) => {
    useInfiniteScroll(props);
    return <div style={props.style} />;
};

describe('useInfiniteScroll', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container" style="height:100px;overflow:auto;"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should trigger on load while scrolling if it does reach the offset threshold', (done) => {
        const container = document.querySelector("#container");
        act(() => {
            ReactDOM.render(<Component
                style={{ height: 500 }}
                offset={200}
                shouldScroll={() => true}
                scrollContainer={container}
                onLoad={() => {
                    done();
                }}
            />, document.getElementById("container"));
        });
        container.scrollTop = 400;
        container.dispatchEvent(new window.UIEvent('scroll', { detail: 0 }));
    });
});
