const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const customTimesEnhancer = require('../customTimesEnhancer');

const TEST_LAYER = "TEST_LAYER";
const NEW_DATE = "2018-12-20T15:07:42.981Z";
const TEST_ITEMS = [{
    start: "2016-01-01T00:00:00.001Z",
    group: TEST_LAYER
}];
const CURRENT_TIME = "2010-01-01T00:00:00.001Z";
const CURRENT_OFFSET = "2011-01-01T00:00:00.001Z";
const currentTimeRange = {
    start: CURRENT_TIME,
    end: CURRENT_OFFSET
};
const CURRENT_PLAYBACK_START = "2016-01-01T00:00:00.001Z";
const CURRENT_PLAYBACK_END = "2017-01-01T00:00:00.001Z";
const playbackRange = {
    startPlaybackTime: CURRENT_PLAYBACK_START,
    endPlaybackTime: CURRENT_PLAYBACK_END
};

describe('customTimesEnhancer enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('customTimesEnhancer rendering with defaults', (done) => {
        const Sink = customTimesEnhancer(createSink( props => {
            expect(props.rangeItems).toExist();
            expect(props.rangeItems.length).toBe(0);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('playbackEnabled and playbackRange add range items and cursors', (done) => {

        const Sink = customTimesEnhancer(createSink( props => {
            expect(props.rangeItems).toExist();
            expect(props.rangeItems.length).toBe(1);
            expect(props.rangeItems[0].id).toBe('playback-range');
            expect(props.rangeItems[0].type).toBe('background');
            expect(props.rangeItems[0].start).toBe(CURRENT_PLAYBACK_START);
            expect(props.rangeItems[0].end).toBe(CURRENT_PLAYBACK_END);
            expect(props.customTimes.startPlaybackTime).toBe(CURRENT_PLAYBACK_START);
            expect(props.customTimes.endPlaybackTime).toBe(CURRENT_PLAYBACK_END);
            done();
        }));
        ReactDOM.render(<Sink items={TEST_ITEMS} playbackEnabled playbackRange={playbackRange} />, document.getElementById("container"));
    });
    it('current time add cursor for currentTime', (done) => {

        const Sink = customTimesEnhancer(createSink(props => {
            expect(props.rangeItems).toExist();
            expect(props.rangeItems.length).toBe(0);
            expect(props.customTimes.currentTime).toBe(CURRENT_TIME);
            done();
        }));
        ReactDOM.render(<Sink items={TEST_ITEMS} playbackEnabled currentTime={CURRENT_TIME} />, document.getElementById("container"));
    });
    it('offsetEnabled currentTimeRange add draggable range and cursors', (done) => {

        const Sink = customTimesEnhancer(createSink(props => {
            expect(props.rangeItems).toExist();
            expect(props.rangeItems.length).toBe(1);
            expect(props.rangeItems[0].id).toBe("current-range");
            expect(props.rangeItems[0].type).toBe('background');
            expect(props.rangeItems[0].editable.updateTime).toBe(true);
            expect(props.rangeItems[0].start).toBe(CURRENT_TIME);
            expect(props.rangeItems[0].end).toBe(CURRENT_OFFSET);
            expect(props.customTimes.currentTime).toBe(CURRENT_TIME);
            expect(props.customTimes.offsetTime).toBe(CURRENT_OFFSET);
            done();
        }));
        ReactDOM.render(<Sink items={TEST_ITEMS} offsetEnabled currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} />, document.getElementById("container"));
    });
    it('readOnly', (done) => {
        const Sink = customTimesEnhancer(createSink(props => {
            expect(props.rangeItems).toExist();
            expect(props.rangeItems.length).toBe(1);
            expect(props.rangeItems[0].id).toBe("current-range");
            expect(props.rangeItems[0].editable.updateTime).toBe(false);
            expect(props.rangeItems[0].start).toBe(CURRENT_TIME);
            expect(props.rangeItems[0].end).toBe(CURRENT_OFFSET);
            expect(props.customTimes.currentTime).toBe(CURRENT_TIME);
            done();
        }));
        ReactDOM.render(<Sink items={TEST_ITEMS} offsetEnabled readOnly currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} />, document.getElementById("container"));
    });
    it('Test Component callback', () => {
        const Sink = customTimesEnhancer(createSink(props => {
            props.options.onMove({
                id: 'current-range',
                start: new Date(NEW_DATE),
                end: new Date(props.rangeItems[0].end)
            }, () => {});
        }));
        const actions = {
            moveCurrentRange: () => {}
        };
        const onUpdateSpy = expect.spyOn(actions, 'moveCurrentRange');
        ReactDOM.render(<Sink items={TEST_ITEMS} offsetEnabled moveCurrentRange={actions.moveCurrentRange} currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} />, document.getElementById("container"));
        expect(onUpdateSpy).toHaveBeenCalled();
        expect(onUpdateSpy.calls[0].arguments[0]).toBe(NEW_DATE);
    });
});
