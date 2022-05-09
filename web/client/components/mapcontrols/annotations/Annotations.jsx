/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import bbox from '@turf/bbox';
import { countBy, head, isUndefined, keys, values } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import uuidv1 from 'uuid/v1';

import { getGeometryGlyphInfo } from '../../../utils/AnnotationsUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import SideGrid from '../../misc/cardgrids/SideGrid';
import Filter from '../../misc/Filter';
import Loader from '../../misc/Loader';
import Toolbar from '../../misc/toolbar/Toolbar';
import defaultConfig from './AnnotationsConfig';
import SelectAnnotationsFile from './SelectAnnotationsFile';
import Button from '../../misc/Button';

/**
 * Annotations panel component.
 * It can be in different modes:
 *  - list: when showing the current list of annotations on the map
 *  - detail: when showing a detail of a specific annotation
 *  - editing: when editing an annotation
 * When in list mode, the list of current map annotations is shown, with:
 *  - summary card for each annotation, with full detail show on click
 *  - upload annotations Button
 *  - new annotation Button
 *  - download annotations Button
 *  - filtering widget
 * When in detail mode the configured editor is shown on the selected annotation, in viewer mode.
 * When in editing mode the configured editor is shown on the selected annotation, in editing mode.
 *
 * It also handles removal confirmation modals
 * @memberof components.mapControls.annotations
 * @class
 * @prop {string} id id of the borderlayout Component
 * @prop {boolean} closing user asked for closing panel when editing
 * @prop {boolean} styling flag to state status of styling during editing
 * @prop {boolean} showUnsavedChangesModal flag to state status of UnsavedChangesModal
 * @prop {boolean} showUnsavedStyleModal flag to state status of UnsavedStyleModal
 * @prop {object} editing annotation object currently under editing (null if we are not in editing mode)
 * @prop {function} toggleControl triggered when the user closes the annotations panel
 * @prop {object} removing object to remove, it is also a flag that means we are currently asking for removing an annotation / geometry. Toggles visibility of the confirm dialog
 * @prop {string} mode current mode of operation (list, editing, detail)
 * @prop {object} editor editor component, used in detail and editing modes
 * @prop {object[]} annotations list of annotations objects to list
 * @prop {string} current id of the annotation currently shown in the editor (when not in list mode)
 * @prop {object} config configuration object, where overridable stuff is stored (fields config for annotations, marker library, etc.) {@link #components.mapControls.annotations.AnnotationsConfig}
 * @prop {string} filter current filter entered by the user
 * @prop {function} onToggleUnsavedChangesModal toggles the view of the UnsavedChangesModal
 * @prop {function} onToggleUnsavedStyleModal toggles the view of the UnsavedStyleModal
 * @prop {function} onCancelRemove triggered when the user cancels removal
 * @prop {function} onCancelEdit triggered when the user cancels any changes to the properties or geometry
 * @prop {function} onCancelStyle triggered when the user cancels any changes to the style
 * @prop {function} onConfirmRemove triggered when the user confirms removal
 * @prop {function} onCancelClose triggered when the user cancels closing
 * @prop {function} onConfirmClose triggered when the user confirms closing
 * @prop {function} onAdd triggered when the user clicks on the new annotation button
 * @prop {function} onEdit triggered when the user clicks on the annotation card into annotation viewer
 * @prop {function} onZoom triggered when the user zooms to an annotation
 * @prop {function} onHighlight triggered when the mouse hovers an annotation card
 * @prop {function} onCleanHighlight triggered when the mouse is out of any annotation card
 * @prop {function} onDetail triggered when the user clicks on an annotation card
 * @prop {function} onFilter triggered when the user enters some text in the filtering widget
 * @prop {function} classNameSelector optional selector to assign custom a CSS class to annotations, based on
 * @prop {function} onSetErrorSymbol set a flag in the state to say if the default symbols exists
 * @prop {function} onDownload triggered when the user clicks on the download annotations button
 * @prop {function} onUpdateSymbols triggered when user click on refresh icon of the symbols addon
 * @prop {function} onToggleVisibility triggered when user click on annotation visibility icon
 * @prop {boolean} symbolErrors errors related to the symbols
 * @prop {object[]} lineDashOptions list of options for dashed lines
 * @prop {string} symbolsPath path to the svg folder
 * @prop {object[]} symbolList list of symbols
 * @prop {string} defaultShape default Shape
 * @prop {number} maxZoom max zoom for annotation (default 18)
 * @prop {string} defaultShapeStrokeColor default symbol stroke color
 * @prop {string} defaultShapeFillColor default symbol fill color
 * @prop {string} defaultShapeSize default symbol shape size in px
 * @prop {object} defaultStyles object with default symbol styles
 * @prop {number} textRotationStep rotation step of text styler
 * @prop {boolean} geodesic draw geodesic annotation (Currently applicable only for Circle annotation)
 *
 * the annotation's attributes.
 */
