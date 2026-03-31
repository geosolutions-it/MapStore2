/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import CustomWidgetFrame from '../CustomWidgetFrame';

const CustomBody = ({ id, title, extraFromRest }) => (
    <div>
        <span className="cw-test-id">{id}</span>
        <span className="cw-test-title">{title}</span>
        {extraFromRest ? <span className="cw-test-extra">{extraFromRest}</span> : null}
    </div>
);

const base = {
    Component: CustomBody,
    id: 'cw-1',
    title: 'Custom title'
};

describe('CustomWidgetFrame component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders widget shell with prefixed id and header title', () => {
        ReactDOM.render(
            <CustomWidgetFrame {...base} title="My widget" />,
            document.getElementById('container')
        );
        const card = document.getElementById('widget-custom-cw-1');
        expect(card).toExist();
        expect(card.querySelector('.widget-title').textContent).toBe('My widget');
    });


    it('renders title together with header tools', () => {
        ReactDOM.render(
            <CustomWidgetFrame
                {...base}
                title="Widget Header"
                toolsOptions={{ showMaximize: true }}
                toggleMaximize={() => {}}
            />,
            document.getElementById('container')
        );
        const root = document.getElementById('container');
        expect(root.querySelector('.widget-title').textContent).toBe('Widget Header');
        expect(root.querySelector('.widget-icons .glyphicon-resize-full')).toExist();
    });


    it('forwards remaining props to the custom Component', () => {
        ReactDOM.render(
            <CustomWidgetFrame {...base} extraFromRest="rest-value" />,
            document.getElementById('container')
        );
        expect(document.getElementById('container').querySelector('.cw-test-extra').textContent).toBe('rest-value');
    });
});
