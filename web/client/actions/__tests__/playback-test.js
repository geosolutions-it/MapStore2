/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    PLAY, PAUSE, STOP, SET_FRAMES, SET_CURRENT_FRAME, APPEND_FRAMES, FRAMES_LOADING, SELECT_PLAYBACK_RANGE,
    CHANGE_SETTING, TOGGLE_ANIMATION_MODE, ANIMATION_STEP_MOVE, UPDATE_METADATA, SET_INTERVAL_DATA,
    pause, play, stop, setFrames, setCurrentFrame, appendFrames, framesLoading, selectPlaybackRange,
    changeSetting, toggleAnimationMode, animationStepMove, updateMetadata, setIntervalData
} from "../playback";

describe('Test playback actions', () => {
    it('Test play action creator', () => {
        const retval = play();
        expect(retval).toExist();
        expect(retval.type).toBe(PLAY);
    });
    it('Test pause action creator', () => {
        const retval = pause();
        expect(retval).toExist();
        expect(retval.type).toBe(PAUSE);
    });
    it('Test stop action creator', () => {
        const retval = stop();
        expect(retval).toExist();
        expect(retval.type).toBe(STOP);
    });
    it('Test setFrames action creator', () => {
        const frames = ['1', '2'];
        const retval = setFrames(frames);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_FRAMES);
        expect(retval.frames).toBe(frames);
    });
    it('Test setCurrentFrame action creator', () => {
        const retval = setCurrentFrame(1);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_CURRENT_FRAME);
        expect(retval.frame).toBe(1);
    });
    it('Test appendFrames action creator', () => {
        const frames = ['1', '2'];
        const retval = appendFrames(frames);
        expect(retval).toExist();
        expect(retval.type).toBe(APPEND_FRAMES);
        expect(retval.frames).toBe(frames);
    });
    it('Test framesLoading action creator', () => {
        const retval = framesLoading(true);
        expect(retval).toExist();
        expect(retval.type).toBe(FRAMES_LOADING);
        expect(retval.loading).toBe(true);
    });
    it('Test selectPlaybackRange action creator', () => {
        const range = { startPlaybackRange: 'start', endPlaybackRange: 'end'};
        const retval = selectPlaybackRange(range);
        expect(retval).toExist();
        expect(retval.type).toBe(SELECT_PLAYBACK_RANGE);
        expect(retval.range).toBe(range);
    });
    it('Test changeSetting action creator', () => {
        const retval = changeSetting('test', 'value');
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_SETTING);
        expect(retval.name).toBe('test');
        expect(retval.value).toBe('value');
    });
    it('Test toggleAnimationMode action creator', () => {
        const retval = toggleAnimationMode();
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_ANIMATION_MODE);
    });
    it('Test animationStepMove action creator', () => {
        const retval = animationStepMove('asc');
        const retval1 = animationStepMove('desc');
        expect(retval).toExist();
        expect(retval1).toExist();
        expect(retval.type).toBe(ANIMATION_STEP_MOVE);
        expect(retval1.type).toBe(ANIMATION_STEP_MOVE);
        expect(retval.direction).toBe('asc');
        expect(retval1.direction).toBe('desc');
    });
    it('Test updateMetadata action creator', () => {
        const retval = updateMetadata({ next: 'next', previous: 'previous', forTime: 'forTime'});
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_METADATA);
        expect(retval.next).toBe('next');
        expect(retval.previous).toBe('previous');
        expect(retval.forTime).toBe('forTime');
    });
    it('Test setIntervalData action creator', () => {
        const retval = setIntervalData(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_INTERVAL_DATA);
        expect(retval.timeIntervalData).toBe(true);
    });
});
