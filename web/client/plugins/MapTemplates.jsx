/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import { createSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';

import {setControlProperty, toggleControl} from '../actions/controls';
import { templatesSelector, mapTemplatesLoadedSelector } from '../selectors/maptemplates';
import { openMapTemplatesPanel, mergeTemplate, replaceTemplate, toggleFavouriteTemplate, setAllowedTemplates } from '../actions/maptemplates';

import Message from '../components/I18N/Message';
import Loader from '../components/misc/Loader';
import MapTemplatesPanel from '../components/maptemplates/MapTemplatesPanel';

import maptemplates from '../reducers/maptemplates';
import * as epics from '../epics/maptemplates';
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import PropTypes from "prop-types";
import ResponsivePanel from "../components/misc/panels/ResponsivePanel";

/**
 * Provides a list of map templates available inside of a currently loaded context.
 * Allows to merge their contents with the current map configuration or to replace it entirely.
 * Map templates can be of various formats(currently supported are MapStore JSON, OGC WMC)
 * @memberof plugins
 * @class
 * @name MapTemplates
 * @prop {object[]} cfg.allowedTemplates: A list of objects with map template ids used to load templates when not in context
 */
class MapTemplatesComponent extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        templatesLoaded: PropTypes.bool,
        templates: PropTypes.array,
        allowedTemplates: PropTypes.array,
        dockStyle: PropTypes.object,
        onToggleControl: PropTypes.func,
        onMergeTemplate: PropTypes.func,
        onReplaceTemplate: PropTypes.func,
        onToggleFavourite: PropTypes.func,
        onSetAllowedTemplates: PropTypes.func,
        size: PropTypes.number
    };

    static defaultProps = {
        active: false,
        templatesLoaded: false,
        templates: [],
        allowedTemplates: [],
        dockStyle: {},
        onToggleControl: () => {},
        onMergeTemplate: () => {},
        onReplaceTemplate: () => {},
        onToggleFavourite: () => {},
        onSetAllowedTemplates: () => {},
        size: 550
    };

    componentDidUpdate(prevProps) {
        const { active, allowedTemplates, onSetAllowedTemplates } = this.props;
        const { active: prevActive } = prevProps;
        if (active !== prevActive) {
            if (active) {
                onSetAllowedTemplates(allowedTemplates);
            }
        }

    }

    render() {
        const {
            active,
            templates,
            templatesLoaded,
            onToggleControl,
            onMergeTemplate,
            onReplaceTemplate,
            onToggleFavourite,
            dockStyle,
            size
        } = this.props;
        return (
            <ResponsivePanel
                containerStyle={dockStyle}
                containerId="map-templates-container"
                containerClassName="dock-container"
                className="map-templates-dock-panel"
                open={active}
                position="right"
                size={size}
                bsStyle="primary"
                title={<Message msgId="mapTemplates.title"/>}
                style={dockStyle}
                onClose={onToggleControl}
            >
                {!templatesLoaded && <div className="map-templates-loader"><Loader size={352}/></div>}
                {templatesLoaded && <MapTemplatesPanel
                    templates={templates}
                    onMergeTemplate={onMergeTemplate}
                    onReplaceTemplate={onReplaceTemplate}
                    onToggleFavourite={onToggleFavourite}/>}
            </ResponsivePanel>
        );
    }
}

const MapTemplatesPlugin = connect(createSelector(
    state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
    state => get(state, 'controls.mapTemplates.enabled'),
    templatesSelector,
    mapTemplatesLoadedSelector,

    (dockStyle, active, templates, templatesLoaded) => ({
        active,
        templates,
        templatesLoaded,
        dockStyle
    })
), {
    onToggleControl: toggleControl.bind(null, 'mapTemplates', 'enabled'),
    onMergeTemplate: mergeTemplate,
    onReplaceTemplate: replaceTemplate,
    onToggleFavourite: toggleFavouriteTemplate,
    onSetAllowedTemplates: setAllowedTemplates
})(MapTemplatesComponent);

export default createPlugin('MapTemplates', {
    component: MapTemplatesPlugin,
    containers: {
        BurgerMenu: {
            name: 'MapTemplates',
            position: 998,
            text: <Message msgId="mapTemplates.title" />,
            icon: <Glyphicon glyph="1-map" />,
            action: openMapTemplatesPanel,
            priority: 2,
            doNotHide: true,
            tooltip: <Message msgId="mapTemplates.tooltip" />
        },
        SidebarMenu: {
            name: 'mapTemplates',
            position: 998,
            text: <Message msgId="mapTemplates.title" />,
            icon: <Glyphicon glyph="1-map" />,
            action: setControlProperty.bind(null, "mapTemplates", "enabled", true, true),
            toggle: true,
            priority: 1,
            doNotHide: true,
            tooltip: "mapTemplates.tooltip"
        }
    },
    reducers: {
        maptemplates
    },
    epics
});
