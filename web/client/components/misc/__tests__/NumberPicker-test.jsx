var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var NumberPicker = require('../NumberPicker');
const ReactTestUtils = require('react-dom/test-utils');
describe("This test for NumberPicker component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates componet with defaults', () => {
        ReactDOM.render(<NumberPicker />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
    });

    it('Test NumberPicker onChange with empty value', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.rw-btn')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(1);
        ReactTestUtils.Simulate.mouseDown(document.querySelectorAll('.rw-btn')[1]);
        expect(spyonChange.calls[1].arguments[0]).toBe(-1);
    });
    it('Test NumberPicker onChange with value', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker value={2} onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        expect(document.querySelector('input').value).toBe('2');
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.rw-btn')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(3);
        ReactTestUtils.Simulate.mouseDown(document.querySelectorAll('.rw-btn')[1]);
        expect(spyonChange.calls[1].arguments[0]).toBe(1);
    });
    it('Test NumberPicker onChange', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        ReactTestUtils.Simulate.change(document.querySelector('input'), { target: { value: '7' }}); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(7);
    });
});
