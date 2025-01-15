/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useResourcePanelWrapper from '../useResourcePanelWrapper';
import expect from 'expect';
import { act } from 'react-dom/test-utils';

const Component = (props) => {
    const {
        stickyTop,
        stickyBottom
    } = useResourcePanelWrapper(props);
    return <div id="component" style={{ top: stickyTop, bottom: stickyBottom }} />;
};

describe('useResourcePanelWrapper', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should apply top and bottom styles to the component based on the existing header, navbar and footer components', () => {
        act(() => {
            ReactDOM.render(
                <div style={{ position: 'relative', height: 500 }}>
                    <div id="header" style={{ position: 'absolute', top: 0, left: 0, height: 30 }}></div>
                    <div id="navbar" style={{ position: 'absolute', top: 30, left: 0, height: 30 }}></div>
                    <Component
                        headerNodeSelector="#header"
                        navbarNodeSelector="#navbar"
                        footerNodeSelector="#footer"
                        active
                    />
                    <div id="footer" style={{ position: 'absolute', bottom: 0, left: 0, height: 30 }}></div>
                </div>, document.getElementById("container"));
        });
        const componentNode = document.querySelector('#component');
        expect(componentNode.style.top).toBe('60px');
        expect(componentNode.style.bottom).toBe('30px');
    });
});
