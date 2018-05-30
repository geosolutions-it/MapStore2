const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col, FormGroup, ControlLabel, FormControl} = require('react-bootstrap');
const {/*isEqual,*/ head, isNaN} = require('lodash');
const Toolbar = require('../../misc/toolbar/Toolbar');
const draggableContainer = require('../../misc/enhancers/draggableContainer');
const {validateCoords} = require('../../../utils/AnnotationsUtils');
const CoordinatesRow = require('./CoordinatesRow');
let cnt = 0;

class CoordinateEditor extends React.Component {
    static propTypes = {
        id: PropTypes.number,
        components: PropTypes.array,
        onRemove: PropTypes.func,
        onlyRows: PropTypes.bool,
        onChange: PropTypes.func,
        onComplete: PropTypes.func,
        onChangeRadius: PropTypes.func,
        onSetInvalidSelected: PropTypes.func,
        onChangeText: PropTypes.func,
        componentsValidation: PropTypes.object,
        transitionProps: PropTypes.object,
        properties: PropTypes.object,
        type: PropTypes.string,
        isDraggable: PropTypes.bool,
        completeGeometry: PropTypes.bool
    };

    static defaultProps = {
        id: 0,
        components: [],
        onRemove: null,
        onlyRows: false,
        onComplete: () => {},
        onChangeRadius: () => {},
        onSetInvalidSelected: () => {},
        onChangeText: () => {},
        onChange: () => {},
        componentsValidation: {
            "Polygon": {min: 3, add: true, remove: true, validation: "validateCoordinates", notValid: "Add 3 valid coordinates to complete the Polygon"},
            "LineString": {min: 2, add: true, remove: true, validation: "validateCoordinates", notValid: "Add 2 valid coordinates to complete the Polyline"},
            "Point": {min: 1, add: false, remove: false, validation: "validateCoordinates", notValid: "Add a valid coordinate to complete the Point"},
            "Circle": {add: false, remove: false, validation: "validateCircle", notValid: "Add a valid coordinate and a radius (m) to complete the Circle"},
            "Text": {add: false, remove: false, validation: "validateText", notValid: "Add a valid coordinate and a value to complete the Text"}
        },
        transitionProps: {
            transitionName: "switch-panel-transition",
            transitionEnterTimeout: 300,
            transitionLeaveTimeout: 300
        },
        isDraggable: false,
        completeGeometry: false
    };

    state = {
        components: [],
        radius: 0,
        valueText: ""
    };

