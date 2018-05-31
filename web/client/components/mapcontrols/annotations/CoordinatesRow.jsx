const React = require('react');
const PropTypes = require('prop-types');
const {Row, Col, FormGroup, FormControl} = require('react-bootstrap');
const Toolbar = require('../../misc/toolbar/Toolbar');
const draggableComponent = require('../../misc/enhancers/draggableComponent');

class CoordinatesRowComponent extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        component: PropTypes.object,
        onRemove: PropTypes.func,
        onChange: PropTypes.func,
        isDraggable: PropTypes.bool,
        removeEnabled: PropTypes.bool
    };
    state = {
        lon: null,
        lat: null
    };
    componentDidMount = () => {
        this.setState({
            lon: this.props.component.lon,
            lat: this.props.component.lat
        });
    }
    componentWillReceiveProps = (newProps) => {
        if (newProps.component !== this.props.component) {
            this.setState({
                lon: newProps.component.lon,
                lat: newProps.component.lat
            });
        }
    }
    getValidationStateLon = (longitude) => {
        const lon = parseFloat(longitude);
        if (isNaN(lon) || lon < -180 || lon > 180 ) {
            return "error";
        }
        return null; // "success"
    }
    getValidationStateLat = (latitude) => {
        const lat = parseFloat(latitude);
        if (isNaN(lat) || lat < -90 || lat > 90 ) {
            return "error";
        }
        return null; // "success"
    }

    render() {
        const {idx} = this.props;
        return (
            <Row style={{marginLeft: 0, marginRight: 0}}>
                <Col xs={1}>
                    <Toolbar
                        btnDefaultProps={{ className: 'square-button-md no-border'}}
                        buttons={
                        [
                            {
                                style: {pointerEvents: !this.props.isDraggable ? "none" : "auto"},
                                glyph: 'menu-hamburger'
                            }
                        ]
                    }/>
                </Col>
                <Col xs={5}>
                    <FormGroup
                        validationState={this.getValidationStateLat(this.state.lat)}>
                        <FormControl
                            value={this.state.lat}
                            placeholder="Lat"
                            onChange={e => {
                                this.setState({
                                    lon: this.state.lon,
                                    lat: e.target.value
                                });
                                if (e.target.value === "") {
                                    this.props.onChange(idx, 'lat', undefined);
                                }
                                if (this.getValidationStateLat(e.target.value) === null) {
                                    this.props.onChange(idx, 'lat', e.target.value);
                                }
                            }}
                            max={90}
                            min={-90}
                            type="number"/>
                    </FormGroup>
                </Col>
                <Col xs={5}>
                <FormGroup
                     validationState={this.getValidationStateLon(this.state.lon)}>
                    <FormControl
                        value={this.state.lon}
                        placeholder="Lon"
                        onChange={e => {
                            this.setState({
                                lon: e.target.value,
                                lat: this.state.lat
                            });
                            if (e.target.value === "") {
                                this.props.onChange(idx, 'lon', undefined);
                            }
                            if (this.getValidationStateLon(e.target.value) === null) {
                                this.props.onChange(idx, 'lon', e.target.value);
                            }
                        }}
                        max={180}
                        min={-180}
                        type="number"/>
                </FormGroup>
                </Col>
                <Col xs={1}>
                    <Toolbar
                        btnGroupProps={{ className: 'pull-right' }}
                        btnDefaultProps={{ className: 'square-button-md no-border'}}
                        buttons={
                        [
                            {
                                visible: this.props.removeEnabled,
                                glyph: 'trash',
                                onClick: () => {
                                    this.props.onRemove(idx);
                                }
                            }
                        ]
                    }/>
                </Col>
            </Row>
        );
    }
}

module.exports = draggableComponent(CoordinatesRowComponent);
