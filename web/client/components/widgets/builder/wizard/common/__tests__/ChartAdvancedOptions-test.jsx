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
            type: inputs[2]
        },
        yAxisLabel: inputs[8], // legend
        xAxisOpts: {
            type: inputs[4],
            hide: inputs[5],
            nTicks: inputs[6] // force ticks
        },
        xAxisAngle: inputs[7]
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

