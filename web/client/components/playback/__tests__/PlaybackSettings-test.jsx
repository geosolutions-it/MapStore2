const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const PlaybackSettings = require('../PlaybackSettings');
describe('PlaybackSettings component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('PlaybackSettings rendering with defaults', () => {
        ReactDOM.render(<PlaybackSettings />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-playback-settings');
        expect(el).toExist();
    });
    it('PlaybackSettings rendering with values', () => {
        ReactDOM.render(<PlaybackSettings following stepUnit="days" timeStep={1} frameDuration={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-playback-settings');
        expect(el).toExist();
        expect(document.querySelector('#frameDuration').value).toBe('1');
        expect(document.querySelector('input#formPlaybackStep').value).toBe('1');
        expect(document.querySelector('select#formPlaybackStep').value).toBe('days');
    });

    it('Test PlaybackSettings onChangeSetting', () => {
        const actions = {
            onSettingChange: () => {}
        };
        const spyonChangeSetting = expect.spyOn(actions, 'onSettingChange');
        ReactDOM.render(<PlaybackSettings onSettingChange={actions.onSettingChange} />, document.getElementById("container"));
        const element = document.querySelector('#frameDuration');
        ReactTestUtils.Simulate.change(element, { target: { value: "2" } });
        expect(spyonChangeSetting).toHaveBeenCalled();
        expect(spyonChangeSetting.calls[0].arguments[0]).toBe("frameDuration");
        expect(spyonChangeSetting.calls[0].arguments[1]).toBe(2);
    });
    it('Test PlaybackSettings onChangeSetting default values to 1', () => {
        const actions = {
            onSettingChange: () => { }
        };
        const spyonChangeSetting = expect.spyOn(actions, 'onSettingChange');
        ReactDOM.render(<PlaybackSettings onSettingChange={actions.onSettingChange} />, document.getElementById("container"));
        const element = document.querySelector('#frameDuration');
        ReactTestUtils.Simulate.change(element, { target: { value: "-2" } });
        expect(spyonChangeSetting).toHaveBeenCalled();
        expect(spyonChangeSetting.calls[0].arguments[1]).toBe(1);
    });
    it('Test PlaybackSettings toggleAnimationRange', () => {
        const actions = {
            toggleAnimationRange: () => {}
        };
        const spytoggleAnimationRange = expect.spyOn(actions, 'toggleAnimationRange');
        ReactDOM.render(<PlaybackSettings toggleAnimationRange={actions.toggleAnimationRange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector(".mapstore-switch-panel .m-slider")); // <-- trigger event callback
        expect(spytoggleAnimationRange).toHaveBeenCalled();
        expect(spytoggleAnimationRange.calls[0].arguments[0]).toBe(true);
    });
    it('Test PlaybackSettings toggleAnimationRange disable', () => {
        const actions = {
            toggleAnimationRange: () => { }
        };
        const spytoggleAnimationRange = expect.spyOn(actions, 'toggleAnimationRange');
        ReactDOM.render(<PlaybackSettings playbackRange={{
            startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" }} toggleAnimationRange={actions.toggleAnimationRange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector(".mapstore-switch-panel .m-slider")); // <-- trigger event callback
        expect(spytoggleAnimationRange).toHaveBeenCalled();
        expect(spytoggleAnimationRange.calls[0].arguments[0]).toBe(false);
    });
    it('Test PlaybackSettings playbackButtons', () => {
        const actions = {
            onClick: () => { }
        };
        const spyClick = expect.spyOn(actions, 'onClick');
        ReactDOM.render(<PlaybackSettings
            playbackRange={{
                startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" // this have to be valid to show buttons
            }}
        playbackButtons={[{
            className: "test_button",
            onClick: actions.onClick
        }]} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector(".mapstore-switch-panel .test_button")); // <-- trigger event callback
        expect(spyClick).toHaveBeenCalled();
    });
    it('setPlaybackRange callback', () => {
        const actions = {
            setPlaybackRange: () => { }
        };
        const spyClick = expect.spyOn(actions, 'setPlaybackRange');
        ReactDOM.render(<PlaybackSettings
            playbackRange={{
                startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" // this have to be valid to show buttons
            }}
            setPlaybackRange={actions.setPlaybackRange}
        />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelectorAll(".ms-inline-datetime")[0].querySelector("button"));
        expect(spyClick).toHaveBeenCalled();
        expect(spyClick.calls[0].arguments[0].startPlaybackTime).toExist();
        expect(spyClick.calls[0].arguments[0].endPlaybackTime).toExist();
    });
    it('setPlaybackRange callback for time end', () => {
        const actions = {
            setPlaybackRange: () => { }
        };
        const spyClick = expect.spyOn(actions, 'setPlaybackRange');
        ReactDOM.render(<PlaybackSettings
            playbackRange={{
                startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" // this have to be valid to show buttons
            }}
            setPlaybackRange={actions.setPlaybackRange}
        />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelectorAll(".ms-inline-datetime")[1].querySelector("button")); // <-- trigger event callback
        expect(spyClick).toHaveBeenCalled();
        expect(spyClick.calls[0].arguments[0].startPlaybackTime).toExist();
        expect(spyClick.calls[0].arguments[0].endPlaybackTime).toExist();
    });
    it('follow button', () => {
        const actions = {
            onSettingChange: () => { }
        };
        const spyClick = expect.spyOn(actions, 'onSettingChange');
        ReactDOM.render(<PlaybackSettings
            playbackRange={{
                startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" // this have to be valid to show buttons
            }}
            onSettingChange={actions.onSettingChange}
        />, document.getElementById("container"));
        ReactTestUtils.Simulate.change(document.querySelectorAll('input[type=checkbox]')[2]); // <-- trigger event callback
        expect(spyClick).toHaveBeenCalled();
        expect(spyClick.calls[0].arguments[0]).toBe("following");
        expect(spyClick.calls[0].arguments[1]).toBe(true);
    });


});
