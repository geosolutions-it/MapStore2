import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import SectionsPreview from '../SectionsPreview';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

describe('SectionsPreview component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SectionsPreview rendering with defaults', () => {
        ReactDOM.render(<SectionsPreview />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
    });
    it('SectionsPreview rendering with sections', () => {
        ReactDOM.render(<SectionsPreview sections={STORY.sections} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        // empty view when no session
        expect(el.querySelectorAll('.items-list > div').length).toBe(5); // 2 + 1 (first inner) + 2 (second inner)
    });
});
