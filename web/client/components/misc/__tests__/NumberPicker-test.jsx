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
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.increment')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(1);
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.decrement'));
        expect(spyonChange.calls[1].arguments[0]).toBe(0);
    });
    it('Test NumberPicker onChange with value', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker value={2} onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        expect(document.querySelector('input').value).toBe('2');
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.increment')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(3);
        ReactDOM.render(<NumberPicker value={3} onChange={actions.onChange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.decrement'));
        expect(spyonChange.calls[1].arguments[0]).toBe(2);
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
    it('Test NumberPicker onChange invalid input', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        ReactTestUtils.Simulate.change(document.querySelector('input'), { target: { value: 'a' } }); // <-- trigger event callback
        expect(spyonChange).toNotHaveBeenCalled();
        expect(document.querySelector('input').value).toBe('');
    });
    it('Test NumberPicker onChange reset onBlur ', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker value={1} onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        ReactTestUtils.Simulate.change(document.querySelector('input'), { target: { value: '.' } }); // <-- trigger event callback
        expect(spyonChange).toNotHaveBeenCalled();
        ReactTestUtils.Simulate.blur(document.querySelector('input')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(null);
    });
    it('Test NumberPicker onChange onBlur do not trigger twice', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker value={1} onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        ReactTestUtils.Simulate.change(document.querySelector('input'), { target: { value: '.' } }); // <-- trigger event callback
        expect(spyonChange).toNotHaveBeenCalled();
        ReactTestUtils.Simulate.change(document.querySelector('input'), { target: { value: '.7' } }); // <-- trigger event callback
        ReactDOM.render(<NumberPicker value={0.7} onChange={actions.onChange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.blur(document.querySelector('input')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(0.7);
        // do not trigger twice on blur if value is updated
        expect(spyonChange.calls.length).toBe(1);
    });
    it('Test NumberPicker onChange with increment decrement correct precision', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker value={7.12} onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        expect(document.querySelector('input').value).toBe('7.12');
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.increment')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(8.12); // without round it will be 8.1200000000001
        expect(document.querySelector('input').value).toBe('8.12');
    });
    it('Test NumberPicker onChange increment decrement with value', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<NumberPicker value={8.2} onChange={actions.onChange} />, document.getElementById("container"));
        expect(document.querySelector('.rw-numberpicker')).toExist();
        expect(document.querySelector('input').value).toBe('8.2');
        ReactTestUtils.Simulate.mouseDown(document.querySelector('.decrement')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(7.2); // without round it will be 2.1999999999999
        expect(document.querySelector('input').value).toBe('7.2');
    });

});
