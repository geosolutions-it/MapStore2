/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';

import Transfer from '../Transfer';

const testLeftColumn = {
    items: [{
        id: 'item1',
        title: "Item1"
    }, {
        id: 'item2',
        title: "Item2"
    }, {
        id: 'item3',
        title: "Item3"
    }, {
        id: 'item4',
        title: "Item4"
    }],
    title: 'Left Column'
};

const testRightColumn = {
    items: [{
        id: 'item5',
        title: "Item5"
    }, {
        id: 'item6',
        title: "Item6"
    }, {
        id: 'item7',
        title: "Item7"
    }],
    title: 'Right Column'
};

describe('Transfer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Transfer rendering with defaults', () => {
        ReactDOM.render(<Transfer />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer')[0]).toExist();
    });
    it('Transfer with items', () => {
        ReactDOM.render(<Transfer leftColumn={testLeftColumn} rightColumn={testRightColumn}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer')[0]).toExist();
        const columns = container.getElementsByClassName('ms2-transfer-sidegrid');
        expect(columns.length).toBe(2);
        expect(columns[0].getElementsByClassName('mapstore-side-card').length).toBe(testLeftColumn.items.length);
        expect(columns[1].getElementsByClassName('mapstore-side-card').length).toBe(testRightColumn.items.length);
    });
    it('Move buttons', () => {
        const actions = {
            onTransfer: () => {}
        };

        const spy = expect.spyOn(actions, 'onTransfer');

        ReactDOM.render(<Transfer leftColumn={testLeftColumn} rightColumn={testRightColumn} {...actions}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer')[0]).toExist();
        const moveButtonsContainer = container.getElementsByClassName('btn-group-vertical')[0];
        expect(moveButtonsContainer).toExist();
        const moveButtons = moveButtonsContainer.getElementsByClassName('square-button-md');
        expect(moveButtons.length).toBe(4);
        expect(moveButtons[0].hasAttribute('disabled')).toBe(false);
        expect(moveButtons[1].hasAttribute('disabled')).toBe(true);
        expect(moveButtons[2].hasAttribute('disabled')).toBe(true);
        expect(moveButtons[3].hasAttribute('disabled')).toBe(false);

        TestUtils.Simulate.click(moveButtons[0]);
        TestUtils.Simulate.click(moveButtons[3]);

        expect(spy.calls.length).toBe(2);
        expect(spy.calls[0].arguments[0]).toEqual(testLeftColumn.items);
        expect(spy.calls[0].arguments[1]).toBe('right');
        expect(spy.calls[1].arguments[0]).toEqual(testRightColumn.items);
        expect(spy.calls[1].arguments[1]).toBe('left');
    });
    it('Move buttons with selected items', () => {
        const actions = {
            onTransfer: () => {}
        };

        const spy = expect.spyOn(actions, 'onTransfer');

        ReactDOM.render(<Transfer leftColumn={testLeftColumn} rightColumn={testRightColumn} selectedItems={[testLeftColumn.items[1]]}
            selectedSide="left" {...actions}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer')[0]).toExist();
        const moveButtonsContainer = container.getElementsByClassName('btn-group-vertical')[0];
        expect(moveButtonsContainer).toExist();
        const moveButtons = moveButtonsContainer.getElementsByClassName('square-button-md');
        expect(moveButtons.length).toBe(4);
        expect(moveButtons[0].hasAttribute('disabled')).toBe(false);
        expect(moveButtons[1].hasAttribute('disabled')).toBe(false);
        expect(moveButtons[2].hasAttribute('disabled')).toBe(true);
        expect(moveButtons[3].hasAttribute('disabled')).toBe(false);

        TestUtils.Simulate.click(moveButtons[1]);

        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments[0]).toEqual([testLeftColumn.items[1]]);
        expect(spy.calls[0].arguments[1]).toBe('right');
    });
    it('Move buttons with no items', () => {
        ReactDOM.render(<Transfer leftColumn={{}} rightColumn={{}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer')[0]).toExist();
        const moveButtonsContainer = container.getElementsByClassName('btn-group-vertical')[0];
        expect(moveButtonsContainer).toExist();
        const moveButtons = moveButtonsContainer.getElementsByClassName('square-button-md');
        expect(moveButtons.length).toBe(4);
        expect(moveButtons[0].hasAttribute('disabled')).toBe(true);
        expect(moveButtons[1].hasAttribute('disabled')).toBe(true);
        expect(moveButtons[2].hasAttribute('disabled')).toBe(true);
        expect(moveButtons[3].hasAttribute('disabled')).toBe(true);
    });
    it('Filter test', () => {
        ReactDOM.render(<Transfer leftColumn={testLeftColumn} rightColumn={{...testRightColumn, filterText: "item5"}}
            filter={(text, items) => items.filter(item => text === '' || item.id === text)}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer')[0]).toExist();
        const columns = container.getElementsByClassName('ms2-transfer-sidegrid');
        const leftItems = columns[0].getElementsByClassName('mapstore-side-card');
        const rightItems = columns[1].getElementsByClassName('mapstore-side-card');
        expect(leftItems.length).toBe(4);
        expect(rightItems.length).toBe(1);
        const title = rightItems[0].getElementsByClassName('mapstore-side-card-title')[0];
        expect(title.textContent).toBe(testRightColumn.items[0].title);
    });
});
