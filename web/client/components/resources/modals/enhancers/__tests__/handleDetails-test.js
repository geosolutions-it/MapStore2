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

import handleDetails from '../handleDetails';

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

describe('handleDetails enhancer', () => {
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
        let run = createTestRun(({onShowDetailsSheet}) => {
            expect(onShowDetailsSheet).toExist();
            onShowDetailsSheet();
        }, ({showDetailsSheet}) => {
            expect(showDetailsSheet).toBe(true);
        });

        let Sink = compose(
            handleDetails,
            run.runOnMount
        )(createSink(run.testProps));
        ReactDOM.render(<Sink/>, document.getElementById('container'));

        run = createTestRun(({onHideDetailsSheet}) => {
            expect(onHideDetailsSheet).toExist();
            onHideDetailsSheet();
        }, ({showDetailsSheet}) => {
            expect(showDetailsSheet).toBe(false);
        });

        Sink = compose(
            handleDetails,
            run.runOnMount
        )(createSink(run.testProps));
        ReactDOM.render(<Sink/>, document.getElementById('container'));
    });
    it('handleDetails savedDetailsText', () => {
        let Sink = handleDetails(createSink(({savedDetailsText}) => expect(savedDetailsText).toBe('text')));
        ReactDOM.render(<Sink linkedResources={{details: {data: 'text'}}}/>, document.getElementById('container'));
    });
    it('handleDetails savedDetailsText when data is NODATA', () => {
        let Sink = handleDetails(createSink(({savedDetailsText}) => expect(savedDetailsText).toNotExist()));
        ReactDOM.render(<Sink linkedResources={{details: {data: 'NODATA'}}}/>, document.getElementById('container'));
    });
});
