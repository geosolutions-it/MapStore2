import React from 'react';
const ReactDOM = require('react-dom');
const expect = require('expect');
import Section from '../Section';
import STORY from 'json-loader!../../../../../test-resources/geostory/sampleStory_1.json';

describe('Section component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Section rendering with defaults', () => {
        ReactDOM.render(<Section />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-section')).toExist();
        expect(container.querySelector('.unknown-session-type')).toExist();

    });
    it('Section rendering with unknown type', () => {
        ReactDOM.render(<Section type="SOME_UNKNOWN_TYPE" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-section')).toExist();
        expect(container.querySelector('.unknown-session-type')).toExist();

    });
    it('Section rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Section {...STORY.sections[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-cascade-section');
        expect(el).toExist();
        expect(container.querySelector('.unknown-session-type')).toNotExist();
        expect(el.querySelector('.section-paragraph-contents')).toExist();
    });
});
