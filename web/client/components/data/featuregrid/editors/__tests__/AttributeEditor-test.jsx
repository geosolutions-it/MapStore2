import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import AttributeEditor from '../AttributeEditor';

let testColumn = {
    key: 'columnKey'
};


describe('FeatureGrid AttributeEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('AttributeEditor', () => {

        const cmp = ReactDOM.render(<AttributeEditor
            value={"A"}
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp.getValue().columnKey).toBe("A");
    });
    it('Test onTemporaryChanges triggered on render', (done) => {
        const onTemporaryChanges = () => done();
        ReactDOM.render(<AttributeEditor
            onTemporaryChanges={onTemporaryChanges}
            dataType="int"
            value={1.1}
            rowIdx={2}
            column={testColumn}/>, document.getElementById("container"));
    });
});
