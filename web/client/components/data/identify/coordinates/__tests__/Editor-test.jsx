const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const Editor = require('../Editor');
describe('Identify Coordinate Editor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Editor rendering with defaults', () => {
        ReactDOM.render(<Editor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.coord-editor');
        expect(el).toBeTruthy();
    });
    it('Test Editor onChange correctly passed and argument mapping', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<Editor onChange={actions.onChange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.change(document.querySelector('input'), { target: { value: 20} }); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.mock.calls[0][0]).toBe('lat');
        expect(spyonChange.mock.calls[0][1]).toBe(20);
    });
    it('Test Editor onChangeFormat correctly passed', () => {
        const actions = {
            onChangeFormat: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChangeFormat');
        ReactDOM.render(<Editor onChangeFormat={actions.onChangeFormat} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('a > span')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
    });
});
