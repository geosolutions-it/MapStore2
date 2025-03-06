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
import GroupDialog from '../GroupDialog';
import ReactTestUtils from 'react-dom/test-utils';
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
const group2 = {
    id: 2,
    groupName: "GROUP2",
    description: "description",
    enabled: true,
    users: [user1, user2],
    attributes: [{
        name: "attribute1",
        value: "value1"
    }, {
        name: "attribute2",
        value: "value2"
    }]
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
            const groupDlg = ReactDOM.render(
                <GroupDialog
                    group={{...group1, status: "modified"}}
                    onClose={actions.onClose}
                />, document.getElementById("container"));
            expect(groupDlg).toExist();
            let buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(6);
            let closeBtn = buttons[4];
            let saveBtn = buttons[5];
            expect(closeBtn.innerText).toBe("saveDialog.close");
            expect(saveBtn.innerText).toBe("usergroups.saveGroup");
            ReactTestUtils.Simulate.click(closeBtn); // click on enhanced close button

            buttons = document.querySelectorAll('button');
            expect(buttons.length).toBe(8);


            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeTruthy();
            const buttons_ = dialog.querySelectorAll('.btn');
            expect(buttons_.length).toBe(4);
            const confirmButton = buttons_[1];
            expect(confirmButton).toBeTruthy();
            ReactTestUtils.Simulate.click(confirmButton);
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
    it('group attributes tab', () => {
        let comp = ReactDOM.render(
            <GroupDialog group={group2} showAttributesTab attributeFields={[{name: "attribute1"}, {name: "attribute2", controlType: "text"}]}/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const tabs = document.querySelectorAll('.nav.nav-justified > li');
        expect(tabs[0].getAttribute('class')).toBe('active');
        const groupAttributesButton = tabs[2].children[0];
        ReactTestUtils.Simulate.click(groupAttributesButton);
        expect(tabs[2].getAttribute('class')).toBe('active');
        const groupAttributesTab = document.querySelector('.tab-content > div:nth-child(3)');
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
});
