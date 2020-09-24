/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const Toolbar = require('../../misc/toolbar/Toolbar');
const Portal = require('../../misc/Portal');
const GeometryEditor = require('./GeometryEditor');
const Manager = require('../../style/vector/Manager');
const Message = require('../../I18N/Message');
const { FormControl, Grid, Row, Col, Nav, NavItem, Glyphicon, FormGroup, ControlLabel } = require('react-bootstrap');
const ReactQuill = require('react-quill');
require('react-quill/dist/quill.snow.css');
const { isFunction, isEmpty, head } = require('lodash');
const {getGeometryGlyphInfo, getGeometryType} = require('../../../utils/AnnotationsUtils');
const ConfirmDialog = require('../../misc/ConfirmDialog');
const assign = require('object-assign');
const PluginsUtils = require('../../../utils/PluginsUtils');
const defaultConfig = require('./AnnotationsConfig');
const FeaturesList = require('./FeaturesList');
const {getComponents, coordToArray, validateCoords} = require('../../../utils/AnnotationsUtils');

/**
 * (Default) Viewer / Editor for Annotations.
 * @memberof components.mapControls.annotations
 * @class
 * @prop {string} id identifier of the current annotation feature
 * @prop {function} onChangeFormat triggered every format change
 * @prop {string} format decimal or aeronautical degree for coordinates
 * @prop {string} mapProjection crs of the map
 * @prop {object} config configuration object, where overridable stuff is stored (fields config for annotations, marker library, etc.) {@link #components.mapControls.annotations.AnnotationsConfig}
 * @prop {object} editing feature object of the feature under editing (when editing mode is enabled, null otherwise)
 * @prop {boolean} drawing flag to state status of drawing during editing
 * @prop {boolean} styling flag to state status of styling during editing
 * @prop {object} errors key/value set of validation errors (field_name: error_id)
 * @prop {object} feature object with the annotation properties
 * @prop {bool} showBack shows / hides the back button in the view mode
 * @prop {bool} showEdit shows / hides the edit button in the view mode
 * @prop {function} onEdit triggered when the user clicks on the edit button
 * @prop {function} onCancelEdit triggered when the user cancels current editing session
 * @prop {function} onCancelStyle triggered when the user cancels style selection
 * @prop {function} onCancel triggered when the user cancels the addition/changes made to the annotation
 * @prop {function} onCleanHighlight triggered when the user exits 'details' mode
 * @prop {function} onHighlight triggered when the user hover the infoviewer card
 * @prop {function} onConfirmDeleteFeature triggered when the user confirms deletion of a feature
 * @prop {function} onAddText triggered when the user adds new Text geometry to the feature
 * @prop {function} onToggleUnsavedChangesModal toggles the view of the UnsavedChangesModal
 * @prop {function} onToggleUnsavedStyleModal toggles the view of the UnsavedStyleModal
 * @prop {function} onToggleUnsavedGeometryModal toggles the view of the UnsavedGeometryModal
 * @prop {function} onSetUnsavedChanges triggered when the user changes the value of any field, it sets a flag used to trigger the view of the UnsavedChangesModal
 * @prop {function} onAddNewFeature triggered when user click on save icon of the coordinate editor, this will add the feature being drawn to the list of features of the ft coll of the annotation
 * @prop {function} onChangeProperties triggered when the user changes the value of any field
 * @prop {function} onSetUnsavedStyle triggered when the user changes the style , it sets a flag used to trigger the view of the UnsavedStyleModal
 * @prop {function} onConfirmRemove triggered when the user confirms removal
 * @prop {function} onCancelRemove triggered when the user cancels removal
 * @prop {function} onCancelClose triggered when the user cancels closing
 * @prop {function} onConfirmClose triggered when the user confirms closing
  * @prop {function} onChangePointType triggered when the user switches between the point stylers
 * @prop {function} onStartDrawing triggered before the user starts the drawing process
 * @prop {object} editedFields fields of the annotation
 * @prop {object} drawingText it contains info of the text annotation, 'drawing' if being added or 'show' used to show the modal to add the relative value
 * @prop {boolean} unsavedChanges flag used to trigger changes of showUnsavedChangesModal
 * @prop {boolean} unsavedStyle flag used to trigger changes of showUnsavedChangesModal
 * @prop {boolean} closing user asked for closing panel when editing
 * @prop {string} stylerType selected styler to be shown as body
 * @prop {boolean} showUnsavedStyleModal flag used to show the UnsavedChangesModal
 * @prop {boolean} showUnsavedChangesModal flag used to show the UnsavedStyleModal
 * @prop {boolean} showUnsavedGeometryModal flag used to display the modal after user clicks on back and has changed something in the coord editor
 * @prop {boolean} showDeleteFeatureModal flag used to display the modal after deleting a feature for confirmation
 * @prop {boolean} unsavedGeometry flag used to say if something has changed when coord editor is open
 * @prop {string} mode current mode of operation (list, editing, detail)
 * @prop {function} onRemove triggered when the user clicks on the remove button
 * @prop {function} onSave triggered when the user clicks on the save button
 * @prop {function} onSaveStyle triggered when the user saves changes to the style
 * @prop {function} onError triggered when a validation error occurs
 * @prop {function} onAddGeometry triggered when the user clicks on the add point button TODO FIX THIS
 * @prop {function} onDeleteGeometry triggered when the user clicks on the remove points button
 * @prop {function} onStyleGeometry triggered when the user clicks on the style button
 * @prop {function} onSetStyle triggered when the user changes a style property
 * @prop {function} onChangeSelected triggered when the user changes a value(lat or lon) of a coordinate in the coordinate editor
 * @prop {function} onChangeRadius triggered when the user changes the radius of the Circle in its coordinate editor
 * @prop {function} onChangeText triggered when the user changes the text of the Text Annotation in its coordinate editor
 * @prop {function} onSetInvalidSelected triggered when the user insert an invalid coordinate or remove a valid one i.e. ""
 * @prop {function} onHighlightPoint triggered when mouse goes over/off a CoordinatesRow
 * @prop {function} onResetCoordEditor triggered when the user goes back from the coordinate editor, it will open a dialog for unsaved changes
 * @prop {function} onZoom triggered when the user zooms to an annotation
 * @prop {function} onDownload triggered when the user exports
 * @prop {function} onChangeGeometryTitle triggered when the user changes geometry title in coordinate editor panel
 * @prop {function} onSelectFeature triggered when the user clicks on a geometry card
 * @prop {boolean} coordinateEditorEnabled triggered when the user zooms to an annotation
 * @prop {object} selected Feature containing the geometry and the properties used for the coordinated editor
 * @prop {object} aeronauticalOptions options for aeronautical format (seconds decimals and step)
 * @prop {number} maxZoom max zoome the for annotation (default 18)
 * @prop {function} onDeleteFeature triggered when user click on trash icon of the coordinate editor
 * @prop {function} onUpdateSymbols triggered when user click on refresh icon of the symbols addon
 * @prop {function} onSetErrorSymbol set a flag in the state to say if the default symbols exists
 * @prop {number} width of the annotation panel
 * @prop {string} pointType the type of the point, values are "marker" or "symbol"
 * @prop {object[]} lineDashOptions list of options for dashed lines
 * @prop {object[]} symbolList list of symbols
 * @prop {string} symbolsPath path to the svg folder
 * @prop {string} defaultShape default shape for symbol
 * @prop {string} defaultShapeStrokeColor default symbol stroke color
 * @prop {string} defaultShapeFillColor default symbol fill color
 * @prop {string} defaultShapeSize default symbol shape size in px
 * @prop {object} defaultStyles object with default symbol styles
 * @prop {number} textRotationStep rotation step of text styler
 * @prop {function} onFilterMarker triggered when marker/glyph name is specified for filtering
 * @prop {object[]} annotations list of annotations
 *
 * In addition, as the Identify viewer interface mandates, every feature attribute is mapped as a component property (in addition to the feature object).
 */
