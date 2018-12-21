const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const expect = require('expect');
const InlineDateTimeSelector = require('../InlineDateTimeSelector');
describe('InlineDateTimeSelector component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('InlineDateTimeSelector rendering with defaults', () => {
        ReactDOM.render(<InlineDateTimeSelector />, document.getElementById("container"));
        const container = document.getElementById('container');
        const inputs = container.querySelectorAll('input');
        expect(inputs).toExist();
        expect(inputs[0]).toExist();
        expect(inputs[1].readOnly).toBe(true); // month should not be editable
    });
    it('Test InlineDateTimeSelector onIconClick', () => {
        const actions = {
            onIconClick: () => {}
        };
        const spyonIconClick = expect.spyOn(actions, 'onIconClick');
        ReactDOM.render(<InlineDateTimeSelector onIconClick={actions.onIconClick} />, document.getElementById("container"));
        const el = document.querySelector('.ms-inline-datetime-icon');
        TestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonIconClick).toHaveBeenCalled();
    });
    it('Test InlineDateTimeSelector edit days', () => {
        const actions = {
            onUpdate: () => { }
        };
        const spyonUpdate = expect.spyOn(actions, 'onUpdate');
        ReactDOM.render(<InlineDateTimeSelector date="2018-12-21T15:00:00.000Z" onUpdate={actions.onUpdate} />, document.getElementById("container"));
        const input = document.querySelectorAll('input');
        TestUtils.Simulate.change(input[0], { target: { value: '2' } });
        expect(spyonUpdate).toHaveBeenCalled();
        expect(spyonUpdate.calls[0].arguments[0]).toBe("2018-12-02T15:00:00.000Z");
    });
});
