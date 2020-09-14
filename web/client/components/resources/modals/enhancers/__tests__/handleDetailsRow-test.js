/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import {compose, lifecycle, createSink} from 'recompose';

import handleDetailsRow from '../handleDetailsRow';

const createTestRun = (onMount = () => {}, testFunc = () => {}) => {
    let ranMount = false;
    const runOnMount = lifecycle({
        componentDidMount() {
            ranMount = true;
            onMount(this.props);
        }
    });
    const testProps = (props) => {
        if (ranMount) {
            testFunc(props);
        }
    };
    return {runOnMount, testProps};
};

describe('handleDetailsRow enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleDetails handlers', () => {
        let run = createTestRun(({onShowPreview}) => {
            expect(onShowPreview).toExist();
            onShowPreview();
        }, ({showPreview}) => {
            expect(showPreview).toBe(true);
        });

        let Sink = compose(
            handleDetailsRow,
            run.runOnMount
        )(createSink(run.testProps));
        ReactDOM.render(<Sink/>, document.getElementById('container'));

        run = createTestRun(({onHidePreview}) => {
            expect(onHidePreview).toExist();
            onHidePreview();
        }, ({showPreview}) => {
            expect(showPreview).toBe(false);
        });

        Sink = compose(
            handleDetailsRow,
            run.runOnMount
        )(createSink(run.testProps));
        ReactDOM.render(<Sink/>, document.getElementById('container'));
    });
});

