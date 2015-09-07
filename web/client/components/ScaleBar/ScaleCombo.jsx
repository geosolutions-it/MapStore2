/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react'),
ReactBts = require('react-bootstrap'),
Button = ReactBts.Button,
Glyphicon = ReactBts.Glyphicon,
DropdownButton = ReactBts.DropdownButton,
MenuItem = ReactBts.MenuItem,
ScaleComboController,
ScaleBoxController = require('./ScaleBox');

/**
 * [ScaleComboController new React Controller for ScaleCombo]
 */
ScaleComboController = React.createClass({
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
            			getComboItems: function () {
					var items =  [[18,'18'], [17,'17'], [16,'16'], [15,'15'], [14,'14'], [13,'13'], [12,'12'], [11,'11'], [10,'10'], [9,'9'], [8,'8'], [7,'7'],  [6,'6'],  [5,'5'],  [4,'4'],  [3,'3'],  [2,'2'],  [1,'1'],  [0,'0']];
					return items;
		            }
	        	}
	    	};
	},
	/**
	 * [getInitialState get initial state]
	 * @return {[Object]} [return showCombo, showGlyph, activeVal and items]
	 */
	getInitialState() {
		return {
			showCombo: {
				visibility: document.cookie && document.cookie.match('hideCombo') ? 'hidden' : 'visible'
			},
			showGlyph: document.cookie && document.cookie.match('hideCombo') ? 'chevron-left' : 'chevron-right',
			activeVal: '',
			items: function () {return;}
		}
	},
	/**
	 * [render render view]
	 * @return {[HTML element]} [html]
	 */
	render() {
		return (
			<div>
				<DropdownButton className="mapstore-scalebox-combo-main" style={this.state.showCombo} title={this.state.activeVal} dropup pullRight>
					{this.state.items()}
			    	</DropdownButton>
			    	<Button className="mapstore-scalebox-combo-trigger" onClick={this.changeButtonState}><Glyphicon glyph={this.state.showGlyph} /></Button>
		    	</div>
		);
	},
	/**
	 * [changeActiveVal changes scalebox text]
	 * @param  {[Object]} e [SyntheticMouseEvent]
	 * @return {[undefined]}   [no return]
	 */
	changeActiveVal(e) {
		this.setState({activeVal: e.target.text});
		// hack - problem with react and bootstrap
		$('.mapstore-scalebox-combo-main button.dropdown-toggle').trigger('click');
		// zoom to chosen zoom level
		leafMap.setZoom(parseInt($(e.currentTarget).attr('data')));
	},
	/**
	 * [changeButtonState fired when combo trigger is clicked]
	 * @param  {[Object]} e [SyntheticMouseEvent]
	 * @return {[undefined]}   [no return]
	 */
	changeButtonState(e) {
		// scalecombo is visible
		if (this.state.showGlyph === 'chevron-right') {
			document.cookie = "hideCombo=true";
			this.setState({
				showCombo: {visibility: 'hidden'},
				showGlyph: 'chevron-left'
			});
		}
		// scalecombo is not visible
		else {
			document.cookie = "hideCombo=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
			this.setState({
				showCombo: {visibility: 'visible'},
				showGlyph: 'chevron-right'
			});
		}
	},
	/**
	 * [componentDidMount after component is loaded]
	 * @return {[undefined]} [no return]
	 */
	componentDidMount() {
		var that = this,
		// list of items in scalecombo
		comboitems = that.props.scalebox.getComboItems();

		// start function that creates items as list of html elements
		that.setComboItems(comboitems);

		// when zoom ends trigger function that changes the scalecombo title
		leafMap.on('zoomend', function () {
			that.setComboTitle(comboitems);
		});
	},
	/**
	 * [setComboItems creates items as list of html elements and then changes the state]
	 * @param {[Aray]} comboitems [list of items]
	 */
	setComboItems(comboitems) {
		var that = this;

		that.setState({
			items: function () {
				var itemEl = [];
				$.each(comboitems, function (i, item) {
					itemEl.push(<MenuItem onClick={that.changeActiveVal} href='#' data={item[0]}>{item[1]}</MenuItem>);
				});		

				return {itemEl};
			}
		});

		that.setComboTitle(comboitems);
	},
	/**
	 * [setComboTitle changes scalecombo title depending on zoom level]
	 * @param {[Array]} comboitems [list of items]
	 */
	setComboTitle(comboitems) {
		var that = this,
		zoomLev = leafMap.getZoom();

		$.each(comboitems, function (i, item) {
			if (item[0] === zoomLev) {
				that.setState({
					activeVal: item[1]
				});
				return;
			}
		});
	}
	
});

module.exports = ScaleComboController;