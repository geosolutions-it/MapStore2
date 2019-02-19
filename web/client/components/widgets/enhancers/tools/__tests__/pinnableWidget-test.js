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
const pinnableWidget = require('../pinnableWidget');

// enabled collapse tools
const pinnable =
    compose(
        defaultProps({
            toolsOptions: {
                showPin: true
            }
        }),
        pinnableWidget()
    );
describe('pinnableWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('pinnableWidget rendering with defaults', (done) => {
        const Sink = pinnableWidget()(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(0);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('when toolsOptions.showPin = true adds a widget tool', (done) => {
        const Sink = pinnable(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(1);
            expect(props.widgetTools[0].glyph).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('Test toggleCollapse callback', () => {
        const actions = {
            updateProperty: () => {}
        };
        const spy = expect.spyOn(actions, 'updateProperty');
        const Sink = pinnable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[0].onClick();
        }));
        ReactDOM.render(<Sink updateProperty={actions.updateProperty}/>, document.getElementById("container"));
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBe("dataGrid.static");
        expect(spy.calls[0].arguments[1]).toBe(true);
        ReactDOM.render(<Sink dataGrid={{"static": true}} updateProperty={actions.updateProperty} />, document.getElementById("container"));
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1].arguments[0]).toBe("dataGrid.static");
        expect(spy.calls[1].arguments[1]).toBe(false);

    });
});
