/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useIsMounted from '../useIsMounted';
import expect from 'expect';
import { Simulate, act } from 'react-dom/test-utils';

const Component = ({ onClick, timeoutTime }) => {
    const isMounted = useIsMounted();
    return (<button onClick={() => setTimeout(() => {
        isMounted((mounted) => {
            onClick(mounted);
        });
    }, timeoutTime)}></button>);
};

describe('useIsMounted', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should trigger on click when the component is mounted', (done) => {
        act(() => {
            ReactDOM.render(<Component
                timeoutTime={100}
                onClick={(mounted) => {
                    expect(mounted).toBe(true);
                    done();
                }}
            />, document.getElementById("container"));
        });
        Simulate.click(document.querySelector('button'));
    });
});
