/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

/**
 * [ScaleBarController new React Controller for ScaleBar]
 */
var ScaleBarController = React.createClass({
    /**
     * [propTypes types of props]
     * @type {Object}
     */
    propTypes: {
        scalebox: React.PropTypes.object
    },
    /**
     * [getDefaultProps fetch default props]
     * @return {[Object]} [return scalebox object]
     */
    getDefaultProps() {
        return {
            scalebox: {
                getBarValues: function() {
                    return ['1:5000', 150];
                }
            }
        };
    },
    /**
     * [getInitialState get initial state]
     * @return {[Object]} [return empty object]
     */
    getInitialState() {
        return {};
    },
    /**
     * [componentDidMount after component is loaded]
     * @return {[undefined]} [no return]
     */
    componentDidMount() {
        var that = this;

        // start function where I get scalebar values and then change the state
        that.setStateBar();

        // when zoom ends trigger function that changes the state
        if (that.props.scalebox.map) {
            that.props.scalebox.map.on('zoomend', function() {
                that.setStateBar();
            });
        }
    },
    /**
     * [render render view]
     * @return {[HTML element]} [html]
     */
    render() {
        return (
            <div className="mapstore-scalebox-bar-main">
                <div className="mapstore-scalebox-bar-dist" style={this.state.width}>
                    <span>{this.state.distText}</span>
                </div>
            </div>
        );
    },
    /**
     * [setStateBar get scalebar values and then set state]
     */
    setStateBar() {
        var that = this;

        // fetch scalebar values (response is array)
        var res = that.props.scalebox.getBarValues();
        that.setState({
            distText: res[0],
            width: {
                width: res[1]
            }
        });
    }
});

module.exports = ScaleBarController;
