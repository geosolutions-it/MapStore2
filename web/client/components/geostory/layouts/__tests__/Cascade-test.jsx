import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import Cascade from '../Cascade';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

describe('Cascade component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Cascade rendering with defaults', () => {
        ReactDOM.render(<Cascade />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-story')).toExist();

    });
    it('Cascade rendering with unknown type', () => {
        ReactDOM.render(<Cascade type="SOME_UNKNOWN_TYPE" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-story')).toExist();

    });
    it('Cascade rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Cascade {...STORY} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-cascade-story');
        expect(el.querySelector('.section-paragraph-contents')).toExist();
    });
});
