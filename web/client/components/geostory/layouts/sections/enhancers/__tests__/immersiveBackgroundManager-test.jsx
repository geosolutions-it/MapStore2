/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { createSink, setObservableConfig } from 'recompose';
import expect from 'expect';

// config for recompose usage of RXJS
import rxjsconfig from 'recompose/rxjsObservableConfig';
import immersiveBackgroundManager, { backgroundSectionProp } from '../immersiveBackgroundManager';

import STORY from '../../../../../../test-resources/geostory/sampleStory_1.json';
const contents = STORY.sections[1].contents;

setObservableConfig(rxjsconfig);

describe('immersiveBackgroundManager enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', (done) => {
        const Sink = immersiveBackgroundManager(createSink( props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('holds last background ', (done) => {
        const Sink = immersiveBackgroundManager(createSink(props => {
            expect(props).toExist();
            if (props.background.id !== contents[1].background.id) {
                // first render, trigger onVisibility change to make the background to be 1
                props.onVisibilityChange({ id: contents[1].id, visible: true });
            } else {
                // second render, the background now is the one triggered with onVisibilityChange({id: contents[1].id})
                done();
            }

        }));
        ReactDOM.render(<Sink contents={contents}/>, document.getElementById("container"));
    });
    it('should export backgroundSectionProp HOC', () => {
        const Component = backgroundSectionProp(({ contentId, sectionId, path }) => (
            <div>
                <div id="content-id">{contentId}</div>
                <div id="section-id">{sectionId}</div>
                <div id="path">{path}</div>
            </div>
        ));

        ReactDOM.render(<Component
            id={'section-id'}
            backgroundId={'content-id'}
            contents={[{ id: 'content-id' }]}
        />, document.getElementById("container"));

        expect(document.getElementById('content-id').innerText).toBe('content-id');
        expect(document.getElementById('section-id').innerText).toBe('section-id');
        expect(document.getElementById('path').innerText).toBe('sections[{"id": "section-id"}].background');
    });
});
