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
const collapsibleWidget = require('../collapsibleWidget');

// enabled collapse tools
const collapsible =
    compose(
        defaultProps({
            toolsOptions: {
                showCollapse: true
            }
        }),
        collapsibleWidget()
    );
describe('collapsibleWidget enhancer', () => {
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
        const Sink = collapsibleWidget()(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(0);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('when toolsOptions.showCollapse = true adds a widget tool', (done) => {
        const Sink = collapsible(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(1);
            expect(props.widgetTools[0].visible).toBe(true);
            expect(props.widgetTools[0].glyph).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('hide when pinned (dataGrid.static = pinned)', (done) => {
        const Sink = collapsible(createSink(props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(1);
            expect(props.widgetTools[0].visible).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink dataGrid={{"static": true}} />, document.getElementById("container"));
    });
    it('show when hidden (hide = true hides the tool for certain types of users )', (done) => {
        const Sink = collapsible(createSink(props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(1);
            expect(props.widgetTools[0].visible).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink hide />, document.getElementById("container"));
    });
    it('toggleCollapse callback', () => {
        const actions = {
            toggleCollapse: () => {}
        };
        const spyToggleCollapse = expect.spyOn(actions, 'toggleCollapse');
        const Sink = collapsible(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[0].onClick();
        }));
        ReactDOM.render(<Sink toggleCollapse={actions.toggleCollapse}/>, document.getElementById("container"));
        expect(spyToggleCollapse).toHaveBeenCalled();
    });
});
