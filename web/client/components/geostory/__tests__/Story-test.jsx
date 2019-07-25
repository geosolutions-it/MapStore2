import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import Story from '../Story';

describe('Story component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Story rendering with defaults', () => {
        ReactDOM.render(<Story />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-story')).toExist();
    });
});
