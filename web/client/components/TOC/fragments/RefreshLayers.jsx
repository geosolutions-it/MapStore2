/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');

const React = require('react');
const {Button, Glyphicon, Alert} = require('react-bootstrap');

const Dialog = require('../../misc/Dialog');
const Portal = require('../../misc/Portal');
const Message = require('../../I18N/Message');

const Spinner = require('../../misc/spinners/BasicSpinner/BasicSpinner');

const assign = require('object-assign');

class RefreshLayers extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        show: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        onClose: PropTypes.func,
        onRefresh: PropTypes.func,
        onUpdateOptions: PropTypes.func,
        layers: PropTypes.array,
        refreshing: PropTypes.array,
        availableOptions: PropTypes.array,
        options: PropTypes.object,
        error: PropTypes.array
    };

    static defaultProps= {
        id: "mapstore-refresh-layers",
        show: false,
        panelStyle: {minWidth: "300px",
            zIndex: 2000,
            position: "absolute",
            // overflow: "auto",
            top: "100px",
            left: "calc(50% - 150px)"
        },
        panelClassName: "toolbar-panel",
        onClose: () => {},
        onRefresh: () => {},
        onUpdateOptions: () => {},
        layers: [],
        refreshing: [],
        options: {},
        availableOptions: ['bbox', 'search', 'dimensions', 'title'],
        error: []
    };

    renderOptions = () => {
        return this.props.availableOptions.map((opt) => <div><label><input type="checkbox" checked={this.props.options[opt] || false} onChange={(e) => this.updateOption(opt, e.target.checked)}/><Message msgId={"toc.refreshOptions." + opt}/></label></div>);
    };

    renderError = () => {
        if (this.props.error && this.props.error.length) {
            return (<Alert bsStyle="danger">
                <Message msgId="toc.refreshError" />
                {this.props.error.map((e) => e.layer).join(', ')}
            </Alert>);
        }
        return null;
    };

    render() {
        if (this.props.show) {
            return (<Portal><Dialog id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                <span role="header">
                    <span className="refresh-layers-panel-title"><Message msgId="toc.refreshTitle"/></span>
                    <button onClick={this.props.onClose} className="refresh-layers-panel-close close"><Glyphicon glyph="1-close"/></button>
                </span>
                <div role="body">
                    <Message msgId="toc.refreshMessage"/>
                    {this.renderOptions()}
                    {this.renderError()}
                </div>
                <span role="footer">
                    <Button disabled={this.props.refreshing.length > 0} bsStyle="primary" onClick={this.refresh}>{this.props.refreshing.length > 0 ? <Spinner value={this.props.refreshing.length} sSize="sp-small" /> : null}<Message msgId="toc.refreshConfirm"/></Button>
                </span>
            </Dialog></Portal>);
        }
        return null;
    }

    refresh = () => {
        this.props.onRefresh(this.props.layers, this.props.options);
    };

    updateOption = (opt, value) => {
        const options = assign({}, this.props.options, {
            [opt]: value
        });
        this.props.onUpdateOptions(options);
    };
}

module.exports = RefreshLayers;
