/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');

const {Button, Glyphicon} = require('react-bootstrap');
const TButton = require('../../data/featuregrid/toolbars/TButton');

const Message = require('../../I18N/Message');

const {FormControl, ButtonGroup, Grid, Row, Col} = require('react-bootstrap');

const ReactQuill = require('react-quill');
require('react-quill/dist/quill.snow.css');

const {isFunction} = require('lodash');

const assign = require('object-assign');

const Select = require('react-select');

const PluginsUtils = require('../../../utils/PluginsUtils');
const MarkerUtils = require('../../../utils/MarkerUtils');

const defaultIcon = MarkerUtils.extraMarkers.icons[0];
const defaultMarkers = MarkerUtils.extraMarkers.shapes.map((s) => ({
    name: s,
    markers: MarkerUtils.extraMarkers.colors.map((m) => ({
        name: m,
        width: MarkerUtils.extraMarkers.size[0],
        height: MarkerUtils.extraMarkers.size[1],
        offsets: MarkerUtils.extraMarkers.getOffsets(m, s),
        style: {
            color: m,
            shape: s
        }
    }))
}));

const glyphs = Object.keys(MarkerUtils.getGlyphs('fontawesome'));

/**
 * Identify Viewer customized for Annotations.
 * @memberof components.mapControls.annotations
 * @class
 * @prop {string} id identifier of the current annotation feature
 * @prop {object[]} fields (configurable) list of fields managed by the annotations viewer / editor; each element is an
 * object with the following properties:
 *  - name: name of the property in the underlying feature object
 *  - type: type of value, chooses the type of rendering and editing component (currently supported types are text and html)
 *  - showLabel: (true/false) wether we have to show the label or only the value
 *  - editable: wether the user can edit the field or not
 *  - validator: function that returns true if the current field value is valid
 *  - validateError: id for translations of the validation error to show in case of failed validation
 * @prop {object} editing feature object of the feature under editing (when editing mode is enabled, null otherwise)
 * @prop {boolean} drawing flag to state status of drawing during editing
 * @prop {boolean} styling flag to state status of styling during editing
 * @prop {object} errors key/value set of validation errors (field_name: error_id)
 * @prop {object[]} markers list of markers to be used for styling (defaults to using the extra-markers lib {@link https://github.com/coryasilva/Leaflet.ExtraMarkers})
 * @prop {string} markerIcon default marker icon image (sprite), defaults to image from the extra-markers lib {@link https://github.com/coryasilva/Leaflet.ExtraMarkers}
 * @prop {function} onEdit triggered when the user clicks on the edit button
 * @prop {function} onCancelEdit triggered when the user cancels current editing session
 * @prop {function} onCancelStyle triggered when the user cancels style selection
 * @prop {function} onRemove triggered when the user clicks on the remove button
 * @prop {function} onSave triggered when the user clicks on the save button
 * @prop {function} onError triggered when a validation error occurs
 * @prop {function} onAddGeometry triggered when the user clicks on the add point button
 * @prop {function} onDeleteGeometry triggered when the user clicks on the remove points button
 * @prop {function} onStyleGeometry triggered when the user clicks on the style button
 * @prop {function} onSetStyle triggered when the user changes a style property
 *
 * In addition, as the Identify viewer interface mandates, every feature attribute is mapped as a component property.
 */
class AnnotationsInfoViewer extends React.Component {
    static displayName = 'AnnotationsInfoViewer';

    static propTypes = {
        id: PropTypes.string,
        onEdit: PropTypes.func,
        onCancelEdit: PropTypes.func,
        onCancelStyle: PropTypes.func,
        onRemove: PropTypes.func,
        onSave: PropTypes.func,
        onSaveStyle: PropTypes.func,
        onError: PropTypes.func,
        onAddGeometry: PropTypes.func,
        onDeleteGeometry: PropTypes.func,
        onStyleGeometry: PropTypes.func,
        onSetStyle: PropTypes.func,
        fields: PropTypes.array,
        editing: PropTypes.object,
        drawing: PropTypes.bool,
        styling: PropTypes.bool,
        errors: PropTypes.object,
        markers: PropTypes.array,
        markerIcon: PropTypes.string
    };

