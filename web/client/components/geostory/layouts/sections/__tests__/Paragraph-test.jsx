import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import Paragraph from '../Paragraph';
import STORY from 'json-loader!../../../../../test-resources/geostory/sampleStory_1.json';

describe('Paragraph component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Paragraph rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Paragraph {...STORY.sections[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.section-paragraph-contents')).toExist();
    });
});
