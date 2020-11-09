import React from 'react';
import ReactDOM from 'react-dom';
import { get } from 'lodash';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import ChartAdvancedOptions from '../ChartAdvancedOptions';


describe('chart advanced options', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('onChange events', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<ChartAdvancedOptions data={{ type: 'bar' }} onChange={actions.onChange} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        // 0 is panel switch
        // cartesian
        ReactTestUtils.Simulate.change(inputs[1]);
        expect(spyonChange.calls[0].arguments[0]).toBe("cartesian");
        expect(spyonChange.calls[0].arguments[1]).toBe(false);
        // y axis type
        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'widgets.advanced.axisTypes.linear' } });
        ReactTestUtils.Simulate.keyDown(inputs[2], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("yAxisOpts.type");
        expect(spyonChange.calls[1].arguments[1]).toBe("linear");

        // y hide labels
        ReactTestUtils.Simulate.change(inputs[3]);
        expect(spyonChange.calls[2].arguments[0]).toBe("yAxis");
        expect(spyonChange.calls[2].arguments[1]).toBe(true);

        // x axis type
        ReactTestUtils.Simulate.change(inputs[4], { target: { value: 'widgets.advanced.axisTypes.linear' } });
        ReactTestUtils.Simulate.keyDown(inputs[4], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[3].arguments[0]).toBe("xAxisOpts.type");
        expect(spyonChange.calls[3].arguments[1]).toBe("linear");

        // x hide labels
        ReactTestUtils.Simulate.change(inputs[5]);
        expect(spyonChange.calls[4].arguments[0]).toBe("xAxisOpts.hide");
        expect(spyonChange.calls[4].arguments[1]).toBe(true);

        // force ticks
        ReactTestUtils.Simulate.change(inputs[6]);
        expect(spyonChange.calls[5].arguments[0]).toBe("xAxisOpts.forceTicks");
        expect(spyonChange.calls[5].arguments[1]).toBe(true);

        // label rotation
        ReactTestUtils.Simulate.change(inputs[7]);
        expect(spyonChange.calls[6].arguments[0]).toBe("xAxisAngle");
        expect(spyonChange.calls[6].arguments[1]).toBe(0);
        // label rotation
        ReactTestUtils.Simulate.change(inputs[8], {target: { value: "test"}});
        expect(spyonChange.calls[7].arguments[0]).toBe("yAxisLabel");
        expect(spyonChange.calls[7].arguments[1]).toBe("test");
    });
    it('xAxis advanced options disabled when hide', () => {

        ReactDOM.render(<ChartAdvancedOptions data={{ type: 'bar', xAxisOpts: { hide: true } }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        // 0 is panel switch

        // switch checked
        expect(inputs[5].value).toEqual('on');
        expect(inputs[6].disabled).toBeTruthy();
        expect(inputs[7].disabled).toBeTruthy();
    });
});

