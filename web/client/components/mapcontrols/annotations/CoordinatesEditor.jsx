const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col, FormGroup, ControlLabel, FormControl, MenuItem, DropdownButton: DropdownButtonRB, Glyphicon: GlyphiconRB} = require('react-bootstrap');

const tooltip = require('../../misc/enhancers/tooltip');
const Glyphicon = tooltip(GlyphiconRB);
const DropdownButton = tooltip(DropdownButtonRB);
const {head, isNaN} = require('lodash');
const Toolbar = require('../../misc/toolbar/Toolbar');
const draggableContainer = require('../../misc/enhancers/draggableContainer');
const Message = require('../../I18N/Message');
const {validateCoords, coordToArray} = require('../../../utils/AnnotationsUtils');
const CoordinatesRow = require('../../misc/coordinateeditors/CoordinatesRow');
const MeasureEditor = require('./MeasureEditor');

/**
 * Geometry editor for annotation Features.
 * @memberof components.annotations
 * @class
 * @prop {object[]} components the data used as value in the CoordinatesRow
 * @prop {object} measureOptions options for the measure input
 * @prop {function} onSetInvalidSelected if the form becomes invalid, this will be triggered
 * @prop {function} onChange triggered on every coordinate change
 * @prop {function} onChangeText triggered every text change
 * @prop {function} onHighlightPoint triggered on mouse enter and leave and if polygons or linestring editor is opened
 * @prop {function} onChangeRadius triggered every radius change
 * @prop {function} onChangeFormat triggered every format change
 * @prop {boolean} isMouseEnterEnabled Flag used to run actions on mouseEnter the coord row
 * @prop {boolean} isMouseLeaveEnabled Flag used to run actions on mouseLeave the coord row
 * @prop {string} format decimal or aeronautical degree for coordinates
 * @prop {object} componentsValidation it contains parameters for validation of the form based on the types
 * @prop {object} transitionProps properties of the transition for drag component
 * @prop {object} properties of the GeoJSON feature being edited
 * @prop {string} type of the feature (Polygon, LineString, Point, Circle, Text)
 * @prop {string} isDraggable tells if the coordinate row is draggable
 *
*/
class CoordinateEditor extends React.Component {
    static propTypes = {
        components: PropTypes.array,
        measureOptions: PropTypes.object,
        onSetInvalidSelected: PropTypes.func,
        onChange: PropTypes.func,
        onChangeRadius: PropTypes.func,
        onHighlightPoint: PropTypes.func,
        onChangeText: PropTypes.func,
        onChangeFormat: PropTypes.func,
        format: PropTypes.string,
        aeronauticalOptions: PropTypes.object,
        componentsValidation: PropTypes.object,
        transitionProps: PropTypes.object,
        properties: PropTypes.object,
        type: PropTypes.string,
        isDraggable: PropTypes.bool,
        isMouseEnterEnabled: PropTypes.bool,
        isMouseLeaveEnabled: PropTypes.bool
    };

    static defaultProps = {
        components: [],
        measureOptions: {},
        onChange: () => {},
        onChangeRadius: () => {},
        onHighlightPoint: () => {},
        onChangeFormat: () => {},
        onChangeText: () => {},
        onSetInvalidSelected: () => {},
        componentsValidation: {
            "Bearing": {min: 2, max: 2, add: true, remove: true, validation: "validateCoordinates", notValid: "annotations.editor.notValidPolyline"},
            "Polygon": {min: 3, add: true, remove: true, validation: "validateCoordinates", notValid: "annotations.editor.notValidPolyline"},
            "LineString": {min: 2, add: true, remove: true, validation: "validateCoordinates", notValid: "annotations.editor.notValidPolyline"},
            "MultiPoint": {min: 2, add: true, remove: true, validation: "validateCoordinates", notValid: "annotations.editor.notValidPolyline"},
            "Point": {min: 1, max: 1, add: true, remove: false, validation: "validateCoordinates", notValid: "annotations.editor.notValidMarker"},
            "Circle": {min: 1, max: 1, add: true, remove: false, validation: "validateCircle", notValid: "annotations.editor.notValidCircle"},
            "Text": {min: 1, max: 1, add: true, remove: false, validation: "validateText", notValid: "annotations.editor.notValidText"}
        },
        transitionProps: {
            transitionName: "switch-panel-transition",
            transitionEnterTimeout: 300,
            transitionLeaveTimeout: 300
        },
        isDraggable: true,
        isMouseEnterEnabled: false,
        isMouseLeaveEnabled: false,
        properties: {}
    };

    getValidationStateText = (text) => {
        if (!text) {
            return "error";
        }
        return null; // "success"
    }
    getValidationStateRadius = (radius) => {
        const r = parseFloat(radius);
        if (isNaN(r)) {
            return "error";
        }
        return null; // "success"
    }

