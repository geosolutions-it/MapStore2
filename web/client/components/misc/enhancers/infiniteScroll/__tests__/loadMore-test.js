/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const rxjsconfig = require('recompose/rxjsObservableConfig').default;
const { setObservableConfig } = require('recompose');
setObservableConfig(rxjsconfig);
const {Observable} = require('rxjs');

const React = require('react');

const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const loadMore = require('../loadMore');

describe('loadMore enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('loadMore load items on callbacks', (done) => {
        const Sink = loadMore(
                (params, page) => Observable.of({ items: Array(10), page }).catch( e => { done(e); })
            )(createSink( props => {
                expect(props).toExist();
                if (props.page === undefined) {
                    props.loadFirst();
                } else if (props.page === 0) {
                    props.onLoadMore(props.page + 1);
                } else if (props.page === 1) {
                    expect(props.items.length).toBe(20);
                    done();
                }
            }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
