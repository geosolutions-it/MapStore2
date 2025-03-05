/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import expect from 'expect';
import ReactDOM from 'react-dom';
import UserDialog from '../UserDialog';
import ReactTestUtils from 'react-dom/test-utils';
const enabledUser = {
    id: 1,
    name: "USER1",
    role: "USER",
    enabled: true,
    groups: [{
        groupName: "GROUP1"
    }]
};
const disabledUser = {
    id: 2,
    name: "USER2",
    role: "USER",
    enabled: false,
    groups: [{
        groupName: "GROUP1"
    }],
    attribute: [{
        name: "notes",
        value: "this user is disabled"
    }]
};
const adminUser = {
    id: 3,
    name: "ADMIN",
    role: "ADMIN",
    enabled: true
};
const newUser = {
    role: "USER",
    "enabled": true
};

const attributeUser = {
    id: 4,
    name: "USER3",
    role: "USER",
    enabled: true,
    groups: [{
        groupName: "GROUP1"
    }],
    attribute: [{
        name: "attribute1",
        value: "value1"
    }, {
        name: "attribute2",
        value: "value2"
    }]
};
describe("Test UserDialog Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test enabled user rendering', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={enabledUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("newPassword").length).toBe(1);
        expect(document.getElementsByName("confirmPassword").length).toBe(1);
        expect(document.getElementsByName("enabled").length).toBe(1);
        expect(document.getElementsByName("enabled").item(0).checked).toBe(true);
    });
    it('Test disabled user rendering', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={disabledUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("enabled").length).toBe(1);
        expect(document.getElementsByName("enabled").item(0).checked).toBe(false);
    });
    it('Test admin user rendering', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={adminUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("role").length).toBe(1);
        expect(document.getElementsByName("role").item(0).value).toBe("ADMIN");
    });
    it('Test user loading', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{...adminUser, status: "loading"}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test user error', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{...enabledUser, lastError: {statusText: "ERROR"}}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test isValidPassword', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{...enabledUser, newPassword: "testPassword"}}/>, document.getElementById("container"));
        expect(comp).toExist();
        // valid password, wrong confirm
        comp = ReactDOM.render(
            <UserDialog show user={{...enabledUser, newPassword: "aaabbb", confirmPassword: "bbbccc"}}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.isValidPassword()).toBe(false);
        // Valid password
        comp = ReactDOM.render(
            <UserDialog show user={{name: "user", newPassword: "aA1!@#$%&*_", confirmPassword: "aA1!@#$%&*_"}}/>, document.getElementById("container"));
        expect(comp.isValidPassword()).toBe(true);
        // Invalid password, correct confirm
        comp = ReactDOM.render(
            <UserDialog show user={{...enabledUser, newPassword: "aaabbbà", confirmPassword: "aaabbbà"}}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.isValidPassword()).toBe(true);
        // New user, empty password
        comp = ReactDOM.render(
            <UserDialog show user={{...newUser, newPassword: "", confirmPassword: ""}}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.isValidPassword()).toBe(false);
    });
    it('Test without password fields', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={enabledUser} hidePasswordFields/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("newPassword").length).toBe(0);
        expect(document.getElementsByName("confirmPassword").length).toBe(0);
    });
    it('Test new user', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={newUser} />, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("newPassword").length).toBe(1);
        expect(document.getElementsByName("confirmPassword").length).toBe(1);
        expect(document.getElementsByName("role").length).toBe(1);
        expect(document.getElementsByName("role").item(0).value).toBe("USER");
        expect(document.getElementsByName("enabled").length).toBe(1);
        expect(document.getElementsByName("enabled").item(0).checked).toBe(true);

    });
    it('Test empty user', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={null} />, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("name").length).toBe(1);
        expect(document.getElementsByName("newPassword").length).toBe(1);
        expect(document.getElementsByName("confirmPassword").length).toBe(1);
        expect(document.getElementsByName("role").length).toBe(1);
        expect(document.getElementsByName("role").item(0).value).toBe("ADMIN");
        expect(document.getElementsByName("enabled").length).toBe(1);
        expect(document.getElementsByName("enabled").item(0).checked).toBe(false);
    });
    it('calls the checkbox callback', () => {
        const handlers = {
            onChange() {}
        };
        let spy = expect.spyOn(handlers, "onChange");
        let comp = ReactDOM.render(
            <UserDialog show user={null} onChange={handlers.onChange} />, document.getElementById("container"));
        expect(comp).toExist();
        document.getElementsByName("enabled").item(0).click();

        comp = ReactDOM.render(
            <UserDialog show user={newUser} onChange={handlers.onChange} />, document.getElementById("container"));
        document.getElementsByName("enabled").item(0).click();
        expect(spy.calls.length).toBe(2);
    });
    it('calls the save callback', () => {
        const handlers = {
            onSave() {}
        };
        let spy = expect.spyOn(handlers, "onSave");
        let comp = ReactDOM.render(
            <UserDialog show user={{
                id: 1,
                name: "USER1",
                role: "USER",
                enabled: true,
                status: "modified"
            }} onSave={handlers.onSave} />, document.getElementById("container"));
        expect(comp).toExist();
        let domnode = ReactDOM.findDOMNode(comp);
        const saveButton = domnode.querySelector('.btn-primary');
        expect(saveButton).toExist();
        ReactTestUtils.Simulate.click(saveButton);
        expect(spy.calls.length).toBe(1);
    });
    it('displays the spinner', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{
                id: 1,
                name: "USER1",
                role: "USER",
                "enabled": true,
                status: "saving"
            }} />, document.getElementById("container"));
        expect(comp).toExist();
        let domnode = ReactDOM.findDOMNode(comp);
        expect(domnode.getElementsByClassName("btn-primary")[0].classList.contains('disabled')).toBe(true);
        expect(domnode.getElementsByClassName("spinner").length).toNotBe(0);
    });
    it('displays the success style', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{
                id: 1,
                name: "USER1",
                role: "USER",
                enabled: true,
                status: "saved"
            }} />, document.getElementById("container"));
        expect(comp).toExist();
        let domnode = ReactDOM.findDOMNode(comp);
        expect(domnode.getElementsByClassName("btn-success").length).toBe(1);
    });
    it('Testing selected user-dialog-tab is highlighted', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{
                id: 1,
                name: "USER1",
                role: "USER",
                enabled: true,
                status: "saved"
            }} />, document.getElementById("container"));

        expect(comp).toExist();

        const tabs = document.querySelectorAll('.nav.nav-justified > li');
        expect(tabs[0].getAttribute('class')).toBe('active');
        const userGroupButton = tabs[2].children[0];
        ReactTestUtils.Simulate.click(userGroupButton);
        expect(tabs[2].getAttribute('class')).toBe('active');
    });

    it('Testing asterisk inside mandatory fields', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={{
                id: 1,
                name: "USER1",
                role: "USER",
                enabled: true,
                status: "saved"
            }} />,
            document.getElementById("container"));

        expect(comp).toExist();
        const labels = document.querySelectorAll('.control-label');
        const [
            username,
            password,
            retypePassword
        ] = labels;
        expect(username.children.length).toBe(2);
        expect(username.children[0].innerHTML).toBe('user.username');
        expect(username.children[1].innerHTML).toBe('*');

        expect(password.children.length).toBe(3);
        expect(password.children[0].innerHTML).toBe('user.password');
        expect(password.children[1].innerHTML).toBe('*');
        expect(password.children[2].getAttribute('class')).toBe('glyphicon glyphicon-info-sign');

        expect(retypePassword.children.length).toBe(2);
        expect(retypePassword.children[0].innerHTML).toBe('user.retypePwd');
        expect(retypePassword.children[1].innerHTML).toBe('*');
    });

    it('Test on close dialog using form close btn, reset password field', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={newUser} />, document.getElementById("container"));
        expect(comp).toExist();
        const passwordField = document.querySelector("input[name='newPassword']");
        const closeBtn = document.querySelector(".btn-default");
        passwordField.value = 'password';
        ReactTestUtils.Simulate.click(closeBtn);
        expect(passwordField.value).toEqual('');
    });

    it('Test on close dialog using dialog header close btn, reset password field', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={newUser} />, document.getElementById("container"));
        expect(comp).toExist();
        const passwordField = document.querySelector("input[name='newPassword']");
        const closeBtn = document.querySelector(".login-panel-close");
        passwordField.value = 'password';
        ReactTestUtils.Simulate.click(closeBtn);
        expect(passwordField.value).toEqual('');
    });
    it('user attributes tab', () => {
        let comp = ReactDOM.render(
            <UserDialog show user={attributeUser} showAttributesTab attributeFields={[{ name: "attribute1" }, { name: "attribute2", controlType: "text" }]} />,
            document.getElementById("container"));
        expect(comp).toExist();
        const tabs = document.querySelectorAll('.nav.nav-justified > li');
        expect(tabs[0].getAttribute('class')).toBe('active');
        const groupAttributesButton = tabs[2].children[0];
        ReactTestUtils.Simulate.click(groupAttributesButton);
        expect(tabs[2].getAttribute('class')).toBe('active');
        const groupAttributesTab = document.querySelector('.tab-content > div:nth-child(2)');
        const controlLabel = groupAttributesTab.querySelectorAll('.control-label')[0];
        expect(controlLabel.innerHTML).toBe('attribute1');
        const input = groupAttributesTab.querySelectorAll('input')[0];
        expect(input.getAttribute('type')).toBe('text');
        expect(input.value).toBe('value1');
        const controlLabel2 = groupAttributesTab.querySelectorAll('.control-label')[1];
        expect(controlLabel2.innerHTML).toBe('attribute2');
        const input2 = groupAttributesTab.querySelectorAll('textarea')[0];
        expect(input2.value).toBe('value2');
    });

    describe('unsaved changes modal', () => {
        it('showing unsaved changes modal and closing the modal', () => {
            const actions = {
                onClose: () => {}
            };

            const userDlg = ReactDOM.render(
                <UserDialog
                    show
                    user={{...newUser, status: "modified"}}
                    onClose={actions.onClose}
                />, document.getElementById("container"));
            expect(userDlg).toExist();
            let buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(3);
            let closeBtn = buttons[1];
            let saveBtn = buttons[2];
            expect(closeBtn.innerText).toBe("saveDialog.close");
            expect(saveBtn.innerText).toBe("users.createUser");
            ReactTestUtils.Simulate.click(closeBtn);
            buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(5);

            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeTruthy();
            const buttons_ = dialog.querySelectorAll('.btn');
            expect(buttons_.length).toBe(2);
            const confirmButton = buttons_[1];
            expect(confirmButton).toBeTruthy();
            ReactTestUtils.Simulate.click(confirmButton);
        });
    });
});
