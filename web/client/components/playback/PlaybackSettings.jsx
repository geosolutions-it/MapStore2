/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const moment = require('moment');
const tooltip = require('../misc/enhancers/tooltip');
const { isNaN } = require('lodash');
const { Form, FormGroup, ControlLabel, FormControl, InputGroup, Glyphicon, Button: BButton } = require('react-bootstrap');
const Message = require('../I18N/Message');
const InfoPopover = require('../widgets/widget/InfoPopover');

const InlineDateTimeSelector = require('../time/InlineDateTimeSelector');
const SwitchButton = require('../misc/switch/SwitchButton');
const Button = tooltip(BButton);

/**
 *
 * @param {number} v the number to evaluate
 * @param {function} fun the function to execute with number as parameter, if the string is va valid number
 * @param {function} validate the function to execute with number as parameter, if the string is va valid number
 * @param {function} errFun the function to execute in case of error or not valid number
 */
const onValidInteger = (v, fun, errFun = () => { }) => {
    try {
        if (!isNaN(parseInt(v, 10))) {
            const value = parseInt(v, 10);
            if (value < 1) {
                return fun(1);
            }
            return fun(value);
        }
        return errFun();
    } catch (e) {
        return errFun(e);
    }
};
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
    following,
    frameDuration,
    timeStep,
    stepUnit,
    onSettingChange = () => { },
    /*
     * Boolean step for animation
     */
    fixedStep = false,

    playbackRange = {
        startPlaybackTime: new Date().toISOString(),
        endPlaybackTime: new Date().toISOString()
    },
    setPlaybackRange = () => { },

    dateSelectorStyle = {
        padding: 0,
        margin: 0,
        border: 'none'
    }

}) => (<div className="ms-playback-settings">
    <h4><Message msgId="playback.settings.title" /></h4>
        <FormGroup controlId="frameDuration" >
        <ControlLabel><Message msgId="playback.settings.frameDuration" /></ControlLabel>
            <InputGroup>
            <FormControl
                componentClass="input"
                type="number"
                value={frameDuration}

                    onChange={({ target = {} } = {}) => onValidInteger(
                    target.value,
                    v => {
                        onSettingChange("frameDuration", v);
                    }
                    )} /><InputGroup.Addon>s</InputGroup.Addon>
        </InputGroup>

    </FormGroup>
    <ControlLabel><Message msgId="playback.settings.step.label" /></ControlLabel>
    <FormGroup controlId="formPlaybackStep">
        <Form componentClass="fieldset" inline>
            <ControlLabel><Message msgId="playback.settings.step.fixed" /></ControlLabel>
            <span><SwitchButton checked={fixedStep} onChange={v => onSettingChange("fixedStep", v)} /></span>
            <FormControl
                disabled={!fixedStep}
                componentClass="input"
                type="number"
                style={{ maxWidth: 120 }}
                value={timeStep}
                    onChange={({ target = {} } = {}) => onValidInteger(
                        target.value,
                        v => {
                            onSettingChange("timeStep", v);
                        }
                        )} />
            <FormControl disabled={!fixedStep} componentClass="select" value={stepUnit} onChange={({ target = {} }) => onSettingChange("stepUnit", target.value)} >
                <option value="years"><Message msgId="playback.settings.step.year" msgParams={{ number: timeStep || 1 }} /></option>
                <option value="weeks"><Message msgId="playback.settings.step.week" msgParams={{ number: timeStep || 1 }} /></option>
                <option value="days"><Message msgId="playback.settings.step.day" msgParams={{ number: timeStep || 1 }} /></option>
                <option value="hour"><Message msgId="playback.settings.step.hour" msgParams={{ number: timeStep || 1 }} /></option>
                <option value="minutes"><Message msgId="playback.settings.step.minute" msgParams={{ number: timeStep || 1 }} /></option>
                <option value="seconds"><Message msgId="playback.settings.step.second" msgParams={{ number: timeStep || 1 }} /></option>
            </FormControl>
        </Form>
    </FormGroup>
    <FormGroup controlId="formPlaybackMode">
        <ControlLabel><Message msgId="playback.settings.range.title" /><Button className="no-border" bsSize="xs" tooltipId="playback.settings.range.zoomTooltip" ><Glyphicon glyph="search" /></Button></ControlLabel>
        <InlineDateTimeSelector
            tooltipId="playback.settings.range.animationStart"
            glyph="play"
            date={playbackRange.startPlaybackTime}
            onUpdate={startPlaybackTime => setPlaybackRange(getPlaybackRange({ ...playbackRange, startPlaybackTime }))}
            style={dateSelectorStyle} />
        <InlineDateTimeSelector
            glyph="stop"
            tooltipId="playback.settings.range.animationEnd"
            date={playbackRange.endPlaybackTime}
            onUpdate={endPlaybackTime => setPlaybackRange(getPlaybackRange({ ...playbackRange, endPlaybackTime }))}
            style={dateSelectorStyle} />
    </FormGroup>
    <FormGroup controlId="formPlaybackFollowingMode">
        <Form componentClass="fieldset" inline>
            <ControlLabel><Message msgId="playback.settings.mode.following" /><InfoPopover text={<Message msgId="playback.settings.mode.followingDescription" />} /></ControlLabel>
                <span><SwitchButton checked={following} onChange={v => onSettingChange("following", v)}/></span>
        </Form>
    </FormGroup>
</div>);
