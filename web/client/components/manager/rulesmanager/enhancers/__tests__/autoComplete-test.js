/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { createSink, setObservableConfig} = require('recompose');
const expect = require('expect');
const autoComplete = require('../autoComplete');

const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);


describe('autoComplete enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('it calls load function', (done) => {
        const Sink = autoComplete(createSink( props => {
            expect(props).toExist();
            expect(props.onChange).toExist();
            expect(props.onSelect).toExist();
            expect(props.onToggle).toExist();
            props.onChange("%");
        }));
        const loadData = (search, page, size, parentsFilter, count) => {
            expect(search).toBe("%");
            expect(page).toBe(0);
            expect(size).toBe(5);
            expect(parentsFilter.workspaces).toBe("cite");
            expect(count).toBe(true);
            done();
        };
        ReactDOM.render(<Sink size={5} parentsFilter={{workspaces: "cite"}}
        loadData={loadData}/>, document.getElementById("container"));
    });
    it('it emits selected val', (done) => {
        const Sink = autoComplete(createSink( props => {
            expect(props).toExist();
            expect(props.onValueSelected).toExist();
            expect(props.onSelect).toExist();
            props.onSelect("%");
        }));
        const onValueSelected = (val) => {
            expect(val).toBe("%");
            done();
        };
        ReactDOM.render(<Sink onValueSelected={onValueSelected}/>, document.getElementById("container"));
    });
    it('on toggle with empty val it cleans selected', (done) => {
        const Sink = autoComplete(createSink( props => {
            expect(props).toExist();
            expect(props.selectedValue).toBe("%");
            expect(props.onValueSelected).toExist();
            expect(props.onSelect).toExist();
            props.onChange("");
            props.onToggle(false);
        }));
        const onValueSelected = (val) => {
            expect(val).toNotExist();
            done();
        };
        ReactDOM.render(<Sink selected="%" onValueSelected={onValueSelected}/>, document.getElementById("container"));
    });
});
