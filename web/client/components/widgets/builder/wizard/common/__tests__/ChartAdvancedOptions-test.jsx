import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import ChartAdvancedOptions from '../ChartAdvancedOptions';

const getInputs = () => {
    const inputs = document.querySelectorAll('input');
    // 0 is panel switch
    return {
        cartesian: inputs[1],
        yAxis: inputs[3],
        yAxisOpts: {
            type: inputs[2],
            tickPrefix: inputs[4],
            format: inputs[5],
            tickSuffix: inputs [6]
        },
        formula: inputs [7],
        yAxisLabel: inputs[12], // legend
        xAxisOpts: {
            type: inputs[8],
            hide: inputs[9],
            nTicks: inputs[10] // force ticks
        },
        xAxisAngle: inputs[11]
    };
};
const createSpyOnChange = () => {
    const actions = {
        onChange: () => { }
    };
    const spyonChange = expect.spyOn(actions, 'onChange');
    ReactDOM.render(<ChartAdvancedOptions data={{ type: 'bar' }} onChange={actions.onChange} />, document.getElementById("container"));
    return spyonChange;
};
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
    const TYPE = { type: 'bar' };
    it('defaults', () => {
        ReactDOM.render(<ChartAdvancedOptions data={TYPE} />, document.getElementById("container"));

        expect(getInputs().yAxis.checked).toBeTruthy();
        expect(getInputs().xAxisOpts.nTicks.checked).toBeFalsy();

        expect(getInputs().cartesian.checked).toBeFalsy();
    });
    it('cartesian (hide grid)', () => {
        // default
        ReactDOM.render(<ChartAdvancedOptions data={TYPE} />, document.getElementById("container"));
        expect(getInputs().cartesian.checked).toBeFalsy();

        // from props
        ReactDOM.render(<ChartAdvancedOptions data={{...TYPE, cartesian: false}} />, document.getElementById("container"));
        expect(getInputs().cartesian.checked).toBeTruthy(); // checkbox has inverse condition, hide

        // change event
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().cartesian);
        expect(spyOnChange.calls[0].arguments[0]).toBe("cartesian");
        expect(spyOnChange.calls[0].arguments[1]).toBe(false);
    });
    it('yAxis (hide labels)', () => {
        // default
        ReactDOM.render(<ChartAdvancedOptions data={TYPE} />, document.getElementById("container"));
        expect(getInputs().yAxis.checked).toBeTruthy();

        // from props
        ReactDOM.render(<ChartAdvancedOptions data={{ ...TYPE, yAxis: true }}/>, document.getElementById("container"));
        expect(getInputs().yAxis.checked).toBeFalsy(); // inverse condition

        // change event
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().yAxis);
        expect(spyOnChange.calls[0].arguments[0]).toBe("yAxis");
        expect(spyOnChange.calls[0].arguments[1]).toBe(true);
    });
    it('force ticks (nTicks = 200)', () => {
        // default
        ReactDOM.render(<ChartAdvancedOptions data={TYPE} />, document.getElementById("container"));
        expect(getInputs().xAxisOpts.nTicks.checked).toBeFalsy();

        // from props
        ReactDOM.render(<ChartAdvancedOptions data={{ ...TYPE, xAxisOpts: {nTicks: 200} }} />, document.getElementById("container"));
        expect(getInputs().xAxisOpts.nTicks.checked).toBeTruthy();

        // change event
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().xAxisOpts.nTicks);
        expect(spyOnChange.calls[0].arguments[0]).toBe("xAxisOpts.nTicks");
        expect(spyOnChange.calls[0].arguments[1]).toBe(200);
    });
    it('x axis hide labels', () => {
        // default
        ReactDOM.render(<ChartAdvancedOptions data={TYPE} />, document.getElementById("container"));
        expect(getInputs().xAxisOpts.hide.checked).toBeFalsy();

        // from props
        ReactDOM.render(<ChartAdvancedOptions xAxisOpts={{ nTicks: 200 }} data={TYPE} />, document.getElementById("container"));
        expect(getInputs().xAxisOpts.nTicks.value).toBeTruthy();
        ReactDOM.render(<ChartAdvancedOptions xAxisOpts={{ hide: true }} data={TYPE} />, document.getElementById("container"));
        expect(getInputs().xAxisOpts.hide.value).toBeTruthy();

        // change event
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().xAxisOpts.hide);
        expect(spyOnChange.calls[0].arguments[0]).toBe("xAxisOpts.hide");
        expect(spyOnChange.calls[0].arguments[1]).toBe(true);
    });
    it('yAxisType', () => {
        // change event
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().yAxisOpts.type, { target: { value: 'widgets.advanced.axisTypes.linear' } });
        ReactTestUtils.Simulate.keyDown(getInputs().yAxisOpts.type, { keyCode: 9, key: 'Tab' });
        expect(spyOnChange.calls[0].arguments[0]).toBe("yAxisOpts.type");
        expect(spyOnChange.calls[0].arguments[1]).toBe("linear");

    });
    it('xAxisType', () => {
        // change event
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().xAxisOpts.type, { target: { value: 'widgets.advanced.axisTypes.linear' } });
        ReactTestUtils.Simulate.keyDown(getInputs().xAxisOpts.type, { keyCode: 9, key: 'Tab' });
        expect(spyOnChange.calls[0].arguments[0]).toBe("xAxisOpts.type");
        expect(spyOnChange.calls[0].arguments[1]).toBe("linear");
    });
    it('xAxisAngle', () => {
        // label rotation
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().xAxisAngle);
        expect(spyOnChange.calls[0].arguments[0]).toBe("xAxisAngle");
        expect(spyOnChange.calls[0].arguments[1]).toBe(0);
    });
    it('legend (yAxisLabel prop)', () => {
        // label rotation
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().yAxisLabel, { target: { value: "test" } });
        expect(spyOnChange.calls[0].arguments[0]).toBe("yAxisLabel");
        expect(spyOnChange.calls[0].arguments[1]).toBe("test");
    });
    it('yAxisOpts format', () => {
        // label rotation
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().yAxisOpts.format, { target: { value: "test" } });
        expect(spyOnChange.calls[0].arguments[0]).toBe("yAxisOpts.format");
        expect(spyOnChange.calls[0].arguments[1]).toBe("test");
    });
    it('yAxisOpts tickPrefix', () => {
        // label rotation
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().yAxisOpts.tickPrefix, { target: { value: "test" } });
        expect(spyOnChange.calls[0].arguments[0]).toBe("yAxisOpts.tickPrefix");
        expect(spyOnChange.calls[0].arguments[1]).toBe("test");
    });
    it('yAxisOpts tickSuffix', () => {
        // label rotation
        const spyOnChange = createSpyOnChange();
        ReactTestUtils.Simulate.change(getInputs().yAxisOpts.tickSuffix, { target: { value: "test" } });
        expect(spyOnChange.calls[0].arguments[0]).toBe("yAxisOpts.tickSuffix");
        expect(spyOnChange.calls[0].arguments[1]).toBe("test");
    });
    it('yAxisOpts formula', () => {
        // label rotation
        const spyOnChange = createSpyOnChange();
        // invalid
        ReactTestUtils.Simulate.change(getInputs().formula, { target: { value: "test" } });
        expect(spyOnChange.calls.length).toBe(0);
        // valid
        ReactTestUtils.Simulate.change(getInputs().formula, { target: { value: "value * 100" } });
        expect(spyOnChange.calls.length).toBe(1);
        expect(spyOnChange.calls[0].arguments[0]).toBe("formula");
        expect(spyOnChange.calls[0].arguments[1]).toBe("value * 100");
    });
    it('yAxis advanced options disabled when hide', () => {
        ReactDOM.render(<ChartAdvancedOptions data={{ type: 'bar', yAxis: false}} />, document.getElementById("container"));
        // switch checked
        expect(getInputs().yAxis.value).toEqual('on');
        expect(getInputs().formula.disabled).toBeTruthy();
        expect(getInputs().yAxisOpts.format.disabled).toBeTruthy();
        expect(getInputs().yAxisOpts.tickPrefix.disabled).toBeTruthy();
        expect(getInputs().yAxisOpts.tickSuffix.disabled).toBeTruthy();
    });
    it('xAxis advanced options disabled when hide', () => {

        ReactDOM.render(<ChartAdvancedOptions data={{ type: 'bar', xAxisOpts: { hide: true } }} />, document.getElementById("container"));
        // switch checked
        expect(getInputs().xAxisOpts.hide.value).toEqual('on');
        expect(getInputs().xAxisOpts.nTicks.disabled).toBeTruthy();
        expect(getInputs().xAxisAngle.disabled).toBeTruthy();
    });
});

