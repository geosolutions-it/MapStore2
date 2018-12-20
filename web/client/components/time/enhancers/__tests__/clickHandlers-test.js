const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const clickHandlers = require('../clickHandlers');
const mockCurrentTimeTarget = {
    closest: () => ({
        getAttribute: () => 'currentTime'
    })
};
describe('clickHandlers enhancer', () => {
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
            expect(props.mouseDownHandler).toExist();
            expect(props.mouseUpHandler).toExist();

        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('click handler triggers setCurrentTime', () => {
        const actions = {
            setCurrentTime: () => {}
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
                }});

        }));
        const cmp = ReactDOM.render(<Sink setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(DATE);
        expect(spyCallback.calls[0].arguments[1]).toBe(LAYER);
    });
    it('click handler does not trigger anything while dragging', () => {
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
        const cmp = ReactDOM.render(<Sink setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toBe(DATE);
        expect(spyCallback.calls[0].arguments[1]).toBe(LAYER);
    });

    it('mouseDownHandler setMouseData', () => {
        const actions = {
            setMouseData: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setMouseData');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.mouseDownHandler({
                time: new Date(DATE),
                group: LAYER,
                event: {
                    target: mockCurrentTimeTarget
                }
            });

        }));
        const cmp = ReactDOM.render(<Sink setMouseData={actions.setMouseData} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0].dragging).toBe(false);
        expect(spyCallback.calls[0].arguments[0].startTime).toBe(DATE);
    });
    it('mouseUpHandler reset mouse event data calling setMouseData', () => {
        const actions = {
            setMouseData: () => { },
            setCurrentTime: () => {}
        };
        const spyCallback = expect.spyOn(actions, 'setMouseData');
        const spySetCurrentTime = expect.spyOn(actions, 'setCurrentTime');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.mouseUpHandler({
                time: new Date(DATE),
                group: LAYER,
                event: {
                    target: mockCurrentTimeTarget
                }
            });
        }));
        const cmp = ReactDOM.render(<Sink
            mouseEventProps={{ borderID: 'startPlaybackTime' }}
            setMouseData={actions.setMouseData}
            setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toEqual({});
        expect(spySetCurrentTime).toNotHaveBeenCalled();
    });
    it('mouseUpHandler with offset enabled', () => {
        const actions = {
            setMouseData: () => { },
            setCurrentTime: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'setMouseData');
        const spySetCurrentTime = expect.spyOn(actions, 'setCurrentTime');
        const DATE = "2018-12-20T15:07:42.981Z";
        const LAYER = "LAYER";
        const Sink = clickHandlers(createSink(props => {
            props.mouseUpHandler({
                time: new Date(DATE),
                group: LAYER,
                event: {
                    target: mockCurrentTimeTarget
                }
            });

        }));
        const cmp = ReactDOM.render(<Sink
            offsetEnabled
            mouseEventProps={{ borderID: 'currentTime' }}
            setMouseData={actions.setMouseData}
            setCurrentTime={actions.setCurrentTime}
            />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toHaveBeenCalled();
        expect(spyCallback.calls[0].arguments[0]).toEqual({});
        expect(spySetCurrentTime).toHaveBeenCalled();
        expect(spySetCurrentTime.calls[0].arguments[0]).toBe(DATE);
    });

    it('handlers do not trigger when mouseEventProps.timeId is defined (dragging)', () => { // to skip user's actions during animation on timeline
        const actions = {
            setCurrentTime: () => { },
            setMouseData: () => {}
        };
        const spyCallback = expect.spyOn(actions, 'setCurrentTime');
        const spyCallback2 = expect.spyOn(actions, 'setMouseData');
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
        const cmp = ReactDOM.render(<Sink mouseEventProps={{ timeId: "SOMETHING" }} status="PLAY" setMouseData={actions.setMouseData} setCurrentTime={actions.setCurrentTime} />, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spyCallback).toNotHaveBeenCalled();
        expect(spyCallback2).toNotHaveBeenCalled();
    });
});