class Annotations extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        styling: PropTypes.bool,
        toggleControl: PropTypes.func,
        loading: PropTypes.bool,
        closing: PropTypes.bool,
        showUnsavedChangesModal: PropTypes.bool,
        showUnsavedStyleModal: PropTypes.bool,
        editing: PropTypes.object,
        removing: PropTypes.object,
        onCancelRemove: PropTypes.func,
        onConfirmRemove: PropTypes.func,
        onCancelClose: PropTypes.func,
        onToggleUnsavedChangesModal: PropTypes.func,
        onToggleUnsavedStyleModal: PropTypes.func,
        onResetCoordEditor: PropTypes.func,
        onAddNewFeature: PropTypes.func,
        onToggleUnsavedGeometryModal: PropTypes.func,
        onConfirmClose: PropTypes.func,
        onCancelEdit: PropTypes.func,
        onCancelStyle: PropTypes.func,
        onAdd: PropTypes.func,
        onZoom: PropTypes.func,
        onHighlight: PropTypes.func,
        onCleanHighlight: PropTypes.func,
        onDetail: PropTypes.func,
        mode: PropTypes.string,
        editor: PropTypes.func,
        annotations: PropTypes.array,
        current: PropTypes.string,
        config: PropTypes.object,
        filter: PropTypes.string,
        onFilter: PropTypes.func,
        classNameSelector: PropTypes.func,
        width: PropTypes.number,
        onDownload: PropTypes.func,
        onLoadAnnotations: PropTypes.func,
        onUpdateSymbols: PropTypes.func,
        onSetErrorSymbol: PropTypes.func,
        onToggleVisibility: PropTypes.func,
        onEdit: PropTypes.func,
        symbolErrors: PropTypes.array,
        lineDashOptions: PropTypes.array,
        symbolList: PropTypes.array,
        defaultShape: PropTypes.string,
        symbolsPath: PropTypes.string,
        maxZoom: PropTypes.number,
        defaultShapeSize: PropTypes.number,
        defaultShapeFillColor: PropTypes.string,
        defaultShapeStrokeColor: PropTypes.string,
        defaultStyles: PropTypes.object,
        onLoadDefaultStyles: PropTypes.func,
        textRotationStep: PropTypes.number,
        measurementAnnotationEdit: PropTypes.bool,
        geodesic: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        mode: 'list',
        config: defaultConfig,
        classNameSelector: () => '',
        toggleControl: () => {},
        onUpdateSymbols: () => {},
        onSetErrorSymbol: () => {},
        onLoadAnnotations: () => {},
        annotations: [],
        maxZoom: 18,
        onLoadDefaultStyles: () => {}
    };
    state = {
        selectFile: false
    }

    componentDidMount() {
        this.props.onLoadDefaultStyles(this.props.defaultShape, this.props.defaultShapeSize, this.props.defaultShapeFillColor, this.props.defaultShapeStrokeColor,
            this.props.symbolsPath);
    }

    getConfig = () => {
        return assign({}, defaultConfig, this.props.config);
    };

    getGeomsThumbnail(geometry) {
        let glyph;
        const geoms =  geometry?.features.reduce((p, c) => {
            if (c.properties && c.properties.isCircle) {
                return {...p, "Circle": true};
            }
            if (c.properties && c.properties.isText) {
                return {...p, "Text": true};
            }
            return {...p, [c.geometry.type]: true};
        }, {"Circle": false, "Text": false});

        if (countBy(values(geoms))?.true > 1) {
            glyph = "geometry-collection";
        } else {
            const type = keys(geoms).find(key => geoms[key] === true);
            glyph = getGeometryGlyphInfo(type)?.glyph;
        }

        return <Glyphicon glyph={glyph}/>;
    }

    renderField = (field, annotation) => {
        return (<div className={"mapstore-annotations-panel-card-" + field.name}>
            {this.renderFieldValue(field, annotation)}
        </div>);
    };

    renderFieldValue = (field, annotation) => {
        const fieldValue = annotation.properties[field.name] || '';
        if (field.type === 'html') {
            // Return the text content of the first child of the html string (to prevent collating all texts into a single word)
            return (new DOMParser).parseFromString(fieldValue, "text/html").documentElement.lastElementChild
                ?.firstChild
                ?.textContent || '';
        }
        return fieldValue;
    };

    renderThumbnail = ({featureType, geometry, properties = {}}) => {
        if (properties?.type === "Measure") {
            return (<span className={"mapstore-annotations-panel-card" }>
                <Glyphicon glyph={"1-ruler"}/>
            </span>);
        } else if (featureType === "LineString" || featureType === "MultiLineString" ) {
            return (<span className={"mapstore-annotations-panel-card" }>
                <Glyphicon glyph={"polyline"}/>;
            </span>);
        }
        if (featureType === "Polygon" || featureType === "MultiPolygon" ) {
            return (<span className={"mapstore-annotations-panel-card"}>
                <Glyphicon glyph={"polygon"}/>;
            </span>);
        }
        if (featureType === "Circle") {
            return (<span className={"mapstore-annotations-panel-card"}>
                <Glyphicon glyph={"1-circle"}/>;
            </span>);
        }
        if (featureType === "GeometryCollection" || featureType === "FeatureCollection") {
            return (<span className={"mapstore-annotations-panel-card"}>
                {(!!(geometry.geometries || geometry.features || []).filter(f => f.type !== "MultiPoint").length || (properties.textValues && properties.textValues.length)) && (this.getGeomsThumbnail(geometry))}
            </span>);
        }
        return (<span className={"mapstore-annotations-panel-card"}>
            <Glyphicon glyph={"point"}/>;
        </span>);
    };

    renderItems = (annotation) => {
        const {features: aFeatures, properties} = annotation;
        const cardActions = {
            onMouseEnter: () => {this.props.onHighlight(properties.id); },
            onMouseLeave: this.props.onCleanHighlight,
            onClick: () => this.props.onEdit(properties.id)
        };
        const annotationVisibility = properties && !isUndefined(properties.visibility) ? properties.visibility : true;
        return {
            ...this.getConfig().fields.reduce( (p, c)=> {
                return assign({}, p, {[c.name]: this.renderField(c, annotation)});
            }, {}),
            preview: this.renderThumbnail({featureType: "FeatureCollection", geometry: {features: aFeatures}, properties }),
            tools: <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md no-border'
                }}
                btnGroupProps={{
                    style: {
                        margin: 10,
                        whiteSpace: 'nowrap'
                    }
                }}
                buttons={[
                    {
                        glyph: 'zoom-to',
                        tooltipId: "annotations.zoomTo",
                        onClick: (event) => {
                            event.stopPropagation();
                            const extent = bbox(annotation);
                            this.props.onZoom(extent, 'EPSG:4326', this.props.maxZoom);
                        }
                    },
                    {
                        glyph: annotationVisibility ? 'eye-open' : 'eye-close',
                        tooltipId: annotationVisibility ? "annotations.hide" : "annotations.show",
                        onClick: (event) => {
                            event.stopPropagation();
                            this.props.onToggleVisibility(properties?.id);
                        }
                    }

                ]}/>,
            ...cardActions
        };
    };

    renderCards = () => {
        if (this.props.loading) {
            return (
                <div style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <Loader size={250}/>
                </div>
            );
        }
        if (this.props.mode === 'list') {
            const annotationsPresent = !!this.props.annotations.length;
            return (
                <>
                    <div style={{display: "flex", margin: "auto", justifyContent: "center"}} className="text-center">
                        <Toolbar
                            btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary'}}
                            buttons={[
                                {
                                    glyph: 'upload',
                                    tooltip: <Message msgId="annotations.loadtooltip"/>,
                                    visible: this.props.mode === "list",
                                    onClick: () => { this.setState(() => ({selectFile: true})); }
                                },
                                {
                                    glyph: 'plus',
                                    tooltip: <Message msgId="annotations.add"/>,
                                    visible: this.props.mode === "list",
                                    onClick: () => { this.props.onAdd(); }
                                },
                                {
                                    glyph: 'download',
                                    disabled: !(annotationsPresent),
                                    tooltip: <Message msgId="annotations.downloadtooltip"/>,
                                    visible: this.props.mode === "list",
                                    onClick: () => { this.props.onDownload(); }
                                }
                            ]}/>
                    </div>
                    <div style={{padding: "0 8px", margin: "10px 0 0"}}>
                        <Filter
                            filterPlaceholder={getMessageById(this.context.messages, "annotations.filter")}
                            filterText={this.props.filter}
                            onFilter={this.props.onFilter} />
                    </div>
                    <div id="ms-annotations-panel-card" className={(!annotationsPresent && "annotations-empty-panel")}>
                        {!annotationsPresent && <Message msgId={"annotations.empty"}/>}
                        { annotationsPresent &&
                            <SideGrid size="sm" items={this.props.annotations && this.props.annotations.filter(this.applyFilter).map(a => this.renderItems(a))}/>
                        }
                    </div>
                </>
            );
        }
        const annotation = this.props.annotations && head(this.props.annotations.filter(a => a.properties.id === this.props.current));
        const Editor = this.props.editor;
        if (this.props.mode === 'detail') {
            return (<Editor feature={annotation} geodesic={this.props.geodesic} showBack id={this.props.current} config={this.props.config} width={this.props.width}
                {...annotation.properties}
            />);
        }
        // mode = editing
        return this.props.editing && <Editor
            feature={annotation} id={this.props.editing.properties && this.props.editing.properties.id || uuidv1()} width={this.props.width} config={this.props.config} {...this.props.editing.properties} lineDashOptions={this.props.lineDashOptions}
            symbolsPath={this.props.symbolsPath}
            onUpdateSymbols={this.props.onUpdateSymbols}
            onSetErrorSymbol={this.props.onSetErrorSymbol}
            symbolErrors={this.props.symbolErrors}
            symbolList={this.props.symbolList}
            defaultShape={this.props.defaultShape}
            defaultShapeSize={this.props.defaultShapeSize}
            defaultShapeFillColor={this.props.defaultShapeFillColor}
            defaultShapeStrokeColor={this.props.defaultShapeStrokeColor}
            defaultStyles={this.props.defaultStyles}
            textRotationStep={this.props.textRotationStep}
            annotations={this.props.annotations}
            measurementAnnotationEdit={this.props.measurementAnnotationEdit}
            geodesic={this.props.geodesic}
        />;
    };

    renderHeader() {
        return (
            <div style={this.props.styling || { width: '100%' }}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <div>
                        <Button className="square-button no-border" onClick={this.props.toggleControl} >
                            <Glyphicon glyph="1-close"/>
                        </Button>
                    </div>
                    <div style={{flex: "1 1 0%", padding: 8, textAlign: "center"}}>
                        <h4><Message msgId="annotations.title"/></h4>
                    </div>
                    <div>
                        <Button className="square-button no-events">
                            <Glyphicon glyph="comment"/>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        let body;
        if (this.state.selectFile) {
            body = (
                <SelectAnnotationsFile
                    text={<Message msgId="annotations.selectfiletext"/>}
                    onFileChoosen={this.props.onLoadAnnotations}
                    show={this.state.selectFile}
                    disableOvveride={!(this.props.annotations && this.props.annotations.length > 0)}
                    onClose={() => this.setState(() => ({selectFile: false}))}
                />);


        } else {
            body = (<span> {this.renderCards()} </span>);
        }
        return (<BorderLayout id={this.props.id} header={this.renderHeader()}>
            {body}
        </BorderLayout>);

    }

    applyFilter = (annotation) => {
        return !this.props.filter || this.getConfig().fields.reduce((previous, field) => {
            return (annotation.properties[field.name] || '').toUpperCase().indexOf(this.props.filter.toUpperCase()) !== -1 || previous;
        }, false);
    };
}

export default Annotations;
