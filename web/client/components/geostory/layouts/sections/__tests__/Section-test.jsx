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
        expect(container.querySelector('.ms-section-unknown')).toExist();

    });
    it('Section rendering with unknown type', () => {
        ReactDOM.render(<Section type="SOME_UNKNOWN_TYPE" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-section-unknown')).toExist();

    });
    it('Section rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Section {...STORY.sections[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-paragraph');
        expect(el).toExist();
        expect(container.querySelector('.ms-section-unknown')).toNotExist();
        expect(el.querySelector('.ms-section-contents')).toExist();
    });
    describe('every section type supports onVisibilityChange', () => {
        it('title', done => {
            ReactDOM.render(<Section
                type="title"
                id={`test-title-section`}
                onVisibilityChange={({id, visible, entry}) => {
                    try {
                        expect(id).toBe(`test-title-section`);
                        expect(visible).toBe(false);
                        expect(entry).toExist();
                        expect(entry.intersectionRatio).toNotBe(undefined);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
        it('paragraph', done => {
            ReactDOM.render(<Section
                type="paragraph"
                id={`test-paragraph-section`}
                onVisibilityChange={({id, visible, entry}) => {
                    try {
                        expect(id).toBe(`test-paragraph-section`);
                        expect(visible).toBe(false);
                        expect(entry).toExist();
                        expect(entry.intersectionRatio).toNotBe(undefined);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
        it('immersive', done => {
            ReactDOM.render(<Section
                type="immersive"
                id={`test-immersive-section`}
                onVisibilityChange={({id, visible, entry}) => {
                    try {
                        expect(id).toBe(`test-immersive-section`);
                        expect(visible).toBe(false);
                        expect(entry).toExist();
                        expect(entry.intersectionRatio).toNotBe(undefined);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
    });
});
