
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
import Permissions from '../Permissions';

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
            permissionOptions={{
                'entry.name.everyone': [
                    {
                        value: 'view',
                        labelId: 'resourcesCatalog.viewPermission'
                    }
                ],
                'default': [
                    {
                        value: 'view',
                        labelId: 'resourcesCatalog.viewPermission'
                    },
                    {
                        value: 'edit',
                        labelId: 'resourcesCatalog.editPermission'
                    }
                ]
            }}
        />, document.getElementById('container'));
        const permissions = document.querySelector('.ms-permissions');
        expect(permissions).toBeTruthy();
        const permissionsRows = document.querySelectorAll('.ms-permissions-row');
        expect(permissionsRows.length).toBe(2);
        expect([...permissionsRows].map(row => row.innerText)).toEqual(['everyone\nresourcesCatalog.viewPermission', 'custom-group\nresourcesCatalog.viewPermission']);
        const disabled = permissionsRows[0].querySelector('.is-disabled');
        expect(disabled).toBeTruthy();
    });
});
