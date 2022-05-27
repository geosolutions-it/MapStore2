import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import Settings from '../Settings';
describe('Timeline/Playback Settings component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', () => {
        ReactDOM.render(<Settings />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-playback-settings');
        expect(el).toExist();
    });
    it('rendering with values', () => {
        ReactDOM.render(<Settings following stepUnit="days" timeStep={1} frameDuration={1} fixedStep />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-playback-settings');
        expect(el).toExist();
        const numericInputs = document.querySelectorAll('input#intl-numeric');
        const frameDuration = numericInputs[0];
        const formPlaybackStep = numericInputs[1];
        expect(frameDuration.value).toBe('1');
        expect(formPlaybackStep.value).toBe('1');
        expect(document.querySelector('select#formPlaybackStep').value).toBe('days');
    });
    it('test guide layer switch value', () => {
        const snapTypes = [{
            id: 'start',
            value: 'start',
            label: 'timeline.settings.snapToStart'
        }, {
            id: 'end',
            value: 'end',
            label: 'timeline.settings.snapToEnd'
        }];
        ReactDOM.render(<Settings fixedStep={false} snapTypes={snapTypes} endValuesSupport/>, document.getElementById("container"));
        expect(document.querySelectorAll('input[type=checkbox]')[0].checked).toBe(true);
        let radioButtonInputs = document.getElementsByClassName('snap-type-radio-btn');
        expect(radioButtonInputs).toExist();
        expect(radioButtonInputs.length).toBe(2);
        const snapToStartBtn = radioButtonInputs[0];
        const snapToEndBtn = radioButtonInputs[1];
        expect(snapToStartBtn.checked).toBe(true);
        expect(snapToEndBtn.checked).toBe(false);
        ReactDOM.render(<Settings fixedStep />, document.getElementById("container"));
        expect(document.querySelectorAll('input[type=checkbox]')[0].checked).toBe(false);
        radioButtonInputs = document.getElementsByClassName('snap-type-radio-btn');
        expect(radioButtonInputs.length).toBe(0);
    });
    it('test toggle snap moment radio button', () => {
        const snapTypes = [{
            id: 'start',
            value: 'start',
            label: 'timeline.settings.snapToStart'
        }, {
            id: 'end',
            value: 'end',
            label: 'timeline.settings.snapToEnd'
        }];
        ReactDOM.render(<Settings fixedStep={false} snapTypes={snapTypes} endValuesSupport snapRadioButtonEnabled/>, document.getElementById("container"));
        const radioButtonInputs = document.querySelectorAll('input[type=radio]');
        expect(radioButtonInputs).toExist();
        expect(radioButtonInputs.length).toBe(2);
        const snapToStartBtn = radioButtonInputs[0];
        const snapToEndBtn = radioButtonInputs[1];
        expect(snapToStartBtn.checked).toBe(true);
        expect(snapToEndBtn.checked).toBe(false);
        snapToEndBtn.checked = true;
        expect(snapToStartBtn.checked).toBe(false);
        expect(snapToEndBtn.checked).toBe(true);
    });
    it('test snap type radio button disabled', () => {
        const snapTypes = [{
            id: 'start',
            value: 'start',
            label: 'timeline.settings.snapToStart'
        }, {
            id: 'end',
            value: 'end',
            label: 'timeline.settings.snapToEnd'
        }];
        ReactDOM.render(<Settings fixedStep={false} snapTypes={snapTypes} endValuesSupport/>, document.getElementById("container"));
        const radioButtonInputs = document.querySelectorAll('input[type=radio]');
        expect(radioButtonInputs).toExist();
        expect(radioButtonInputs.length).toBe(2);
        const snapToStartBtn = radioButtonInputs[0];
        const snapToEndBtn = radioButtonInputs[1];
        expect(snapToStartBtn.classList.contains('disabled')).toBe(true);
        expect(snapToEndBtn.classList.contains('disabled')).toBe(true);
    });
    it('Test toggleAnimationMode', () => {
        const actions = {
            toggleAnimationMode: () => { }
        };
        const spy = expect.spyOn(actions, 'toggleAnimationMode');
        ReactDOM.render(<Settings
            playbackRange={{
                startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" // this have to be valid to show buttons
            }}
            toggleAnimationMode={actions.toggleAnimationMode}
        />, document.getElementById("container"));
        ReactTestUtils.Simulate.change(document.querySelectorAll('input[type=checkbox]')[0]); // <-- trigger event callback
        expect(spy).toHaveBeenCalled();
    });
    it('Test onChangeSetting', () => {
        const actions = {
            onSettingChange: () => {}
        };
        const spyonChangeSetting = expect.spyOn(actions, 'onSettingChange');
        ReactDOM.render(<Settings onSettingChange={actions.onSettingChange} />, document.getElementById("container"));
        const element = document.querySelector('input#intl-numeric');
        ReactTestUtils.Simulate.focus(element);
        ReactTestUtils.Simulate.change(element, { target: { value: "2" } });
        expect(spyonChangeSetting).toHaveBeenCalled();
        expect(spyonChangeSetting.calls[0].arguments[0]).toBe("frameDuration");
        expect(spyonChangeSetting.calls[0].arguments[1]).toBe(2);
    });
    it('Test onChangeSetting default values to 1', () => {
        const actions = {
            onSettingChange: () => { }
        };
        const spyonChangeSetting = expect.spyOn(actions, 'onSettingChange');
        ReactDOM.render(<Settings onSettingChange={actions.onSettingChange} />, document.getElementById("container"));
        const element = document.querySelector('input#intl-numeric');
        ReactTestUtils.Simulate.focus(element);
        ReactTestUtils.Simulate.change(element, { target: { value: "-2" } });
        expect(spyonChangeSetting).toHaveBeenCalled();
        expect(spyonChangeSetting.calls[0].arguments[1]).toBe(1);
    });
    it('Test toggleAnimationRange', () => {
        const actions = {
            toggleAnimationRange: () => {}
        };
        const spytoggleAnimationRange = expect.spyOn(actions, 'toggleAnimationRange');
        ReactDOM.render(<Settings toggleAnimationRange={actions.toggleAnimationRange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector(".mapstore-switch-panel .m-slider")); // <-- trigger event callback
        expect(spytoggleAnimationRange).toHaveBeenCalled();
        expect(spytoggleAnimationRange.calls[0].arguments[0]).toBe(true);
    });
    it('Test toggleAnimationRange disable', () => {
        const actions = {
            toggleAnimationRange: () => { }
        };
        const spytoggleAnimationRange = expect.spyOn(actions, 'toggleAnimationRange');
        ReactDOM.render(<Settings playbackRange={{
            startPlaybackTime: "2018-11-19T11:36:26.990Z", endPlaybackTime: "2019-11-19T11:36:26.990Z" }} toggleAnimationRange={actions.toggleAnimationRange} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector(".mapstore-switch-panel .m-slider")); // <-- trigger event callback
        expect(spytoggleAnimationRange).toHaveBeenCalled();
        expect(spytoggleAnimationRange.calls[0].arguments[0]).toBe(false);
    });
    it('Test playbackButtons', () => {
        const actions = {
            onClick: () => { }
        };
        const spyClick = expect.spyOn(actions, 'onClick');
        ReactDOM.render(<Settings
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
        ReactDOM.render(<Settings
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
        ReactDOM.render(<Settings
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
        ReactDOM.render(<Settings
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
