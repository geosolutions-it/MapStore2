/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const {createPagedUniqueAutompleteStream} = require('../autocomplete');
const AutocompleteEditor = require('../../components/data/featuregrid/editors/AutocompleteEditor');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
const {setObservableConfig, mapPropsStreamWithConfig} = require('recompose');
setObservableConfig(rxjsConfig);
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);

describe('autocomplete Observables', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test with fake stream, no result', () => {

        const props = {
            attribute: "STATE_NAME",
            performFetch: false,
            typeName: "topp:states",
            maxFeatures: 5,
            currentPage: 1,
            value: "",
            url: "/fakeResponse.json",
            delayDebounce: 0
        };

        /*const ReactItem = mapPropsStream(props$ =>
            props$.map(({ n }) => ({ children: n * 2 }))
        )('div');*/

        const ReactItem = mapPropsStream(props$ =>
            createPagedUniqueAutompleteStream(props$)
        )(AutocompleteEditor);
        const item = ReactDOM.render(<ReactItem {...props}/>, document.getElementById("container"));
        expect(item).toExist();
    });
});