    renderCircle() {
        return (<Row style={{flex: 1, overflowY: 'auto'}}>
            <Col xs={12}>
                <FormGroup validationState={this.getValidationStateRadius(this.props.properties.radius)}>
                    <ControlLabel><Message msgId="annotations.editor.radius"/></ControlLabel>
                    <MeasureEditor
                        placeholder="radius"
                        {...this.props.measureOptions}
                        value={this.props.properties.radius}
                        name="radius"
                        onChange={radius => {
                            if (this.isValid(this.props.components, radius )) {
                                this.props.onChangeRadius(parseFloat(radius), this.props.components.map(coordToArray));
                            } else if (radius !== "") {
                                this.props.onChangeRadius(parseFloat(radius), []);
                            } else {
                                this.props.onChangeRadius(null, this.props.components.map(coordToArray));
                                this.props.onSetInvalidSelected("radius", this.props.components.map(coordToArray));
                            }
                        }}
                        step={1}
                        type="number"/>
                </FormGroup>
            </Col>
        </Row>);
    }
    renderText() {
        return (<Row style={{flex: 1, overflowY: 'auto'}}>
            <Col xs={12}>
                <FormGroup validationState={this.getValidationStateText(this.props.properties.valueText)}>
                    <ControlLabel><Message msgId="annotations.editor.text"/></ControlLabel>
                    <FormControl
                        value={this.props.properties.valueText}
                        name="text"
                        placeholder="text value"
                        onChange={e => {
                            const valueText = e.target.value;
                            if (this.isValid(this.props.components, valueText )) {
                                this.props.onChangeText(valueText, this.props.components.map(coordToArray));
                            } else if (valueText !== "") {
                                this.props.onChangeText(valueText, this.props.components.map(coordToArray));
                            } else {
                                this.props.onChangeText("", this.props.components.map(coordToArray));
                                this.props.onSetInvalidSelected("text", this.props.components.map(coordToArray));
                            }
                        }}
                        type="text"/>
                </FormGroup>
            </Col>
        </Row>);
    }
    render() {
        const {componentsValidation, type} = this.props;
        const actualComponents = [...this.props.components];
        const actualValidComponents = actualComponents.filter(validateCoords);
        const allValidComponents = actualValidComponents.length === actualComponents.length;
        const validationCompleteButton = this[componentsValidation[type].validation]() && allValidComponents;
        const formats = [{
                value: 'decimal',
                text: <Message msgId="annotations.editor.decimal"/>
            }, {
                value: 'aeronautical',
                text: <Message msgId="annotations.editor.aeronautical"/>
            }];

        const buttons = [
            {
                glyph: validationCompleteButton ? 'ok-sign text-success' : 'exclamation-mark text-danger',
                tooltipId: validationCompleteButton ? 'annotations.editor.valid' : componentsValidation[type].notValid,
                visible: true
            }, {
            Element: () => (
                <DropdownButton
                    noCaret
                    title={<Glyphicon glyph="cog"/>}
                    pullRight
                    className="square-button-md no-border"
                    tooltip="Format">
                    {formats.map(({text, value}) => <MenuItem
                        active={this.props.format === value}
                        key={value}
                        onClick={() => this.props.onChangeFormat(value)}>{text}</MenuItem>)}
                </DropdownButton>
                )
            },
            {
                glyph: 'plus',
                tooltipId: 'annotations.editor.add',
                visible: componentsValidation[type].add && componentsValidation[type].max ? this.props.components.length !== componentsValidation[type].max : true,
                onClick: () => {
                    let tempComps = [...this.props.components];
                    tempComps = tempComps.concat([{lat: "", lon: ""}]);
                    if (this.props.type === "Polygon") {
                        tempComps = this.addCoordPolygon(tempComps);
                    }
                    this.props.onChange(tempComps, this.props.properties.radius, this.props.properties.valueText);
                }
            }
        ];
        const toolbarVisible = !!buttons.filter(b => b.visible).length;
        return (
            <Grid fluid style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <Row style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                    <Col xs={toolbarVisible ? 6 : 12}>
                        <h5><Message msgId={"annotations.editor.title." + this.props.type}/></h5>
                    </Col>
                    <Col xs={6}>
                        <Toolbar
                            btnGroupProps={{ className: 'pull-right' }}
                            btnDefaultProps={{ className: 'square-button-md no-border'}}
                            buttons={buttons}/>
                    </Col>
                </Row>
                {this.props.type === "Circle" && this.renderCircle()}
                {this.props.type === "Text" && this.renderText()}
                {
                    this.props.type === "Circle" && <Row style={{flex: 1, overflowY: 'auto'}}>
                        <Col xs={12}>
                            <ControlLabel><Message msgId={"annotations.editor.center"}/></ControlLabel>
                        </Col>
                    </Row>
                }
                 {!(!this.props.components || this.props.components.length === 0) &&
                     <Row style={{flex: 1, overflowY: 'auto'}}>
                        <Col xs={5} xsOffset={1}>
                            <Message msgId="annotations.editor.lat"/>
                        </Col>
                        <Col xs={5}>
                            <Message msgId="annotations.editor.lon"/>
                        </Col>
                        <Col xs={1}/>
                    </Row>}
                <Row style={{flex: 1, flexBasis: 'auto', overflowY: 'auto', overflowX: 'hidden'}}>
                    {this.props.components.map((component, idx) => <CoordinatesRow
                        format={this.props.format}
                        aeronauticalOptions={this.props.aeronauticalOptions}
                        sortId={idx}
                        key={idx + " key"}
                        isDraggable={this.props.isDraggable && componentsValidation[type].remove && this[componentsValidation[type].validation]()}
                        formatVisible={false}
                        removeVisible={componentsValidation[type].remove}
                        removeEnabled={this[componentsValidation[type].validation](this.props.components, componentsValidation[type].remove, idx)}
                        onChange={this.change}
                        onMouseEnter={(val) => {
                            if (this.props.isMouseEnterEnabled || this.props.type === "LineString" || this.props.type === "Polygon" || this.props.type === "MultiPoint") {
                                this.props.onHighlightPoint(val);
                            }
                        }}
                        onMouseLeave={() => {
                            if (this.props.isMouseLeaveEnabled || this.props.type === "LineString" || this.props.type === "Polygon" || this.props.type === "MultiPoint") {
                                this.props.onHighlightPoint(null);
                            }
                        }}
                        onSort={(targetId, currentId) => {
                            const components = this.props.components.reduce((allCmp, cmp, id) => {
                                if (targetId === id) {
                                    return targetId > currentId ?
                                        [...allCmp, {...cmp}, head(this.props.components.filter((cm, i) => i === currentId))]
                                        :
                                        [...allCmp, head(this.props.components.filter((cm, i) => i === currentId)), {...cmp}];
                                }
                                if (currentId === id) {
                                    return [...allCmp];
                                }
                                return [...allCmp, {...cmp}];
                            }, []).filter(val => val);

                            if (this.isValid(components)) {
                                const validComponents = this.addCoordPolygon(components);
                                this.props.onChange(validComponents);
                            } else if (this.props.properties.isValidFeature) {
                                this.props.onSetInvalidSelected("coords", this.props.components.map(coordToArray));
                            }
                        }}
                        idx={idx}
                        component={component}
                        onRemove={() => {
                            const components = this.props.components.filter((cmp, i) => i !== idx);
                            if (this.isValid(components)) {
                                const validComponents = this.addCoordPolygon(components);
                                if (this.props.isMouseEnterEnabled || this.props.type === "LineString" && idx !== components.length || this.props.type === "Polygon") {
                                    this.props.onHighlightPoint(components[idx]);
                                } else {
                                    this.props.onHighlightPoint(null);
                                }
                                this.props.onChange(validComponents);
                            } else if (this.props.properties.isValidFeature) {
                                this.props.onSetInvalidSelected("coords", this.props.components.map(coordToArray));
                            }
                        }}/>)}
                </Row>
                 {(!this.props.components || this.props.components.length === 0) &&
                     <Row><Col xs={12} className="text-center" style={{padding: 15, paddingBottom: 30}}>
                         <i><Message msgId="annotations.editor.addByClick"/></i>
                     </Col></Row>}
            </Grid>
        );
    }
    validateCoordinates = (components = this.props.components, remove = false, idx) => {
        if (components && components.length) {
            const validComponents = components.filter(validateCoords);

            if (remove) {
                return validComponents.length > this.props.componentsValidation[this.props.type].min ||
                // if there are at least the min number of valid points, then you can delete the other invalid ones
                validComponents.length >= this.props.componentsValidation[this.props.type].min && !validateCoords(components[idx]);
            }
            return validComponents.length >= this.props.componentsValidation[this.props.type].min;
        }
        return false;
    }
    validateCircle = (components = this.props.components, remove, radius = this.props.properties.radius) => {
        if (components && components.length) {
            const cmp = head(components);
            return !isNaN(parseFloat(radius)) && validateCoords(cmp);
        }
        return false;
    }
    validateText = (components = this.props.components, remove, valueText = this.props.properties.valueText) => {
        if (components && components.length) {
            const cmp = head(components);
            return !!valueText && validateCoords(cmp);
        }
        return false;
    }
    isValid = (components = this.props.components, val) => {
        return this[this.props.componentsValidation[this.props.type].validation](components, false, val);
    }
    addCoordPolygon = (components) => {
        if (this.props.type === "Polygon") {
            const validComponents = components.filter(validateCoords);
            return components.concat([validComponents.length ? validComponents[0] : {lat: "", lon: ""}]);
        }
        return components;
    }
    change = (id, key, value) => {
        let tempComps = this.props.components;
        tempComps[id][key] = isNaN(parseFloat(value)) ? "" : parseFloat(value);
        let validComponents = this.addCoordPolygon(tempComps);
        this.props.onChange(validComponents, this.props.properties.radius, this.props.properties.valueText);
        if (!this.isValid(tempComps)) {
            if (this.props.isMouseLeaveEnabled || this.props.type === "LineString" || this.props.type === "Polygon") {
                this.props.onHighlightPoint(null);
            }
            this.props.onSetInvalidSelected("coords", tempComps.map(coordToArray));
        } else {
            if (this.props.isMouseEnterEnabled || this.props.type === "LineString" || this.props.type === "Polygon") {
                this.props.onHighlightPoint(tempComps[id]);
            }
        }
    }
}

module.exports = draggableContainer(CoordinateEditor);
