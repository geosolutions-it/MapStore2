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
import { LayerStylesList } from '../index';

describe('LayerStyleList component', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('should render correct className elements when styles are passed as props', () => {
        const mockStyles = [
            {
                name: 'default',
                title: 'Default Style'
            },
            {
                name: 'style1',
                title: 'Style 1'
            },
            {
                name: 'style2',
                title: 'Style 2'
            }
        ];

        const layer = {
            type: 'wms',
            url: 'http://test-url.com',
            name: 'test-layer'
        };

        const container = document.getElementById("container");
        ReactDOM.render(
            <LayerStylesList
                layer={layer}
                styles={mockStyles}
                stylesLoading={false}
                stylesError={null}
            />,
            container
        );

        // Check main container className
        const mainContainer = container.querySelector('.ms-layer-styles-list');
        expect(mainContainer).toExist();
        expect(mainContainer.className).toContain('ms-layer-styles-list');

        // Open popover to see the UI
        const button = container.querySelector('button');
        expect(button).toExist();
        ReactTestUtils.Simulate.click(button);

        // Check popover content className
        const popoverContent = document.querySelector('.ms-layer-styles-popover-content');
        expect(popoverContent).toExist();
        expect(popoverContent.className).toContain('ms-layer-styles-popover-content');

        // Check styles list container className
        const stylesList = document.querySelector('.ms-layer-styles-items');
        expect(stylesList).toExist();
        expect(stylesList.className).toContain('ms-layer-styles-items');
        expect(stylesList.className).toContain('list-group');

        // Check individual style items className
        const styleItems = document.querySelectorAll('.ms-layer-style-item');
        expect(styleItems.length).toBe(3);
        styleItems.forEach(item => {
            expect(item.className).toContain('ms-layer-style-item');
            expect(item.className).toContain('list-group-item');
        });

        // Verify loading className should NOT exist
        const loadingIndicator = document.querySelector('.spinning');
        expect(loadingIndicator).toNotExist();
        const loadingContainer = document.querySelector('.ms-layer-styles-loading');
        expect(loadingContainer).toNotExist();

        // Verify error className should NOT exist
        const errorAlert = document.querySelector('.alert-danger');
        expect(errorAlert).toNotExist();

        // Verify empty message className should NOT exist
        const emptyMessage = document.querySelector('.ms-layer-styles-empty');
        expect(emptyMessage).toNotExist();
    });
});

