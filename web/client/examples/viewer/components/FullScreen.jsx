var React = require('react');
var {Button, Glyphicon} = require('react-bootstrap');

var full = React.createClass({
    propTypes: {
        fullscreen: React.PropTypes.bool,
        glyphicon: React.PropTypes.string,
        buttonText: React.PropTypes.string,
        propertiesToggle: React.PropTypes.func
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.fullscreen !== this.props.fullscreen) {
            // call enterFullscreen method
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
            // call exitFullscreen method
        }
    },
    render() {
        var btn;
        if (this.props.fullscreen === true) {
            btn = (<Button id="full-screen-toggle" active={this.props.fullscreen} onClick={this.onClick}><Glyphicon glyph="resize-small"/>OFF</Button>);
        } else {
            btn = (<Button id="full-screen-toggle" active={this.props.fullscreen} onClick={this.onClick}><Glyphicon glyph="resize-full"/>ON</Button>);
        }
        return btn;
    },
    onClick() {
        this.props.propertiesToggle(this.props.fullscreen);
    },
    enterFullscreen() {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
            screen.orientation.lock("portrait-primary");
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
            screen.orientation.lock("portrait-primary");
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
            screen.orientation.lock("portrait-primary");
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
            screen.orientation.lock("portrait-primary");
        }
    },
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
});

module.exports = full;
