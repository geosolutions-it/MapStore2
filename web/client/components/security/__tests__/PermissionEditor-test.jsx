/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-addons-test-utils');
const PermissionEditor = require('../PermissionEditor');

let setupEditor = (docElement, actions) => {
    return ReactDOM.render(<PermissionEditor
        {...actions}
        map={{
        permissions: {
            SecurityRuleList: {
                SecurityRule: [
                    {
                        canRead: true,
                        canWrite: false,
                        group: {
                            groupName: "everyone"
                        }
                    }, {
                        canRead: true,
                        canWrite: true,
                        group: {
                            groupName: "g11"
                        }
                    }
                ]
            }
        }
    }}
    availableGroups = {[{
        groupName: "everyone",
        id: "1234"
    }, {
        groupName: "g22",
        id: "22"
    }]} />, docElement);
};

describe("Test the permission editor component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<PermissionEditor/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component with some existing permission rules', () => {
        const cmp = setupEditor(document.getElementById("container"));
        expect(cmp).toExist();
        const nodeEven = ReactTestUtils.scryRenderedDOMComponentsWithClass(cmp, "even");
        expect(nodeEven.length).toBe(1);
        const nodeOdd = ReactTestUtils.scryRenderedDOMComponentsWithClass(cmp, "odd");
        expect(nodeOdd.length).toBe(1);
    });

    it('changes a security rule', () => {
        let actions = {
            onGroupsChange: (c) => {
                return {c};
            },
            onNewGroupChoose: () => {}
        };
        let groupChangeSpy = expect.spyOn(actions, "onGroupsChange");

        const cmp = setupEditor(document.getElementById("container"), actions);
        expect(cmp).toExist();

        const cmpDom = document.querySelector("tr.odd > td:nth-child(2) > div > select");
        expect(cmpDom).toExist();

        cmpDom.selectedIndex = 0;
        let event = new Event('change', {bubbles: true});
        cmpDom.dispatchEvent(event);

        cmpDom.selectedIndex = 1;
        cmpDom.dispatchEvent(event);

        expect(groupChangeSpy.calls.length).toBe(2);
    });

    it('changes groups rules clicking the Add permission button', () => {
        let actions = {
            onGroupsChange: (c) => {
                return {c};
            },
            onNewGroupChoose: () => {},
            newGroup: { groupName: "everyone", id: 1234 }
        };
        let groupChangeSpy = expect.spyOn(actions, "onNewGroupChoose");
        let groupChangeCallbackSpy = expect.spyOn(actions, "onGroupsChange");

        const cmp = setupEditor(document.getElementById("container"), actions);
        expect(cmp).toExist();

        const cmpDom = document.querySelector("select[data-reactid*=addRowKey]");
        expect(cmpDom).toExist();

        cmpDom.selectedIndex = 0;
        let event = new Event('change', {bubbles: true});
        cmpDom.dispatchEvent(event);

        expect(groupChangeSpy.calls.length).toBe(1);

        const addBtnDom = document.querySelector("button[data-reactid*=addRowKey]");
        expect(addBtnDom).toExist();
        addBtnDom.click();

        expect(groupChangeCallbackSpy.calls.length).toBe(1);
    });


    it('changes adds a new groups rules clicking the Add permission button', () => {
        let actions = {
            onGroupsChange: (c) => {
                return {c};
            },
            onNewGroupChoose: () => {},
            onAddPermission: () => {},
            newGroup: { groupName: "g22", id: 22}
        };
        let groupChangeSpy = expect.spyOn(actions, "onNewGroupChoose");
        let groupChangeCallbackSpy = expect.spyOn(actions, "onGroupsChange");
        let groupAddCallbackSpy = expect.spyOn(actions, "onAddPermission");

        const cmp = setupEditor(document.getElementById("container"), actions);
        expect(cmp).toExist();

        const cmpDom = document.querySelector("select[data-reactid*=addRowKey]");
        expect(cmpDom).toExist();

        cmpDom.selectedIndex = 1;
        let event = new Event('change', {bubbles: true});
        cmpDom.dispatchEvent(event);

        expect(groupChangeSpy.calls.length).toBe(1);

        const addBtnDom = document.querySelector("button[data-reactid*=addRowKey]");
        expect(addBtnDom).toExist();
        addBtnDom.click();

        expect(groupChangeCallbackSpy.calls.length).toBe(0);
        expect(groupAddCallbackSpy.calls.length).toBe(1);
    });
});
