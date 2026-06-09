/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import IPDialog, { DeleteConfirm } from '../IPDialog';

describe('IPDialog component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should call onSave with valid CIDR data when save clicked', () => {
        const onSave = expect.createSpy();
        const onClose = expect.createSpy();

        ReactDOM.render(
            <IPDialog show ip={null} onSave={onSave} onClose={onClose} />,
            document.getElementById("container")
        );

        const ipInput = document.querySelectorAll('input[type="text"]')[0];
        const descInput = document.querySelectorAll('input[type="text"]')[1];

        ipInput.value = '192.168.1.0/24';
        ReactTestUtils.Simulate.change(ipInput);

        descInput.value = 'Office Network';
        ReactTestUtils.Simulate.change(descInput);

        const buttons = document.querySelectorAll('.modal-footer button');
        const saveButton = buttons[1];
        ReactTestUtils.Simulate.click(saveButton);

        expect(onSave).toHaveBeenCalled();
        expect(onSave.calls[0].arguments[0].ipAddress).toBe('192.168.1.0/24');
        expect(onSave.calls[0].arguments[0].description).toBe('Office Network');
    });

    it('should show validation error for invalid IP', () => {
        const onSave = expect.createSpy();
        const onClose = expect.createSpy();

        ReactDOM.render(
            <IPDialog show ip={null} onSave={onSave} onClose={onClose} />,
            document.getElementById("container")
        );

        const ipInput = document.querySelectorAll('input[type="text"]')[0];
        ipInput.value = '192.168.1.1'; // No CIDR mask
        ReactTestUtils.Simulate.change(ipInput);

        const buttons = document.querySelectorAll('.modal-footer button');
        const saveButton = buttons[1];
        ReactTestUtils.Simulate.click(saveButton);

        const errorBlock = document.querySelector('.help-block');
        expect(errorBlock).toExist();
        expect(onSave).toNotHaveBeenCalled();
    });
});

describe('DeleteConfirm component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should call onDelete when confirmed', () => {
        const onDelete = expect.createSpy();
        const onClose = expect.createSpy();
        const ip = { id: 1, cidr: '192.168.1.0/24' };

        ReactDOM.render(
            <DeleteConfirm show ip={ip} onDelete={onDelete} onClose={onClose} />,
            document.getElementById("container")
        );

        const buttons = document.querySelectorAll('button');
        const deleteButton = buttons[buttons.length - 1];
        ReactTestUtils.Simulate.click(deleteButton);

        expect(onDelete).toHaveBeenCalled();
        expect(onDelete.calls[0].arguments[0]).toBe(ip);
    });
});

