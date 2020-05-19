/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const Spinner = require('react-spinkit');
const Message = require('../I18N/Message');
const {Panel} = require('react-bootstrap');
const DockPanel = require('../misc/panels/DockPanel');
const BorderLayout = require('../layout/BorderLayout');
const Toolbar = require('../misc/toolbar/Toolbar');
const ResizeDetector = require('react-resize-detector').default;

class DetailsPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        show: PropTypes.bool,
        loadFlags: PropTypes.object,
        canEdit: PropTypes.bool,
        editing: PropTypes.string,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        style: PropTypes.object,
        onEdit: PropTypes.func,
        onCancelEdit: PropTypes.func,
        onEditSettings: PropTypes.func,
        onCancelSettingsEdit: PropTypes.func,
        onSave: PropTypes.func,
        onClose: PropTypes.func,
        dockProps: PropTypes.object,
        width: PropTypes.number,
        dockStyle: PropTypes.object
    }

    static defaultProps = {
        id: "mapstore-details",
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%",
            marginBottom: 0
        },
        loadFlags: {},
        onEdit: () => {},
        onCancelEdit: () => {},
        onEditSettings: () => {},
        onCancelSettingsEdit: () => {},
        onSave: () => {},
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
        dockStyle: {}
    }

    render() {
        const header = (
            <div style={{display: 'flex', justifyContent: 'center', padding: '8px 0 8px 0'}}>
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md',
                        bsStyle: 'primary'
                    }}
                    buttons={[...(this.props.editing ? [{
                        disabled: this.props.loadFlags.detailsSaving,
                        glyph: 'arrow-left',
                        tooltipId: 'details.cancel',
                        onClick: () => this.props.onCancelEdit()
                    }, {
                        disabled: this.props.loadFlags.detailsSaving,
                        glyph: 'floppy-disk',
                        tooltipId: 'details.save',
                        onClick: () => this.props.onSave()
                    }] : [{
                        glyph: 'pencil',
                        tooltipId: 'details.edit',
                        onClick: () => this.props.onEdit()
                    }, {
                        glyph: 'cog',
                        tooltipId: 'details.settings',
                        onClick: () => this.props.onEditSettings()
                    }])]}/>
            </div>
        );

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
                                    header={this.props.canEdit ? header : undefined}>
                                    <div className={this.props.editing === 'content' && !this.props.loadFlags.detailsSaving ? "ms-details-panel-editor" : "ms-details-preview-container"}>
                                        {this.props.loadFlags.detailsSaving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : this.props.children}
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

module.exports = DetailsPanel;