class AnnotationsEditor extends React.Component {
    static displayName = 'AnnotationsEditor';

    static propTypes = {
        id: PropTypes.string,
        onEdit: PropTypes.func,
        onCancelEdit: PropTypes.func,
        onCancelStyle: PropTypes.func,
        onCleanHighlight: PropTypes.func,
        onHighlight: PropTypes.func,
        onAddText: PropTypes.func,
        onCancel: PropTypes.func,
        onConfirmDeleteFeature: PropTypes.func,
        onRemove: PropTypes.func,
        onSave: PropTypes.func,
        onSaveStyle: PropTypes.func,
        onError: PropTypes.func,
        onAddGeometry: PropTypes.func,
        onToggleUnsavedChangesModal: PropTypes.func,
        onToggleUnsavedGeometryModal: PropTypes.func,
        onToggleUnsavedStyleModal: PropTypes.func,
        onToggleDeleteFtModal: PropTypes.func,
        onSetUnsavedChanges: PropTypes.func,
        onSetUnsavedStyle: PropTypes.func,
        onChangeProperties: PropTypes.func,
        onChangeSelected: PropTypes.func,
        onConfirmClose: PropTypes.func,
        onCancelRemove: PropTypes.func,
        onConfirmRemove: PropTypes.func,
        onChangeRadius: PropTypes.func,
        onChangeText: PropTypes.func,
        onChangeGeometryTitle: PropTypes.func,
        onCancelClose: PropTypes.func,
        onSetInvalidSelected: PropTypes.func,
        onDeleteGeometry: PropTypes.func,
        onAddNewFeature: PropTypes.func,
        onStyleGeometry: PropTypes.func,
        onResetCoordEditor: PropTypes.func,
        onHighlightPoint: PropTypes.func,
        onSetStyle: PropTypes.func,
        onChangePointType: PropTypes.func,
        onStartDrawing: PropTypes.func,
        onZoom: PropTypes.func,
        editing: PropTypes.object,
        editedFields: PropTypes.object,
        drawingText: PropTypes.object,
        drawing: PropTypes.bool,
        unsavedChanges: PropTypes.bool,
        unsavedGeometry: PropTypes.bool,
        unsavedStyle: PropTypes.bool,
        mouseHoverEvents: PropTypes.bool,
        coordinateEditorEnabled: PropTypes.bool,
        styling: PropTypes.bool,
        closing: PropTypes.bool,
        removing: PropTypes.bool,
        errors: PropTypes.object,
        stylerType: PropTypes.string,
        featureType: PropTypes.string,
        showBack: PropTypes.bool,
        showEdit: PropTypes.bool,
        showUnsavedChangesModal: PropTypes.bool,
        showUnsavedStyleModal: PropTypes.bool,
        showDeleteFeatureModal: PropTypes.bool,
        showUnsavedGeometryModal: PropTypes.bool,
        config: PropTypes.object,
        feature: PropTypes.object,
        features: PropTypes.object,
        selected: PropTypes.object,
        mode: PropTypes.string,
        maxZoom: PropTypes.number,
        width: PropTypes.number,
        onDownload: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onSelectFeature: PropTypes.func,
        mapProjection: PropTypes.string,
        format: PropTypes.string,
        aeronauticalOptions: PropTypes.object,
        onDeleteFeature: PropTypes.func,
        pointType: PropTypes.string,
        symbolsPath: PropTypes.string,
        onUpdateSymbols: PropTypes.func,
        onSetErrorSymbol: PropTypes.func,
        symbolErrors: PropTypes.array,
        lineDashOptions: PropTypes.array,
        symbolList: PropTypes.array,
        defaultShape: PropTypes.string,
        defaultShapeSize: PropTypes.number,
        defaultShapeFillColor: PropTypes.string,
        defaultShapeStrokeColor: PropTypes.string,
        defaultStyles: PropTypes.object,
        textRotationStep: PropTypes.number,
        onFilterMarker: PropTypes.func,
        annotations: PropTypes.array
    };

