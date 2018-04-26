/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {createSelector} = require('reselect');
const {connect} = require('react-redux');
const PropTypes = require('prop-types');

const { isEditorActive} = require('../selectors/rulesmanager');

const Editor = require('./manager/RulesEditor');
const Toolbar = require('./manager/RulesToolbar');

/**
  * @name RulesEditor
  * @memberof plugins
  * @class
  * @classdesc
  * Rules-editor it's part of rules-manager page. It allow a admin user to add, modify and delete geofence rules
*/
class RulesEditorComponent extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         editing: PropTypes.bool,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         onMount: PropTypes.func,
         onUnmount: PropTypes.func,
         setEditing: PropTypes.func,
         dimMode: PropTypes.string,
         src: PropTypes.string,
         style: PropTypes.object
     };
     static defaultProps = {
         id: "rules-editor",
         editing: false,
         dockSize: 500,
         limitDockHeight: true,
         zIndex: 10000,
         fluid: false,
         dimMode: "none",
         position: "left",
         onMount: () => {},
         onUnmount: () => {},
         setEditing: () => {}
     };
    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }
    render() {


        return this.props.editing
                ? <div className="dashboard-editor de-builder"><Editor enabled={this.props.editing} onClose={() => this.props.setEditing(false)} catalog={this.props.catalog}/></div>
                : (<div className="ms-vertical-toolbar rules-editor re-toolbar" id={this.props.id}>
                    <Toolbar transitionProps={false} btnGroupProps={{vertical: true}} btnDefaultProps={{ tooltipPosition: 'right', className: 'square-button-md', bsStyle: 'primary'}} />
                    </div>);
    }
}

const Plugin = connect(
    createSelector(
        isEditorActive,
        editing => ({editing})
    ), {
        // setEditing,
        // onMount: () => setEditorAvailable(true),
        // onUnmount: () => setEditorAvailable(false)
    }
)(RulesEditorComponent);
module.exports = {
    RulesEditorPlugin: Plugin,
    reducers: {
        rulesmanager: require('../reducers/rulesmanager')
    },
    epics: require("../epics/rulesmanager")
};
