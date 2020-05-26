/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Panel} from 'react-bootstrap';
import Spinner from 'react-spinkit';
import ResizeDetector from 'react-resize-detector';

import Message from '../I18N/Message';
import DockPanel from '../misc/panels/DockPanel';
import BorderLayout from '../layout/BorderLayout';

export default class DetailsPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        show: PropTypes.bool,
        loading: PropTypes.bool,
        editing: PropTypes.string,
        header: PropTypes.element,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        width: PropTypes.number,
        dockStyle: PropTypes.object,
        onClose: PropTypes.func
    }

    static defaultProps = {
        id: "mapstore-details",
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%",
            marginBottom: 0
        },
        loading: false,
        onClose: () => {},
        show: false,
        panelClassName: "details-panel",
        width: 658,
        closeGlyph: "1-close",
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030,
            bottom: 0
        },
        dockStyle: {height: 'calc(100% - 30px)'}
    }

    render() {
        return (
            <ResizeDetector handleWidth>
                { ({ width }) =>
                    <div className="react-dock-no-resize">
                        <DockPanel
                            fluid
                            open={this.props.show}
                            size={this.props.width / width > 1 ? 1 : this.props.width / width}
                            position="right"
                            bsStyle="primary"
                            title={<Message msgId="details.title"/>}
                            onClose={() => this.props.onClose()}
                            glyph="sheet"
                            style={this.props.dockStyle}>
                            <Panel id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                                <BorderLayout
                                    header={this.props.header}>
                                    <div className={this.props.editing && !this.props.loading ? "ms-details-panel-editor" : "ms-details-preview-container"}>
                                        {this.props.loading ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : this.props.children}
                                    </div>
                                </BorderLayout>
                            </Panel>
                        </DockPanel>
                    </div>
                }
            </ResizeDetector>
        );
    }
}
