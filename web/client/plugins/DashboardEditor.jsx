/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {createSelector} = require('reselect');
const {connect} = require('react-redux');
const {widgetBuilderSelector} = require('../selectors/controls');

const PropTypes = require('prop-types');


const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const Builder = require('./widgetbuilder/WidgetTypeBuilder');
const Toolbar = require('../components/misc/toolbar/Toolbar');


class SideBarComponent extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         enabled: PropTypes.bool,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         onMount: PropTypes.func,
         onUnmount: PropTypes.func,
         dimMode: PropTypes.string,
         src: PropTypes.string,
         style: PropTypes.object,
         layout: PropTypes.object
     };
     static defaultProps = {
         id: "dashboard-editor",
         enabled: false,
         dockSize: 500,
         limitDockHeight: true,
         zIndex: 10000,
         fluid: false,
         dimMode: "none",
         position: "left",
         onMount: () => {},
         onUnmount: () => {},
         layout: {}
     };
    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }
    render() {
        const buttons = [{
            glyph: 'plus',
            tooltip: 'Add a dashboard card',
            bsStyle: 'primary',
            tooltipPosition: 'right',
            visible: true,
            onClick: () => {
                this.setState({
                    enabled: !(this.state && this.state.enabled)
                });
            }
        }];
        return (<div className="ms-vertical-toolbar" style={{order: -1}} id={this.props.id}>
        <Toolbar btnGroupProps={{vertical: true}} btnDefaultProps={{ className: 'square-button', bsStyle: 'primary'}} buttons={buttons}/>

        {this.state && this.state.enabled ? <Builder enabled={this.state && this.state.enabled} /> : null}
        </div>);

    }
}

const Plugin = connect(
    createSelector(
        widgetBuilderSelector,
        state => mapLayoutValuesSelector(state, {height: true}),
        state => state && state.controls && state.controls.dashboardBuilder && state.controls.dashboardBuilder.enabled,
        (enabled, layout) => ({
            enabled: true,
            layout
    }))

)(SideBarComponent);
module.exports = {
    DashboardEditorPlugin: Plugin,
    epics: require('../epics/widgetsbuilder')
};
