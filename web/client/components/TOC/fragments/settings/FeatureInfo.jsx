/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { getSupportedFormat as getSupportedFormatWMS } from '../../../../api/WMS';
import { getSupportedFormat as getSupportedFormatWFS } from '../../../../api/WFS';
import Loader from '../../../misc/Loader';
import { Button, Checkbox, FormControl, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import { DragSource as dragSource, DropTarget as dropTarget } from 'react-dnd';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { getDefaultInfoViewMode, getLayerFeatureInfoViews, isLayerFeatureInfoDisabled } from '../../../../utils/MapInfoUtils';
import Message from '../../../I18N/Message';
import FeatureInfoEditor from './FeatureInfoEditor';

const supportedFormatRequests = {
    wms: getSupportedFormatWMS,
    wfs: getSupportedFormatWFS
};

const FeatureInfoView = ({
    view,
    views,
    canEdit,
    connectDragSource = cmp => cmp,
    connectDragPreview = cmp => cmp,
    connectDropTarget = cmp => cmp,
    isDisabled = false,
    isDraggable,
    onEdit = () => {},
    onRemove = () => {},
    onUpdateView = () => {},
    renderTypeSelect = () => null
}) => {
    const content = (
        <div
            data-id={`feature-info-view-${view.id}`}
            style={{
                alignItems: 'center',
                border: '1px solid #ddd',
                cursor: 'default',
                display: 'flex',
                gap: 12,
                marginBottom: 12,
                minHeight: 58,
                opacity: isDisabled ? 0.5 : 1,
                padding: 10
            }}>
            {isDraggable ? connectDragSource(
                <div
                    className="grab-handle"
                    style={{
                        alignItems: 'center',
                        color: '#777',
                        cursor: 'move',
                        display: 'flex'
                    }}
                    onClick={(event) => event.stopPropagation()}>
                    <Glyphicon glyph="grab-handle"/>
                </div>
            ) : (
                <div
                    className="grab-handle disabled"
                    style={{
                        alignItems: 'center',
                        color: '#ccc',
                        display: 'flex'
                    }}>
                    <Glyphicon glyph="grab-handle"/>
                </div>
            )}
            <FormControl
                disabled={isDisabled}
                placeholder="Title"
                style={{ flex: '1 1 220px' }}
                value={view.title}
                onChange={(event) => onUpdateView(view.id, { title: event.target.value })}/>
            <div style={{ flex: '1 1 260px' }}>
                {renderTypeSelect(view)}
            </div>
            <Button
                disabled={isDisabled || !canEdit}
                onClick={() => onEdit(view.id)}>
                <Glyphicon glyph="pencil"/>
            </Button>
            <Button
                disabled={isDisabled || views.length === 1}
                onClick={() => onRemove(view.id)}>
                <Glyphicon glyph="trash"/>
            </Button>
        </div>
    );
    return isDraggable ? connectDragPreview(connectDropTarget(content)) : content;
};

const ITEM_KEY = 'feature-info-view';

const drag = dragSource(ITEM_KEY,
    {
        beginDrag: ({ view, index }) => ({
            id: view.id,
            index
        })
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
);

const drop = dropTarget(ITEM_KEY,
    {
        hover: (props, monitor) => {
            const item = monitor.getItem();
            const { index, view, onMove = () => {} } = props;
            const node = document.querySelector(`[data-id="feature-info-view-${view.id}"]`);

            if (!node?.getBoundingClientRect) {
                return null;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return null;
            }

            const hoverBoundingRect = node.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return null;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return null;
            }

            onMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
            return null;
        }
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    })
);

const DraggableFeatureInfoView = drag(drop(FeatureInfoView));

/**
 * Component for rendering FeatureInfo an Accordion with current available format for get feature info
 * @memberof components.TOC.fragments.settings
 * @name FeatureInfo
 * @class
 * @prop {object} element data of the current selected node
 * @prop {array} defaultInfoFormat array of formats
 * @prop {object} formatCards object that represents the panels of accordion, e.g.: { FORMAT_NAME: { titleId: 'titleMsgId', descId: 'descMsgId', glyph: 'ext-empty', body: () => <div/> } }
 * @prop {function} onChange called when a format has been selected
 */
