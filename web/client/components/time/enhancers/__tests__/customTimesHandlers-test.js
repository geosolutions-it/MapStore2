const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const clickHandlers = require('../customTimesHandlers');
const CURRENT_TIME = "2016-01-01T00:00:00.001Z";
const CURRENT_OFFSET = "2017-01-01T00:00:00.001Z";
const CURRENT_PLAYBACK_START = "2016-01-01T00:00:00.001Z";
const CURRENT_PLAYBACK_END = "2017-01-01T00:00:00.001Z";

const mockCurrentTimeTarget = {
    closest: () => ({
        getAttribute: () => 'currentTime'
    })
};
describe('customTimesHandlers enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults defines handlers', () => {
        const Sink = clickHandlers(createSink( props => {
            expect(props.clickHandler).toExist();
            expect(props.timechangedHandler).toExist();

        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('click triggers setCurrentTime', () => {
        const actions = {
            setCurrentTime: () => {}
        };
        const spyCallback = expect.spyOn(actions, 'setCurrentTime');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const SELECTED_LAYER = "SELECTED_LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.clickHandler({
                time: new Date(DATE),
                group: LAYER,
                event: {
                    target: mockCurrentTimeTarget
                }});

        }));
        const cmp = ReactDOM.render(<Sink selectedLayer={SELECTED_LAYER} setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(DATE);
        expect(spyCallback.calls[0].arguments[1]).toBe(SELECTED_LAYER);
    });
    it('click triggers selectGroup', () => {
        const actions = {
            selectGroup: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'selectGroup');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.clickHandler({
                time: new Date(DATE),
                group: LAYER,
                what: 'group-label',
                event: {
                    target: mockCurrentTimeTarget
                }
            });

        }));
        const cmp = ReactDOM.render(<Sink selectGroup={actions.selectGroup} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(LAYER);
    });

    it('handlers do not trigger setCurrentTime when playing', () => { // to skip user's actions during animation on timeline
        const actions = {
            setCurrentTime: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setCurrentTime');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.clickHandler({
                time: new Date(DATE),
                group: LAYER,
                event: {
                    target: mockCurrentTimeTarget
                }
            });

        }));
        const cmp = ReactDOM.render(<Sink status="PLAY" setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toNotHaveBeenCalled();
    });
    it('click triggers  do not trigger selectGroup when playing ', () => {
        const actions = {
            selectGroup: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'selectGroup');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.clickHandler({
                time: new Date(DATE),
                group: LAYER,
                what: 'group-label',
                event: {
                    target: mockCurrentTimeTarget
                }
            });

        }));
        const cmp = ReactDOM.render(<Sink status="PLAY" selectGroup={actions.selectGroup} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toNotHaveBeenCalled();
    });

    it('timechangedHandler for currentTime', () => {
        const actions = {
            setCurrentTime: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setCurrentTime');
        const DATE = "2018-12-20T15:07:42.981Z";
        const CURSOR = "currentTime";
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(DATE);
        expect(spyCallback.calls[0].arguments[1]).toBe(undefined);
    });
    it('timechangedHandler for currentTime with selected layer', () => {
        const actions = {
            setCurrentTime: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setCurrentTime');
        const DATE = "2018-12-20T15:07:42.981Z";
        const CURSOR = "currentTime";
        const SELECTED_LAYER = "SELECTED_LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink selectedLayer={SELECTED_LAYER} setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(DATE);
        expect(spyCallback.calls[0].arguments[1]).toBe(SELECTED_LAYER);
    });
    it('timechangedHandler with range', () => {
        const actions = {
            setOffset: () => { },
            setCurrentTime: () => { }
        };
        const spyOffsetCallback = expect.spyOn(actions, 'setOffset');
        const spyCurrentTimeCallback = expect.spyOn(actions, 'setCurrentTime');
        const currentTimeRange = {
            start: CURRENT_TIME,
            end: CURRENT_OFFSET
        };
        const NEW_DATE = "2015-12-20T15:07:42.981Z";
        const CURSOR = "currentTime";
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(NEW_DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} setCurrentTime={actions.setCurrentTime} setOffset={actions.setOffset} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyOffsetCallback).toNotHaveBeenCalled();
        expect(spyCurrentTimeCallback).toHaveBeenCalled();
        expect(spyCurrentTimeCallback.calls[0].arguments[0]).toBe(NEW_DATE);
    });

    it('timechangedHandler for offsetTime', () => {
        const actions = {
            setOffset: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setOffset');
        const currentTimeRange = {
            start: CURRENT_TIME,
            end: CURRENT_OFFSET
        };
        const NEW_DATE = "2018-12-20T15:07:42.981Z";
        const CURSOR = "offsetTime";
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(NEW_DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} setOffset={actions.setOffset} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(NEW_DATE);
    });
    it('timechangedHandler switch times when move currentTime', () => {
        const actions = {
            setOffset: () => { },
            setCurrentTime: () => { }
        };
        const spyOffsetCallback = expect.spyOn(actions, 'setOffset');
        const spyCurrentTimeCallback = expect.spyOn(actions, 'setCurrentTime');
        const currentTimeRange = {
            start: CURRENT_TIME,
            end: CURRENT_OFFSET
        };
        const NEW_DATE = "2018-12-20T15:07:42.981Z";
        const CURSOR = "currentTime";
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(NEW_DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} setCurrentTime={actions.setCurrentTime} setOffset={actions.setOffset} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyOffsetCallback).toHaveBeenCalled();
        expect(spyCurrentTimeCallback).toHaveBeenCalled();
        expect(spyOffsetCallback.calls[0].arguments[0]).toBe(NEW_DATE);
        expect(spyCurrentTimeCallback.calls[0].arguments[0]).toBe(CURRENT_OFFSET);
    });
    it('timechangedHandler switch times when move offsetTime', () => {
        const actions = {
            setOffset: () => { },
            setCurrentTime: () => {}
        };
        const spyOffsetCallback = expect.spyOn(actions, 'setOffset');
        const spyCurrentTimeCallback = expect.spyOn(actions, 'setCurrentTime');
        const currentTimeRange = {
            start: CURRENT_TIME,
            end: CURRENT_OFFSET
        };
        const NEW_DATE = "2015-12-20T15:07:42.981Z";
        const CURSOR = "offsetTime";
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(NEW_DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink currentTime={CURRENT_TIME} currentTimeRange={currentTimeRange} setCurrentTime={actions.setCurrentTime} setOffset={actions.setOffset} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyOffsetCallback).toHaveBeenCalled();
        expect(spyCurrentTimeCallback).toHaveBeenCalled();
        expect(spyOffsetCallback.calls[0].arguments[0]).toBe(CURRENT_TIME);
        expect(spyCurrentTimeCallback.calls[0].arguments[0]).toBe(NEW_DATE);
    });
    it('timechangedHandler for playback controls (startPlaybackTime), with switch)', () => {
        const actions = {
            setPlaybackRange: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setPlaybackRange');
        const DATE = "2018-12-20T15:07:42.981Z";
        const CURSOR = "startPlaybackTime";

        const playbackRange = {
            startPlaybackTime: CURRENT_PLAYBACK_START,
            endPlaybackTime: CURRENT_PLAYBACK_END
        };
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink playbackRange={playbackRange} setPlaybackRange={actions.setPlaybackRange} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        // dates switch
        expect(spyCallback.calls[0].arguments[0].startPlaybackTime).toBe(CURRENT_PLAYBACK_END);
        expect(spyCallback.calls[0].arguments[0].endPlaybackTime).toBe(DATE);
    });
    it('timechangedHandler for playback controls (endPlaybackTime)', () => {
        const actions = {
            setPlaybackRange: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setPlaybackRange');
        const DATE = "2018-12-20T15:07:42.981Z";
        const CURSOR = "endPlaybackTime";
        const playbackRange = {
            startPlaybackTime: CURRENT_PLAYBACK_START,
            endPlaybackTime: CURRENT_PLAYBACK_END
        };
        const Sink = clickHandlers(createSink(props => {
            props.timechangedHandler({
                time: new Date(DATE),
                id: CURSOR
            });

        }));
        const cmp = ReactDOM.render(<Sink playbackRange={playbackRange} setPlaybackRange={actions.setPlaybackRange} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        // dates switch
        expect(spyCallback.calls[0].arguments[0].startPlaybackTime).toBe(CURRENT_PLAYBACK_START);
        expect(spyCallback.calls[0].arguments[0].endPlaybackTime).toBe(DATE);
    });
});
