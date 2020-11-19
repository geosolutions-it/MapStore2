import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import DragZone from '../DragZone';
describe('DragZone component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DragZone rendering with defaults', () => {
        ReactDOM.render(<DragZone />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#DRAGDROP_IMPORT_ZONE');
        expect(el).toExist();
    });
});