export default class extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        defaultInfoFormat: PropTypes.object,
        onChange: PropTypes.func,
        formatCards: PropTypes.object
    };

    static defaultProps = {
        element: {},
        defaultInfoFormat: [],
        onChange: () => {},
        formatCards: {}
    };

    state = {
        loading: false,
        editingViewId: null
    };

    componentDidMount() {
        const getSupportedFormat = supportedFormatRequests[this.props.element.type];
        // we dont know supported infoFormats yet
        if (getSupportedFormat && this.props.element.url && !this.props.element.infoFormats || this.props.element.infoFormats?.length === 0) {
            this.setState({ loading: true }); // eslint-disable-line -- TODO: need to be fixed
            getSupportedFormat(this.props.element.url, true)
                .then(({ infoFormats }) => {
                    this.props.onChange("infoFormats", infoFormats);
                    this.setState({ loading: false }); // eslint-disable-line -- TODO: need to be fixed
                })
                .catch(() => {
                    this.setState({ loading: false }); // eslint-disable-line -- TODO: need to be fixed
                });
        }
    }

    getTypeOptions = () => {
        return Object.keys(this.transformInfoFormatsToViews(this.supportedInfoFormats()));
    }

    transformInfoFormatsToViews = (infoFormats) => {
        const { JSON, GEOJSON, ..._infoFormats } = infoFormats;
        if (JSON) {
            return {..._infoFormats, [getDefaultInfoViewMode(GEOJSON || JSON)]: GEOJSON || JSON, 'TEMPLATE': GEOJSON || JSON};
        }
        if (GEOJSON) {
            return {..._infoFormats, [getDefaultInfoViewMode(GEOJSON)]: GEOJSON, 'TEMPLATE': GEOJSON};
        }

        return infoFormats;
    }

    getFeatureInfo = (disabled, views) => {
        const { format, template, viewer, ...featureInfo } = this.props.element.featureInfo || {};
        return {
            ...featureInfo,
            disabled,
            views
        };
    }

    updateFeatureInfo = (disabled, views) => {
        this.props.onChange("featureInfo", this.getFeatureInfo(disabled, views));
    }

    getViews = () => {
        const defaultType = this.getTypeOptions()[0] || 'PROPERTIES';
        return getLayerFeatureInfoViews(this.props.element, {
            defaultType,
            includeDisabled: true
        });
    }

    updateView = (viewId, changes) => {
        const views = this.getViews().map((view) => view.id === viewId ? {
            ...view,
            ...changes
        } : view);
        this.updateFeatureInfo(isLayerFeatureInfoDisabled(this.props.element), views);
    }

    addView = () => {
        const views = this.getViews();
        const defaultType = this.getTypeOptions()[0] || 'PROPERTIES';
        this.updateFeatureInfo(isLayerFeatureInfoDisabled(this.props.element), [
            ...views,
            {
                id: `view-${Date.now()}`,
                title: 'Identify',
                type: defaultType
            }
        ]);
    }

    removeView = (viewId) => {
        const views = this.getViews().filter((view) => view.id !== viewId);
        this.updateFeatureInfo(isLayerFeatureInfoDisabled(this.props.element), views);
    }

    reorderView = (sourceIndex, targetIndex) => {
        const views = this.getViews();
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
            return;
        }
        const updatedViews = [...views];
        const [view] = updatedViews.splice(sourceIndex, 1);
        updatedViews.splice(targetIndex, 0, view);
        this.updateFeatureInfo(isLayerFeatureInfoDisabled(this.props.element), updatedViews);
    }

    renderTypeSelect = (view, isDisabled) => {
        const options = this.getTypeOptions().map((type) => ({
            value: type,
            label: type,
            glyph: this.props.formatCards[type]?.glyph || 'ext-empty'
        }));
        return (
            <Select
                clearable={false}
                disabled={isDisabled}
                value={view.type}
                options={options}
                optionRenderer={this.renderTypeOption}
                valueRenderer={this.renderTypeOption}
                onChange={(selected) => this.updateView(view.id, { type: selected?.value })}/>
        );
    }

    renderTypeOption = (option) => {
        return (
            <span>
                <Glyphicon glyph={option.glyph}/>&nbsp;{option.label}
            </span>
        );
    }

    renderView = (view, views, index, isDisabled) => {
        const canEdit = view.type === 'TEMPLATE';
        return (
            <DraggableFeatureInfoView
                key={view.id}
                index={index}
                isDisabled={isDisabled}
                isDraggable={!isDisabled && views.length > 1}
                view={view}
                views={views}
                canEdit={canEdit}
                onEdit={(viewId) => this.setState({ editingViewId: viewId })}
                onRemove={this.removeView}
                onUpdateView={this.updateView}
                onMove={this.reorderView}
                renderTypeSelect={(featureInfoView) => this.renderTypeSelect(featureInfoView, isDisabled)}/>
        );
    }

    render() {
        const disabled = isLayerFeatureInfoDisabled(this.props.element);
        const views = this.getViews();
        const editingView = views.find((view) => view.id === this.state.editingViewId);
        return this.state.loading ? (
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <Loader size={150}/>
            </div>
        ) : (
            <span>
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        padding: 6
                    }}>
                    <Checkbox
                        checked={disabled}
                        style={{ margin: 0 }}
                        onChange={(event) => this.updateFeatureInfo(event.target.checked, views)}>
                        <Message msgId="layerProperties.disableIdentify" />
                    </Checkbox>
                    <Button
                        bsStyle="primary"
                        disabled={disabled}
                        onClick={this.addView}>
                        <Message msgId="layerProperties.addIdentifyView" />
                    </Button>
                </div>
                <div style={{ clear: 'both' }}>
                    {views.map((view, index) => this.renderView(view, views, index, disabled))}
                    {!disabled && editingView ? (
                        <FeatureInfoEditor
                            {...this.props}
                            template={editingView.template || ''}
                            showEditor
                            onShowEditor={() => this.setState({ editingViewId: null })}
                            onSaveTemplate={(template) => {
                                this.updateView(editingView.id, { template });
                                this.setState({ editingViewId: null });
                            }}/>
                    ) : null}
                </div>
            </span>
        );
    }

    /**
     * Fetch the supported formats from the layer props if present
     * else use the default info format
     * @return {object} info formats
     */
    supportedInfoFormats = () => {
        const availableInfoFormats =  this.props.element?.infoFormats || [];
        // if the infoFormats is empty we should exclude also HMTL for default supported types
        const excludedFormatsWfs = availableInfoFormats.length ? ['TEXT'] : ['TEXT', 'HTML'];
        const supportedWfsFormats = Object.fromEntries(Object.entries(this.props.defaultInfoFormat).filter(([key]) => !excludedFormatsWfs.includes(key)));
        const formats = this.props.element.type === 'wfs' ? supportedWfsFormats : this.props.defaultInfoFormat;
        const infoFormats = Object.assign({},
            ...Object.entries(formats)
                .filter(([, value])=> includes(availableInfoFormats, value))
                .map(([key, value])=> ({[key]: value}))
        );
        return isEmpty(infoFormats) ? formats : infoFormats;
    }
}
