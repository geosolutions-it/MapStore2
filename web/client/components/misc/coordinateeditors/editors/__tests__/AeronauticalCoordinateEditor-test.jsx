const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const AeronauticalCoordinateEditor = require('../AeronauticalCoordinateEditor');

describe('AeronauticalCoordinateEditor enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('AeronauticalCoordinateEditor rendering with defaults', () => {
        ReactDOM.render(<AeronauticalCoordinateEditor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
    });
    it('AeronauticalCoordinateEditor rendering with 13.3333333333', () => {
        ReactDOM.render(<AeronauticalCoordinateEditor value={13.3333333333} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].value).toBe('13');
        expect(elements[1].value).toBe('20');
        expect(elements[2].value).toBe('0');
    });
    it('Test AeronauticalCoordinateEditor onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<AeronauticalCoordinateEditor value={19} onChange={actions.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');

        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].value).toBe('19');
        expect(elements[1].value).toBe('0');
        expect(elements[2].value).toBe('0');
        ReactTestUtils.Simulate.change(elements[0], { target: { value: "20" } });
        expect(spyonChange).toHaveBeenCalled();
        expect(parseFloat(spyonChange.calls[0].arguments[0])).toBe(20);
    });
});
