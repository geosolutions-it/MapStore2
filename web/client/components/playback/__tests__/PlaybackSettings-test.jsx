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
});
