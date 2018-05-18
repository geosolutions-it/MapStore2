/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const MARKER = "marker";
const LINE = "lineString";
const POLYGON = "polygon";
const CIRCLE = "circle";
const TEXT = "text";
const Toolbar = require('../../misc/toolbar/Toolbar');
const Portal = require('../../misc/Portal');
const GeometryEditor = require('./GeometryEditor');
const PolygonStyler = require('../../style/PolygonStyler');
const CircleStyler = require('../../style/CircleStyler');
const TextStyler = require('../../style/TextStyler');
const PolylineStyler = require('../../style/PolylineStyler');
const Message = require('../../I18N/Message');
const {FormControl, Grid, Row, Col, Nav, NavItem, Glyphicon, FormGroup, InputGroup} = require('react-bootstrap');
const DropdownFeatureType = require('./DropdownFeatureType');
const ReactQuill = require('react-quill');
require('react-quill/dist/quill.snow.css');
const tooltip = require('../../misc/enhancers/tooltip');
const NavItemT = tooltip(NavItem);
const {getAvailableStyler, convertGeoJSONToInternalModel} = require('../../../utils/AnnotationsUtils');
const {isFunction} = require('lodash');
const ConfirmDialog = require('../../misc/ConfirmDialog');

const assign = require('object-assign');

const Select = require('react-select');

const PluginsUtils = require('../../../utils/PluginsUtils');
const defaultConfig = require('./AnnotationsConfig');

const bbox = require('@turf/bbox');

