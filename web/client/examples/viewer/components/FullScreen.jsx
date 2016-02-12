var React = require('react');
var {ButtonGroup} = require('react-bootstrap');
var {Button, Glyphicon} = require('react-bootstrap');

var full = React.createClass({
    propTypes: {
        activeKey: React.PropTypes.string
    },
    getInitialState() {
        return {
            active_full_button: false,
            active_resize_button: true,
            activeKey: this.props.activeKey
        };
    },
    render() {
        return (
                <ButtonGroup id="screen-switcher" type="select" bsSize="small">
                    <Button id="enter-full-screen-button" active={this.state.active_full_button} onClick = {() => {this.enterFullscreen(); }}><Glyphicon glyph="resize-full"/>ON</Button>
                    <Button id="exit-full-screen-button" active={this.state.active_resize_button} onClick = {() => {this.exitFullscreen(); }} ><Glyphicon glyph="resize-small" />OFF</Button>
                </ButtonGroup>
        		);
    },
    enterFullscreen () {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
        return false;
        this.setState({ active_full_button: true, active_resize_button: false, activeKey: this.state.activeKey });
    },
    exitFullscreen () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return false;
        this.setState({ active_full_button: false, active_resize_button:true, activeKey: this.state.activeKey });
    }
});

module.exports = full;
