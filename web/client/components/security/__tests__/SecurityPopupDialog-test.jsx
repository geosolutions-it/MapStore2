
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
import SecurityPopupDialog from '../SecurityPopupDialog';
import { Simulate } from 'react-dom/test-utils';
import { setCredentials } from '../../../utils/SecurityUtils';

describe('SecurityPopupDialog component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render with default', () => {
        ReactDOM.render(<SecurityPopupDialog />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeFalsy();
    });
    it('should render the modal when show is true', () => {
        ReactDOM.render(<SecurityPopupDialog show />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
    });
    it('should trigger onConfirm', (done) => {
        setCredentials("id", {username: "u", password: "p"});
        ReactDOM.render(<SecurityPopupDialog
            show
            service={{protectedId: "id"}}
            onConfirm={() => {
                done();
            }}
            onValidateCreds={async() => ({ ok: true })}
        />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(3);
        Simulate.click(buttons[2]);
        sessionStorage.removeItem("id");
    });
    it('should trigger onConfirm showing an error message when validation fails', (done) => {
        setCredentials("id", {username: "u", password: "p"});
        ReactDOM.render(<SecurityPopupDialog
            show
            service={{protectedId: "id"}}
            onConfirm={() => {}}
            onValidateCreds={async() => ({ ok: false, error: 'securityPopup.validationErrs.invalidCredentials' })}
        />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        const buttons = dialog.querySelectorAll('.btn');
        Simulate.click(buttons[2]);  // Click confirm
        setTimeout(() => {
            const alert = dialog.querySelector('.alert-danger');
            expect(alert).toBeTruthy();
            expect(alert.textContent).toContain('securityPopup.validationErrs.invalidCredentials');

            expect(dialog).toBeTruthy();
            sessionStorage.removeItem("id");
            done();
        }, 100);
    });
    it('should trigger onCancel', (done) => {
        ReactDOM.render(<SecurityPopupDialog
            show
            showClose
            onCancel={() => {
                done();
            }}
        />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(4);
        Simulate.click(buttons[0]);
    });
    it('should disable confirm button when disabled prop is true', () => {
        ReactDOM.render(
            <SecurityPopupDialog
                show
            />,
            document.getElementById('container')
        );
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(3);
        const confirmButton = document.querySelectorAll('.btn')[2];
        expect(confirmButton.disabled).toBe(true);
    });
});