    static defaultProps = {
        config: defaultConfig,
        errors: {},
        selected: null,
        editedFields: {},
        showBack: false,
        showEdit: true,
        coordinateEditorEnabled: false,
        feature: {},
        maxZoom: 18,
        format: "decimal",
        pointType: "marker",
        stylerType: "marker",
        annotations: []
    };
    /**
    @prop {object} removing object to remove, it is also a flag that means we are currently asking for removing an annotation / geometry. Toggles visibility of the confirm dialog
    */
    state = {
        editedFields: {},
        removing: null,
        textValue: "",
        tabValue: "coordinates"
    };

    getConfig = () => {
        return {...defaultConfig, ...this.props.config, onFilterMarker: this.props.onFilterMarker};
    };

    getBodyItems = (editing) => {
        return this.getConfig().fields
            .filter((field) => !editing || field.editable)
            .map((field) => {
                const isError = editing && this.props.errors[field.name];
                const additionalCls = isError ? 'field-error' : '';
                return (
                    <div key={field.name} className={"mapstore-annotations-info-viewer-item mapstore-annotations-info-viewer-" + field.name + ' ' + additionalCls}>
                        {field.showLabel ? <label><Message msgId={"annotations.field." + field.name} /></label> : null}
                        {isError ? this.renderErrorOn(field.name) : ''}
                        {this.renderProperty(field, this.props[field.name] || field.value, editing)}
                    </div>
                );
            });
    };