/**
 * (Default) Viewer / Editor for Annotations.
 * @memberof components.mapControls.annotations
 * @class
 * @prop {string} id identifier of the current annotation feature
 * @prop {object} config configuration object, where overridable stuff is stored (fields config for annotations, marker library, etc.) {@link #components.mapControls.annotations.AnnotationsConfig}
 * @prop {object} editing feature object of the feature under editing (when editing mode is enabled, null otherwise)
 * @prop {boolean} drawing flag to state status of drawing during editing
 * @prop {boolean} styling flag to state status of styling during editing
 * @prop {object} errors key/value set of validation errors (field_name: error_id)
 * @prop {object} feature object with the annotation properties
 * @prop {bool} showBack shows / hides the back button
 * @prop {function} onEdit triggered when the user clicks on the edit button
 * @prop {function} onCancelEdit triggered when the user cancels current editing session
 * @prop {function} onCleanHighlight triggered when the user exit 'details' mode
 * @prop {function} onAddText triggered when the user adds new Text geometry to the feature
 * @prop {function} onSaveText triggered when the user saves the value inserted for the Text annotation
 * @prop {function} onCancelText triggered when the user cancels the addition of the last Text annotation
 * @prop {function} onToggleUnsavedChangesModal toggles the view of the UnsavedChangesModal
 * @prop {function} onToggleUnsavedStyleModal toggles the view of the UnsavedStyleModal
 * @prop {function} onSetUnsavedChanges triggered when the user changes the value of any field, it sets a flag used to trigger the view of the UnsavedChangesModal
 * @prop {function} onAddNewFeature
 * @prop {function} onChangeProperties triggered when the user changes the value of any field
 * @prop {function} onSetUnsavedStyle triggered when the user changes the style , it sets a flag used to trigger the view of the UnsavedStyleModal
 * @prop {function} onConfirmRemove triggered when the user confirms removal
 * @prop {function} onCancelRemove triggered when the user cancels removal
 * @prop {function} onCancelClose triggered when the user cancels closing
 * @prop {function} onConfirmClose triggered when the user confirms closing
 * @prop {function} onChangeStyler triggered when the user switches between the stylers
 * @prop {function} onStopDrawing triggered when the user exits drawing process
 * @prop {object} editedFields fields of the annotation
 * @prop {object} drawingText it contains info of the text annotation, 'drawing' if being added or 'show' used to show the modal to add the relative value
 * @prop {boolean} unsavedChanges flag used to trigger changes of showUnsavedChangesModal
 * @prop {boolean} unsavedStyle flag used to trigger changes of showUnsavedChangesModal
 * @prop {object} removing object to remove, it is also a flag that means we are currently asking for removing an annotation / geometry. Toggles visibility of the confirm dialog
 * @prop {boolean} closing user asked for closing panel when editing
 * @prop {string} stylerType selected styler to be shown as body
 * @prop {boolean} showUnsavedStyleModal flag used to show the UnsavedChangesModal
 * @prop {boolean} showUnsavedChangesModal flag used to show the UnsavedStyleModal
 * @prop {string} mode current mode of operation (list, editing, detail)
 * @prop {function} onCancelStyle triggered when the user cancels style selection
 * @prop {function} onRemove triggered when the user clicks on the remove button
 * @prop {function} onSave triggered when the user clicks on the save button
 * @prop {function} onError triggered when a validation error occurs
 * @prop {function} onAddGeometry triggered when the user clicks on the add point button TODO FIX THIS
 * @prop {function} onDeleteGeometry triggered when the user clicks on the remove points button
 * @prop {function} onStyleGeometry triggered when the user clicks on the style button
 * @prop {function} onSetStyle triggered when the user changes a style property
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
        onCancel: PropTypes.func,
        onRemove: PropTypes.func,
        onSave: PropTypes.func,
        onSaveStyle: PropTypes.func,
        onError: PropTypes.func,
        onAddGeometry: PropTypes.func,
        onAddText: PropTypes.func,
        onSaveText: PropTypes.func,
        onCancelText: PropTypes.func,
        onToggleUnsavedChangesModal: PropTypes.func,
        onToggleUnsavedStyleModal: PropTypes.func,
        onSetUnsavedChanges: PropTypes.func,
        onSetUnsavedStyle: PropTypes.func,
        onChangeProperties: PropTypes.func,
        onChangeSelected: PropTypes.func,
        onConfirmClose: PropTypes.func,
        onCancelRemove: PropTypes.func,
        onConfirmRemove: PropTypes.func,
        onChangeRadius: PropTypes.func,
        onChangeText: PropTypes.func,
        onCancelClose: PropTypes.func,
        onDeleteGeometry: PropTypes.func,
        onAddNewFeature: PropTypes.func,
        onStyleGeometry: PropTypes.func,
        onResetCoordEditor: PropTypes.func,
        onSetStyle: PropTypes.func,
        onChangeStyler: PropTypes.func,
        onStopDrawing: PropTypes.func,
        onZoom: PropTypes.func,
        editing: PropTypes.object,
        editedFields: PropTypes.object,
        drawingText: PropTypes.object,
        drawing: PropTypes.bool,
        unsavedChanges: PropTypes.bool,
        unsavedStyle: PropTypes.bool,
        coordinateEditorEnabled: PropTypes.bool,
        styling: PropTypes.bool,
        removing: PropTypes.object,
        closing: PropTypes.bool,
        errors: PropTypes.object,
        stylerType: PropTypes.string,
        showBack: PropTypes.bool,
        showUnsavedChangesModal: PropTypes.bool,
        showUnsavedStyleModal: PropTypes.bool,
        config: PropTypes.object,
        feature: PropTypes.object,
        selected: PropTypes.object,
        mode: PropTypes.string,
        maxZoom: PropTypes.number,
        width: PropTypes.number,
        onDownload: PropTypes.func
    };

    static defaultProps = {
        config: defaultConfig,
        errors: {},
        selected: null,
        editedFields: {},
        showBack: false,
        coordinateEditorEnabled: false,
        feature: {},
        maxZoom: 18,
        stylerType: "marker"
    };

    state = {
        editedFields: {},
        textValue: ""
    };

    getConfig = () => {
        return assign({}, defaultConfig, this.props.config);
    };

    getBodyItems = (editing) => {
        return this.getConfig().fields
            .filter((field) => !editing || field.editable)
            .map((field) => {
                const isError = editing && this.props.errors[field.name];
                const additionalCls = isError ? 'field-error' : '';
                return (
                    <span key={field.name}><div key={field.name} className={"mapstore-annotations-info-viewer-item mapstore-annotations-info-viewer-" + field.name + ' ' + additionalCls}>
                        {field.showLabel ? <label><Message msgId={"annotations.field." + field.name}/></label> : null}
                        {isError ? this.renderErrorOn(field.name) : ''}
                        {this.renderProperty(field, this.props[field.name] || field.value, editing)}
                    </div>
                    </span>
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
            <Grid fluid style={this.props.styling ? { width: '100%', boxShadow: 'none'} : { width: '100%' }}>
                <Row className="noTopMargin">
                    <Col xs={12} className="text-center">
                        <Toolbar
                            btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary'}}
                            buttons={[ {
                                glyph: 'arrow-left',
                                tooltipId: "annotations.back",
                                visible: this.props.showBack,
                                onClick: () => {this.props.onCancel(); this.props.onCleanHighlight(); }
                            }, {
                                glyph: 'zoom-to',
                                tooltipId: "annotations.zoomTo",
                                visible: true,
                                onClick: () => {this.zoom(); }
                            }, {
                                glyph: "pencil",
                                tooltipId: "annotations.edit",
                                visible: true,
                                multiGeometry: this.props.config.multiGeometry,
                                onClick: () => {this.props.onEdit(this.props.id); },
                                disabled: !this.props.config.multiGeometry && this.props.editing && this.props.editing.features,
                                bsStyle: this.props.drawing ? "success" : "primary"
                            }, {
                                glyph: 'trash',
                                tooltipId: "annotations.remove",
                                visible: true,
                                onClick: () => {this.props.onRemove(this.props.id); }
                            }, {
                                    glyph: 'download',
                                    tooltip: <Message msgId="annotations.downloadcurrenttooltip"/>,
                                    visible: true,
                                    onClick: () => { this.props.onDownload(this.props.feature); }
                            }
                        ]}/>
                    </Col>
                </Row>
            </Grid>);
    };

    renderEditingButtons = () => {
        return (<Grid className="mapstore-annotations-info-viewer-buttons" fluid>
            <Row className="text-center noTopMargin">
                <Col xs={12}>
                    <Toolbar
                        btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary'}}
                        buttons={[ {
                            glyph: 'arrow-left',
                            tooltipId: "annotations.back",
                            visible: true,
                            onClick: () => {
                                if (this.props.unsavedChanges) {
                                    const errors = this.validate();
                                    if (Object.keys(errors).length === 0) {
                                        this.props.onToggleUnsavedChangesModal();
                                    } else {
                                        this.props.onError(errors);
                                    }
                                } else {
                                    this.cancelEdit();
                                }
                            }
                        }, {
                            glyph: "pencil-add",
                            el: DropdownFeatureType,
                            tooltipId: "annotations.addMarker",
                            visible: true,
                            onClick: this.props.onAddGeometry,
                            onAddText: this.props.onAddText,
                            onSetStyle: this.props.onSetStyle,
                            style: this.props.editing.style,
                            onStopDrawing: this.props.onStopDrawing,
                            disabled: !this.props.config.multiGeometry && this.props.editing && this.props.editing.features && this.props.editing.features.length,
                            drawing: this.props.drawing,
                            titles: {
                                marker: <Message msgId="annotations.titles.marker"/>,
                                line: <Message msgId="annotations.titles.line"/>,
                                polygon: <Message msgId="annotations.titles.polygon"/>,
                                circle: <Message msgId="annotations.titles.circle"/>,
                                text: <Message msgId="annotations.titles.text"/>
                            },
                                bsStyle: this.props.drawing ? "success" : "primary"
                            }, {
                                glyph: 'polygon-trash',
                                tooltipId: "annotations.deleteGeometry",
                                visible: this.props.editing && !!this.props.editing.features,
                                onClick: this.props.onDeleteGeometry
                            }, {
                                glyph: 'dropper',
                                tooltipId: "annotations.styleGeometry",
                                visible: this.props.editing && !!this.props.editing.features,
                                onClick: this.props.onStyleGeometry
                            }, {
                                glyph: 'floppy-disk',
                                tooltipId: "annotations.save",
                                visible: true,
                                onClick: this.save
                            }
                        ]}/>
                </Col>
            </Row>
        </Grid>);
    };
    renderEditingCoordButtons = () => {
        return (<Grid className="mapstore-annotations-info-viewer-buttons" fluid>
            <Row className="text-center noTopMargin">
                <Col xs={12}>
                    <Toolbar
                        btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary'}}
                        buttons={[ {
                            glyph: 'arrow-left',
                            tooltipId: "annotations.back",
                            visible: true,
                            onClick: () => {
                                // TODO back should return to editing form
                                this.props.onResetCoordEditor();
                            }
                        }, {
                            glyph: 'floppy-disk',
                            tooltipId: "annotations.save",
                            visible: true,
                            disabled: this.props.selected && this.props.selected.properties && !this.props.selected.properties.allValidPoints,
                            onClick: () => {
                                if (this.props.selected) {
                                    this.props.onAddNewFeature(this.props.selected);
                                }
                            }
                        }
                        ]}/>
                </Col>
            </Row>
        </Grid>);
    };

    renderButtons = (editing, coordinateEditorEnabled) => {
        const toolbar = editing ?
            coordinateEditorEnabled ? this.renderEditingCoordButtons() : this.renderEditingButtons()
            : this.renderViewButtons();
        return (<div className="mapstore-annotations-info-viewer-buttons">{toolbar}</div>);
    };

    renderProperty = (field, prop, editing) => {
        const fieldValue = this.props.editedFields[field.name] === undefined ? prop : this.props.editedFields[field.name];
        if (editing) {
            switch (field.type) {
                case 'html':
                    return <ReactQuill value={fieldValue || ''} onChange={(val) => {this.change(field.name, val); if (!this.props.unsavedChanges) {this.props.onSetUnsavedChanges(true); } }}/>;
                case 'component':
                    const Component = fieldValue;
                    return <prop editing value={<Component annotation={this.props.feature} />} onChange={(e) => {this.change(field.name, e.target.value); if (!this.props.unsavedChanges) {this.props.onSetUnsavedChanges(true); } }} />;
                default:
                    return <FormControl value={fieldValue || ''} onChange={(e) => {this.change(field.name, e.target.value); if (!this.props.unsavedChanges) {this.props.onSetUnsavedChanges(true); } }}/>;
            }

        }
        switch (field.type) {
            case 'html':
                return <span dangerouslySetInnerHTML={{__html: fieldValue} }/>;
            case 'component':
                const Component = fieldValue;
                return <Component annotation={this.props.feature} />;
            default:
                return (<p>{fieldValue}</p>);
        }
    };

    renderErrorOn = (field) => {
        return <div className="annotations-edit-error"><Message msgId={this.props.errors[field]}/></div>;
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
                        (this.isCurrentStyle(marker) ? " mapstore-annotations-info-viewer-marker-selected" : "")} style={marker.thumbnailStyle}/>);
        });
    };

    renderStylerTAB = (stylerTabs) => {
        return stylerTabs.map(e => {
            switch (e) {
                case MARKER: return (<NavItemT eventKey={MARKER} onClick={() => {
                    if (this.props.stylerType !== MARKER) {
                        this.props.onChangeStyler(MARKER);
                    }
                }}><Glyphicon glyph="point"/></NavItemT>);
                case CIRCLE: return (<NavItemT eventKey={CIRCLE} onClick={() => {
                    if (this.props.stylerType !== CIRCLE) {
                        this.props.onChangeStyler(CIRCLE);
                    }
                }}><Glyphicon glyph="1-circle"/></NavItemT>);
                case LINE: return (<NavItemT eventKey={LINE} onClick={() => {
                    if (this.props.stylerType !== LINE) {
                        this.props.onChangeStyler(LINE);
                    }
                }}><Glyphicon glyph="line"/></NavItemT>);
                case TEXT: return (<NavItemT eventKey={TEXT} onClick={() => {
                    if (this.props.stylerType !== TEXT) {
                        this.props.onChangeStyler(TEXT);
                    }
                }}><Glyphicon glyph="text-colour"/></NavItemT>);
                case POLYGON: return (<NavItemT eventKey={POLYGON} onClick={() => {
                    if (this.props.stylerType !== POLYGON) {
                        this.props.onChangeStyler(POLYGON);
                    }
                }}><Glyphicon glyph="polygon"/></NavItemT>);
                default: return null;
            }
        });
    };

    renderStylerBody = (stylerType = "marker") => {
        switch (stylerType) {
            case "marker": {
                const glyphRenderer = (option) => (<div><span className={"fa fa-" + option.value}/><span> {option.label}</span></div>);
                return (<div className="mapstore-annotations-info-viewer-markers">
                    {this.renderMarkers(this.getConfig().markers)}
                    <Select
                        options={this.getConfig().glyphs.map(g => ({
                            label: g,
                            value: g
                        }))}
                        optionRenderer={glyphRenderer}
                        valueRenderer={glyphRenderer}
                        value={this.props.editing.style.MultiPoint.iconGlyph || this.props.editing.style.Point.iconGlyph}
                        onChange={(option) => {this.selectGlyph(option); this.props.onSetUnsavedStyle(true); this.props.onSetUnsavedChanges(true); }}/>
                </div>);
            }
            case "lineString": return <PolylineStyler setStyleParameter={(style) => {this.props.onSetStyle(style); this.props.onSetUnsavedStyle(true); this.props.onSetUnsavedChanges(true); }} shapeStyle={this.props.editing.style} width={this.props.width} />;
            case "text": return <TextStyler setStyleParameter={(style) => {this.props.onSetStyle(style); this.props.onSetUnsavedStyle(true); this.props.onSetUnsavedChanges(true); }} shapeStyle={this.props.editing.style} width={this.props.width} />;
            case "polygon": return <PolygonStyler setStyleParameter={(style) => {this.props.onSetStyle(style); this.props.onSetUnsavedStyle(true); this.props.onSetUnsavedChanges(true); }} shapeStyle={this.props.editing.style} width={this.props.width}/>;
            case "circle": return <CircleStyler setStyleParameter={(style) => {this.props.onSetStyle(style); this.props.onSetUnsavedStyle(true); this.props.onSetUnsavedChanges(true); }} shapeStyle={this.props.editing.style} width={this.props.width}/>;
            default: return null;
        }
    };

    renderStyler = () => {
        const {editing, onCancelStyle, onSaveStyle, stylerType, onSetUnsavedStyle, onToggleUnsavedStyleModal} = this.props;
        const stylerTabs = editing.features ? getAvailableStyler(convertGeoJSONToInternalModel(editing)) : [];
        return (<div className="mapstore-annotations-info-viewer-styler">
            <Grid className="mapstore-annotations-info-viewer-styler-buttons" fluid style={{width: '100%', boxShadow: 'none'}}>
                <Row className="noTopMargin">
                    <Col xs={12} className="text-center">
                        <Toolbar
                            btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary'}}
                            buttons={[ {
                                glyph: 'back',
                                tooltipId: "annotations.back",
                                visible: true,
                                onClick: () => {
                                    if (this.props.unsavedStyle) {
                                        onToggleUnsavedStyleModal();
                                    } else {
                                        onCancelStyle();
                                    }}
                                },
                                {
                                    glyph: 'floppy-disk',
                                    tooltipId: "annotations.save",
                                    visible: true,
                                    onClick: () => {
                                        onSaveStyle();
                                        onSetUnsavedStyle(false);
                                    }}
                            ]}
                        />
                    </Col>
                </Row>
                <Row className="ms-style-header">
                    <Nav bsStyle="tabs" activeKey={stylerType} justified>
                        {this.renderStylerTAB(stylerTabs)}
                    </Nav>
                </Row>
                <Row>
                    <Col xs={12}>
                        {this.renderStylerBody(stylerType)}
                    </Col>
                </Row>
                </Grid>
        </div>);
    };

    renderBody = (editing) => {
        const items = this.getBodyItems(editing);
        if (items.length === 0) {
            return null;
        }
        return (
            <div className="mapstore-annotations-info-viewer-items">
                <Grid fluid>
                    {!this.props.coordinateEditorEnabled && <Row>
                        <Col xs={12}>
                            {items}
                        </Col>
                    </Row>
                    }
                    {this.props.coordinateEditorEnabled && <Row>
                        <Col xs={12}>
                            <GeometryEditor
                                drawing={this.props.drawing}
                                selected={this.props.selected}
                                completeGeometry={this.props.drawing}
                                onChange={this.props.onChangeSelected}
                                onChangeRadius={this.props.onChangeRadius}
                                onChangeText={this.props.onChangeText}
                            />
                        </Col>
                    </Row>}
                </Grid>
            </div>
        );
    };

    renderError = (editing) => {
        return editing ? (Object.keys(this.props.errors)
            .filter(field => this.getConfig().fields.filter(f => f.name === field).length === 0).map(field => this.renderErrorOn(field))) : null;
    };

    render() {
        if (this.props.closing ) {
            return (<Portal><ConfirmDialog
                    show
                    modal
                    onClose={this.props.onCancelClose}
                    onConfirm={this.props.onConfirmClose}
                    confirmButtonBSStyle="default"
                    closeGlyph="1-close"
                    confirmButtonContent={<Message msgId="annotations.confirm" />}
                    closeText={<Message msgId="annotations.cancel" />}>
                    <Message msgId="annotations.undo"/>
                </ConfirmDialog></Portal>);
        } else if (this.props.showUnsavedChangesModal) {
            return (<Portal><ConfirmDialog
                    show
                    modal
                    onClose={this.props.onToggleUnsavedChangesModal}
                    onConfirm={() => { this.props.onCancelEdit(); this.props.onToggleUnsavedChangesModal(); }}
                    confirmButtonBSStyle="default"
                    closeGlyph="1-close"
                    confirmButtonContent={<Message msgId="annotations.confirm" />}
                    closeText={<Message msgId="annotations.cancel" />}>
                    <Message msgId="annotations.undo"/>
                </ConfirmDialog></Portal>);
        } else if (this.props.showUnsavedStyleModal) {
            return (<Portal><ConfirmDialog
                    show
                    modal
                    onClose={this.props.onToggleUnsavedStyleModal}
                    onConfirm={() => { this.props.onCancelStyle(); this.props.onToggleUnsavedStyleModal(); }}
                    confirmButtonBSStyle="default"
                    closeGlyph="1-close"
                    confirmButtonContent={<Message msgId="annotations.confirm" />}
                    closeText={<Message msgId="annotations.cancel" />}>
                    <Message msgId="annotations.undo"/>
                </ConfirmDialog></Portal>);
        } else if (this.props.removing) {
            return (<Portal><ConfirmDialog
                show
                modal
                onClose={this.props.onCancelRemove}
                onConfirm={() => this.props.onConfirmRemove(this.props.removing)}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId={this.props.mode === 'editing' ? "annotations.removegeometry" : "annotations.removeannotation"}/>
                </ConfirmDialog></Portal>);
        }
        if (this.props.styling) {
            return this.renderStyler();
        }
        const editing = this.props.editing && (this.props.editing.properties.id === this.props.id);
        return (
            <div className="mapstore-annotations-info-viewer">
                {this.renderButtons(editing, this.props.coordinateEditorEnabled)}
                {this.props.drawingText && this.props.drawingText.show &&
                    (<Portal><ConfirmDialog
                        show
                        modal
                        title={<Message msgId="annotations.insertText" />}
                        confirmButtonDisabled={this.state.textValue === ""}
                        confirmButtonBSStyle="default"
                        onClose={this.props.onCancelText}
                        onConfirm={() => this.props.onSaveText(this.state.textValue)}
                        closeGlyph="1-close"
                        confirmButtonContent={<Message msgId="annotations.save" />}
                        closeText={<Message msgId="annotations.cancel" />}>
                        <Message msgId="Text"/>
                            <FormGroup className="mapstore-filter">
                                <InputGroup>
                                    <FormControl
                                        placeholder=""
                                        onChange={(evt) => {this.setState({textValue: evt.target.value}); }}
                                        type="text"/>
                                </InputGroup>
                            </FormGroup>
                    </ConfirmDialog></Portal>)}
                {this.renderError(editing)}
                {this.renderBody(editing)}
            </div>
        );
    }

    zoom = () => {
        const extent = bbox(this.props.feature);
        this.props.onZoom(extent, 'EPSG:4326', this.props.maxZoom);
    }

    cancelEdit = () => {
        this.props.onCancelEdit();
    };

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
        return this.props.onSetStyle(assign({}, this.props.editing.style, {
            "Point": {
                ...this.props.editing.style.Point,
                iconGlyph: option.value
            },
            "MultiPoint": {
                ...this.props.editing.style.MultiPoint,
                iconGlyph: option.value
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
        }, {}), this.props.editing.features ? {} : {
            geometry: 'annotations.emptygeometry'
        });

    };

    save = () => {
        const errors = this.validate();
        if (Object.keys(errors).length === 0) {
            this.props.onSave(this.props.id, assign({}, this.props.editedFields),
                this.props.editing.features, this.props.editing.style, this.props.editing.newFeature || false, this.props.editing.properties);
        } else {
            this.props.onError(errors);
        }
    };
}

module.exports = AnnotationsEditor;
