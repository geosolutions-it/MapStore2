/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import Message from '../I18N/Message';
import { Panel } from 'react-bootstrap';
import BorderLayout from '../layout/BorderLayout';
import ResponsivePanel from "../misc/panels/ResponsivePanel";

class DetailsPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        panelStyle: PropTypes.object,
        dockStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        style: PropTypes.object,
        onClose: PropTypes.func,
        width: PropTypes.number
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-details",
        panelStyle: {
            zIndex: 100,
            marginBottom: 0,
            minHeight: '100%'
        },
        style: {},
        onClose: () => {
        },
        active: false,
        panelClassName: "details-panel",
        width: 550
    };

    render() {
        return (
            <ResponsivePanel
                containerId="details-container"
                containerClassName="dock-container"
                containerStyle={this.props.dockStyle}
                open={this.props.active}
                size={this.props.width}
                position="right"
                bsStyle="primary"
                title={<Message msgId="details.title"/>}
                onClose={() => this.props.onClose()}
                glyph="sheet"
                style={this.props.dockStyle}
            >
                <Panel id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                    <BorderLayout>
                        {this.props.children}
                    </BorderLayout>
                </Panel>
            </ResponsivePanel>
        );
    }
}


export default DetailsPanel;
