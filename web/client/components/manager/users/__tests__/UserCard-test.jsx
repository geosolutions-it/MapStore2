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
const UserCard = require('../UserCard');
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
    }]
};
const adminUser = {
    id: 3,
    name: "ADMIN",
    role: "ADMIN",
    enabled: true
};
describe("Test UserCard Component", () => {
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
            <UserCard user={enabledUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelector('#container .gridcard')).toExist();
    });
    it('Test disabled user rendering', () => {
        let comp = ReactDOM.render(
            <UserCard user={disabledUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelector('#container .gridcard')).toExist();
    });
    it('Test admin user rendering', () => {
        let comp = ReactDOM.render(
            <UserCard user={adminUser}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelector('#container .gridcard')).toExist();
    });
    it('Test admin user with undefined group do not crash', () => {
        let comp = ReactDOM.render(
            <UserCard user={{...enabledUser, groups: [undefined]}} />, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelector('#container .gridcard')).toExist();
    });
    it('Test username rendering inside the card', () => {
        let comp = ReactDOM.render(
            <UserCard user={enabledUser} />, document.getElementById("container"));
        expect(comp).toExist();
        let items = document.querySelectorAll('#container .gridcard .user-data-container .user-card-info-container > div');
        let renderName = items[0];
        expect(renderName.innerHTML).toBe(enabledUser.name);
    });
});
