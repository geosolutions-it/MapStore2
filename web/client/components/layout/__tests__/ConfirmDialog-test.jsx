
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
import ConfirmDialog from '../ConfirmDialog';
import { Simulate } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';

describe('ConfirmDialog component', () => {
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
        ReactDOM.render(<ConfirmDialog />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeFalsy();
    });
    it('should render the modal when show is true', () => {
        ReactDOM.render(<ConfirmDialog show />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
    });
    it('should trigger onConfirm', (done) => {
        ReactDOM.render(<ConfirmDialog
            show
            onConfirm={() => {
                done();
            }}
        />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[1]);
    });
    it('should trigger onCancel', (done) => {
        ReactDOM.render(<ConfirmDialog
            show
            onCancel={() => {
                done();
            }}
        />, document.getElementById('container'));
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toBeTruthy();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[0]);
    });
    it('should disable confirm button when disabled prop is true', () => {
        ReactDOM.render(
            <ConfirmDialog
                show
                disabled
            />,
            document.getElementById('container')
        );
        const confirmButton = document.querySelectorAll('.btn')[1];
        expect(confirmButton.disabled).toBe(true);
    });
    it('should use msgParams on the confirm dialog when applicable', () => {
        const msgId = 'Test {id}';
        ReactDOM.render(
            <IntlProvider locale="en-US" messages={{ [msgId]: 'Test {id}' }}>
                <ConfirmDialog
                    show
                    cancelId={msgId}
                    cancelParams={{ id: 1 }}
                    confirmId={msgId}
                    confirmParams={{ id: 2 }}
                    titleId={msgId}
                    titleParams={{ id: 3 }}
                    descriptionId={msgId}
                    descriptionParams={{ id: 4 }}
                /></IntlProvider>,
            document.getElementById('container')
        );
        const buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        expect(buttons[0].textContent).toBe('Test 1');
        expect(buttons[1].textContent).toBe('Test 2');
        const textSpans = document.querySelectorAll('span');
        expect(textSpans.length).toBe(4);
        expect(textSpans[0].textContent).toBe('Test 3');
        expect(textSpans[1].textContent).toBe('Test 4');
    });
});
