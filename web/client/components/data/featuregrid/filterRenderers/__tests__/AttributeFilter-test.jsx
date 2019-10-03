/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const AttributeFilter = require('../AttributeFilter');
var Localized = require('../../../../I18N/Localized');

const expect = require('expect');

describe('Test for AttributeFilter component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<AttributeFilter/>, document.getElementById("container"));
        const el = document.getElementsByClassName("form-control input-sm")[0];
        expect(el).toExist();
    });
    it('render not filterable', () => {
        ReactDOM.render(<AttributeFilter column={{filterable: false}}/>, document.getElementById("container"));
        expect(document.getElementsByTagName("input").length).toBe(0);
    });
    it('check tooltip', () => {
        const cmp = ReactDOM.render(<Localized locale="en-US" messages={{test: "TEST"}}><AttributeFilter tooltipMsgId="test"/></Localized>, document.getElementById("container"));
        expect(cmp).toExist();
        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        const filterDomCmp = ReactTestUtils.findRenderedComponentWithType(cmp, AttributeFilter);
        expect(filterDomCmp).toExist();
        ReactTestUtils.Simulate.mouseEnter(ReactDOM.findDOMNode(filterDomCmp));
    });
    it('render with value', () => {
        const cmp = ReactDOM.render(<AttributeFilter value={"TEST"}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("form-control input-sm")[0];
        expect(el).toExist();
        const input = ReactTestUtils.findRenderedDOMComponentWithTag(cmp, "input");
        expect(input.value).toBe("TEST");
    });
    it('render invalid', () => {
        const cmp = ReactDOM.render(<AttributeFilter value={"TEST"} valid={false}/>, document.getElementById("container"));
        const input = ReactTestUtils.findRenderedDOMComponentWithTag(cmp, "input");
        expect(input.value).toBe("TEST");
        expect( document.getElementsByClassName("has-error").length > 0).toBe(true);
    });
    it('Test AttributeFilter onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        const cmp = ReactDOM.render(<AttributeFilter onChange={actions.onChange} />, document.getElementById("container"));
        expect(cmp).toExist();
        const input = ReactTestUtils.findRenderedDOMComponentWithTag(cmp, "input");
        input.value = "test";
        ReactTestUtils.Simulate.change(input);
        expect(spyonChange).toHaveBeenCalled();
    });
});
