/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import DefaultGroup from '../DefaultGroup';

const Group = dragDropContext(testBackend)(DefaultGroup);
const CustomChildNode = ({ node }) => {
    return <div className="custom-node">{node.id}</div>;
};

describe('test Group module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test Group creation', () => {
        const layers = [{
            id: 'layer01',
            name: 'layer01',
            title: 'Layer 1',
            visibility: true,
            storeIndex: 0,
            type: 'wms',
            group: 'grp'
        }, {
            id: 'layer02',
            name: 'layer02',
            title: 'Layer 2',
            visibility: true,
            storeIndex: 1,
            type: 'wms',
            group: ''
        }];

        const group = {
            id: 'Group',
            name: 'grp',
            title: 'Group',
            nodes: layers
        };
        ReactDOM.render(<Group node={group}><CustomChildNode/></Group>, document.getElementById("container"));
        const children = document.querySelectorAll('.ms-node-group > ul .custom-node');
        expect(children.length).toBe(2);
    });

    it('test Group creation with filter', () => {
        const layers = [{
            id: 'layer01',
            name: 'layer01',
            title: 'Layer 1',
            visibility: true,
            storeIndex: 0,
            type: 'wms',
            group: 'grp'
        }, {
            id: 'layer02',
            name: 'layer02',
            title: 'Layer 2',
            visibility: true,
            storeIndex: 1,
            type: 'wms',
            group: ''
        }];

        const group = {
            id: 'Group',
            name: 'grp',
            title: 'Group',
            nodes: layers
        };
        ReactDOM.render(<Group node={group} filter={(node) => node.name === 'grp'}><CustomChildNode/></Group>, document.getElementById("container"));
        const children = document.querySelectorAll('.ms-node-group > ul .custom-node');
        expect(children.length).toBe(2);
    });

    it('test Group collapsed', () => {
        const layers = [{
            id: 'layer01',
            name: 'layer01',
            title: 'Layer 1',
            visibility: true,
            storeIndex: 0,
            type: 'wms',
            group: 'grp'
        }, {
            id: 'layer02',
            name: 'layer02',
            title: 'Layer 2',
            visibility: true,
            storeIndex: 1,
            type: 'wms',
            group: ''
        }];

        const group = {
            id: 'Group',
            name: 'grp',
            title: 'Group',
            nodes: layers,
            expanded: false
        };
        ReactDOM.render(<Group node={group}><CustomChildNode/></Group>, document.getElementById("container"));
        const children = document.querySelectorAll('.ms-node-group > ul .custom-node');
        expect(children.length).toBe(0);
    });

    it('test Group expanded', () => {
        const layers = [{
            id: 'layer01',
            name: 'layer01',
            title: 'Layer 1',
            visibility: true,
            storeIndex: 0,
            type: 'wms',
            group: 'grp'
        }, {
            id: 'layer02',
            name: 'layer02',
            title: 'Layer 2',
            visibility: true,
            storeIndex: 1,
            type: 'wms',
            group: ''
        }];

        const group = {
            id: 'Group',
            name: 'grp',
            title: 'Group',
            nodes: layers,
            expanded: true
        };
        ReactDOM.render(<Group node={group} ><CustomChildNode/></Group>, document.getElementById("container"));
        const children = document.querySelectorAll('.ms-node-group > ul .custom-node');
        expect(children.length).toBe(2);
    });

    it('test group visibility checkbox', () => {
        const layers = [{
            id: 'layer01',
            name: 'layer01',
            title: 'Layer 1',
            visibility: true,
            storeIndex: 0,
            type: 'wms',
            group: 'grp'
        }];
        const group = {
            id: 'Group',
            name: 'grp',
            title: 'Group',
            nodes: layers,
            visibility: false
        };
        const actions = {
            onChange: () => {}
        };
        let spy = expect.spyOn(actions, "onChange");
        ReactDOM.render(<Group node={group} nodeType="groups" onChange={actions.onChange}><CustomChildNode/></Group>,
            document.getElementById("container"));
        const visibilityNode = document.querySelector('.ms-visibility-check');
        expect(visibilityNode.querySelector('.glyphicon-checkbox-off'));
        Simulate.click(visibilityNode);
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(1);
        expect(spy.calls[0].arguments[0].node.id).toBe('Group');
        expect(spy.calls[0].arguments[0].nodeType).toBe('groups');
        expect(spy.calls[0].arguments[0].options).toEqual({ visibility: true });
    });
    it('test group visibility radio', () => {
        const layers = [{
            id: 'layer01',
            name: 'layer01',
            title: 'Layer 1',
            visibility: true,
            storeIndex: 0,
            type: 'wms',
            group: 'grp'
        }];
        const group = {
            id: 'Group',
            name: 'grp',
            title: 'Group',
            nodes: layers,
            visibility: false
        };
        const actions = {
            onChange: () => {}
        };
        let spy = expect.spyOn(actions, "onChange");
        ReactDOM.render(<Group node={group} nodeType="groups" mutuallyExclusive onChange={actions.onChange}><CustomChildNode/></Group>,
            document.getElementById("container"));
        const visibilityNode = document.querySelector('.ms-visibility-check');
        expect(visibilityNode.querySelector('.glyphicon-radio-off'));
        Simulate.click(visibilityNode);
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(1);
        expect(spy.calls[0].arguments[0].node.id).toBe('Group');
        expect(spy.calls[0].arguments[0].nodeType).toBe('groups');
        expect(spy.calls[0].arguments[0].options).toEqual({ visibility: true });
    });

});
