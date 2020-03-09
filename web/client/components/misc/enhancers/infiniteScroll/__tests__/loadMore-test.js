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
    it('loadMore test debounce on loadFirst', (done) => {
        const Sink = loadMore(
            ({text = ''} = {}, page) => {
                return Observable.of({ items: Array(10), page, text }).catch( e => { done(e); });
            }, {
                initialStreamDebounce: 50
            }
        )(createSink(props => {
            if (props.page === undefined) {
                props.loadFirst();
                setTimeout(() => {
                    props.loadFirst({text: 't'});
                }, 15);
                setTimeout(() => {
                    props.loadFirst({text: 'te'});
                }, 20);
                setTimeout(() => {
                    props.loadFirst({text: 'tex'});
                }, 25);
            } else if (props.text) {
                try {
                    expect(props.text).toBe('tex');
                    done();
                } catch (e) {
                    done(e);
                }
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
