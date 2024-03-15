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
import { buttonCanEdit, showConnectionsSelector } from '../selectors/dashboard';
import { dashboardHasWidgets, getWidgetsDependenciesGroups } from '../selectors/widgets';
import { triggerShowConnections } from '../actions/dashboard';
import { createPlugin } from '../utils/PluginsUtils';

class MapConnectionDashboard extends React.Component {
    static propTypes = {
        showConnections: PropTypes.bool,
        canEdit: PropTypes.bool,
        hasWidgets: PropTypes.bool,
        hasConnections: PropTypes.bool,
        onShowConnections: PropTypes.func
    }

    static defaultProps = {
        onShowConnections: () => {}
    }

    render() {
        const { showConnections, canEdit, hasConnections, hasWidgets, onShowConnections } = this.props;
        if (!(!!hasWidgets && !!hasConnections || !canEdit)) return false;
        return  (<ToolbarButton
            glyph={showConnections ? 'bulb-on' : 'bulb-off'}
            tooltipId={showConnections ? 'dashboard.editor.hideConnections' : 'dashboard.editor.showConnections'}
            bsStyle={showConnections ? 'success' : 'tray'}
            onClick={()=>onShowConnections(!showConnections)}
            tooltipPosition={'left'}
            id={'ms-map-connection-card-dashboard'}
            btnDefaultProps={{ tooltipPosition: 'bottom', className: 'square-button-md', bsStyle: 'primary' }}/>);
    }
}

const ConnectedMapAddWidget = connect(
    createSelector(
        showConnectionsSelector,
        dashboardHasWidgets,
        buttonCanEdit,
        getWidgetsDependenciesGroups,
        (showConnections, hasWidgets, edit, groups = []) => ({
            showConnections,
            hasConnections: groups.length > 0,
            hasWidgets,
            canEdit: edit
        })
    ),
    {
        onShowConnections: triggerShowConnections
    }
)(MapConnectionDashboard);

export default createPlugin('MapConnectionDashboard', {
    component: () => null,
    containers: {
        SidebarMenu: {
            name: "MapConnectionDashboard",
            tool: ConnectedMapAddWidget,
            position: 3,
            priority: 0
        }
    }
});
