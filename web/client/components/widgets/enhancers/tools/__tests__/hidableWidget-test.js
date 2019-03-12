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
const hidableWidget = require('../hidableWidget');

// enabled collapse tools
const hidable =
    compose(
        defaultProps({
            toolsOptions: {
                showHide: true
            }
        }),
        hidableWidget()
    );
describe('hidableWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('hidableWidget rendering with defaults', (done) => {
        const Sink = hidableWidget()(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(0);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('when toolsOptions.showHide = true adds a widget tool', (done) => {
        const Sink = hidable(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(1);
            expect(props.widgetTools[0].glyph).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('updateProperty callback', () => {
        const actions = {
            updateProperty: () => {}
        };
        const spy = expect.spyOn(actions, 'updateProperty');
        const Sink = hidable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[0].onClick();
        }));
        ReactDOM.render(<Sink updateProperty={actions.updateProperty}/>, document.getElementById("container"));
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBe("hide");
        expect(spy.calls[0].arguments[1]).toBe(true);
        ReactDOM.render(<Sink hide updateProperty={actions.updateProperty} />, document.getElementById("container"));
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1].arguments[0]).toBe("hide");
        expect(spy.calls[1].arguments[1]).toBe(false);

    });
});