    getValidator = (validator) => {
        if (isFunction(validator)) {
            return validator;
        }
        return PluginsUtils.handleExpression({}, {}, '{(function(value) {return ' + validator + ';})}');
    };

    renderViewButtons = () => {
        return (
            <Grid fluid style={this.props.styling ? { width: '100%', boxShadow: 'none' } : { width: '100%' }}>
                <Row className="noTopMargin">
                    <Col xs={12} className="text-center">
                        <Toolbar
                            btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary' }}
                            buttons={[{
                                glyph: 'arrow-left',
                                tooltipId: "annotations.back",
                                visible: this.props.showBack,
                                onClick: () => {
                                    this.props.onCancelEdit();
                                    this.props.onCancel(); this.props.onCleanHighlight();
                                }
                            }, {
                                glyph: "pencil",
                                tooltipId: "annotations.edit",
                                visible: this.props.showEdit,
                                multiGeometry: this.props.config.multiGeometry,
                                onClick: () => { this.props.onEdit(this.props.id); },
                                disabled: !this.props.config.multiGeometry && this.props.editing && this.props.editing.features && this.props.editing.features.length,
                                bsStyle: this.props.drawing ? "success" : "primary"
                            }, {
                                glyph: 'trash',
                                tooltipId: "annotations.remove",
                                visible: true,
                                onClick: () => {
                                    this.setState({removing: this.props.id});
                                }
                            }, {  // TODO should this be included on geometry card
                                glyph: 'download',
                                tooltip: <Message msgId="annotations.downloadcurrenttooltip" />,
                                visible: true,
                                onClick: () => { this.props.onDownload(this.props.features); }
                            }
                            ]} />
                    </Col>
                </Row>
            </Grid>);
    };

