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
import immersiveBackgroundManager from '../immersiveBackgroundManager';

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
});
