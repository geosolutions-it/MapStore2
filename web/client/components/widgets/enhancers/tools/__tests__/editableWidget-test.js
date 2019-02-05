/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {compose, defaultProps, createSink} = require('recompose');
const expect = require('expect');
const editableWidget = require('../editableWidget');

// enabled collapse tools
const editable =
    compose(
        defaultProps({
            canEdit: true
        }),
        editableWidget()
    );
describe('editableWidget enhancer', () => {
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
        const Sink = editableWidget()(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(0);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('when canEdit = true adds a widget tool', (done) => {
        const Sink = editable(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(2);
            expect(props.widgetTools[0].glyph).toExist();
            expect(props.widgetTools[1].glyph).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('callbacks', () => {
        const actions = {
            onEdit: () => {},
            onDelete: () => {}
        };
        const spyEdit = expect.spyOn(actions, 'onEdit');
        const spyDelete = expect.spyOn(actions, 'onDelete');
        const SinkCallEdit = editable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[0].onClick();
        }));
        const SinkCallDelete = editable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[1].onClick();
        }));
        ReactDOM.render(<SinkCallEdit onEdit={actions.onEdit} />, document.getElementById("container"));
        expect(spyEdit).toHaveBeenCalled();
        ReactDOM.render(<SinkCallDelete toggleDeleteConfirm={actions.onDelete} />, document.getElementById("container"));
        expect(spyDelete).toHaveBeenCalled();
        expect(spyDelete.calls[0].arguments[0]).toBe(true);
    });
});
