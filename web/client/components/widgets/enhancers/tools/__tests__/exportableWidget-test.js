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
const exportableWidget = require('../exportableWidget');

// enabled collapse tools
const exportable =
    compose(
        defaultProps({
            canEdit: true
        }),
        exportableWidget()
    );
describe('exportableWidget enhancer', () => {
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
        const Sink = exportableWidget()(createSink( props => {
            expect(props).toExist();
            expect(props.widgetTools.length).toBe(2);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });

    it('callbacks', () => {
        const sampleData = {
            sampleObject: "with data for CSV"
        };
        const actions = {
            exportCSV: () => {},
            exportImage: () => {}
        };
        const spyCSV = expect.spyOn(actions, 'exportCSV');
        const spyImage = expect.spyOn(actions, 'exportImage');
        const SinkCallEdit = exportable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[0].onClick();
        }));
        const SinkCallDelete = exportable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0]).toExist();
            widgetTools[1].onClick();
        }));
        ReactDOM.render(<SinkCallEdit title="widget title" data={sampleData} exportCSV={actions.exportCSV} />, document.getElementById("container"));
        expect(spyCSV).toHaveBeenCalled();
        expect(spyCSV.calls[0].arguments[0].data).toBe(sampleData);
        expect(spyCSV.calls[0].arguments[0].title).toBe("widget title");
        ReactDOM.render(<SinkCallDelete title="widget title" id={"ID"} exportImage={actions.exportImage} />, document.getElementById("container"));
        expect(spyImage).toHaveBeenCalled();
        // check the id of the widget' s div is correctly generated (
        // it must be the same of the widget, to allow canvg to crate an image from the div
        expect(spyImage.calls[0].arguments[0].widgetDivId).toBe("widget-chart-ID");
        expect(spyImage.calls[0].arguments[0].title).toBe("widget title");
    });

    it('should disable exportCSV or exportImage btns when data is empty', () => {
        const Sink = exportable(createSink(({ widgetTools = [] }) => {
            expect(widgetTools[0].disabled).toBe(true);
            expect(widgetTools[1].disabled).toBe(true);
            widgetTools[0].onClick();
        }));

        ReactDOM.render(<Sink title="widget title" data={[]} />, document.getElementById("container"));
    });
});