    static defaultProps = {
        fields: [
            {
                name: 'title',
                type: 'text',
                validator: (val) => val,
                validateError: 'annotations.mandatory',
                showLabel: false,
                editable: true
            },
            {
                name: 'description',
                type: 'html',
                showLabel: true,
                editable: true
            }
        ],
        markers: defaultMarkers,
        markerIcon: defaultIcon,
        errors: {}
    };

    state = {
        editedFields: {}
    };

    componentWillReceiveProps(newProps) {
        if (newProps.id !== this.props.id) {
            this.setState({
                editedFields: {}
            });
        }
    }

    getBodyItems = (editing) => {
        return this.props.fields
            .filter((field) => !editing || field.editable)
            .map((field) => {
                const isError = editing && this.props.errors[field.name];
                const additionalCls = isError ? 'field-error' : '';
                return (
                    <span><p key={field.name} className={"mapstore-annotations-info-viewer-item mapstore-annotations-info-viewer-" + field.name + ' ' + additionalCls}>
                        {field.showLabel ? <b><Message msgId={"annotations.field." + field.name}/></b> : null} {this.renderProperty(field, this.props[field.name], editing)}
                    </p>
                    {isError ? this.renderErrorOn(field.name) : ''}
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
        return (<ButtonGroup id="mapstore-annotations-info-viewer-buttons">
                <Button bsStyle="primary" onClick={() => this.props.onEdit(this.props.id)}><Glyphicon glyph="pencil"/>&nbsp;<Message msgId="annotations.edit"/></Button>
                <Button bsStyle="primary" onClick={() => this.props.onRemove(this.props.id)}><Glyphicon glyph="ban-circle"/>&nbsp;<Message msgId="annotations.remove"/></Button>
            </ButtonGroup>);
    };

    renderEditingButtons = () => {
        return (<Grid fluid>
                    <Row>
                        <Col xs={7}>
                            <TButton
                                id="edit-geometry"
                                tooltip={<Message msgId="annotations.addMarker"/>}
                                onClick={this.props.onAddGeometry}
                                visible
                                className="square-button-md"
                                active={this.props.drawing}
                                glyph="pencil-add"/>
                            <TButton
                                id="style-annotation-geometry"
                                tooltip={<Message msgId="annotations.styleGeometry"/>}
                                onClick={this.props.onStyleGeometry}
                                visible
                                className="square-button-md"
                                glyph="1-stilo"/>
                            <TButton
                                id="delete-annotation-geometry"
                                tooltip={<Message msgId="annotations.deleteGeometry"/>}
                                onClick={this.props.onDeleteGeometry}
                                visible
                                className="square-button-md"
                                glyph="trash"/>
                        </Col>
                        <Col xs={5}>
                            <ButtonGroup id="mapstore-annotations-info-viewer-edit-buttons">
                                <Button bsStyle="primary" onClick={this.save}><Glyphicon glyph="floppy-disk"/>&nbsp;<Message msgId="annotations.save"/></Button>
                                <Button bsStyle="primary" onClick={this.cancelEdit}><Glyphicon glyph="remove"/>&nbsp;<Message msgId="annotations.cancel"/></Button>
                            </ButtonGroup>
                        </Col>
            </Row>
        </Grid>);
    };

    renderButtons = (editing) => {
        return editing ? this.renderEditingButtons() : this.renderViewButtons();
    };

    renderProperty = (field, prop, editing) => {
        const fieldValue = this.state.editedFields[field.name] === undefined ? prop : this.state.editedFields[field.name];
        if (editing) {
            switch (field.type) {
                case 'html':
                    return <ReactQuill value={fieldValue} onChange={(val) => this.change(field.name, val)}/>;
                default:
                    return <FormControl value={fieldValue} onChange={(e) => this.change(field.name, e.target.value)}/>;
            }

        }
        switch (field.type) {
            case 'html':
                return <span dangerouslySetInnerHTML={{__html: fieldValue} }/>;
            default:
                return fieldValue;
        }
    };

    renderErrorOn = (field) => {
        return <div className="annotations-edit-error"><Message msgId={this.props.errors[field]}/></div>;
    };

    renderMarkers = (markers, prefix = '') => {
        return markers.map((marker) => {
            if (marker.markers) {
                return <div className={"mapstore-annotations-info-viewer-marker-group mapstore-annotations-info-viewer-marker-" + prefix + marker.name}>{this.renderMarkers(marker.markers, marker.name + '-')}</div>;
            }
            return (<div onClick={() => this.selectStyle(marker)} className={"mapstore-annotations-info-viewer-marker mapstore-annotations-info-viewer-marker-" + prefix + marker.name + (this.isCurrentStyle(marker) ? " mapstore-annotations-info-viewer-marker-selected" : "")} style={{
                backgroundImage: "url(" + this.props.markerIcon + ")",
                width: marker.width + "px",
                height: marker.height + "px",
                backgroundPositionX: marker.offsets[0],
                backgroundPositionY: marker.offsets[1],
                cursor: "pointer"
            }}/>);
        });
    };

    renderStyler = () => {
        const glyphRenderer = (option) => (<div><span className={"fa fa-" + option.value}/><span> {option.label}</span></div>);
        return (<div className="mapstore-annotations-info-viewer-styler">
            <div className="mapstore-annotations-info-viewer-markers">{this.renderMarkers(this.props.markers)}</div>
            <Select
                options={glyphs.map(g => ({
                    label: g,
                    value: g
                }))}
                optionRenderer={glyphRenderer}
                valueRenderer={glyphRenderer}
                value={this.props.editing.style.iconGlyph}
                onChange={this.selectGlyph}/>
            <div className="mapstore-annotations-info-viewer-styler-buttons"><Button bsStyle="primary" onClick={this.props.onSaveStyle}><Glyphicon glyph="floppy-disk"/>&nbsp;<Message msgId="annotations.save"/></Button><Button bsStyle="primary" onClick={this.props.onCancelStyle}><Glyphicon glyph="remove"/>&nbsp;<Message msgId="annotations.cancel"/></Button></div>
        </div>);
    };

    renderBody = (editing) => {
        const items = this.getBodyItems(editing);
        if (items.length === 0) {
            return null;
        }
        return (
            <div className="mapstore-annotations-info-viewer-items">
                {items}
            </div>
        );
    };

    renderError = (editing) => {
        return editing ? Object.keys(this.props.errors).filter(field => this.props.fields.filter(f => f.name === field).length === 0).map(field => this.renderErrorOn(field)) : null;
    };

    render() {
        if (this.props.styling) {
            return this.renderStyler();
        }

        const editing = this.props.editing && (this.props.editing.properties.id === this.props.id);
        return (
            <div className="mapstore-annotations-info-viewer">
                {this.renderBody(editing)}
                {this.renderError(editing)}
                {this.renderButtons(editing)}
            </div>
        );
    }

    cancelEdit = () => {
        this.setState({
            editedFields: {}
        });
        this.props.onCancelEdit();
    };

    change = (field, value) => {
        this.setState({
            editedFields: assign({}, this.state.editedFields, {
                [field]: value
            })
        });
    };

    isCurrentStyle = (m) => {
        return MarkerUtils.extraMarkers.matches(this.props.editing.style, m.style);
    };

    selectStyle = (marker) => {
        return this.props.onSetStyle(assign(MarkerUtils.extraMarkers.getStyle(marker.style), {
            iconGlyph: this.props.editing.style.iconGlyph
        }));
    };

    selectGlyph = (option) => {
        return this.props.onSetStyle(assign({}, this.props.editing.style, {
            iconGlyph: option.value
        }));
    };

    validate = () => {
        return assign(this.props.fields.filter(field => field.editable).reduce((previous, field) => {
            const value = this.state.editedFields[field.name] === undefined ? this.props[field.name] : this.state.editedFields[field.name];
            if (field.validator && !this.getValidator(field.validator)(value)) {
                return assign(previous, {
                    [field.name]: field.validateError
                });
            }
            return previous;
        }, {}), this.props.editing.geometry ? {} : {
            geometry: 'annotations.emptygeometry'
        });

    };

    save = () => {
        const errors = this.validate();
        if (Object.keys(errors).length === 0) {
            this.props.onSave(this.props.id, assign({}, this.state.editedFields),
                this.props.editing.geometry, this.props.editing.style);
        } else {
            this.props.onError(errors);
        }
    };
}

module.exports = AnnotationsInfoViewer;
