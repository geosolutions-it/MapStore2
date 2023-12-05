/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import ToolbarButton from '../components/misc/toolbar/ToolbarButton';
import { buttonCanEdit, isDashboardEditing } from '../selectors/dashboard';
import { setEditing } from '../actions/dashboard';
import { createWidget } from '../actions/widgets';
import { createPlugin } from '../utils/PluginsUtils';

class AddWidgetDashboard extends React.Component {
    static propTypes = {
        canEdit: PropTypes.bool,
        editing: PropTypes.bool,
        onAddWidget: PropTypes.func,
	    setEditing: PropTypes.func
    }

    static defaultProps = {
        editing: false,
 		canEdit: false
    }

    render() {
        if (!this.props.canEdit && !this.props.editing) return false;
        return  (<ToolbarButton
            glyph={'plus'}
            tooltipId={'dashboard.editor.addACardToTheDashboard'}
            bsStyle={ this.props.editing ? 'primary' : 'tray'}
            disabled={this.props.editing}
            onClick={() => {
 				if (this.props.editing) this.props.setEditing(false);
 				else {
 					this.props.onAddWidget();
 				}
 			}}
            id={'ms-add-card-dashboard'}
            tooltipPosition={'left'}
            btnDefaultProps={{ tooltipPosition: 'right', className: 'square-button-md', bsStyle: this.props.editing ? 'primary' : 'tray' }}/>);
    }
}

const ConnectedAddWidget = connect(
    createSelector(
        buttonCanEdit,
        isDashboardEditing,
        ( edit, editing ) => ({
            canEdit: edit,
            editing
        })
    ),
    {
        onAddWidget: createWidget,
	    setEditing: setEditing
    }
)(AddWidgetDashboard);

export default createPlugin('AddWidgetDashboard', {
    component: () => null,
    containers: {
        SidebarMenu: {
            name: "AddWidgetDashboard",
            position: 3,
            tool: ConnectedAddWidget,
            priority: 0
        }
    }
});
