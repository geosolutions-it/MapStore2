/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const moment = require('moment');

const {Form, FormGroup, ControlLabel, FormControl, InputGroup} = require('react-bootstrap');
const Message = require('../I18N/Message');


const InlineDateTimeSelector = require('../time/InlineDateTimeSelector');
const SwitchButton = require('../misc/switch/SwitchButton');
const getPlaybackRange = ({ startPlaybackTime, endPlaybackTime }) => {
    const diff = moment(startPlaybackTime).diff(endPlaybackTime);
    return {
        startPlaybackTime: diff >= 0 ? endPlaybackTime : startPlaybackTime,
        endPlaybackTime: diff >= 0 ? startPlaybackTime : endPlaybackTime
    };
};

/**
 * Form div for settings of the playback
 */
module.exports = ({
    frameDuration,
    timeStep,
    setPlaybackRange = () => { },
    playbackRange = {
        startPlaybackTime: new Date().toISOString(),
        endPlaybackTime: new Date().toISOString()
    },
    dateSelectorStyle = {
        padding: 0,
        margin: 0,
        border: 'none'
    }

}) => (<div className="ms-playback-settings">
        <h4><Message msgId="playback.settings.title" /></h4>
    <FormGroup controlId="formPlaybackTime">
        <ControlLabel><Message msgId="playback.settings.frameDuration" /></ControlLabel>
        <InputGroup>
                <FormControl componentClass="input" type="number" value={frameDuration} /><InputGroup.Addon>s</InputGroup.Addon>
        </InputGroup>

    </FormGroup>
        <ControlLabel><Message msgId="playback.settings.step.label" /></ControlLabel>
        <Form componentClass="fieldset" inline>
            <FormGroup controlId="formPlaybackStep" >
                <ControlLabel><Message msgId="Fixed" /></ControlLabel>
                <span><SwitchButton /></span>
                <FormControl componentClass="input" type="number" value={timeStep} />
                <FormControl componentClass="select" placeholder="Select mode">
                    <option value="years"><Message msgId="playback.settings.step.year" msgParams={{ number: timeStep || 1 }}/></option>
                    <option value="weeks"><Message msgId="playback.settings.step.week" msgParams={{ number: timeStep || 1 }}/></option>
                    <option value="days"><Message msgId="playback.settings.step.day" msgParams={{ number: timeStep || 1 }}/></option>
                    <option value="hour"><Message msgId="playback.settings.step.hour" msgParams={{ number: timeStep || 1 }}/></option>
                    <option value="minutes"><Message msgId="playback.settings.step.minute" msgParams={{ number: timeStep || 1 }}/></option>
                    <option value="seconds"><Message msgId="playback.settings.step.second" msgParams={{number: timeStep || 1}}/></option>
                </FormControl>
            </FormGroup>
        </Form>
        <FormGroup controlId="formPlaybackMode">
            <ControlLabel>Mode</ControlLabel>
            <FormControl componentClass="select" placeholder="Select mode">
                <option value="normal">Normal</option>
                <option value="cumulative">Cumulative</option>
                <option value="ranged">Ranged</option>
            </FormControl>
        </FormGroup>


    <FormGroup controlId="formPlaybackMode">
        <ControlLabel>Range</ControlLabel>
        <InlineDateTimeSelector
            tooltipId="playback.settings.range.animationStart"
            glyph="play"
            date={playbackRange.startPlaybackTime}
            onUpdate={startPlaybackTime => setPlaybackRange(getPlaybackRange({...playbackRange, startPlaybackTime}))}
            style={dateSelectorStyle}/>
        <InlineDateTimeSelector
            glyph="stop"
            tooltipId="playback.settings.range.animationEnd"
            date={playbackRange.endPlaybackTime}
            onUpdate={endPlaybackTime => setPlaybackRange(getPlaybackRange({...playbackRange, endPlaybackTime}))}
            style={dateSelectorStyle}/>
    </FormGroup>
</div>);
