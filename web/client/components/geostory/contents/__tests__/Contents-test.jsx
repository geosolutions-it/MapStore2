import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import Content from '../Content';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

describe('Content component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Content rendering with defaults', () => {
        ReactDOM.render(<Content />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.geostory-content-unknown')).toExist();
    });
    it('Content rendering known type (text)', () => {
        ReactDOM.render(<Content {...STORY.sections[0].contents[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.geostory-content-text');
        expect(el).toExist();
    });
});
