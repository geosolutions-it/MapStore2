/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import ViewSwitcher from '../ViewSwitcher';

describe('ViewSwitcher component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders view-switcher container with no layouts', () => {
        ReactDOM.render(
            <ViewSwitcher
                layouts={[]}
                selectedLayoutId={null}
                canEdit={false}
            />,
            document.getElementById("container")
        );
        const container = document.querySelector('.view-switcher-container');
        expect(container).toExist();
        const tabs = document.querySelectorAll('.ms-layout-view');
        expect(tabs.length).toBe(0);
    });

    it('renders layout tabs and calls onSelect when a view tab is clicked', () => {
        const onSelect = expect.createSpy();
        const layouts = [
            { id: '1', name: 'View 1', color: '#ff0000' },
            { id: '2', name: 'View 2', color: '#00ff00' }
        ];
        ReactDOM.render(
            <ViewSwitcher
                layouts={layouts}
                selectedLayoutId="1"
                onSelect={onSelect}
                canEdit={false}
            />,
            document.getElementById("container")
        );
        const tabs = document.querySelectorAll('.ms-layout-view');
        expect(tabs.length).toBe(2);
        const view2Button = Array.from(document.querySelectorAll('.ms-layout-view button')).find(
            (btn) => btn.textContent.trim() === 'View 2'
        );
        expect(view2Button).toExist();
        ReactTestUtils.Simulate.click(view2Button);
        expect(onSelect).toHaveBeenCalledWith('2');
    });

    it('shows Add button when canEdit is true and calls onAdd when clicked', () => {
        const onAdd = expect.createSpy();
        const layouts = [{ id: '1', name: 'View 1', color: null }];
        ReactDOM.render(
            <ViewSwitcher
                layouts={layouts}
                selectedLayoutId="1"
                onAdd={onAdd}
                canEdit
            />,
            document.getElementById("container")
        );
        const addButton = document.querySelector('.view-switcher-container .square-button');
        expect(addButton).toExist();
        expect(addButton.getAttribute('title')).toBe('Add a layout view to the dashboard');
        ReactTestUtils.Simulate.click(addButton);
        expect(onAdd).toHaveBeenCalled();
    });

    it('does not show Add button when canEdit is false', () => {
        const layouts = [{ id: '1', name: 'View 1', color: null }];
        ReactDOM.render(
            <ViewSwitcher
                layouts={layouts}
                selectedLayoutId="1"
                onAdd={() => {}}
                canEdit={false}
            />,
            document.getElementById("container")
        );
        const addButton = document.querySelector('[title="Add a layout view to the dashboard"]');
        expect(addButton).toNotExist();
    });
});
