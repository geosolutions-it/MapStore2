const React = require('react');
const ReactDOM = require('react-dom');
const NumberEditor = require('../NumberEditor');
var expect = require('expect');

let testColumn = {
  key: 'columnKey'
};


describe('FeatureGrid NumberEditor/IntegerEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Number Editor', () => {
        const cmp = ReactDOM.render(<NumberEditor
            value={1.1}
            rowIdx={1}
        column={testColumn}/>, document.getElementById("container"));
        expect(cmp.getValue().columnKey).toBe(1.1);
        expect(cmp.validate(1.1)).toBe(true);
    });
    it('Integer Editor', () => {
        const cmp = ReactDOM.render(<NumberEditor
            dataType="int"
            value={1.1}
            rowIdx={2}
        column={testColumn}/>, document.getElementById("container"));
        expect(cmp.getValue().columnKey).toBe(1);
        expect(cmp.validate(1)).toBe(true);
    });
});
