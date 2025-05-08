/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { withProps, compose } from 'recompose';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createPlugin } from '../utils/PluginsUtils';
import { isDashboardEditing, isDashboardLoading, canEditServiceSelector } from '../selectors/dashboard';
import { dashboardSelector, dashboardsLocalizedSelector } from './widgetbuilder/commons';

import { toggleConnection } from '../actions/widgets';

import { initPlugin, setEditing, setEditorAvailable, triggerShowConnections } from '../actions/dashboard';

import withDashboardExitButton from './widgetbuilder/enhancers/withDashboardExitButton';
import WidgetTypeBuilder from './widgetbuilder/WidgetTypeBuilder';
import epics from '../epics/dashboard';
import dashboard from '../reducers/dashboard';
import usePluginItems from '../hooks/usePluginItems';

const Builder =
    compose(
        connect(dashboardSelector, { toggleConnection, triggerShowConnections }),
        connect(dashboardsLocalizedSelector),
        withProps(({ availableDependencies = [] }) => ({
            availableDependencies: availableDependencies.filter(d => d !== "map")
        })),
        withDashboardExitButton
    )(WidgetTypeBuilder);

/**
 * Side toolbar that allows to edit dashboard widgets.
 * @name DashboardEditor
 * @class
 * @memberof plugins
 * @prop {object} cfg.catalog **Deprecated** in favor of `cfg.services`. Can contain a catalog configuration
 * @prop {object} cfg.services Object with the catalogs available to select layers for maps, charts and tables. The format is the same of the `Catalog` plugin.
 * @prop {string} cfg.selectedService the key of service selected by default from the list of `cfg.services`
 * @prop {string} cfg.servicesPermission object with permission properties to manage catalog service. Configurations are `editingAllowedRoles` & `editingAllowedGroups`. By default `editingAllowedRoles: ["ADMIN"]`
 * @prop {boolean} cfg.disableEmptyMap disable empty map entry from the available maps of map widget
 */
class DashboardEditorComponent extends React.Component {
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
        style: PropTypes.object,
        pluginCfg: PropTypes.object,
        addonsItems: PropTypes.array,
        catalog: PropTypes.object,
        disableEmptyMap: PropTypes.bool,
        servicesPermission: PropTypes.object
    };
    static defaultProps = {
        id: "dashboard-editor",
        editing: false,
        dockSize: 500,
        limitDockHeight: true,
        zIndex: 10000,
        fluid: false,
        dimMode: "none",
        position: "left",
        onMount: () => { },
        onUnmount: () => { },
        setEditing: () => { },
        servicesPermission: {
            editingAllowedRoles: ["ALL"]
        }
    };
    componentDidMount() {
        this.props.onInit({ servicesPermission: this.props.servicesPermission });
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }
    render() {
        const defaultSelectedService = this.props.pluginCfg.selectedService || "";
        const defaultServices = this.props.pluginCfg.services || {};

        return this.props.editing
            ? <div
                className="dashboard-editor de-builder">
                <Builder
                    disableEmptyMap={this.props.disableEmptyMap}
                    addonsItems={this.props.addonsItems}
                    defaultSelectedService={defaultSelectedService}
                    defaultServices={defaultServices}
                    canEditService={this.props.canEditService}
                    enabled={this.props.editing}
                    onClose={() => this.props.setEditing(false)}
                    catalog={this.props.catalog}
                />
            </div>
            : false;
    }
}

const DashboardEditorComponentWrapper = (props, context) => {
    const { loadedPlugins } = context;
    const addonsItems = usePluginItems({ items: props.items, loadedPlugins }).filter(({ target }) => target === 'url-addon');
    return <DashboardEditorComponent {...props} addonsItems={addonsItems}/>;
};


const Plugin = connect(
    createSelector(
        isDashboardEditing,
        isDashboardLoading,
        canEditServiceSelector,
        (editing, isDashboardOpened, canEditService) => ({ editing, isDashboardOpened, canEditService })
    ), {
        setEditing,
        onInit: initPlugin,
        onMount: () => setEditorAvailable(true),
        onUnmount: () => setEditorAvailable(false)
    }
)(DashboardEditorComponentWrapper);
export default createPlugin('DashboardEditor', {
    component: Plugin,
    reducers: {
        dashboard
    },
    epics
});
