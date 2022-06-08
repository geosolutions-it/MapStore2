/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import moment from 'moment';
import { isNaN } from 'lodash';
import { Form, FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import classnames from 'classnames';
import Message from '../I18N/Message';
import InfoPopover from '../widgets/widget/InfoPopover';
import InlineDateTimeSelector from '../time/InlineDateTimeSelector';
import SwitchButton from '../misc/switch/SwitchButton';
import SwitchPanel from '../misc/switch/SwitchPanel';
import IntlNumberFormControl from '../I18N/IntlNumberFormControl';

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
export default ({
    following,
    frameDuration,
    timeStep,
    stepUnit,
    onSettingChange = () => { },
    toggleAnimationMode = () => { },
    toggleAnimationRange = () => { },
    /*
     * Boolean step for animation
     */
    fixedStep = false,

    playbackRange = {

    },
    snapTypes = [],
    currentSnapType = "start",
    snapRadioButtonEnabled = false,
    endValuesSupport,
    onChangeSnapType = () => { },
    setPlaybackRange = () => { },
    playbackButtons,
    dateSelectorStyle = {
        padding: 0,
        margin: 0,
        border: 'none'
    },
    style = {}

}) => (<div className="ms-playback-settings" style={style}>
    <h4><Message msgId="timeline.settings.title" /></h4>
    <FormGroup controlId="timelineSettings">
        <Form componentClass="fieldset" inline className="snap-guide-form">
            <ControlLabel>
                <Message msgId="timeline.settings.snapToGuideLayer" />&nbsp;
                <InfoPopover text={<Message msgId="timeline.settings.snapToGuideLayerTooltip" />} />
            </ControlLabel>
            <span><SwitchButton checked={!fixedStep} onChange={() => toggleAnimationMode()} /></span>
        </Form>
        {!fixedStep && endValuesSupport && (
            <Form componentClass="fieldset" inline className="snap-type-form" disabled={!snapRadioButtonEnabled}>
                <div className="snap-type-form-title">
                    <ControlLabel>
                        <Message msgId="timeline.settings.snapType" />&nbsp;
                        <InfoPopover text={<Message msgId="timeline.settings.snapTypeTooltip" />} />
                    </ControlLabel>
                </div>
                <div className="snap-type-container">
                    {snapTypes.map(snapType => (
                        <div className="snap-type-item">
                            <input
                                type="radio"
                                className={classnames('snap-type-radio-btn', {'disabled': !snapRadioButtonEnabled})}
                                value={snapType.value}
                                name="snapType"
                                checked={currentSnapType === snapType.value}
                                onChange={ e => {
                                    const { value } = e.target;
                                    onChangeSnapType(value);
                                }}
                            />
                            <div className="snap-type-radio-btn-label">
                                <Message msgId={snapType.label}/>
                            </div>
                        </div>
                    ))}
                </div>
            </Form>
        )}
    </FormGroup>
    <h4><Message msgId="playback.settings.title" /></h4>
    <FormGroup controlId="frameDuration" >
        <ControlLabel><Message msgId="playback.settings.frameDuration" /></ControlLabel>
        <InputGroup>
            <IntlNumberFormControl
                componentClass="input"
                type="number"
                value={frameDuration}
                onChange={(val = "") => onValidInteger(
                    val,
                    v => {
                        onSettingChange("frameDuration", v);
                    }
                )} /><InputGroup.Addon>s</InputGroup.Addon>
        </InputGroup>

    </FormGroup>
    <ControlLabel>
        <Message msgId="playback.settings.step.label" />
        &nbsp;<InfoPopover text={<Message msgId="playback.settings.step.tooltip" />} />
    </ControlLabel>
    <FormGroup controlId="formPlaybackStep">
        <Form componentClass="fieldset" inline>
            <IntlNumberFormControl
                disabled={!fixedStep}
                componentClass="input"
                type="number"
                style={{input: {maxWidth: 120}}}
                value={timeStep}
                onChange={(val = "") => onValidInteger(
                    val,
                    v => {
                        onSettingChange("timeStep", v);
                    }
                )} />
            <FormControl disabled={!fixedStep} componentClass="select" value={stepUnit} onChange={({ target = {} }) => onSettingChange("stepUnit", target.value)} >
                <Message msgId="playback.settings.step.year" msgParams={{ number: timeStep || 1 }}>{msg => <option value="years">{msg}</option>}</Message>
                <Message msgId="playback.settings.step.week" msgParams={{ number: timeStep || 1 }}>{msg => <option value="weeks">{msg}</option>}</Message>
                <Message msgId="playback.settings.step.day" msgParams={{ number: timeStep || 1 }}>{msg => <option value="days">{msg}</option>}</Message>
                <Message msgId="playback.settings.step.hour" msgParams={{ number: timeStep || 1 }}>{msg => <option value="hour">{msg}</option>}</Message>
                <Message msgId="playback.settings.step.minute" msgParams={{ number: timeStep || 1 }}>{msg => <option value="minutes">{msg}</option>}</Message>
                <Message msgId="playback.settings.step.second" msgParams={{ number: timeStep || 1 }}>{msg => <option value="seconds">{msg}</option>}</Message>
            </FormControl>
        </Form>
    </FormGroup>
    <SwitchPanel onSwitch={(enabled) => toggleAnimationRange(enabled)} expanded={playbackRange.startPlaybackTime && playbackRange.endPlaybackTime} title={<Message msgId="playback.settings.range.title" />} buttons={playbackButtons}>
        <FormGroup controlId="formPlaybackMode" style={{margin: 10}}>
            <InlineDateTimeSelector
                tooltipId="playback.settings.range.animationStart"
                glyph="play"
                date={playbackRange.startPlaybackTime}
                onUpdate={startPlaybackTime => setPlaybackRange(getPlaybackRange({ ...playbackRange, startPlaybackTime }))}
                style={dateSelectorStyle}
                showButtons />
            <InlineDateTimeSelector
                glyph="stop"
                tooltipId="playback.settings.range.animationEnd"
                date={playbackRange.endPlaybackTime}
                onUpdate={endPlaybackTime => setPlaybackRange(getPlaybackRange({ ...playbackRange, endPlaybackTime }))}
                style={dateSelectorStyle}
                showButtons />
        </FormGroup>
    </SwitchPanel>
    <FormGroup controlId="formPlaybackFollowingMode">
        <Form componentClass="fieldset" inline>
            <ControlLabel><Message msgId="playback.settings.mode.following" />&nbsp;<InfoPopover text={<Message msgId="playback.settings.mode.followingDescription" />} /></ControlLabel>
            <span><SwitchButton checked={following} onChange={v => onSettingChange("following", v)}/></span>
        </Form>
    </FormGroup>
</div>);
