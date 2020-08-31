/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const ConfirmDialog = require('../../misc/ConfirmDialog');
const Message = require('../../I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');
const LineThumb = require('../../../components/style/thumbGeoms/LineThumb.jsx');
const CircleThumb = require('../../../components/style/thumbGeoms/CircleThumb.jsx');
const MultiGeomThumb = require('../../../components/style/thumbGeoms/MultiGeomThumb.jsx');
const PolygonThumb = require('../../../components/style/thumbGeoms/PolygonThumb.jsx');
const {head} = require('lodash');
const assign = require('object-assign');
const Filter = require('../../misc/Filter');
const Loader = require('../../misc/Loader');
const uuidv1 = require('uuid/v1');

const {Grid, Col, Row, Glyphicon, Button} = require('react-bootstrap');
const BorderLayout = require('../../layout/BorderLayout');
const Toolbar = require('../../misc/toolbar/Toolbar');
const SideGrid = require('../../misc/cardgrids/SideGrid');

const SelecAnnotationsFile = require("./SelectAnnotationsFile");

const defaultConfig = require('./AnnotationsConfig');

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
 * @prop {function} onHighlight triggered when the mouse hovers an annotation card
 * @prop {function} onCleanHighlight triggered when the mouse is out of any annotation card
 * @prop {function} onDetail triggered when the user clicks on an annotation card
 * @prop {function} onFilter triggered when the user enters some text in the filtering widget
 * @prop {function} classNameSelector optional selector to assign custom a CSS class to annotations, based on
 * @prop {function} onSetErrorSymbol set a flag in the state to say if the default symbols exists
 * @prop {function} onDownload triggered when the user clicks on the download annotations button
 * @prop {function} onUpdateSymbols triggered when user click on refresh icon of the symbols addon
 * @prop {boolean} symbolErrors errors related to the symbols
 * @prop {object[]} lineDashOptions list of options for dashed lines
 * @prop {string} symbolsPath path to the svg folder
 * @prop {object[]} symbolList list of symbols
 * @prop {string} defaultShape default Shape
 * @prop {string} defaultShapeStrokeColor default symbol stroke color
 * @prop {string} defaultShapeFillColor default symbol fill color
 * @prop {string} defaultShapeSize default symbol shape size in px
 * @prop {object} defaultStyles object with default symbol styles
 * @prop {number} textRotationStep rotation step of text styler
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
        symbolErrors: PropTypes.array,
        lineDashOptions: PropTypes.array,
        symbolList: PropTypes.array,
        defaultShape: PropTypes.string,
        symbolsPath: PropTypes.string,
        defaultShapeSize: PropTypes.number,
        defaultShapeFillColor: PropTypes.string,
        defaultShapeStrokeColor: PropTypes.string,
        defaultStyles: PropTypes.object,
        onLoadDefaultStyles: PropTypes.func,
        textRotationStep: PropTypes.number
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
        onLoadDefaultStyles: () => {},
        annotations: []
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

    renderFieldValue = (field, annotation) => {
        const fieldValue = annotation.properties[field.name] || '';
        switch (field.type) {
        case 'html':
            return <span dangerouslySetInnerHTML={{__html: fieldValue} }/>;
        default:
            return fieldValue;
        }
    };

    renderField = (field, annotation) => {
        return (<div className={"mapstore-annotations-panel-card-" + field.name}>
            {this.renderFieldValue(field, annotation)}
        </div>);
    };

    renderThumbnail = ({style, featureType, geometry, properties = {}}) => {
        const markerStyle = style.MultiPoint || style.Point || style.iconGlyph && style;
        const marker = markerStyle ? this.getConfig().getMarkerFromStyle(markerStyle) : {};
        if (featureType === "LineString" || featureType === "MultiLineString" ) {
            return (<span className={"mapstore-annotations-panel-card"}>
                <LineThumb styleRect={style[featureType]}/>
            </span>);
        }
        if (featureType === "Polygon" || featureType === "MultiPolygon" ) {
            return (<span className={"mapstore-annotations-panel-card"}>
                <PolygonThumb styleRect={style[featureType]}/>
            </span>);
        }
        if (featureType === "Circle") {
            return (<span className={"mapstore-annotations-panel-card"}>
                <CircleThumb styleRect={style[featureType]}/>
            </span>);
        }
        if (featureType === "GeometryCollection" || featureType === "FeatureCollection") {
            return (<span className={"mapstore-annotations-panel-card"}>
                {(!!(geometry.geometries || geometry.features || []).filter(f => f.type !== "MultiPoint").length || (properties.textValues && properties.textValues.length)) && (<MultiGeomThumb styleMultiGeom={style} geometry={geometry} properties={properties}/>)}
                {markerStyle ? (<span className={"mapstore-annotations-panel-card"}>
                    <div className={"mapstore-annotations-panel-card-thumbnail-" + marker.name} style={{...marker.thumbnailStyle, margin: 'auto', textAlign: 'center', color: '#ffffff', marginLeft: 7}}>
                        <span className={"mapstore-annotations-panel-card-thumbnail " + this.getConfig().getGlyphClassName(markerStyle)} style={{marginTop: 0, marginLeft: -7}}/>
                    </div>
                </span>) : null}
            </span>);
        }
        return (
            <span className={"mapstore-annotations-panel-card"}>
                <div className={"mapstore-annotations-panel-card-thumbnail-" + marker.name} style={{...marker.thumbnailStyle, margin: 'auto', textAlign: 'center', color: '#ffffff', marginLeft: 7}}>
                    <span className={"mapstore-annotations-panel-card-thumbnail " + this.getConfig().getGlyphClassName(markerStyle)} style={{marginTop: 0, marginLeft: -7}}/>
                </div>
            </span>);
    };

    renderItems = (annotation) => {
        const cardActions = {
            onMouseEnter: () => {this.props.onHighlight(annotation.properties.id); },
            onMouseLeave: this.props.onCleanHighlight,
            onClick: () => this.props.onDetail(annotation.properties.id)
        };
        return {
            ...this.getConfig().fields.reduce( (p, c)=> {
                return assign({}, p, {[c.name]: this.renderField(c, annotation)});
            }, {}),
            preview: this.renderThumbnail({style: annotation.style, featureType: "FeatureCollection", geometry: {features: annotation.features}, properties: annotation.properties }),
            ...cardActions
        };
    };

    renderCards = () => {
        if (this.props.loading) {
            return (
                <div style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <Loader size={352}/>
                </div>
            );
        }
        if (this.props.mode === 'list') {
            return (
                <SideGrid items={this.props.annotations && this.props.annotations.filter(this.applyFilter).map(a => this.renderItems(a))}/>
            );
        }
        const annotation = this.props.annotations && head(this.props.annotations.filter(a => a.properties.id === this.props.current));
        const Editor = this.props.editor;
        if (this.props.mode === 'detail') {
            return <Editor feature={annotation} showBack id={this.props.current} config={this.props.config} width={this.props.width} {...annotation.properties}/>;
        }
        // mode = editing
        return this.props.editing && <Editor feature={annotation} id={this.props.editing.properties && this.props.editing.properties.id || uuidv1()} width={this.props.width} config={this.props.config} {...this.props.editing.properties} lineDashOptions={this.props.lineDashOptions}
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
        />;
    };

    renderHeader() {
        return (
            <Grid fluid className="ms-header" style={this.props.styling || this.props.mode !== "list" ? { width: '100%', boxShadow: 'none'} : { width: '100%' }}>
                <Row>
                    <Col xs={2}>
                        <Button className="square-button no-events">
                            <Glyphicon glyph="comment"/>
                        </Button>
                    </Col>
                    <Col xs={8}>
                        <h4><Message msgId="annotations.title"/></h4>
                    </Col>
                    <Col xs={2}>
                        <Button className="square-button no-border" onClick={this.props.toggleControl} >
                            <Glyphicon glyph="1-close"/>
                        </Button>
                    </Col>
                </Row>
                {this.props.mode === "list" && <span><Row style={{margin: "auto"}}>
                    <Col xs={12} style={{margin: "auto"}} className="text-center">
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
                                    disabled: !(this.props.annotations && this.props.annotations.length > 0),
                                    tooltip: <Message msgId="annotations.downloadtooltip"/>,
                                    visible: this.props.mode === "list",
                                    onClick: () => { this.props.onDownload(); }
                                }
                            ]}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{padding: "0 15px"}}>
                        <Filter
                            filterPlaceholder={LocaleUtils.getMessageById(this.context.messages, "annotations.filter")}
                            filterText={this.props.filter}
                            onFilter={this.props.onFilter} />
                    </Col>
                </Row></span>}

            </Grid>
        );
    }

    render() {
        let body = null;
        if (this.props.closing ) {
            body = (<ConfirmDialog
                show
                modal
                onClose={this.props.onCancelClose}
                onConfirm={this.props.onConfirmClose}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undo"/>
            </ConfirmDialog>);
        } else if (this.props.showUnsavedChangesModal) {
            body = (<ConfirmDialog
                show
                modal
                onClose={this.props.onToggleUnsavedChangesModal}
                onConfirm={() => { this.props.onCancelEdit(); this.props.onToggleUnsavedChangesModal(); }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undo"/>
            </ConfirmDialog>);
        } else if (this.props.showUnsavedStyleModal) {
            body = (<ConfirmDialog
                show
                modal
                onClose={this.props.onToggleUnsavedStyleModal}
                onConfirm={() => { this.props.onCancelStyle(); this.props.onToggleUnsavedStyleModal(); }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undo"/>
            </ConfirmDialog>);
        } else if (this.props.removing) {
            body = (<ConfirmDialog
                show
                modal
                onClose={this.props.onCancelRemove}
                onConfirm={() => this.props.onConfirmRemove(this.props.removing)}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                {this.props.mode === 'editing' ? <Message msgId="annotations.removegeometry"/> :
                    <Message msgId="annotations.removeannotation" msgParams={{title: this.props.editing && this.props.editing.properties && this.props.editing.properties.title}}/>}
            </ConfirmDialog>);
        } else if (this.state.selectFile) {
            body = (
                <SelecAnnotationsFile
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

module.exports = Annotations;
