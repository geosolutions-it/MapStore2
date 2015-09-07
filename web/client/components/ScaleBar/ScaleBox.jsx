/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react'),
ScaleBoxController,
ScaleComboController = require('./ScaleCombo'),
ScaleBarController = require('./ScaleBar');

/**
 * [ScaleBoxController new React Controller for ScaleBox]
 */
ScaleBoxController = React.createClass({
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
            			combo: true,
            			bar: true
	        	}
	    	};
	},
	/**
	 * [maybeRenderDiv render only div that you want to be visible]
	 * @return {[HTML element]} [chosen html elements]
	 */
	maybeRenderDiv () {
		if (this.props.scalebox.combo && this.props.scalebox.bar) 
			return <div className="mapstore-scalebox-main"> <ScaleComboController scalebox={this.props.scalebox}/><ScaleBarController scalebox={this.props.scalebox}/> </div>;
		else if (this.props.scalebox.combo && !this.props.scalebox.bar)
			return <div className="mapstore-scalebox-main"> <ScaleComboController scalebox={this.props.scalebox}/> </div>
		else if (!this.props.scalebox.combo && this.props.scalebox.bar)
			return <div className="mapstore-scalebox-main"> <ScaleBarController scalebox={this.props.scalebox}/> </div>;
		else 
			return;
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
	}
});

module.exports = ScaleBoxController;