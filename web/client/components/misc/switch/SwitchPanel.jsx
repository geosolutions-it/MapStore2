/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Glyphicon } from 'react-bootstrap';

import SwitchButton from './SwitchButton';
import SwitchToolbar from './SwitchToolbar';
import Button from '../../misc/Button';
import LoadingView from '../LoadingView';
import Toolbar from '../toolbar/Toolbar';

const ErrorIcon = () => <Button className="square-button-sm no-border switch-error"><Glyphicon glyph="exclamation-mark" className="text-danger" /></Button>;
const LoadingIcon = () => <div className="switch-loading"><LoadingView size="small"/></div>;
class SwitchPanel extends React.Component {

    static propTypes = {
        header: PropTypes.node,
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node
        ]),
        defaultExpanded: PropTypes.string,
        expanded: PropTypes.bool,
        onSwitch: PropTypes.func,
        locked: PropTypes.bool,
        buttons: PropTypes.array,
        loading: PropTypes.bool,
        disabled: PropTypes.bool,
        error: PropTypes.any,
        useToolbar: PropTypes.bool
    };

    static defaultProps = {
        title: '',
        disabled: false,
        expanded: false,
        onSwitch: () => {},
        locked: false,
        buttons: [],
        useToolbar: false
    };
    state = {};
    renderHeader() {
        const Switch = this.props.useToolbar ? SwitchToolbar : SwitchButton;
        return (<div>
            <div className="pull-left">{this.props.title || this.props.header}</div>
            <div className="pull-right">
                {!this.props.locked ? <Switch
                    disabled={this.props.disabled}
                    checked={this.props.expanded}
                    onClick={(checked) => {
                        if (!this.props.disabled) {
                            this.props.onSwitch(checked);
                        }
                    }}/> : null}
                {this.props.error ? <ErrorIcon /> : null}
                {this.props.loading ? <LoadingIcon /> : null}
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

export default SwitchPanel;
