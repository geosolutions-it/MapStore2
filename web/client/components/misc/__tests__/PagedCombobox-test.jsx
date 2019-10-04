/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const PagedCombobox = require('../combobox/PagedCombobox');
const TestUtils = require('react-dom/test-utils');
const {Tooltip} = require('react-bootstrap');
const AutocompleteListItem = require('../../data/query/AutocompleteListItem');

describe("This test for PagedCombobox component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('creates PagedCombobox with defaults', () => {
        const comp = ReactDOM.render(<PagedCombobox/>, document.getElementById("container"));
        expect(comp).toExist();

        const input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-input")[0]);
        // triggering default actions
        TestUtils.Simulate.change(input, {
            target: {
                value: "other"
            }
        });
        TestUtils.Simulate.focus(input);

    });
    it('creates PagedCombobox with defaults and with basic tooltip', () => {
        const tooltip = {
            message: "wow",
            enabled: true,
            id: "1",
            overlayTriggerKey: "key",
            placement: "top"
        };
        const comp = ReactDOM.render(<PagedCombobox tooltip={tooltip}/>, document.getElementById("container"));
        expect(comp).toExist();
    });

    it('creates PagedCombobox with functional itemComponent', () => {
        const AutocompleteListItemFunctional = ({item, textField}) => (
            !!item.pagination ? <span>{item[textField]} {item.pagination} </span> : <span>{item[textField]}</span>
        );
        const comp = ReactDOM.render(<PagedCombobox pagination={{paginated: false}} itemComponent={AutocompleteListItemFunctional} textField="label" data={[{value: "value", label: "label"}]} />, document.getElementById("container"));
        expect(comp).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-i rw-i-caret-down")[0]);
        tool.click();
        const option1 = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-list-option")[0]);
        expect(option1.textContent).toBe("label");

    });
    it('creates PagedCombobox with class itemComponent', () => {
        const comp = ReactDOM.render(<PagedCombobox pagination={{paginated: false}} itemComponent={AutocompleteListItem} textField="label" data={[{value: "value", label: "label"}]}/>, document.getElementById("container"));
        expect(comp).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-i rw-i-caret-down")[0]);
        tool.click();
        const option1 = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-list-option")[0]);
        expect(option1.textContent).toBe("label");
    });
    it('creates PagedCombobox with defaults and with customized tooltip', () => {
        const tooltip = <Tooltip id={"wonderfulId"}>"a message for the tooltip"</Tooltip>;

        const comp = ReactDOM.render(<PagedCombobox tooltip={{customizedTooltip: tooltip}}/>, document.getElementById("container"));
        expect(comp).toExist();
    });
    it('tests PagedCombobox onToggle and opening of option lists', () => {
        const actions = {
            onToggle: () => {}
        };
        const spy = expect.spyOn(actions, "onToggle");
        const data = [{
            label: "label", value: "value"
        }];
        const comp = ReactDOM.render(<PagedCombobox onToggle={actions.onToggle} data={data}/>, document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-i rw-i-caret-down")[0]);
        tool.click();
        expect(spy.calls.length).toBe(1);
        // this tests if the option list is opened
        const firstOption = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-list-option")[0]);
        expect(firstOption).toExist();
        const valueOption = firstOption.getElementsByTagName("span")[0];
        expect(valueOption).toExist();
        expect(valueOption.innerText).toBe("label");
    });
    it('tests PagedCombobox onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, "onChange");
        const data = [{
            label: "label", value: "value"
        }];
        const comp = ReactDOM.render(<PagedCombobox onChange={actions.onChange} data={data}/>, document.getElementById("container"));
        expect(comp).toExist();
        const input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-input")[0]);
        TestUtils.Simulate.change(input, {
            target: {
                value: "other"
            }
        });
        expect(spy.calls.length).toBe(1);
    });
    it('tests PagedCombobox onFocus', (done) => {
        const actions = {
            onFocus: () => {}
        };
        const spy = expect.spyOn(actions, "onFocus");
        const data = [{
            label: "label", value: "value"
        }];
        const comp = ReactDOM.render(<PagedCombobox onFocus={actions.onFocus} data={data}/>, document.getElementById("container"));
        expect(comp).toExist();
        const input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-input")[0]);
        TestUtils.Simulate.focus(input);
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            done();
        }, 50);
    });

    it('tests PagedCombobox onSelect and opening of option lists', (done) => {
        const actions = {
            onSelect: () => {}
        };
        const spy = expect.spyOn(actions, "onSelect");
        const data = [{
            label: "label", value: "value"
        }];
        const comp = ReactDOM.render(<PagedCombobox onSelect={actions.onSelect} data={data}/>, document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-i rw-i-caret-down")[0]);
        tool.click();
        // this tests if the option list is opened
        const firstOption = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "rw-list-option")[0]);
        expect(firstOption).toExist();
        const valueOption = firstOption.getElementsByTagName("span")[0];
        expect(valueOption).toExist();
        TestUtils.Simulate.click(firstOption);
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            done();
        }, 50);
    });
});
