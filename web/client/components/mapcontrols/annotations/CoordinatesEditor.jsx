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
        text: ""
    };

    componentWillMount() {
        this.cnt = 0;
        this.setState( {
            components: this.props.components || []
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.components) {
            this.setState( {
                components: newProps.components
            });
        }
    }
/*
    componentWillUpdate(newProps, newState) {
        if (!isEqual(this.state.components, newState.components)) {
            if (this.isValid()) {
                let validComponents = this.normalizeCoordinates(this.state.components.filter(validateCoords));
                this.props.onChange(validComponents);
            }
        }
    }*/

    renderCircle() {
        return (<Row style={{flex: 1, overflowY: 'auto'}}>
            <Col xs={12}>
                <FormGroup>
                    <ControlLabel>Radius</ControlLabel>
                    <FormControl
                        value={this.props.properties.radius}
                        placeholder="radius"
                        onChange={e => {
                            this.props.onChangeRadius(parseFloat(e.target.value));
                        }}
                        type="number"/>
                </FormGroup>
            </Col>
        </Row>);
    }
    renderText() {
        return (<Row style={{flex: 1, overflowY: 'auto'}}>
            <Col xs={12}>
                <FormGroup>
                    <ControlLabel>Text value</ControlLabel>
                    <FormControl
                        value={this.props.properties.valueText}
                        placeholder="text value"
                        onChange={e => {
                            this.props.onChangeText(e.target.value);
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
                onClick: () => {
                    if (validationCompleteButton) {
                        this.props.onComplete(actualComponents);
                        this.setState({
                            components: []
                        });
                    }
                }
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
                        onChange={(id, key, value) => {
                            this.state.components[id][key] = isNaN(parseFloat(value)) ? undefined : parseFloat(value);
                            this.setState({
                                components: this.state.components
                            });
                            if (this.isValid()) {
                                let validComponents = this.normalizeCoordinates(this.state.components/*.filter(validateCoords)*/);
                                this.props.onChange(validComponents);
                            }
                        }}

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
                            if (this.isValid()) {
                                const validComponents = this.normalizeCoordinates(components.filter(validateCoords));
                                this.props.onChange(validComponents);
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
    validateCircle = (components = this.state.components) => {
        if (components && components.length) {
            const cmp = head(components);
            return !isNaN(parseFloat(this.state.radius)) && validateCoords(cmp);
        }
        return false;
    }
    validateText = (components = this.state.components) => {
        if (components && components.length) {
            const cmp = head(components);
            return this.props.properties && !!this.props.properties.valueText && validateCoords(cmp);
        }
        return false;
    }
    isValidForm = (components) => {
        return this[this.props.componentsValidation[this.props.type].validation](components, false);
    }
    isValid = (components) => {
        return this[this.props.componentsValidation[this.props.type].validation](components, false);
    }
    normalizeCoordinates = (components) => {
        if (this.props.type === "Polygon") {
            return components.concat([components[0]]);
        }
        return components;
    }
}

module.exports = draggableContainer(CoordinateEditor);
