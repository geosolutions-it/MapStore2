/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import React from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";

import PermissionEditor from "../PermissionEditor";
import { USER_GROUP_ALL } from "../../../../../utils/SecurityUtils";

describe("PermissionEditor component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = "";
        setTimeout(done);
    });

    it('Should render', () => {
        ReactDOM.render(<PermissionEditor />, document.getElementById('container'));
        const permissionsTable = document.getElementsByClassName('permissions-table')[0];
        expect(permissionsTable).toExist();
    });

    it('Should open insert dropdown', () => {
        const availableGroups = [
            { label: 'Group 1', value: 'group1' },
            { label: 'Group 2', value: 'group2' },
            { label: 'Group 3', value: 'group3' },
            { label: 'Group 4', value: 'group4' }
        ];
        ReactDOM.render(<PermissionEditor availableGroups={availableGroups} />, document.getElementById('container'));
        const permissionsTable = document.getElementsByClassName('permissions-table')[0];
        const input = ReactDOM.findDOMNode(permissionsTable).querySelector('input');
        expect(input).toBeTruthy();
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.focus(input);
            ReactTestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOuter = ReactDOM.findDOMNode(permissionsTable).querySelector('.insert-row .Select-menu-outer');
        expect(selectMenuOuter).toExist();
    });
    it('test group name all and permission', () => {
        const availableGroups = [
            { groupName: USER_GROUP_ALL, id: 'group1' },
            { groupName: 'somegroup', id: 'group2' }
        ];

        // selecting write permission first and then selecting all user group
        ReactDOM.render(<PermissionEditor newPermission="canWrite" availableGroups={availableGroups} />, document.getElementById('container'));
        let permissionsTable = document.getElementsByClassName('permissions-table')[0];
        let input = ReactDOM.findDOMNode(permissionsTable).querySelector('input');
        expect(input).toBeTruthy();
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.focus(input);
            ReactTestUtils.Simulate.click(input);
            ReactTestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOuter = ReactDOM.findDOMNode(permissionsTable).querySelector('.insert-row .Select-menu-outer');
        expect(selectMenuOuter).toBeTruthy();
        let options = ReactDOM.findDOMNode(permissionsTable).querySelectorAll('.Select-option');
        expect(options.length).toBe(1);

        // selecting USER_GROUP_ALL
        ReactDOM.render(<PermissionEditor newGroup={availableGroups[0]} availableGroups={availableGroups} />, document.getElementById('container'));
        permissionsTable = document.getElementsByClassName('permissions-table')[0];
        input = ReactDOM.findDOMNode(permissionsTable).querySelectorAll('input')?.[1];
        expect(input).toBeTruthy();
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.focus(input);
            ReactTestUtils.Simulate.click(input);
            ReactTestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        options = document.querySelectorAll('.Select')[1].querySelectorAll('.Select-option');
        expect(options.length).toBe(1);
    });
});
