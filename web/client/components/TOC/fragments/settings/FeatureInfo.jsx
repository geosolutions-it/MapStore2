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
import { Button, Checkbox, FormControl as FormControlRB, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import { DragSource as dragSource, DropTarget as dropTarget } from 'react-dnd';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { v1 as uuidv1 } from 'uuid';
import {
    getDefaultInfoViewMode,
    getLayerFeatureInfoViews,
    isLayerFeatureInfoDisabled
} from '../../../../utils/MapInfoUtils';
import Message from '../../../I18N/Message';
import FeatureInfoEditor from './FeatureInfoEditor';
import localizedProps from '../../../misc/enhancers/localizedProps';
import FeatureInfoRequestOptions from '../../../misc/FeatureInfoRequestOptions';
import { isGeoServerLayer } from '../../../../utils/FeatureInfoRequestUtils';
import ExternalDataEditor from './ExternalDataEditor';
import PropertiesEditor from './PropertiesEditor';
import { EXTERNAL_DATA, validateExternalDataConfiguration } from '../../../../utils/mapinfo/ExternalDataUtils';

const FormControl = localizedProps('placeholder')(FormControlRB);
const GlyphiconWithTitle = localizedProps('title')(Glyphicon);

const supportedFormatRequests = {
    wms: getSupportedFormatWMS,
    wfs: getSupportedFormatWFS
};

const FeatureInfoView = ({
    view,
    canEdit,
    connectDragSource = cmp => cmp,
    connectDragPreview = cmp => cmp,
    connectDropTarget = cmp => cmp,
    isDisabled = false,
    isDraggable,
    isEditing = false,
    isInvalid = false,
    onEdit = () => {},
    onRemove = () => {},
    onUpdateView = () => {},
    renderTypeSelect = () => null
}) => {
    const content = (
        <div
            data-id={`feature-info-view-${view.id}`}
            className={`ms-feature-info-view${isDisabled ? ' disabled' : ''}${isInvalid ? ' has-error' : ''}`}>
            {isDraggable ? connectDragSource(
                <div
                    className="grab-handle"
                    onClick={(event) => event.stopPropagation()}>
                    <Glyphicon glyph="grab-handle"/>
                </div>
            ) : (
                <div className="grab-handle disabled">
                    <Glyphicon glyph="grab-handle"/>
                </div>
            )}
            <FormControl
                className="ms-feature-info-view-title"
                disabled={isDisabled}
                placeholder="layerProperties.title"
                value={view.title || ''}
                onChange={(event) => onUpdateView(view.id, { title: event.target.value })}/>
            <div className="ms-feature-info-view-type">
                {renderTypeSelect(view)}
            </div>
            <Button
                className="square-button no-border ms-feature-info-view-action ms-feature-info-view-edit"
                bsStyle={isEditing ? 'primary' : undefined}
                disabled={isDisabled || !canEdit}
                onClick={() => onEdit(view.id)}>
                <Glyphicon glyph="pencil"/>
            </Button>
            {isInvalid ? (
                <GlyphiconWithTitle
                    className="text-danger"
                    glyph="warning-sign"
                    title="layerProperties.externalData.invalidConfiguration"/>
            ) : null}
            <Button
                className="square-button no-border ms-feature-info-view-action ms-feature-info-view-remove"
                disabled={isDisabled}
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
 * Component for rendering the list of identify views configured on a layer
 * @memberof components.TOC.fragments.settings
 * @name FeatureInfo
 * @class
 * @prop {object} element data of the current selected node
 * @prop {object} defaultInfoFormat supported info formats, by view type
 * @prop {object} formatCards label and glyph of every view type, e.g.: { FORMAT_NAME: { titleId: 'titleMsgId', glyph: 'ext-empty' } }
 * @prop {function} onChange called when the views configuration changes
 */
export default class extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        defaultInfoFormat: PropTypes.object,
        onChange: PropTypes.func,
        formatCards: PropTypes.object,
        currentLocale: PropTypes.string
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
            getSupportedFormat(this.props.element, true)
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
        const types = Object.keys(this.transformInfoFormatsToViews(this.supportedInfoFormats()));
        // External Data needs a structured source response to read feature properties.
        return types.includes('PROPERTIES') ? [...types, EXTERNAL_DATA] : types;
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
        return getLayerFeatureInfoViews(this.props.element, { includeDisabled: true });
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
                id: `view-${uuidv1()}`,
                title: '',
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
            label: this.props.formatCards[type]?.titleId
                ? <Message msgId={this.props.formatCards[type].titleId}/>
                : type,
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
                onChange={(selected) => {
                    this.updateView(view.id, { type: selected?.value });
                    this.setState({
                        editingViewId: [EXTERNAL_DATA, 'PROPERTIES'].includes(selected?.value)
                            ? view.id
                            : null
                    });
                }}/>
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
        const canEdit = ['TEMPLATE', 'PROPERTIES', EXTERNAL_DATA].includes(view.type);
        return (
            <div key={view.id}>
                <DraggableFeatureInfoView
                    index={index}
                    isDisabled={isDisabled}
                    isDraggable={!isDisabled && views.length > 1}
                    isEditing={[EXTERNAL_DATA, 'PROPERTIES'].includes(view.type)
                        && this.state.editingViewId === view.id}
                    isInvalid={view.type === EXTERNAL_DATA && !!validateExternalDataConfiguration(view.featuresService)}
                    view={view}
                    views={views}
                    canEdit={canEdit}
                    onEdit={(viewId) => this.setState(({ editingViewId }) => ({
                        editingViewId: editingViewId === viewId ? null : viewId
                    }))}
                    onRemove={this.removeView}
                    onUpdateView={this.updateView}
                    onMove={this.reorderView}
                    renderTypeSelect={(featureInfoView) => this.renderTypeSelect(featureInfoView, isDisabled)}/>
                {/* Structured views use inline editors; templates keep their existing editor below the list. */}
                {!isDisabled && this.state.editingViewId === view.id && view.type === EXTERNAL_DATA ? (
                    <ExternalDataEditor
                        sourceLayer={this.props.element}
                        currentLocale={this.props.currentLocale}
                        value={view.featuresService}
                        onChange={(featuresService) => this.updateView(view.id, { featuresService })}/>
                ) : null}
                {!isDisabled && this.state.editingViewId === view.id && view.type === 'PROPERTIES' ? (
                    <PropertiesEditor
                        sourceLayer={this.props.element}
                        currentLocale={this.props.currentLocale}
                        value={view.attributes}
                        onChange={(attributes) => this.updateView(view.id, { attributes })}/>
                ) : null}
            </div>
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
            <span className="ms-feature-info-settings">
                {this.props.element.type === 'wms' ? (
                    <div style={{ padding: "15px 15px 0 15px" }}>
                        <FeatureInfoRequestOptions
                            featureInfo={this.props.element.featureInfo || {}}
                            showBuffer={isGeoServerLayer(this.props.element)}
                            onChange={(featureInfo) => this.props.onChange("featureInfo", featureInfo)} />
                    </div>
                ) : null}
                <div className="ms-feature-info-toolbar">
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
                <div className="ms-feature-info-views">
                    {views.length === 0 ? (
                        <div className="ms-feature-info-views-empty">
                            <Message msgId="layerProperties.noIdentifyView" />
                        </div>
                    ) : null}
                    {views.map((view, index) => this.renderView(view, views, index, disabled))}
                    {!disabled && editingView?.type === 'TEMPLATE' ? (
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
