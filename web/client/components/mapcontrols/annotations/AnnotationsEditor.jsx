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
 * @prop {function} onCancelStyle triggered when the user cancels style selection
 * @prop {function} onRemove triggered when the user clicks on the remove button
 * @prop {function} onSave triggered when the user clicks on the save button
 * @prop {function} onError triggered when a validation error occurs
 * @prop {function} onAddGeometry triggered when the user clicks on the add point button
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
        onCancel: PropTypes.func,
        onRemove: PropTypes.func,
        onSave: PropTypes.func,
        onSaveStyle: PropTypes.func,
        onError: PropTypes.func,
        onAddGeometry: PropTypes.func,
        onDeleteGeometry: PropTypes.func,
        onStyleGeometry: PropTypes.func,
        onSetStyle: PropTypes.func,
        onZoom: PropTypes.func,
        editing: PropTypes.object,
        drawing: PropTypes.bool,
        styling: PropTypes.bool,
        errors: PropTypes.object,
        showBack: PropTypes.bool,
        config: PropTypes.object,
        feature: PropTypes.object,
        maxZoom: PropTypes.number
    };

    static defaultProps = {
        config: defaultConfig,
        errors: {},
        showBack: false,
        feature: {},
        maxZoom: 18
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

    componentWillUpdate(newProps) {
        const editing = this.props.editing && (this.props.editing.properties.id === this.props.id);
        const newEditing = newProps.editing && (newProps.editing.properties.id === newProps.id);

        if (!editing && newEditing) {
            const newConfig = assign({}, defaultConfig, newProps.config);
            this.setState({
                editedFields: newConfig.fields
                    .reduce((a, field) => {
                        return assign({}, a, { [field.name]: newProps[field.name] });
                    }, {})
            });
        }
    }

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
                    <span><p key={field.name} className={"mapstore-annotations-info-viewer-item mapstore-annotations-info-viewer-" + field.name + ' ' + additionalCls}>
                        {field.showLabel ? <label><Message msgId={"annotations.field." + field.name}/></label> : null}
                        {isError ? this.renderErrorOn(field.name) : ''}
                        {this.renderProperty(field, this.props[field.name] || field.value, editing)}
                    </p>
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
        return (<ButtonGroup className="mapstore-annotations-info-viewer-buttons">
                <Button bsStyle="primary" onClick={this.zoom}><Glyphicon glyph="zoom-to" />&nbsp;<Message msgId="annotations.zoomTo" /></Button>
                <Button bsStyle="primary" onClick={() => this.props.onEdit(this.props.id, this.props.config.multiGeometry ? 'MultiPoint' : 'Point')}><Glyphicon glyph="pencil"/>&nbsp;<Message msgId="annotations.edit"/></Button>
                <Button bsStyle="primary" onClick={() => this.props.onRemove(this.props.id)}><Glyphicon glyph="ban-circle"/>&nbsp;<Message msgId="annotations.remove"/></Button>
                {this.props.showBack ? <Button bsStyle="primary" onClick={() => this.props.onCancel()}><Glyphicon glyph="back"/>&nbsp;<Message msgId="annotations.back"/></Button> : null }
            </ButtonGroup>);
    };

    renderEditingButtons = () => {
        return (<Grid className="mapstore-annotations-info-viewer-buttons" fluid>
                    <Row>
                        <Col xs={7}>
                            <TButton
                                id="edit-geometry"
                                tooltip={<Message msgId="annotations.addMarker"/>}
                                onClick={this.props.onAddGeometry}
                                visible
                                disabled={!this.props.config.multiGeometry && this.props.editing && this.props.editing.geometry}
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
                    return <ReactQuill readOnly={this.props.drawing} value={fieldValue || ''} onChange={(val) => this.change(field.name, val)}/>;
                case 'component':
                    const Component = fieldValue;
                    return <prop editing value={<Component annotation={this.props.feature} />} onChange={(e) => this.change(field.name, e.target.value)} />;
                default:
                    return <FormControl disabled={this.props.drawing} value={fieldValue || ''} onChange={(e) => this.change(field.name, e.target.value)}/>;
            }

        }
        switch (field.type) {
            case 'html':
                return <span dangerouslySetInnerHTML={{__html: fieldValue} }/>;
            case 'component':
                const Component = fieldValue;
                return <Component annotation={this.props.feature} />;
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

    renderStyler = () => {
        const glyphRenderer = (option) => (<div><span className={"fa fa-" + option.value}/><span> {option.label}</span></div>);
        return (<div className="mapstore-annotations-info-viewer-styler">
            <div className="mapstore-annotations-info-viewer-styler-buttons">
                <Button bsStyle="primary" onClick={this.props.onSaveStyle}><Glyphicon glyph="floppy-disk"/>&nbsp;<Message msgId="annotations.save"/></Button>
                <Button bsStyle="primary" onClick={this.props.onCancelStyle}><Glyphicon glyph="remove"/>&nbsp;<Message msgId="annotations.cancel"/></Button>
            </div>
            <div className="mapstore-annotations-info-viewer-markers">{this.renderMarkers(this.getConfig().markers)}</div>
            <Select
                options={this.getConfig().glyphs.map(g => ({
                    label: g,
                    value: g
                }))}
                optionRenderer={glyphRenderer}
                valueRenderer={glyphRenderer}
                value={this.props.editing.style.iconGlyph}
                onChange={this.selectGlyph}/>
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
        return editing ? (Object.keys(this.props.errors)
            .filter(field => this.getConfig().fields.filter(f => f.name === field).length === 0).map(field => this.renderErrorOn(field))) : null;
    };

    render() {
        if (this.props.styling) {
            return this.renderStyler();
        }

        const editing = this.props.editing && (this.props.editing.properties.id === this.props.id);
        return (
            <div className="mapstore-annotations-info-viewer">
                {this.renderButtons(editing)}
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
        return this.getConfig().markersConfig.matches(this.props.editing.style, m.style);
    };

    selectStyle = (marker) => {
        return this.props.onSetStyle(assign(this.getConfig().markersConfig.getStyle(marker.style), {
            iconGlyph: this.props.editing.style.iconGlyph
        }));
    };

    selectGlyph = (option) => {
        return this.props.onSetStyle(assign({}, this.props.editing.style, {
            iconGlyph: option.value
        }));
    };

    validate = () => {
        return assign(this.getConfig().fields.filter(field => field.editable).reduce((previous, field) => {
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
                this.props.editing.geometry, this.props.editing.style, this.props.editing.newFeature || false);
        } else {
            this.props.onError(errors);
        }
    };
}

module.exports = AnnotationsEditor;
