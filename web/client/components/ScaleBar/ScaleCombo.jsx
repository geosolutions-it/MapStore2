/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ReactBts = require('react-bootstrap');

var Button = ReactBts.Button;
var Glyphicon = ReactBts.Glyphicon;
var DropdownButton = ReactBts.DropdownButton;
var MenuItem = ReactBts.MenuItem;

/**
 * [ScaleComboController new React Controller for ScaleCombo]
 */
var ScaleComboController = React.createClass({
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
                getComboItems: function() {
                    var items = [[18, '18'], [17, '17'], [16, '16'], [15, '15'], [14, '14'], [13, '13'], [12, '12'], [11, '11'], [10, '10'], [9, '9'], [8, '8'], [7, '7'], [6, '6'], [5, '5'], [4, '4'], [3, '3'], [2, '2'], [1, '1'], [0, '0']];
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
            items: function() {
                return;
            }
        };
    },
    /**
     * [componentDidMount after component is loaded]
     * @return {[undefined]} [no return]
     */
    componentDidMount() {
        var that = this;
        // list of items in scalecombo
        var comboitems = that.props.scalebox.getComboItems();

        // Disable dragging when user's cursor enters the element
        that.getDOMNode().addEventListener('mouseover', function() {
            that.props.scalebox.map.scrollWheelZoom.disable();
            that.props.scalebox.map.doubleClickZoom.disable();
        });

        // Re-enable dragging when user's cursor leaves the element
        that.getDOMNode().addEventListener('mouseout', function() {
            that.props.scalebox.map.scrollWheelZoom.enable();
            that.props.scalebox.map.doubleClickZoom.enable();
        });

        // start function that creates items as list of html elements
        that.setComboItems(comboitems);

        // when zoom ends trigger function that changes the scalecombo title
        that.props.scalebox.map.on('zoomend', function() {
            that.setComboTitle(comboitems);
        });
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
        document.getElementsByClassName("mapstore-scalebox-combo-main")[0].getElementsByClassName("dropdown-toggle")[0].click();

        // zoom to chosen zoom level
        this.props.scalebox.map.setZoom(parseInt((e.currentTarget.attributes.data.value), 10));
    },
    /**
     * [changeButtonState fired when combo trigger is clicked]
     * @param  {[Object]} e [SyntheticMouseEvent]
     * @return {[undefined]}   [no return]
     */
    changeButtonState() {
        // scalecombo is visible / not visible
        if (this.state.showGlyph === 'chevron-right') {
            document.cookie = "hideCombo=true";
            this.setState({
                showCombo: {visibility: 'hidden'},
                showGlyph: 'chevron-left'
            });
        } else {
            document.cookie = "hideCombo=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            this.setState({
                showCombo: {visibility: 'visible'},
                showGlyph: 'chevron-right'
            });
        }
    },
    /**
     * [setComboItems creates items as list of html elements and then changes the state]
     * @param {[Aray]} comboitems [list of items]
     */
    setComboItems(comboitems) {
        var that = this;

        that.setState({
            items: function() {
                var itemEl = [];
                var i = 0;

                for (i; i < comboitems.length; i++) {
                    itemEl.push(<MenuItem onClick={that.changeActiveVal} href="#" data={comboitems[i][0]}>{comboitems[i][1]}</MenuItem>);
                }

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
        var that = this;
        var zoomLev = that.props.scalebox.map.getZoom();
        var i = 0;

        for (i; i < comboitems.length; i++) {
            if (comboitems[i][0] === zoomLev) {
                that.setState({
                    activeVal: comboitems[i][1]
                });
                return;
            }
        }
    }
});

module.exports = ScaleComboController;