    componentWillMount() {
        this.cnt = 0;
        this.setState( {
            components: this.props.components || [],
            valueText: this.props.properties.valueText,
            radius: this.props.properties.radius
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.components !== this.props.components) {
            this.setState( {
                components: newProps.components,
                valueText: newProps.properties.valueText,
                radius: newProps.properties.radius
            });
        }
        this.setState( {
            valueText: newProps.properties.valueText,
            radius: newProps.properties.radius
        });
    }

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
                <FormGroup validationState={this.getValidationStateRadius(this.state.radius)}>
                    <ControlLabel>Radius</ControlLabel>
                    <FormControl
                        value={this.state.radius}
                        placeholder="radius"
                        onChange={e => {
                            const radius = e.target.value;
                            this.setState({
                                radius
                            });
                            if (this.isValid(this.state.components, radius )) {
                                this.props.onChangeRadius(parseFloat(radius), this.state.components.map(c => [c.lon, c.lat]));
                            } else if (this.props.properties.isValidFeature) {
                                this.props.onSetInvalidSelected("radius");
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
                <FormGroup validationState={this.getValidationStateText(this.state.valueText)}>
                    <ControlLabel>Text value</ControlLabel>
                    <FormControl
                        value={this.state.valueText}
                        placeholder="text value"
                        onChange={e => {
                            const valueText = e.target.value;
                            this.setState({
                                valueText
                            });
                            if (this.isValid(this.state.components, valueText )) {
                                this.props.onChangeText(valueText, this.state.components.map(c => [c.lon, c.lat]));
                            } else if (this.props.properties.isValidFeature) {
                                this.props.onSetInvalidSelected("text");
                            }
                        }}
                        type="text"/>
                </FormGroup>
            </Col>
        </Row>);
    }
    render() {
        const {componentsValidation, type} = this.props;
        const actualComponents = [...this.state.components];
        const actualValidComponents = actualComponents.filter(validateCoords);
        const allValidComponents = actualValidComponents.length === actualComponents.length;
        const validationCompleteButton = this[componentsValidation[type].validation]() && allValidComponents;
        const buttons = [
            {
                glyph: validationCompleteButton ? 'ok' : 'exclamation-mark text-danger',
                tooltip: validationCompleteButton ? 'Complete current geometry' : componentsValidation[type].notValid,
                visible: this.props.completeGeometry,
                style: {"pointerEvents": "none"}
            },
            {
                glyph: 'plus',
                tooltip: 'Add new coordinates',
                visible: componentsValidation[type].add,
                onClick: () => {
                    this.setState({
                        components: [...this.state.components, {
                            id: 'cmp:' + cnt
                        }]
                    });
                    cnt++;
                }
            }
        ];
        const toolbarVisible = !!buttons.filter(b => b.visible).length;
        return (
            <Grid fluid style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <Row>
                    <Col xs={toolbarVisible ? 6 : 12}>
                        Coordinates Editor:
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
                <Row style={{flex: 1, overflowY: 'auto'}}>
                    {/* CUSTOMIZATION for CIRCLE and TEXT adding radius and text value*/ }
                    <Col xs={5} xsOffset={this.props.isDraggable && componentsValidation[type].remove && this[componentsValidation[type].validation]() ? 1 : 0}>
                        Latitude
                    </Col>
                    <Col xs={5}>
                        Longitude
                    </Col>
                    <Col xs={this.props.isDraggable && componentsValidation[type].remove && this[componentsValidation[type].validation]() ? 1 : 2}/>
                </Row>
                <Row style={{flex: 1, overflowY: 'auto'}}>
                    {this.state.components.map((component, idx) => <CoordinatesRow
                        sortId={idx}
                        key={idx}
                        isDraggable={this.props.isDraggable && componentsValidation[type].remove && this[componentsValidation[type].validation]()}
                        removeEnabled={componentsValidation[type].remove && this[componentsValidation[type].validation](this.state.components, componentsValidation[type].remove)}
                        onChange={this.change}

                        onSort={(targetId, currentId) => {
                            const components = this.state.components.reduce((allCmp, cmp, id) => {
                                if (targetId === id) {
                                    return targetId > currentId ?
                                        [...allCmp, {...cmp}, head(this.state.components.filter((cm, i) => i === currentId))]
                                        :
                                        [...allCmp, head(this.state.components.filter((cm, i) => i === currentId)), {...cmp}];
                                }
                                if (currentId === id) {
                                    return [...allCmp];
                                }
                                return [...allCmp, {...cmp}];
                            }, []).filter(val => val);

                            this.setState({ components});
                            if (this.isValid(components)) {
                                const validComponents = this.normalizeCoordinates(components.filter(validateCoords));
                                this.props.onChange(validComponents);
                            } else if (this.props.properties.isValidFeature) {
                                this.props.onSetInvalidSelected("coords");
                            }
                        }}
                        idx={idx}
                        component={component}
                        onRemove={() => {
                            const components = this.state.components.filter((cmp, i) => i !== idx);
                            if (this.isValid(components)) {
                                this.setState({components});
                                const validComponents = this.normalizeCoordinates(components.filter(validateCoords));
                                this.props.onChange(validComponents);
                            } else if (this.props.properties.isValidFeature) {
                                this.props.onSetInvalidSelected("coords");
                            }
                        }}/>)}
                </Row>
            </Grid>
        );
    }
    validateCoordinates = (components = this.state.components, remove = false) => {
        if (components && components.length) {
            const validComponents = components.filter(validateCoords);

            if (remove) {
                return validComponents.length > this.props.componentsValidation[this.props.type].min;
            }
            return validComponents.length >= this.props.componentsValidation[this.props.type].min;
        }
        return false;
    }
    validateCircle = (components = this.state.components, remove, radius = this.state.radius) => {
        if (components && components.length) {
            const cmp = head(components);
            return !isNaN(parseFloat(radius)) && validateCoords(cmp);
        }
        return false;
    }
    validateText = (components = this.state.components, remove, valueText = this.state.valueText) => {
        if (components && components.length) {
            const cmp = head(components);
            return !!valueText && validateCoords(cmp);
        }
        return false;
    }
    isValid = (components = this.state.components, val) => {
        return this[this.props.componentsValidation[this.props.type].validation](components, false, val);
    }
    normalizeCoordinates = (components) => {
        if (this.props.type === "Polygon") {
            return components.concat([components[0]]);
        }
        return components;
    }
    change = (id, key, value) => {
        this.state.components[id][key] = isNaN(parseFloat(value)) ? undefined : parseFloat(value);
        this.setState({
            components: this.state.components
        });
        if (this.isValid(this.state.components)) {
            let validComponents = this.normalizeCoordinates(this.state.components/*.filter(validateCoords)*/);
            this.props.onChange(validComponents, this.state.radius, this.state.valueText);
        } else if (this.props.properties.isValidFeature) {
            this.props.onSetInvalidSelected("coords", this.state.components.map(c => [c.lon, c.lat]));
        }
    }
}

module.exports = draggableContainer(CoordinateEditor);
