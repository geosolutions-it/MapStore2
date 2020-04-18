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
import ReactTestUtils from 'react-dom/test-utils';

import Tab from '../Tab';

describe('Tab Component', function() {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<Tab />, document.getElementById('container'));
        const tabRoot = document.querySelector('.ms-menu-tab');
        expect(tabRoot).toExist();
    });
    it('should render with glyph', () => {
        const ID = 'Id';
        ReactDOM.render(<Tab
            id={ID}
            active
            glyph="1-layer"/>, document.getElementById('container'));
        const tabRoot = document.querySelector(`#ms-menu-tab-${ID.toLowerCase()}`);
        expect(tabRoot).toExist();
        const glyphicon = tabRoot.querySelector('.glyphicon-1-layer');
        expect(glyphicon).toExist();
        const icon = tabRoot.querySelector('.ms-icon');
        expect(icon).toBe(null);
    });
    it('should render with icon', () => {
        const ID = 'Id';
        ReactDOM.render(<Tab
            id={ID}
            active
            iconComponent={() => <div className="ms-icon"></div>}
            icon={{
                title: 'Title'
            }}/>, document.getElementById('container'));
        const tabRoot = document.querySelector(`#ms-menu-tab-${ID.toLowerCase()}`);
        expect(tabRoot).toExist();
        const glyphicon = tabRoot.querySelector('.glyphicon');
        expect(glyphicon).toBe(null);
        const icon = tabRoot.querySelector('.ms-icon');
        expect(icon).toExist();
    });
    it('should render with mirror', () => {
        const ID = 'Id';
        ReactDOM.render(<Tab
            id={ID}
            mirror
            active/>, document.getElementById('container'));
        const tabRoot = document.querySelector(`#ms-menu-tab-${ID.toLowerCase()}`);
        expect(tabRoot).toExist();
        const tabArrowNode = tabRoot.children[0];
        const arrowNode = tabArrowNode.querySelector('.ms-arrow-mirror');
        expect(arrowNode).toExist();
    });
    it('should render with no mirror', () => {
        const ID = 'Id';
        ReactDOM.render(<Tab
            id={ID}
            mirror={false}
            active/>, document.getElementById('container'));
        const tabRoot = document.querySelector(`#ms-menu-tab-${ID.toLowerCase()}`);
        expect(tabRoot).toExist();
        const tabArrowNode = tabRoot.children[1];
        const arrowNode = tabArrowNode.querySelector('.ms-arrow');
        expect(arrowNode).toExist();
    });
    it('should trigger on click event', (done) => {
        const ID = 'Id';
        ReactDOM.render(<Tab
            id={ID}
            onClick={(id) => {
                expect(id).toBe(ID);
                done();
            }}/>, document.getElementById('container'));
        const tabRoot = document.querySelector(`#ms-menu-tab-${ID.toLowerCase()}`);
        expect(tabRoot).toExist();
        const buttonNode = tabRoot.querySelector('.btn');
        expect(buttonNode).toExist();
        ReactTestUtils.Simulate.click(buttonNode);
    });
    it('should render alert icon', () => {
        const ID = 'Id';
        function AlertIcon() {
            return <div className="custom-alert-icon"></div>;
        }
        ReactDOM.render(<Tab
            id={ID}
            alertIcon={AlertIcon} />, document.getElementById('container'));
        const tabRoot = document.querySelector(`#ms-menu-tab-${ID.toLowerCase()}`);
        expect(tabRoot).toExist();
        const buttonNode = tabRoot.querySelector('.btn');
        expect(buttonNode).toExist();
        const alertIcon = tabRoot.querySelector('.custom-alert-icon');
        expect(alertIcon).toExist();
    });
});
