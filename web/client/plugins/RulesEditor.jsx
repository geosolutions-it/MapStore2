/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { createSelector } from 'reselect';

import { cleanEditing, saveRule, setLoading, cleanEditingGSInstance, saveGSInstance } from '../actions/rulesmanager';
import epics from "../epics/rulesmanager";
import rulesmanager from '../reducers/rulesmanager';
import { activeGridSelector, activeGSInstanceSelector, activeRuleSelector, geometryStateSel, isEditorActive, isEditorActiveGSInstance, isLoading } from '../selectors/rulesmanager';
import enhancer from './manager/EditorEnhancer';
import RulesEditor from './manager/RulesEditor';
import Toolbar from './manager/RulesToolbar';
// for gs instances
import gsInstanceEnhancer from './manager/GSInstances/EditorEnhancer';
import GSInstanceEditor from './manager/GSInstances/GSInstanceEditor';

// Rules editor
const Editor = compose(
    connect(createSelector([activeRuleSelector, geometryStateSel], (activeRule, geometryState) => ({ activeRule, geometryState })), {
        onExit: cleanEditing,
        onSave: saveRule,
        setLoading
    }),
    enhancer)(RulesEditor);

// GS instances editor --> for stand-alone geofence only
const GSInstanceEditorComp = compose(
    connect(createSelector([
        geometryStateSel,
        activeGSInstanceSelector,
        activeGridSelector
    ], (geometryState, activeGSInstance, activeGrid) => ({geometryState, activeGSInstance, activeGrid })), {
        setLoading,
        onSaveGSItance: saveGSInstance,
        onExitGSInstance: cleanEditingGSInstance
    }),
    gsInstanceEnhancer)(GSInstanceEditor);

/**
 *  Rules-editor it's part of {@link api/framework#pages.RulesManager|rules-manager page}. It allow a admin user to add, modify and delete geofence rules
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
         loading: PropTypes.bool,
         activeGrid: PropTypes.string,
         editingGSInstance: PropTypes.bool
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
         setEditing: () => {},
         activeGrid: "rules",
         editingGSInstance: false
     };
     render() {
         // render for rules
         if (this.props.activeGrid === 'rules') {
             return this.props.editing
                 ? <div className="rulesmanager-editor"><Editor disableDetails={this.props.disableDetails} loading={this.props.loading} enabled={this.props.editing} onClose={() => this.props.setEditing(false)} catalog={this.props.catalog}/></div>
                 : (<div className="ms-vertical-toolbar rules-editor re-toolbar" id={this.props.id}>
                     <Toolbar loading={this.props.loading} transitionProps={false} btnGroupProps={{vertical: true}} btnDefaultProps={{ tooltipPosition: 'right', className: 'square-button-md', bsStyle: 'primary'}} />
                 </div>);
         }
         // render for gs instances
         return this.props.editingGSInstance
             ? <div className="rulesmanager-editor"><GSInstanceEditorComp disableDetails={this.props.disableDetails} loading={this.props.loading} enabled={this.props.editingGSInstance} onClose={() => this.props.setEditing(false)} catalog={this.props.catalog}/></div>
             : (<div className="ms-vertical-toolbar rules-editor re-toolbar" id={this.props.id}>
                 <Toolbar loading={this.props.loading} transitionProps={false} btnGroupProps={{vertical: true}} btnDefaultProps={{ tooltipPosition: 'right', className: 'square-button-md', bsStyle: 'primary'}} />
             </div>);
     }
}

const Plugin = connect(
    createSelector(
        [isEditorActive,
            isLoading, isEditorActiveGSInstance, activeGridSelector],
        (editing, loading, editingGSInstance, activeGrid) => ({editing, loading, editingGSInstance, activeGrid})
    ), {
    }
)(RulesEditorComponent);

export default {
    RulesEditorPlugin: Plugin,
    reducers: {
        rulesmanager
    },
    epics
};
