/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';
import { isFeatureGridOpen } from '../selectors/featuregrid';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import { createSelector } from 'reselect';
import ToolsContainer from './containers/ToolsContainer';

class AnimatedContainer extends React.Component {
    render() {
        const {children, ...props} = this.props;
        return (<CSSTransitionGroup {...props} transitionName="toolbarexpand" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            {children}
        </CSSTransitionGroup>);
    }
}
// only for tests
class NormalContainer extends React.Component {
    render() {
        const { children, ...props } = this.props;
        return (<div {...props}>
            {children}
        </div>);
    }
}

class Toolbar extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        tools: PropTypes.array,
        style: PropTypes.object,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        disableAnimation: PropTypes.bool,
        active: PropTypes.string,
        items: PropTypes.array,
        allVisible: PropTypes.bool,
        layout: PropTypes.string,
        stateSelector: PropTypes.string,
        buttonStyle: PropTypes.string,
        buttonSize: PropTypes.string,
        pressedButtonStyle: PropTypes.string,
        btnConfig: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-toolbar",
        style: {},
        panelStyle: {
            minWidth: "300px",
            right: "52px",
            zIndex: 100,
            position: "absolute",
            overflow: "auto",
            left: "450px"
        },
        panelClassName: "toolbar-panel",
        disableAnimation: false,
        items: [],
        allVisible: true,
        layout: "vertical",
        stateSelector: "toolbar",
        buttonStyle: 'primary',
        buttonSize: null,
        pressedButtonStyle: 'success',
        btnConfig: {
            className: "square-button"
        }
    };

    getPanel = (tool) => {
        if (tool.panel === true) {
            return tool.plugin;
        }
        return tool.panel;
    };

    getPanels = () => {
        return this.getTools()
            .filter((tool) => tool.panel)
            .map((tool) => ({name: tool.name, title: tool.title, cfg: tool.cfg, panel: this.getPanel(tool), items: tool.items, wrap: tool.wrap || false}));
    };

    getTools = () => {
        const hidableItems = this.props.items.filter((item) => !item.alwaysVisible) || [];
        const unsorted = this.props.items
            .filter((item) =>
                item.alwaysVisible // items not hidden (by expander)
                || hidableItems.length === 1 // if the item is only one, the expander will not show, instead we have only the item
                || this.props.allVisible) // expanded state, all items are visible, no filtering.
            .filter(item => item.showWhen ? item.showWhen(this.props) : true) // optional display option (used by expander, that depends on other)
            .map((item, index) => Object.assign({}, item, {position: item.position || index}));
        return unsorted.sort((a, b) => a.position - b.position);
    };

    render() {
        const Container = this.props.disableAnimation ? NormalContainer : AnimatedContainer;
        return (<ToolsContainer id={this.props.id} className={"mapToolbar btn-group-" + this.props.layout}
            toolCfg={this.props.btnConfig}
            container={Container}
            toolStyle={this.props.buttonStyle}
            activeStyle={this.props.pressedButtonStyle}
            toolSize={this.props.buttonSize}
            stateSelector={this.props.stateSelector}
            tools={this.getTools()}
            panels={this.getPanels()}
            activePanel={this.props.active}
            style={this.props.layout !== 'vertical' ? {...this.props.style, display: 'flex'} : this.props.style}
            panelStyle={this.props.panelStyle}
            panelClassName={this.props.panelClassName}
        />);
    }
}

const toolbarSelector = stateSelector => createSelector([
    state => state.controls && state.controls[stateSelector] && state.controls[stateSelector].active,
    state => state.controls && state.controls[stateSelector] && state.controls[stateSelector].expanded,
    isFeatureGridOpen,
    state => mapLayoutValuesSelector(state, {right: true, bottom: true})
], (active, allVisible, featuregridOpen, style) => ({
    active,
    allVisible,
    stateSelector,
    layout: featuregridOpen ? 'horizontal' : 'vertical',
    style
}));

/**
 * Container for map tools, rendered in the bottom right corner of the map.
 * @name Toolbar
 * @class
 * @memberof plugins
 */
export default {
    ToolbarPlugin: (stateSelector = 'toolbar') => connect(toolbarSelector(stateSelector))(Toolbar),
    reducers: {controls: require('../reducers/controls').default}
};
