import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import Builder from '../Builder';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

describe('Builder component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Builder rendering with defaults', () => {
        ReactDOM.render(<Builder />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-builder');
        expect(el).toExist();
        expect(el.querySelectorAll('button').length).toBe(4);
        // empty view when no session
        expect(el.querySelector('.empty-state-container')).toExist();
    });
    it('Builder rendering with sections', () => {
        ReactDOM.render(<Builder story={STORY} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-builder');
        expect(el).toExist();
        // empty view when no session
        expect(el.querySelector('.empty-state-container')).toNotExist();
        expect(el.querySelector('.mapstore-side-preview')).toExist();
    });
});
