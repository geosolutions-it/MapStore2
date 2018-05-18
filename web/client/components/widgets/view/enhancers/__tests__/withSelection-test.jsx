/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const withSelection = require('../withSelection');
const WidgetsView = require('../../WidgetsView');

describe('withSelection enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withSelection rendering with defaults', (done) => {
        const Sink = withSelection(createSink( props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('withSelection rendering with selectionActive', (done) => {
        const Sink = withSelection(createSink(props => {
            expect(props).toExist();
            expect(props.className.indexOf('selection-active') >= 0).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink selectionActive className="test"/>, document.getElementById("container"));
    });
    it('withSelection applied to WidgetsView', () => {
        const View = withSelection( WidgetsView );
        const WIDGETS = [{ id: "TEST_1", widgetType: 'text' }, { id: "TEST_2", widgetType: 'text' }];
        ReactDOM.render(<View isWidgetSelectable={w => w.id === "TEST_1"} selectionActive className="test" widgets={WIDGETS} />, document.getElementById("container"));
        expect(document.querySelector('.react-grid-layout.selection-active.test')).toExist();
        expect(document.querySelectorAll('.react-grid-layout.selection-active.test .disabled').length).toBe(1);
    });
});
