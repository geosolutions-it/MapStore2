var React = require('react');
var {ButtonGroup} = require('react-bootstrap');
var {Button, Glyphicon} = require('react-bootstrap');

var full = React.createClass({
    propTypes: {
        active: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            active: true
        };
    },
	enterFullscreen: function () {
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
  	},
    exitFullscreen: function () {
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
    },
    render() {
        return (
                <ButtonGroup id="screen-switcher" type="select" bsSize="small">
                    <Button id="enter-full-screen-button" onClick = {this.enterFullscreen}><Glyphicon glyph="resize-full"/>ON</Button>
                    <Button id="exit-full-screen-button" active={this.props.active} onClick = {this.exitFullscreen} ><Glyphicon glyph="resize-small" />OFF</Button>
                </ButtonGroup>
        		);
    }
});

module.exports = full;