    renderEditingCoordButtons = () => {
        return (<Grid className="mapstore-annotations-info-viewer-buttons" fluid>
            <Row className="text-center noTopMargin">
                <Col xs={12}>
                    <Toolbar
                        btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary' }}
                        buttons={[
                            {
                                glyph: 'arrow-left',
                                tooltipId: "annotations.back",
                                visible: true,
                                disabled: this.props?.selected?.properties
                                    && !this.props?.selected?.properties?.isValidFeature || false,
                                onClick: () => {
                                    if (this.props.styling) {
                                        if (this.props.unsavedStyle) {
                                            this.props.onToggleUnsavedStyleModal();
                                        } else {
                                            this.props.onCancelStyle();
                                        }
                                    } else if (this.props.unsavedGeometry) {
                                        this.props.onToggleUnsavedGeometryModal();
                                    } else if (this.props.unsavedChanges) {
                                        this.props.onToggleUnsavedChangesModal();
                                    } else {
                                        this.props.onResetCoordEditor();
                                        this.props.onCancelEdit();
                                        // Reset geometry editor tab
                                        this.setState({...this.state, tabValue: 'coordinates'});
                                    }

                                }
                            }, {
                                glyph: 'trash',
                                tooltipId: "annotations.remove",
                                disabled: !this.props.annotations.length,
                                visible: !this.props.selected,
                                onClick: () => {
                                    this.setState({removing: this.props.id});
                                }
                            }, {
                                glyph: 'floppy-disk',
                                tooltipId: !isEmpty(this.props.selected) ? "annotations.saveGeometry" : "annotations.save",
                                disabled: this.props.selected && this.props.selected.properties && !this.props.selected.properties.isValidFeature,
                                onClick: () => this.save()
                            },
                            {
                                glyph: 'download',
                                tooltip: <Message msgId="annotations.downloadcurrenttooltip" />,
                                disabled: Object.keys(this.validate()).length !== 0,
                                visible: !this.props.selected,
                                onClick: () => {
                                    const {newFeature, ...features} = this.props.editing;
                                    this.props.onDownload(features);
                                }
                            }
                        ]} />
                </Col>
            </Row>
        </Grid>);
    };

    renderButtons = (editing) => {
        let toolbar;
        if (editing) {
            toolbar = this.renderEditingCoordButtons();
        } else {
            toolbar = this.renderViewButtons();
        }
        return (<div className="mapstore-annotations-info-viewer-buttons">{toolbar}</div>);
    };

    renderProperty = (field, prop, editing) => {
        const fieldValue = this.props.editedFields[field.name] === undefined ? prop : this.props.editedFields[field.name];
        if (editing) {
            switch (field.type) {
            case 'html':
                return (<ReactQuill value={fieldValue || ''} onChange={(val) => { this.change(field.name, val); if (!this.props.unsavedChanges) { this.props.onSetUnsavedChanges(true); } }}
                />);
            case 'component':
                const Component = fieldValue;
                return <prop editing value={<Component annotation={this.props.feature} />} onChange={(e) => { this.change(field.name, e.target.value); if (!this.props.unsavedChanges) { this.props.onSetUnsavedChanges(true); } }} />;
            default:
                return <FormControl value={fieldValue || ''} onChange={(e) => { this.change(field.name, e.target.value); if (!this.props.unsavedChanges) { this.props.onSetUnsavedChanges(true); } }} />;
            }

        }
        switch (field.type) {
        case 'html':
            return <span dangerouslySetInnerHTML={{ __html: fieldValue }} />;
        case 'component':
            const Component = fieldValue;
            return <Component annotation={this.props.feature} />;
        default:
            return (<p>{fieldValue}</p>);
        }
    };

    renderErrorOn = (field) => {
        return <div className="annotations-edit-error"><Message msgId={this.props.errors[field]} /></div>;
    };

    renderMarkers = (markers, prefix = '') => {
        return markers.map((marker) => {
            if (marker.markers) {
                return (<div className={"mapstore-annotations-info-viewer-marker-group mapstore-annotations-info-viewer-marker-" + prefix + marker.name}>
                    {this.renderMarkers(marker.markers, marker.name + '-')}
                </div>);
            }
            return (
                <div onClick={() => this.selectStyle(marker)}
                    className={"mapstore-annotations-info-viewer-marker mapstore-annotations-info-viewer-marker-" + prefix + marker.name +
                        (this.isCurrentStyle(marker) ? " mapstore-annotations-info-viewer-marker-selected" : "")} style={marker.thumbnailStyle} />);
        });
    };

