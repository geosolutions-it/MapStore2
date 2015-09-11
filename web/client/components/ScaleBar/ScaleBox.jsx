/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ScaleComboController = require('./ScaleCombo');
var ScaleBarController = require('./ScaleBar');

/**
 * [ScaleBoxController new React Controller for ScaleBox]
 */
var ScaleBoxController = React.createClass({
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
        const LMap = new L.map(document.body);
        return {
            scalebox: {
                combo: false,
                bar: true,
                units: 'm',
                getComboItems: function() {
                    var items = [[18, '18'], [17, '17'], [16, '16'], [15, '15'], [14, '14'], [13, '13'], [12, '12'], [11, '11'], [10, '10'], [9, '9'], [8, '8'], [7, '7'], [6, '6'], [5, '5'], [4, '4'], [3, '3'], [2, '2'], [1, '1'], [0, '0']];
                    return items;
                },
                getBarValues: function() {
                    return ['1:5000', 150];
                },
                map: LMap
            }
        };
    },
    /**
     * [render render view]
     * @return {[HTML element]} [html]
     */
    render() {
        return (
            <div>
                {this.maybeRenderDiv()}
            </div>
        );
    },
    /**
     * [maybeRenderDiv render only div that you want to be visible]
     * @return {[HTML element]} [chosen html elements]
     */
    maybeRenderDiv() {
        if (this.props.scalebox.combo && this.props.scalebox.bar) {
            return <div className="mapstore-scalebox-main"> <ScaleComboController scalebox={this.props.scalebox}/><ScaleBarController scalebox={this.props.scalebox}/> </div>;
        } else if (this.props.scalebox.combo && !this.props.scalebox.bar) {
            return <div className="mapstore-scalebox-main"> <ScaleComboController scalebox={this.props.scalebox}/> </div>;
        } else if (!this.props.scalebox.combo && this.props.scalebox.bar) {
            return <div className="mapstore-scalebox-main"> <ScaleBarController scalebox={this.props.scalebox}/> </div>;
        }
    }
});

module.exports = ScaleBoxController;
