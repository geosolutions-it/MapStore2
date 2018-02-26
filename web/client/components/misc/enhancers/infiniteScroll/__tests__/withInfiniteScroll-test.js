/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {Observable} = require('rxjs');
const rxjsconfig = require('recompose/rxjsObservableConfig').default;
const { setObservableConfig } = require('recompose');
setObservableConfig(rxjsconfig);


const {lifecycle} = require('recompose');
const expect = require('expect');
const withInfiniteScroll = require('../withInfiniteScroll');


describe('withInfiniteScroll enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Test withScrollSpy onLoadMore callback with items', done => {
        const CMP = lifecycle({
            componentDidMount() {
                this.props.loadFirst();
            },
            componentDidUpdate() {
                // simulate scroll event after first item recived
                if (this.props.items) {
                    const element = document.getElementById('mydiv');
                    element.scrollTop = element.scrollHeight - element.clientHeight;
                }
            }
        })(() => <div><div id="mydiv" style={{ height: "100px", overflow: "auto" }}><div style={{ height: "1000px" }}></div></div></div>);
        // items retrival stream
        const loadPage = (params, page) => {
            if (page === 1) {
                done();
                return Observable.empty();
            }

            return Observable.of({ items: Array(10), page }).catch(e => { done(e); });
        };
        // enhance a component that scrolls
        const EnhancedCMP = withInfiniteScroll({
            loadPage,
            scrollSpyOptions: { querySelector: "#mydiv", loadingProp: false},
            loadStreamOptions: {
                throttleTime: 0
            }
        })(CMP);
        const cmp = ReactDOM.render(<EnhancedCMP />, document.getElementById("container"));
        expect(cmp).toExist();

    });
});