    renderBody = (editing) => {
        const items = this.getBodyItems(editing);
        if (items.length === 0) {
            return null;
        }
        return (<div className={"mapstore-annotations-info-viewer-items" + (this.props.styling ? " mapstore-annotations-info-viewer-styler" : "")}>
            <div>
                {items}
                {editing && <FeaturesList
                    editing={this.props.editing}
                    selected={this.props.selected}
                    onAddGeometry={this.props.onAddGeometry}
                    onSetStyle={this.props.onSetStyle}
                    onStartDrawing={this.props.onStartDrawing}
                    onAddText={this.props.onAddText}
                    onDeleteGeometry={this.props.onDeleteGeometry}
                    onZoom={this.props.onZoom}
                    maxZoom={this.props.maxZoom}
                    setTabValue={this.setTabValue}
                    styling={this.props.styling}
                    onStyleGeometry={this.props.onStyleGeometry}
                    onSelectFeature={this.props.onSelectFeature}
                    drawing={this.props.drawing}
                    onUnselectFeature={this.props.onResetCoordEditor}
                />
                }
            </div>
        </div>);
    };

    renderError = (editing) => {
        return editing ? (Object.keys(this.props.errors)
            .filter(field => this.getConfig().fields.filter(f => f.name === field).length === 0).map(field => this.renderErrorOn(field))) : null;
    };

