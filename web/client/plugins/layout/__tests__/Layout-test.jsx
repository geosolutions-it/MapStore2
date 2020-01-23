/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Layout } from '../Layout';

// styles needed for layout structure
import './layout-test-style.less';

describe('Layout Component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component with default configuration', () => {
        ReactDOM.render(<Layout />, document.getElementById('container'));
        const loaderPanelNode = document.querySelector('.ms-layout-loader-panel');
        expect(loaderPanelNode).toExist();
    });

    it('render a custom layout', () => {

        const LAYOUT_TYPE = 'custom';
        const LAYOUT_TITLE = 'title';
        const OPTIONS = {
            [LAYOUT_TYPE]: {
                title: LAYOUT_TITLE
            }
        };

        const LAYOUT_CLASS = 'custom-layout';
        const TITLE_CLASS = 'custom-title';

        const LAYOUT_COMPONENTS = {
            [LAYOUT_TYPE]: ({
                title = '',
                myLocationItems = []
            }) => {
                return (
                    <div
                        className={LAYOUT_CLASS}>
                        <div className={TITLE_CLASS}>{title}</div>
                        {myLocationItems.map(({ Component }, idx) => <Component key={idx}/>)}
                    </div>
                );
            }
        };

        const COMPONENT_CLASS = 'custom-component';
        const COMPONENTS = {
            myLocationItems: [
                {
                    Component: () => <div className={COMPONENT_CLASS} />
                }
            ]
        };

        ReactDOM.render(<Layout
            error={false}
            loading={false}
            type={LAYOUT_TYPE}
            options={OPTIONS}
            components={COMPONENTS}
            layoutComponents={LAYOUT_COMPONENTS}
        />, document.getElementById('container'));
        const layoutNode = document.querySelector(`.${LAYOUT_CLASS}`);
        expect(layoutNode).toExist();

        const titleNode = document.querySelector(`.${TITLE_CLASS}`);
        expect(titleNode).toExist();
        expect(titleNode.innerHTML).toExist(LAYOUT_TITLE);

        const centerComponentNode = document.querySelector(`.${COMPONENT_CLASS}`);
        expect(centerComponentNode).toExist();
    });
});

