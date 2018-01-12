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
const {Glyphicon, Button, ButtonGroup} = require('react-bootstrap');
const {head} = require('lodash');
const assign = require('object-assign');
const Filter = require('../../misc/Filter');

const defaultConfig = require('./AnnotationsConfig');

/**
 * Annotations panel component.
 * It can be in different modes:
 *  - list: when showing the current list of annotations on the map
 *  - detail: when showing a detail of a specific annotation
 *  - editing: when editing an annotation
 * When in list mode, the list of current map annotations is shown, with:
 *  - summary card for each annotation, with full detail show on click
 *  - new annotation Button
 *  - filtering widget
 * When in detail mode the configured editor is shown on the selected annotation, in viewer mode.
 * When in editing mode the configured editor is shown on the selected annotation, in editing mode.
 *
 * It also handles removal confirmation modals
 * @memberof components.mapControls.annotations
 * @class
 * @prop {boolean} closing user asked for closing panel when editing
 * @prop {object} editing annotation object currently under editing (null if we are not in editing mode)
 * @prop {object} removing object to remove, it is also a flag that means we are currently asking for removing an annotation / geometry. Toggles visibility of the confirm dialog
 * @prop {string} mode current mode of operation (list, editing, detail)
 * @prop {object} editor editor component, used in detail and editing modes
 * @prop {object[]} annotations list of annotations objects to list
 * @prop {string} current id of the annotation currently shown in the editor (when not in list mode)
 * @prop {object} config configuration object, where overridable stuff is stored (fields config for annotations, marker library, etc.) {@link #components.mapControls.annotations.AnnotationsConfig}
 * @prop {string} filter current filter entered by the user
 * @prop {function} onCancelRemove triggered when the user cancels removal
 * @prop {function} onConfirmRemove triggered when the user confirms removal
 * @prop {function} onCancelClose triggered when the user cancels closing
 * @prop {function} onConfirmClose triggered when the user confirms closing
 * @prop {function} onAdd triggered when the user clicks on the new annotation button
 * @prop {function} onHighlight triggered when the mouse hovers an annotation card
 * @prop {function} onCleanHighlight triggered when the mouse is out of any annotation card
 * @prop {function} onDetail triggered when the user clicks on an annotation card
 * @prop {function} onFilter triggered when the user enters some text in the filtering widget
 * @prop {function} classNameSelector optional selector to assign custom a CSS class to annotations, based on
 * the annotation's attributes.
 */
class Annotations extends React.Component {
    static propTypes = {
        closing: PropTypes.bool,
        editing: PropTypes.object,
        removing: PropTypes.object,
        onCancelRemove: PropTypes.func,
        onConfirmRemove: PropTypes.func,
        onCancelClose: PropTypes.func,
        onConfirmClose: PropTypes.func,
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
        classNameSelector: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        mode: 'list',
        config: defaultConfig,
        classNameSelector: () => ''
    };

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

    renderThumbnail = (style) => {
        const marker = this.getConfig().getMarkerFromStyle(style);
        return (<div className={"mapstore-annotations-panel-card-thumbnail-" + marker.name} style={marker.thumbnailStyle}>
            <span className={"mapstore-annotations-panel-card-thumbnail " + this.getConfig().getGlyphClassName(style)}>
        </span></div>);
    };

    renderCard = (annotation) => {
        return (<div className={"mapstore-annotations-panel-card " + this.props.classNameSelector(annotation)} onMouseOver={() => this.props.onHighlight(annotation.properties.id)} onMouseOut={this.props.onCleanHighlight} onClick={() => this.props.onDetail(annotation.properties.id)}>
            <span className="mapstore-annotations-panel-card-thumbnail">{this.renderThumbnail(annotation.style)}</span>
            {this.getConfig().fields.map(f => this.renderField(f, annotation))}
        </div>);
    };

    renderCards = () => {
        const annotation = this.props.annotations && head(this.props.annotations.filter(a => a.properties.id === this.props.current));
        if (this.props.mode === 'list') {
            return [<ButtonGroup id="mapstore-annotations-panel-buttons">
                <Button bsStyle="primary" onClick={() => this.props.onAdd(this.props.config.multiGeometry ? 'MultiPoint' : 'Point')}><Glyphicon glyph="plus"/>&nbsp;<Message msgId="annotations.add"/></Button>
            </ButtonGroup>,
            <Filter
                filterPlaceholder={LocaleUtils.getMessageById(this.context.messages, "annotations.filter")}
                filterText={this.props.filter}
                onFilter={this.props.onFilter}/>,
            <div className="mapstore-annotations-panel-cards">{this.props.annotations.filter(this.applyFilter).map(a => this.renderCard(a))}</div>
            ];
        }
        const Editor = this.props.editor;
        if (this.props.mode === 'detail') {
            return <Editor feature={annotation} showBack id={this.props.current} config={this.props.config} {...annotation.properties}/>;
        }
        // mode = editing
        return this.props.editing && <Editor feature={annotation} id={this.props.editing.properties.id} config={this.props.config} {...this.props.editing.properties}/>;
    };

    render() {
        if (this.props.closing) {
            return (<ConfirmDialog
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
        }
        if (this.props.removing) {
            return (<ConfirmDialog
                show
                modal
                onClose={this.props.onCancelRemove}
                onConfirm={() => this.props.onConfirmRemove(this.props.removing)}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId={this.props.mode === 'editing' ? "annotations.removegeometry" : "annotations.removeannotation"}/>
                </ConfirmDialog>);
        }
        return (<div className="mapstore-annotations-panel">
            {this.renderCards()}
        </div>);
    }

    applyFilter = (annotation) => {
        return !this.props.filter || this.getConfig().fields.reduce((previous, field) => {
            return (annotation.properties[field.name] || '').toUpperCase().indexOf(this.props.filter.toUpperCase()) !== -1 || previous;
        }, false);
    };
}

module.exports = Annotations;