    renderModals = () => {
        if (this.props.closing) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={this.props.onCancelClose}
                onConfirm={this.props.onConfirmClose}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undo" />
            </ConfirmDialog></Portal>);
        } else if (this.props.showUnsavedChangesModal) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={this.props.onToggleUnsavedChangesModal}
                onConfirm={() => {
                    this.props.selected && this.props.onResetCoordEditor();
                    this.props.onCancelEdit(); this.props.onToggleUnsavedChangesModal();
                }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undo" />
            </ConfirmDialog></Portal>);
        } else if (this.props.showUnsavedGeometryModal) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={this.props.onToggleUnsavedGeometryModal}
                onConfirm={() => { this.props.onResetCoordEditor(); }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                title={<Message msgId="annotations.titleUndoGeom" />}
                confirmButtonContent={<Message msgId="annotations.confirmGeom" />}
                closeText={<Message msgId="annotations.cancelModalGeom" />}>
                <Message msgId="annotations.undoGeom" />
            </ConfirmDialog></Portal>);
        } else if (this.props.showUnsavedStyleModal) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={this.props.onToggleUnsavedStyleModal}
                onConfirm={() => {
                    this.props.onCancelStyle(); this.props.onToggleUnsavedStyleModal();
                    this.setTabValue('coordinates');
                }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undo" />
            </ConfirmDialog></Portal>);
        } else if (this.props.showDeleteFeatureModal) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={this.props.onToggleDeleteFtModal}
                onConfirm={() => { this.props.onConfirmDeleteFeature(); this.props.onToggleDeleteFtModal(); }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId="annotations.undoDeleteFeature" />
            </ConfirmDialog></Portal>);
        } else if (this.state.removing || this.props.removing) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={()=>{
                    this.state.removing && this.setState({removing: null});
                    this.props.onCancelRemove();
                }}
                onConfirm={() => {
                    if (this.state.removing) {
                        this.setState({removing: null});
                        this.props.onConfirmRemove(this.state.removing, "features");
                    } else {
                        this.props.onConfirmRemove(this.props.removing, "geometry");
                    }
                }}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                {this.props.mode === 'editing' ? <Message msgId="annotations.removegeometry"/> :
                    <Message msgId="annotations.removeannotation" msgParams={{title: this.props?.feature?.properties?.title}}/>}
            </ConfirmDialog></Portal>);
        }
        return null;
    }

    render() {
        const editing = this.props.editing && (this.props.editing.properties.id === this.props.id);
        let mouseHoverEvents = this.props.mouseHoverEvents ? {
            onMouseEnter: () => {
                this.props.onHighlight(this.props.id);
            },
            onMouseLeave: () => {
                this.props.onCleanHighlight();
            }
        } : {};
        const type = this.props.selected ? getGeometryType(this.props.selected) : "";
        const {glyph = "", label = ""} = isEmpty(type) ? {} : getGeometryGlyphInfo(type);
        return (
            <div style={{display: "flex"}} className={"mapstore-annotations-info-viewer" + (this.props.mouseHoverEvents ? " hover-background" : "")} {...mouseHoverEvents}>
                <div style={{flex: 1}}>
                    {this.renderButtons(editing)}
                    {this.renderError(editing)}
                    {this.renderModals()}
                    {this.renderBody(editing)}
                </div>
                {!isEmpty(this.props.selected) &&
                    <div className="mapstore-annotations-info-viewer-expanded">
                        <div style={{padding: 8, display: 'flex', alignItems: 'center'}}>
                            <Glyphicon glyph={glyph} style={{fontSize: 20, paddingRight: 8}}/>
                            <div style={{flex: 1}}>
                                <FormControl
                                    value={this.props.selected?.properties?.geometryTitle || label || this.props.selected?.properties?.id}
                                    name="text"
                                    placeholder="Enter geometry title"
                                    onChange={e => {
                                        const valueText = e.target.value.trim();
                                        this.props.onChangeGeometryTitle(valueText ? valueText : label);
                                    }}
                                    type="text"/>
                            </div>
                        </div>
                        {this.props.selected?.properties?.isText && <div style={{padding: 8}}>
                            <FormGroup>
                                <FormGroup validationState={!this.props.selected?.properties.valueText ? "error" : null}>
                                    <ControlLabel><Message msgId="annotations.editor.text"/></ControlLabel>
                                    <FormControl
                                        value={this.props.selected?.properties?.valueText || ''}
                                        name="text"
                                        placeholder="text value"
                                        onChange={e => {
                                            const valueText = e.target.value;
                                            const components = this.props?.selected?.geometry?.coordinates?.length ?
                                                getComponents(this.props.selected.geometry) : [];
                                            if (this.validateText(components, valueText )) {
                                                this.props.onChangeText(valueText, components.map(coordToArray));
                                            } else if (valueText !== "") {
                                                this.props.onChangeText(valueText, components.map(coordToArray));
                                            } else {
                                                this.props.onChangeText("", components.map(coordToArray));
                                                this.props.onSetInvalidSelected("text", components.map(coordToArray));
                                            }
                                        }}
                                        type="text"/>
                                </FormGroup>
                            </FormGroup>
                        </div>}
                        <Nav bsStyle="tabs" activeKey={this.state.tabValue} justified>
                            <NavItem
                                key="coordinates"
                                eventKey="coordinates"
                                onClick={() => {
                                    this.setTabValue('coordinates');
                                    this.props.styling && this.props.onStyleGeometry();
                                }}>
                                <Message msgId={"annotations.tabCoordinates"}/>
                            </NavItem>
                            <NavItem
                                key="style"
                                eventKey="style"
                                onClick={() => {
                                    this.setTabValue('style');
                                    !this.props.styling && this.props.onStyleGeometry();
                                }}>
                                <Message msgId={"annotations.tabStyle"}/>
                            </NavItem>
                        </Nav>
                        <div className={'tab-container'}>
                            {this.state.tabValue === 'coordinates' &&
                            <GeometryEditor
                                options={this.props.config && this.props.config.geometryEditorOptions}
                                drawing={this.props.drawing}
                                aeronauticalOptions={this.props.aeronauticalOptions}
                                selected={this.props.selected}
                                featureType={this.props.featureType}
                                format={this.props.format}
                                mapProjection={this.props.mapProjection}
                                onChange={this.props.onChangeSelected}
                                onChangeRadius={this.props.onChangeRadius}
                                onChangeFormat={this.props.onChangeFormat}
                                onHighlightPoint={this.props.onHighlightPoint}
                                onSetInvalidSelected={this.props.onSetInvalidSelected}
                                onChangeText={this.props.onChangeText}
                                renderer={"annotations"}
                            />
                            }
                            {this.state.tabValue === 'style' &&
                            <Manager
                                onChangeStyle={(style) => {
                                    this.props.onSetStyle(style);
                                    this.props.onSetUnsavedStyle(true);
                                    this.props.onSetUnsavedChanges(true);
                                }}
                                pointType={this.props.pointType}
                                onChangePointType={this.props.onChangePointType}
                                style={this.props.selected && this.props.selected.style || this.props.editing.style}
                                width={this.props.width}
                                symbolsPath={this.props.symbolsPath}
                                onSetErrorSymbol={this.props.onSetErrorSymbol}
                                symbolErrors={this.props.symbolErrors}
                                onUpdateSymbols={this.props.onUpdateSymbols}
                                symbolList={this.props.symbolList}
                                defaultShape={this.props.defaultShape}
                                defaultShapeSize={this.props.defaultShapeSize}
                                defaultShapeFillColor={this.props.defaultShapeFillColor}
                                defaultShapeStrokeColor={this.props.defaultShapeStrokeColor}
                                defaultPointType={this.getConfig().defaultPointType}
                                defaultStyles={this.props.defaultStyles}
                                lineDashOptions={this.props.lineDashOptions}
                                markersOptions={this.getConfig()}
                                textRotationStep={this.props.textRotationStep}
                            />
                            }
                        </div>
                    </div>
                }
            </div>
        );
    }

    change = (field, value) => {
        this.props.onChangeProperties(field, value);
    };

    isCurrentStyle = (m) => {
        return this.getConfig().markersConfig.matches(this.props.editing.style.MultiPoint, m.style);
    };

    selectStyle = (marker) => {
        return this.props.onSetStyle(assign({}, {
            "Point": {
                ...this.getConfig().markersConfig.getStyle(marker.style),
                iconGlyph: this.props.editing.style.Point && this.props.editing.style.Point.iconGlyph
            },
            "MultiPoint": {
                ...this.getConfig().markersConfig.getStyle(marker.style),
                iconGlyph: this.props.editing.style.MultiPoint && this.props.editing.style.MultiPoint.iconGlyph
            }
        }));
    };

    selectGlyph = (option) => {
        return this.props.onSetStyle(
            assign({}, this.props.editing.style, {
                "Point": {
                    ...this.props.editing.style.Point,
                    iconGlyph: option && option.value || ""
                },
                "MultiPoint": {
                    ...this.props.editing.style.MultiPoint,
                    iconGlyph: option && option.value || ""
                }
            }));
    };

    validate = () => {
        return assign(this.getConfig().fields.filter(field => field.editable).reduce((previous, field) => {
            const value = this.props.editedFields[field.name] === undefined ? this.props[field.name] : this.props.editedFields[field.name];
            if (field.validator && !this.getValidator(field.validator)(value)) {
                return assign(previous, {
                    [field.name]: field.validateError
                });
            }
            return previous;
        }, {}), this.props.editing.features && this.props.editing.features.length ? {} : {
            geometry: 'annotations.emptygeometry'
        });

    };

    validateText = (components, valueText) => {
        if (components && components.length) {
            const cmp = head(components);
            return !!valueText && validateCoords(cmp);
        }
        return false;
    }

    save = () => {
        const errors = this.validate();
        if (Object.keys(errors).length === 0) {
            this.props.onError({});
            this.props.selected ? this.props.onAddNewFeature() :
                this.props.onSave(this.props.id, assign({}, this.props.editedFields),
                    this.props.editing.features, this.props.editing.style, this.props.editing.newFeature || false, this.props.editing.properties);
        } else {
            this.props.onError(errors);
        }
    };

    setTabValue = (tabValue) =>{
        if (this.state.tabValue !== tabValue) {
            this.setState({...this.state, tabValue});
        }
    }
}

module.exports = AnnotationsEditor;
