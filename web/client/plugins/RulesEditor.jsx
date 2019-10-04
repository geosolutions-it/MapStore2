/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const {createSelector} = require('reselect');
const { compose } = require('recompose');
const {connect} = require('react-redux');

const { cleanEditing, saveRule, setLoading } = require("../actions/rulesmanager");
const { activeRuleSelector, geometryStateSel } = require("../selectors/rulesmanager");
const { isEditorActive, isLoading} = require('../selectors/rulesmanager');

const RulesEditor = require('./manager/RulesEditor');
const Toolbar = require('./manager/RulesToolbar');
const enhancer = require("./manager/EditorEnhancer");


const Editor = compose(
    connect(createSelector([activeRuleSelector, geometryStateSel], (activeRule, geometryState) => ({ activeRule, geometryState })), {
        onExit: cleanEditing,
        onSave: saveRule,
        setLoading
    }),
    enhancer)(RulesEditor);

/**
 *  Rules-editor it's part of rules-manager page. It allow a admin user to add, modify and delete geofence rules
 * @name RulesEditor
 * @memberof plugins
 * @prop {boolean} cfg.disableDetails disable details tab. (Style/Filters/Attribute). Useful to avoid issues with GeoServer integrated version that do not full support this advanced features via REST
 * @class
 */
class RulesEditorComponent extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         editing: PropTypes.bool,
         limitDockHeight: PropTypes.bool,
         disableDetails: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         onMount: PropTypes.func,
         onUnmount: PropTypes.func,
         setEditing: PropTypes.func,
         dimMode: PropTypes.string,
         src: PropTypes.string,
         style: PropTypes.object,
         loading: PropTypes.bool
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
         setEditing: () => {}
     };
     render() {


         return this.props.editing
             ? <div className="rulesmanager-editor"><Editor disableDetails={this.props.disableDetails} loading={this.props.loading} enabled={this.props.editing} onClose={() => this.props.setEditing(false)} catalog={this.props.catalog}/></div>
             : (<div className="ms-vertical-toolbar rules-editor re-toolbar" id={this.props.id}>
                 <Toolbar loading={this.props.loading} transitionProps={false} btnGroupProps={{vertical: true}} btnDefaultProps={{ tooltipPosition: 'right', className: 'square-button-md', bsStyle: 'primary'}} />
             </div>);
     }
}

const Plugin = connect(
    createSelector(
        [isEditorActive,
            isLoading],
        (editing, loading) => ({editing, loading})
    ), {
    }
)(RulesEditorComponent);
module.exports = {
    RulesEditorPlugin: Plugin,
    reducers: {
        rulesmanager: require('../reducers/rulesmanager')
    },
    epics: require("../epics/rulesmanager")
};
