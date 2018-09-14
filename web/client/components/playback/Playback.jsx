
const Toolbar = require('../misc/toolbar/Toolbar');
const React = require('react');
const {compose, withState, /*branch, renderComponent,*/ withProps, lifecycle} = require('recompose');
const InlineDateTimeSelector = require('../../plugins/timeline/InlineDateTimeSelector');
const {FormGroup, ControlLabel, FormControl} = require('react-bootstrap');
const moment = require('moment');

const getPlaybackRange = ({startPlaybackTime, endPlaybackTime}) => {
    const diff = moment(startPlaybackTime).diff(endPlaybackTime);
    return {
        startPlaybackTime: diff >= 0 ? endPlaybackTime : startPlaybackTime,
        endPlaybackTime: diff >= 0 ? startPlaybackTime : endPlaybackTime
    };
};

const collapsible = compose(
    withState("showSettings", "onShowSettings", false),
    withState("collapsed", "setCollapsed", true),
        withProps(({ setCollapsed }) => ({
            buttons: [{
                glyph: 'minus',
                onClick: () => setCollapsed(true)
            }]
    })),
    lifecycle({
        componentWillUnmount() {
            this.props.stop();
        }
    })/*,
    branch(
        ({collapsed}) => collapsed,
        renderComponent(({setCollapsed}) => (<Toolbar btnDefaultProps={{
            className: 'square-button-md',
            bsStyle: 'primary'
        }} buttons={[{
                glyph: 'time',
                onClick: () => setCollapsed(false)
            }]} />))
        )*/
);
module.exports = collapsible(({
    // setCollapsed,
    // currentTime,

    // loading,

    status,
    statusMap,
    play = () => {},
    pause = () => {},
    stop = () => {},
    showSettings,
    onShowSettings = () => {},
    setPlaybackRange = () => {},
    playbackRange = {
        startPlaybackTime: new Date().toISOString(),
        endPlaybackTime: new Date().toISOString()
    },
    dateSelectorStyle = {
        padding: 0,
        margin: 0,
        border: 'none'
    }
}) => ( <div style={{display: 'flex'}}>
            {showSettings &&
            <div className="ms-playback-settings">

                <h4>Playback Settings</h4>

                {/* Example form element */}
                <FormGroup controlId="formPlaybackMode">
                    <ControlLabel>Mode</ControlLabel>
                    <FormControl componentClass="select" placeholder="Select mode">
                        <option value="normal">Normal</option>
                        <option value="comulative">Comulative</option>
                        <option value="ranged">Ranged</option>
                    </FormControl>
                </FormGroup>
                {/* End - Example form element */}

                <FormGroup controlId="formPlaybackMode">
                    <ControlLabel>Range</ControlLabel>
                    <InlineDateTimeSelector
                        tooltip="Start time range"
                        glyph="play"
                        date={playbackRange.startPlaybackTime}
                        onUpdate={startPlaybackTime => setPlaybackRange(getPlaybackRange({...playbackRange, startPlaybackTime}))}
                        style={dateSelectorStyle}/>
                    <InlineDateTimeSelector
                        glyph="stop"
                        tooltip="End time range"
                        date={playbackRange.endPlaybackTime}
                        onUpdate={endPlaybackTime => setPlaybackRange(getPlaybackRange({...playbackRange, endPlaybackTime}))}
                        style={dateSelectorStyle}/>
                </FormGroup>
            </div>}
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md',
                    bsStyle: 'primary'
                }}
                buttons={[
                    {
                        glyph: "step-backward",
                        tooltip: 'Step backward'
                    }, {
                        glyph: status === statusMap.PLAY ? "pause" : "play",
                        onClick: () => status === statusMap.PLAY ? pause() : play(),
                        tooltip: 'Play'
                    }, {
                        glyph: "stop",
                        onClick: stop,
                        tooltip: 'Stop'
                    }, {
                        glyph: "step-forward",
                        tooltip: 'Step forward'
                    }, {
                        glyph: "wrench",
                        bsStyle: showSettings ? 'success' : 'primary',
                        active: !!showSettings,
                        onClick: () => onShowSettings(!showSettings),
                        tooltip: 'Playback settings'
                    }
                ]}/>
        </div>
    )
);
