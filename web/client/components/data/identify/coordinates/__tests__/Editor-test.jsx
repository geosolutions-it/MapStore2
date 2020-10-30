const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const {isEmpty} = require('lodash');
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
        expect(el).toExist();
    });
    it('Test Editor onChange correctly passed and argument mapping', () => {
        const actions = {
            onSubmit: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onSubmit');
        ReactDOM.render(<Editor onSubmit={actions.onSubmit} />, document.getElementById("container"));
        const button = document.querySelector('span > button');
        expect(button.disabled).toBe(true);
        const latLonFields = document.querySelectorAll('input');
        ReactTestUtils.Simulate.focus(latLonFields[0]);
        ReactTestUtils.Simulate.change(latLonFields[0], { target: { value: 20} }); // <-- trigger event callback
        ReactTestUtils.Simulate.focus(latLonFields[1]);
        ReactTestUtils.Simulate.change(latLonFields[1], { target: { value: 10} }); // <-- trigger event callback
        expect(button.disabled).toBe(false);
        ReactTestUtils.Simulate.click(button); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(isEmpty(spyonChange.calls[0].arguments[0])).toBe(false);
        expect(spyonChange.calls[0].arguments[0]).toContain({lat: "20", lon: "10"});
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
