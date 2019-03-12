/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const { updateMetadata, play, pause, stop, setFrames, appendFrames, setCurrentFrame, changeSetting, selectPlaybackRange, framesLoading, STATUS } = require('../../actions/playback');
const playback = require('../playback');
describe('playback reducer', () => {
    it('default', () => {
        const oldState = {};
        const state = playback(oldState, {type: "NO_ACTION"});
        expect(state).toExist();
        expect(state).toBe(oldState);
    });
    it('playback play', () => {
        const action = play();
        const state = playback( undefined, action);
        expect(state).toExist();
        expect(state.status).toBe(STATUS.PLAY);
    });
    it('playback stop', () => {
        const action = stop();
        const state = playback(undefined, action);
        expect(state).toExist();
        expect(state.status).toBe(STATUS.STOP);
    });
    it('playback pause', () => {
        const action = pause();
        const state = playback(undefined, action);
        expect(state).toExist();
        expect(state.status).toBe(STATUS.PAUSE);
    });
    it('playback setFrames', () => {
        const D = "2017-11-29T16:17:46.520Z";
        const action = setFrames([D]);
        const state = playback(undefined, action);
        expect(state).toExist();
        expect(state.frames.length).toBe(1);
        expect(state.frames[0]).toBe(D);
        expect(state.currentFrame).toBe(-1);
    });
    it('playback appendFrames', () => {
        const D0 = "2015-11-29T16:17:46.520Z";
        const D1 = "2017-11-29T16:17:46.520Z";
        const action = appendFrames([D1]);
        const state = playback({ frames: [D0], currentFrame: 0}, action);
        expect(state).toExist();
        expect(state.frames.length).toBe(2);
        expect(state.frames[0]).toBe(D0);
        expect(state.frames[1]).toBe(D1);
        expect(state.currentFrame).toBe(0);
    });
    it('playback setCurrentFrame', () => {
        const D0 = "2015-11-29T16:17:46.520Z";
        const D1 = "2017-11-29T16:17:46.520Z";
        const action = setCurrentFrame(1);
        const state = playback({ frames: [D0, D1], currentFrame: 0 }, action);
        expect(state).toExist();
        expect(state.frames.length).toBe(2);
        expect(state.frames[0]).toBe(D0);
        expect(state.frames[1]).toBe(D1);
        expect(state.currentFrame).toBe(1);
    });
    it('playback changeSetting', () => {
        const action = changeSetting("name", "value");
        const state = playback( undefined, action);
        expect(state).toExist();
        expect(state.settings.name).toBe("value");
    });
    it('playback updateMetadata', () => {
        const next = "2017-11-29T16:17:46.520Z";
        const previous = "2015-11-29T16:17:46.520Z";
        const forTime = "2016-7-29T16:17:46.520Z";
        const action = updateMetadata({ next, previous, forTime});
        const state = playback( undefined, action);
        expect(state).toExist();
        expect(state.metadata.next).toBe(next);
        expect(state.metadata.previous).toBe(previous);
        expect(state.metadata.forTime).toBe(forTime);
    });
    it('reset playback data when switch to a new map', () => {
        const action = {
            type: 'RESET_CONTROLS'
        };
        const D0 = "2015-11-29T16:17:46.520Z";
        const D1 = "2017-11-29T16:17:46.520Z";
        const state = playback( {frames: [D0, D1], currentFrame: 0 }, action);
        expect(state).toExist();
        expect(state.frame).toNotExist();
        expect(state.currentFrame).toBe(-1);
    });
    it('playback selectPlaybackRange', () => {
        const range = {
            startPlaybackRange: "2017-11-29T16:17:46.520Z",
            endPlaybackRange: "2017-12-29T16:17:46.520Z"
        };
        const action = selectPlaybackRange(range);
        const state = playback( undefined, action);
        expect(state).toExist();
        expect(state.playbackRange).toBe(range);
    });
    it('playback framesLoading', () => {
        const action = framesLoading(true);
        const state = playback( undefined, action);
        expect(state).toExist();
        expect(state.framesLoading).toBe(true);
    });
});
