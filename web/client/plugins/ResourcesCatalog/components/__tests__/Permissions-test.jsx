/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Simulate } from 'react-dom/test-utils';
import Permissions from '../Permissions';

const defaultPermissionOptions = {
    'entry.name.everyone': [
        { value: 'view', labelId: 'resourcesCatalog.viewPermission' }
    ],
    'default': [
        { value: 'view', labelId: 'resourcesCatalog.viewPermission' },
        { value: 'edit', labelId: 'resourcesCatalog.editPermission' }
    ]
};

describe('Permissions component', () => {
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
        ReactDOM.render(<Permissions />, document.getElementById('container'));
        const permissions = document.querySelector('.ms-permissions');
        expect(permissions).toBeTruthy();
    });

    it('should provide different list of permission based on entry name', () => {
        ReactDOM.render(<Permissions
            editing
            compactPermissions={{
                entries: [
                    {
                        type: 'group',
                        id: 1,
                        name: 'everyone',
                        permissions: 'view'
                    },
                    {
                        type: 'group',
                        id: 2,
                        name: 'custom-group',
                        permissions: 'view'
                    }
                ]
            }}
            permissionOptions={defaultPermissionOptions}
        />, document.getElementById('container'));
        const permissions = document.querySelector('.ms-permissions');
        expect(permissions).toBeTruthy();
        const permissionsRows = document.querySelectorAll('.ms-permissions-row');
        expect(permissionsRows.length).toBe(2);
        expect([...permissionsRows].map(row => row.innerText)).toEqual(['everyone\nresourcesCatalog.viewPermission', 'custom-group\nresourcesCatalog.viewPermission']);
        const disabled = permissionsRows[0].querySelector('.is-disabled');
        expect(disabled).toBeTruthy();
    });

    it('should remove only the clicked entry when entries have normal ids', () => {
        const onChangeSpy = expect.createSpy();
        ReactDOM.render(<Permissions
            editing
            compactPermissions={{
                entries: [
                    { type: 'group', id: 1, name: 'everyone', permissions: 'view' },
                    { type: 'group', id: 2, name: 'custom-group', permissions: 'edit' }
                ]
            }}
            permissionOptions={defaultPermissionOptions}
            onChange={onChangeSpy}
        />, document.getElementById('container'));
        const rows = document.querySelectorAll('.ms-permissions .ms-permissions-row');
        expect(rows.length).toBe(2);
        const secondRowDeleteButton = rows[1].querySelector('button');
        expect(secondRowDeleteButton).toBeTruthy();
        Simulate.click(secondRowDeleteButton);
        expect(onChangeSpy).toHaveBeenCalled();
        const entries = onChangeSpy.calls[0].arguments[0].entries;
        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('everyone');
        expect(entries[0].id).toBe(1);
    });

    it('should remove only the clicked entry when all entries have id = -1', () => {
        const onChangeSpy = expect.createSpy();
        ReactDOM.render(<Permissions
            editing
            compactPermissions={{
                entries: [
                    { type: 'group', id: -1, name: 'everyone', permissions: 'view' },
                    { type: 'group', id: -1, name: 'custom-group', permissions: 'edit' }
                ]
            }}
            permissionOptions={defaultPermissionOptions}
            onChange={onChangeSpy}
        />, document.getElementById('container'));
        const rows = document.querySelectorAll('.ms-permissions .ms-permissions-row');
        expect(rows.length).toBe(2);
        const secondRowDeleteButton = rows[1].querySelector('button');
        expect(secondRowDeleteButton).toBeTruthy();
        Simulate.click(secondRowDeleteButton);
        expect(onChangeSpy).toHaveBeenCalled();
        const entries = onChangeSpy.calls[0].arguments[0].entries;
        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('everyone');
        expect(entries[0].id).toBe(-1);
    });

    it('should disable current user manage entry and prevent deletion', () => {
        const onChangeSpy = expect.createSpy();
        ReactDOM.render(<Permissions
            editing
            user={{ pk: 1 }}
            compactPermissions={{
                entries: [
                    { type: 'user', id: 1, name: 'current-user', permissions: 'manage' },
                    { type: 'group', id: 2, name: 'custom-group', permissions: 'edit' }
                ]
            }}
            permissionOptions={defaultPermissionOptions}
            onChange={onChangeSpy}
        />, document.getElementById('container'));
        const rows = document.querySelectorAll('.ms-permissions .ms-permissions-row');
        expect(rows.length).toBe(2);
        const firstRowDeleteButton = rows[0].querySelector('button');
        expect(firstRowDeleteButton).toBeTruthy();
        expect(firstRowDeleteButton.disabled).toBe(true);
        Simulate.click(firstRowDeleteButton);
        expect(onChangeSpy).toNotHaveBeenCalled();
    });
});
