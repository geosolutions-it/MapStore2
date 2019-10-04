/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import stickySupport from '../stickySupport';

describe('stickySupport enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('verify correct style position on enhanced component', () => {

        const REF_ID = 'component';
        class TestComponent extends Component {
            render() {
                return (
                    <div
                        id="enhanced-node"
                        ref={REF_ID}/>
                );
            }
        }
        const EnhancerdTestComponent = stickySupport()(TestComponent);
        const cmp = ReactDOM.render(<EnhancerdTestComponent
            refId={REF_ID}
            scrollContainerSelector="#container"
            width={100}
            height={50}/>, document.getElementById('container'));

        const enhancedNode = document.querySelector('#enhanced-node');
        expect(cmp).toExist();
        expect(cmp._stickybits).toExist();
        expect(cmp._node).toBe(enhancedNode);
        const positionStyle = cmp._stickybits.definePosition() || 'fixed';

        // Check id stickybits has applied position style to the ref node
        expect(enhancedNode.style.position).toBe(positionStyle);
    });

});
