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
const PropTypes = require('prop-types');

const {editingSelector} = require('../selectors/dashboard');

const Builder = require('./widgetbuilder/WidgetTypeBuilder');
const Toolbar = require('../components/misc/toolbar/Toolbar');
const {createWidget} = require('../actions/widgets');

const {setEditing, setEditorAvailable} = require('../actions/dashboard');


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
         onAddWidget: PropTypes.func,
         dimMode: PropTypes.string,
         src: PropTypes.string,
         style: PropTypes.object
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
         onMount: () => {},
         onUnmount: () => {},
         onAddWidget: () => {},
         setEditing: () => {}
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
                this.props.onAddWidget();
            }
        }];
        const boxShadow = "0 3px 6px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.12)";
        return this.props.editing
                ? <div style={{width: "500px", order: -1, boxShadow}}><Builder enabled={this.props.editing} onClose={() => this.props.setEditing(false)}/></div>
                : (<div className="ms-vertical-toolbar" style={{order: -1, boxShadow, padding: "10px"}} id={this.props.id}>
                    <Toolbar btnGroupProps={{vertical: true}} btnDefaultProps={{ className: 'square-button', bsStyle: 'primary'}} buttons={buttons}/>
                    </div>);
    }
}

const Plugin = connect(
    createSelector(
        editingSelector,
        editing => ({editing})
    ), {
        setEditing,
        onAddWidget: createWidget,
        onMount: () => setEditorAvailable(true),
        onUnmount: () => setEditorAvailable(false)
    }
)(DashboardEditorComponent);
module.exports = {
    DashboardEditorPlugin: Plugin,
    reducers: {
        dashboard: require('../reducers/dashboard')
    },
    epics: require('../epics/dashboard')
};
