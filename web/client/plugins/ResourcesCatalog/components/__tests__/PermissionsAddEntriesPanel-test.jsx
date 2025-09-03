
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
import PermissionsAddEntriesPanel from '../PermissionsAddEntriesPanel';

describe('PermissionsAddEntriesPanel component', () => {
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
        ReactDOM.render(<PermissionsAddEntriesPanel />, document.getElementById('container'));
        const permissionsAddEntriesPanel = document.querySelector('.ms-permissions-add-entries-panel');
        expect(permissionsAddEntriesPanel).toBeTruthy();
    });
});
