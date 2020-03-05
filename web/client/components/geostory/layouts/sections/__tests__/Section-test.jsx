/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Section from '../Section';
import STORY from '../../../../../test-resources/geostory/sampleStory_1.json';
import { lists } from '../../../../../utils/GeoStoryUtils';


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
        expect(container.querySelector('.ms-section-unknown')).toBeTruthy();

    });
    it('Section rendering with unknown type', () => {
        ReactDOM.render(<Section type="SOME_UNKNOWN_TYPE" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-section-unknown')).toBeTruthy();

    });
    it('Section rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Section {...STORY.sections[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-paragraph');
        expect(el).toBeTruthy();
        expect(container.querySelector('.ms-section-unknown')).toBeFalsy();
        expect(el.querySelector('.ms-section-contents')).toBeTruthy();
    });
    describe('every section type supports onVisibilityChange', () => {
        lists.SectionTypes.forEach((type) => {
            it(`${type}`, done => {
                ReactDOM.render(<Section
                    type={type}
                    {...STORY.sections[1]}
                    mediaType={type}
                    id={`test-${type}-section`}
                    onVisibilityChange={({id, visible, entry}) => {
                        expect(id).toBe(`test-${type}-section`);
                        expect(visible).toBe(true);
                        expect(entry).toBeTruthy();
                        expect(entry.intersectionRatio).toBeTruthy();
                        done();
                    }}
                />, document.getElementById("container"));
            });
        });

    });
});
