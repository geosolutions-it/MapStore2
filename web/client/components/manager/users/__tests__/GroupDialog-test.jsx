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
const GroupDialog = require('../GroupDialog');
const ReactTestUtils = require('react-dom/test-utils');
const user1 = {
    id: 100,
    name: "USER2",
    role: "USER",
    enabled: false,
    groups: [{
        id: 1,
        groupName: "GROUP1"
    }]
};
const user2 = {
    id: 101,
    name: "ADMIN",
    role: "ADMIN",
    enabled: true,
    groups: [{
        id: 1,
        groupName: "GROUP1"
    }]
};
const group1 = {
    id: 1,
    groupName: "GROUP1",
    description: "description",
    enabled: true,
    users: [user1, user2]
};
const users = [ user1, user2 ];
describe("Test GroupDialog Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test group rendering', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1}/>, document.getElementById("container"));
        expect(comp).toExist();
    });

    it('Test group loading', () => {
        let comp = ReactDOM.render(
            <GroupDialog show group={{...group1, status: "loading"}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test group error', () => {
        let comp = ReactDOM.render(
            <GroupDialog show group={{...group1, lastError: {statusText: "ERROR"}}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test group dialog with users', () => {
        let comp = ReactDOM.render(
            <GroupDialog show group={group1} availableUsers={users}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Test group dialog with new users', () => {
        let comp = ReactDOM.render(
            <GroupDialog show group={{...group1, newUsers: [user1]}} availableUsers={users}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('Testing selected group-dialog-tab is highlighted', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1} />,
            document.getElementById("container"));

        expect(comp).toExist();
        const tabs = document.querySelectorAll('.nav.nav-justified > li');
        expect(tabs[0].getAttribute('class')).toBe('active');
        const groupGroupButton = tabs[1].children[0];
        ReactTestUtils.Simulate.click(groupGroupButton);
        expect(tabs[1].getAttribute('class')).toBe('active');
    });

    it('Testing asterisk inside mandatory field', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1} />,
            document.getElementById("container"));

        expect(comp).toExist();
        const labels = document.querySelectorAll('.control-label');
        const [ groupName, description ] = labels;
        expect(groupName.children.length).toBe(2);
        expect(groupName.children[0].innerHTML).toBe('usergroups.groupName');
        expect(groupName.children[1].innerHTML).toBe('*');

        expect(description.children.length).toBe(1);
        expect(description.children[0].innerHTML).toBe('usergroups.groupDescription');
    });

    it('should toggle select member field popup', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1} />,
            document.getElementById("container"));
        expect(comp.state.openSelectMember).toBe(false);
        comp.handleToggleSelectMember(true);
        expect(comp.state.openSelectMember).toBe(true);
    });

    it('should handle select member change on text change', () => {
        const actions = {
            searchUsers: () => { }
        };
        const spySearchUsers = expect.spyOn(actions, 'searchUsers');
        const comp = ReactDOM.render(
            <GroupDialog group={group1} searchUsers={actions.searchUsers} />,
            document.getElementById("container"));
        const text = 'test';
        comp.handleSelectMemberOnChange(text);
        expect(comp.state.selectedMember).toEqual(text);
        expect(spySearchUsers).toHaveBeenCalled();
    });

    it('should handle select member change on value select', () => {
        const actions = {
            onChange: () => { }
        };
        const selected = { id: 1, name: 'test', value: 1 };
        const availableUsers = [selected];
        const spyOnChange = expect.spyOn(actions, 'onChange');
        const comp = ReactDOM.render(
            <GroupDialog group={group1} onChange={actions.onChange} availableUsers={availableUsers} />,
            document.getElementById("container"));
        comp.handleSelect();
        comp.handleSelectMemberOnChange(selected);
        expect(spyOnChange).toHaveBeenCalled();
    });

    it('should go to next member page', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1} />,
            document.getElementById("container"));
        expect(comp.selectMemberPage).toEqual(0);
        comp.loadNextPageMembers();
        expect(comp.selectMemberPage).toBe(6);
    });

    it('should go to prev member page', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1} />,
            document.getElementById("container"));
        comp.selectMemberPage = 11;
        comp.loadPrevPageMembers();
        expect(comp.selectMemberPage).toBe(6);
    });
    it('should go to last member page', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group1} availableUsersCount={15} />,
            document.getElementById("container"));
        comp.selectMemberPage = 11;
        comp.loadNextPageMembers();
        expect(comp.isLastPage()).toBe(true);
    });
    describe('unsaved changes modal', () => {
        it('showing unsaved changes modal and closing the modal', () => {
            const actions = {
                onClose: () => {}
            };
            const onCloseSpy = expect.spyOn(actions, 'onClose');

            const groupDlg = ReactDOM.render(
                <GroupDialog
                    group={{...group1, status: "modified"}}
                    onClose={actions.onClose}
                />, document.getElementById("container"));
            expect(groupDlg).toExist();
            let buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(6);
            let saveBtn = buttons[4];
            let closeBtn = buttons[5];
            expect(saveBtn.innerText).toBe("usergroups.saveGroup");
            expect(closeBtn.innerText).toBe("saveDialog.close");
            ReactTestUtils.Simulate.click(closeBtn); // click on enhanced close button

            buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(9);

            let closeBtnModal = buttons[7];
            let cancelBtnModal = buttons[8];
            expect(closeBtnModal.innerText).toBe("saveDialog.close");
            expect(cancelBtnModal.innerText).toBe("saveDialog.cancel");
            ReactTestUtils.Simulate.click(closeBtnModal);  // click on close button of the confirm modal

            expect(onCloseSpy).toHaveBeenCalled();
        });
    });

    it('search user result from text change must be called with text changed', () => {
        const actions = {
            searchUsers: () => { }
        };
        const spySearchUsers = expect.spyOn(actions, 'searchUsers');
        ReactDOM.render(
            <GroupDialog group={group1} searchUsers={actions.searchUsers} />,
            document.getElementById("container"));
        const input = document.querySelector('.rw-input');
        input.value = 'test';
        ReactTestUtils.Simulate.change(input);
        expect(spySearchUsers).toHaveBeenCalledWith('test', 0, 5);
        spySearchUsers.restore();
    });
});
