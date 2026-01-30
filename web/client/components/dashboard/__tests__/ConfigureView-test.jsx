/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import ConfigureView from '../ConfigureView';

describe('ConfigureView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('does not render when active is false', () => {
        const onToggle = () => {};
        const onSave = () => {};
        ReactDOM.render(
            <ConfigureView
                active={false}
                onToggle={onToggle}
                onSave={onSave}
                data={{ name: null, color: null, linkExistingDashboard: false, dashboard: null }}
                user={null}
                configureViewOptions={{}}
            />,
            document.getElementById("container")
        );
        const dialog = document.querySelector('.configure-view-dialog-container');
        expect(dialog).toNotExist();
    });

    it('renders dialog when active is true and Save button calls onSave with current setting', () => {
        const onToggle = () => {};
        const onSave = expect.createSpy();
        ReactDOM.render(
            <ConfigureView
                active
                onToggle={onToggle}
                onSave={onSave}
                data={{ name: 'My View', color: '#ff0000', linkExistingDashboard: false, dashboard: null }}
                user={null}
                configureViewOptions={{}}
            />,
            document.getElementById("container")
        );
        const dialog = document.querySelector('.configure-view-dialog-container');
        expect(dialog).toExist();
        const saveButton = document.querySelector('[role="footer"] button.btn-primary');
        expect(saveButton).toExist();
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(saveButton);
        });
        expect(onSave).toHaveBeenCalled();
        expect(onSave.calls[0].arguments[0].name).toBe('My View');
        expect(onSave.calls[0].arguments[0].color).toBe('#ff0000');
    });

    it('Cancel button calls onToggle', () => {
        const onToggle = expect.createSpy();
        const onSave = () => {};
        ReactDOM.render(
            <ConfigureView
                active
                onToggle={onToggle}
                onSave={onSave}
                data={{ name: null, color: null, linkExistingDashboard: false, dashboard: null }}
                user={null}
                configureViewOptions={{}}
            />,
            document.getElementById("container")
        );
        const cancelButton = document.querySelector('[role="footer"] button.btn-default');
        expect(cancelButton).toExist();
        ReactTestUtils.Simulate.click(cancelButton);
        expect(onToggle).toHaveBeenCalled();
    });

    it('name change is included in setting passed to onSave', () => {
        const onToggle = expect.createSpy();
        const onSave = expect.createSpy();
        ReactDOM.render(
            <ConfigureView
                active
                onToggle={onToggle}
                onSave={onSave}
                data={{ name: 'Initial', color: null, linkExistingDashboard: false, dashboard: null }}
                user={null}
                configureViewOptions={{}}
            />,
            document.getElementById("container")
        );
        const nameInput = document.querySelector('input[type="text"].form-control');
        expect(nameInput).toExist();
        ReactTestUtils.Simulate.change(nameInput, { target: { value: 'Updated Name' } });
        const saveButton = document.querySelector('[role="footer"] button.btn-primary');
        ReactTestUtils.Simulate.click(saveButton);
        expect(onSave).toHaveBeenCalled();
        expect(onSave.calls[0].arguments[0].name).toBe('Updated Name');
    });
});
