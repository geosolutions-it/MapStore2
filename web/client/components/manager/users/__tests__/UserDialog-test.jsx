/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require("react");
const expect = require('expect');
const ReactDOM = require('react-dom');
const UserDialog = require('../UserDialog');
const ReactTestUtils = require('react-dom/test-utils');
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
            <UserDialog user={enabledUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("newPassword").length).toBe(1);
        expect(document.getElementsByName("confirmPassword").length).toBe(1);
        expect(document.getElementsByName("enabled").length).toBe(1);
        expect(document.getElementsByName("enabled").item(0).checked).toBe(true);
    });
    it('Test disabled user rendering', () => {
        let comp = ReactDOM.render(
            <UserDialog user={disabledUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("enabled").length).toBe(1);
        expect(document.getElementsByName("enabled").item(0).checked).toBe(false);
    });
    it('Test admin user rendering', () => {
        let comp = ReactDOM.render(
            <UserDialog user={adminUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("role").length).toBe(1);
        expect(document.getElementsByName("role").item(0).value).toBe("ADMIN");
    });
    it('Test user loading', () => {
        let comp = ReactDOM.render(
            <UserDialog user={{...adminUser, status: "loading"}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test user error', () => {
        let comp = ReactDOM.render(
            <UserDialog user={{...enabledUser, lastError: {statusText: "ERROR"}}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test isValidPassword', () => {
        let comp = ReactDOM.render(
            <UserDialog user={{...enabledUser, newPassword: "testPassword"}}/>, document.getElementById("container"));
        expect(comp).toExist();
        // valid password, wrong confirm
        comp = ReactDOM.render(
            <UserDialog user={{...enabledUser, newPassword: "aaabbb", confirmPassword: "bbbccc"}}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.isValidPassword()).toBe(false);
        // Valid password
        comp = ReactDOM.render(
            <UserDialog user={{name: "user", newPassword: "aA1!@#$%&*_", confirmPassword: "aA1!@#$%&*_"}}/>, document.getElementById("container"));
        expect(comp.isValidPassword()).toBe(true);
        // Invalid password, correct confirm
        comp = ReactDOM.render(
            <UserDialog user={{...enabledUser, newPassword: "aaabbbà", confirmPassword: "aaabbbà"}}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.isValidPassword()).toBe(false);
        // New user, empty password
        comp = ReactDOM.render(
            <UserDialog user={{...newUser, newPassword: "", confirmPassword: ""}}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.isValidPassword()).toBe(false);
    });
    it('Test without password fields', () => {
        let comp = ReactDOM.render(
            <UserDialog user={enabledUser} hidePasswordFields/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.getElementsByName("newPassword").length).toBe(0);
        expect(document.getElementsByName("confirmPassword").length).toBe(0);
    });
    it('Test new user', () => {
        let comp = ReactDOM.render(
            <UserDialog user={newUser} />, document.getElementById("container"));
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
            <UserDialog user={null} />, document.getElementById("container"));
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
            <UserDialog user={null} onChange={handlers.onChange} />, document.getElementById("container"));
        expect(comp).toExist();
        document.getElementsByName("enabled").item(0).click();

        comp = ReactDOM.render(
            <UserDialog user={newUser} onChange={handlers.onChange} />, document.getElementById("container"));
        document.getElementsByName("enabled").item(0).click();
        expect(spy.calls.length).toBe(2);
    });
    it('calls the save callback', () => {
        const handlers = {
            onSave() {}
        };
        let spy = expect.spyOn(handlers, "onSave");
        let comp = ReactDOM.render(
            <UserDialog user={{
                id: 1,
                name: "USER1",
                role: "USER",
                enabled: true,
                status: "modified"
            }} onSave={handlers.onSave} />, document.getElementById("container"));
        expect(comp).toExist();
        let domnode = ReactDOM.findDOMNode(comp);
        domnode.getElementsByTagName("button").item(1).click();

        expect(spy.calls.length).toBe(1);
    });
    it('displays the spinner', () => {
        let comp = ReactDOM.render(
            <UserDialog user={{
                id: 1,
                name: "USER1",
                role: "USER",
                "enabled": true,
                status: "saving"
            }} />, document.getElementById("container"));
        expect(comp).toExist();
        let domnode = ReactDOM.findDOMNode(comp);
        expect(domnode.getElementsByClassName("btn-primary")[0].disabled).toBe(true);
        expect(domnode.getElementsByClassName("spinner").length).toNotBe(0);
    });
    it('displays the success style', () => {
        let comp = ReactDOM.render(
            <UserDialog user={{
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
            <UserDialog user={{
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
            <UserDialog user={{
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
            <UserDialog user={newUser} />, document.getElementById("container"));
        expect(comp).toExist();
        const passwordField = document.querySelector("input[name='newPassword']");
        const closeBtn = document.querySelector(".btn-default");
        passwordField.value = 'password';
        ReactTestUtils.Simulate.click(closeBtn);
        expect(passwordField.value).toEqual('');
    });

    it('Test on close dialog using dialog header close btn, reset password field', () => {
        let comp = ReactDOM.render(
            <UserDialog user={newUser} />, document.getElementById("container"));
        expect(comp).toExist();
        const passwordField = document.querySelector("input[name='newPassword']");
        const closeBtn = document.querySelector(".login-panel-close");
        passwordField.value = 'password';
        ReactTestUtils.Simulate.click(closeBtn);
        expect(passwordField.value).toEqual('');
    });

    describe('unsaved changes modal', () => {
        it('showing unsaved changes modal and closing the modal', () => {
            const actions = {
                onClose: () => {}
            };
            const onCloseSpy = expect.spyOn(actions, 'onClose');

            const userDlg = ReactDOM.render(
                <UserDialog
                    user={{...newUser, status: "modified"}}
                    onClose={actions.onClose}
                />, document.getElementById("container"));
            expect(userDlg).toExist();
            let buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(3);
            let saveBtn = buttons[1];
            let closeBtn = buttons[2];
            expect(saveBtn.innerText).toBe("users.createUser");
            expect(closeBtn.innerText).toBe("saveDialog.close");
            ReactTestUtils.Simulate.click(closeBtn);
            buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(6);

            let closeBtnModal = buttons[4];
            let cancelBtnModal = buttons[5];
            expect(closeBtnModal.innerText).toBe("saveDialog.close");
            expect(cancelBtnModal.innerText).toBe("saveDialog.cancel");
            ReactTestUtils.Simulate.click(closeBtnModal);

            expect(onCloseSpy).toHaveBeenCalled();
        });
    });
});
