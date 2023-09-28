/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Sidebar from 'react-sidebar';

import SpatialFilterCustom from './SpatialFilter';
import standardItems from '../querypanel/index';
import QueryPanelHeader from '../../components/data/query/QueryPanelHeader';
import Portal from '../../components/misc/Portal';
import ResizableModal from '../../components/misc/ResizableModal';
import Message from '../locale/Message';
import SmartQueryForm from './SmartQueryForm';

class PanelWithMap extends React.Component {
    static propTypes = {
        advancedToolbar: PropTypes.bool,
        appliedFilter: PropTypes.object,
        items: PropTypes.array,
        layout: PropTypes.object,
        loadingError: PropTypes.bool,
        map: PropTypes.object,
        mapComp: PropTypes.node,
        onInit: PropTypes.func,
        onRestoreFilter: PropTypes.func,
        onSaveFilter: PropTypes.func,
        onToggleQuery: PropTypes.func,
        queryPanelEnabled: PropTypes.bool,
        selectedLayer: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        spatialMethodOptions: PropTypes.array,
        spatialOperations: PropTypes.array,
        storedFilter: PropTypes.object,
        toolsOptions: PropTypes.object
    };

    static defaultProps = {
        items: [],
        layout: {},
        loadingError: false,
        onInit: () => {},
        onRestoreFilter: () => {},
        onSaveFilter: () => {},
        onToggleQuery: () => {},
        queryPanelEnabled: false,
        selectedLayer: false,
        toolsOptions: {}
    };
    constructor(props) {
        super(props);
        this.state = {showModal: false};
    }
    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.queryPanelEnabled === true && this.props.queryPanelEnabled === false) {
            this.props.onInit();
        }
    }
    onToggle = () => {
        if (this.props.advancedToolbar && !isEqual(this.props.appliedFilter, this.props.storedFilter)) {
            this.setState(() => ({showModal: true}));
        } else {
            this.props.onToggleQuery();
        }
    }
    getNoBackgroundLayers = (group) => {
        return group.name !== 'background';
    };
    renderSidebar = () => {
        return (
            <Sidebar
                open={this.props.queryPanelEnabled}
                sidebar={this.renderQueryPanel()}
                sidebarClassName="query-form-panel-container"
                touch={false}
                rootClassName="query-form-root"
                styles={{
                    sidebar: {
                        ...this.props.layout,
                        zIndex: 1024,
                        width: 600
                    },
                    overlay: {
                        zIndex: 1023,
                        width: 0
                    },
                    root: {
                        right: this.props.queryPanelEnabled ? 0 : 'auto',
                        width: '0',
                        overflow: 'visible'
                    },
                    content: {
                        overflowY: 'auto'
                    }
                }}
            >
                <div/>
            </Sidebar>
        );
    };
    renderQueryPanel = () => {
        const MapComponent = this.props.mapComp;
        standardItems.spatial = [{
            id: "spatialFilter",
            plugin: SpatialFilterCustom,
            cfg: {},
            position: 1
        }];
        return (<div className="mapstore-query-builder">
            <SmartQueryForm
                advancedToolbar={this.props.advancedToolbar}
                appliedFilter={this.props.appliedFilter}
                featureTypeErrorText={<Message msgId="layerProperties.featureTypeError"/>}
                header={<QueryPanelHeader loadingError={this.props.loadingError} onToggleQuery={this.onToggle} />}
                items={this.props.items}
                loadingError={this.props.loadingError}
                queryPanelEnabled={this.props.queryPanelEnabled}
                selectedLayer={this.props.selectedLayer}
                spatialMethodOptions={this.props.spatialMethodOptions}
                spatialOperations={this.props.spatialOperations}
                standardItems={standardItems}
                storedFilter={this.props.storedFilter}
                toolsOptions={this.props.toolsOptions}
            />
            <div className="mapstore-query-map">
                <MapComponent map={this.props.map}/>
            </div>
            <Portal>
                <ResizableModal
                    fade
                    show={this.state.showModal}
                    title={<Message msgId="queryform.changedFilter"/>}
                    size="xs"
                    onClose={() => this.setState(() => ({showModal: false}))}
                    buttons={[
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="yes"/>,
                            onClick: this.storeAndClose
                        },
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="no" />,
                            onClick: this.restoreAndClose
                        }
                    ]}>
                    <div className="ms-alert">
                        <div className="ms-alert-center">
                            <Message msgId={this.props.loadingError && "queryform.changedFilterWithErrorAlert" || "queryform.changedFilterAlert"}/>
                        </div>
                    </div>
                </ResizableModal>
            </Portal>
        </div>);
    };


    render() {
        return this.renderSidebar();
    }
    restoreAndClose = () => {
        this.setState(() => ({showModal: false}));
        this.props.onRestoreFilter();
        this.props.onToggleQuery();
    }
    storeAndClose = () => {
        this.setState(() => ({showModal: false}));
        this.props.onSaveFilter();
        this.props.onToggleQuery();
    }
}

export default PanelWithMap;
