
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import ResourcesMenu from '../ResourcesMenu';

describe('ResourcesMenu component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<ResourcesMenu />, document.getElementById('container'));
        const resourcesMenu = document.querySelector('.ms-resources-menu');
        expect(resourcesMenu).toBeTruthy();
    });
    it('should render layout button when hideCardLayoutButton is false and cardLayoutStyles length > 1', () => {
        ReactDOM.render(
            <ResourcesMenu
                cardLayoutStyles={['grid', 'list']}
                hideCardLayoutButton={false}
            />,
            document.getElementById('container')
        );
        const layoutButton = document.querySelector('.ms-resources-menu button .glyphicon');
        expect(layoutButton).toBeTruthy();
    });
    it('should not render layout button when hideCardLayoutButton is true', () => {
        ReactDOM.render(
            <ResourcesMenu
                cardLayoutStyles={['grid', 'list']}
                hideCardLayoutButton
            />,
            document.getElementById('container')
        );
        const layoutButton = document.querySelector('.ms-resources-menu button .glyphicon-th, .ms-resources-menu button .glyphicon-th-list');
        expect(layoutButton).toBeFalsy();
    });
    it('should call setCardLayoutStyle on layout toggle button click', () => {
        const setCardLayoutStyleSpy = expect.createSpy();
        ReactDOM.render(
            <ResourcesMenu
                cardLayoutStyle="grid"
                cardLayoutStyles={['grid', 'list']}
                setCardLayoutStyle={setCardLayoutStyleSpy}
            />,
            document.getElementById('container')
        );
        const layoutButton = document.querySelector('.ms-resources-menu button.square-button');
        expect(layoutButton).toBeTruthy();
        ReactTestUtils.Simulate.click(layoutButton);
        expect(setCardLayoutStyleSpy).toHaveBeenCalledWith('list');
    });
    it('should render ResourcesListHeader when cardLayoutStyle is table', () => {
        ReactDOM.render(
            <ResourcesMenu
                cardLayoutStyle="table"
                columns={[]}
                metadata={{ table: [] }}
            />,
            document.getElementById('container')
        );
        const listHeader = document.querySelector('.ms-resources-list-header');
        expect(listHeader).toBeTruthy();
    });
});
