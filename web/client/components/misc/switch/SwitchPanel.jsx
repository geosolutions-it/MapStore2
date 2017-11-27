/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Panel} = require('react-bootstrap');
const SwitchButton = require('./SwitchButton');
const Toolbar = require('../toolbar/Toolbar');

class SwitchPanel extends React.Component {

    static propTypes = {
        header: PropTypes.node,
        title: PropTypes.string,
        defaultExpanded: PropTypes.string,
        expanded: PropTypes.bool,
        onSwitch: PropTypes.func,
        locked: PropTypes.bool,
        buttons: PropTypes.array,
        transitionProps: PropTypes.object
    };

    static defaultProps = {
        title: '',
        expanded: false,
        onSwitch: () => {},
        locked: false,
        buttons: []
    };
    state = {};

    renderHeader() {
        return (<div>
            <div className="pull-left">{this.props.title || this.props.header}</div>
            <div className="pull-right">
                {!this.props.locked ? <SwitchButton
                    checked={this.props.expanded}
                    onChange={(checked) => {
                        this.props.onSwitch(checked);
                    }}/> : null}
                {this.props.buttons.length > 0 && this.props.expanded && <Toolbar btnDefaultProps={{ className: 'square-button-sm no-border'}} buttons={this.props.buttons}/>}
            </div>
        </div>);
    }
    render() {
        return (<Panel className="mapstore-switch-panel" collapsible expanded={this.props.expanded} defaultExpanded={this.props.defaultExpanded} header={this.renderHeader()}>
                {this.props.children}
            </Panel>
        );
    }
}

module.exports = SwitchPanel;
