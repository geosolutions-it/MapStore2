const React = require('react');
const PropTypes = require('prop-types');
const {Row, Col, Glyphicon} = require('react-bootstrap');
const Toolbar = require('../../misc/toolbar/Toolbar');
const draggableComponent = require('../../misc/enhancers/draggableComponent');
const CoordinateEntry = require('./CoordinateEntry');

/**

*/
class CoordinatesRowComponent extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        component: PropTypes.object,
        onRemove: PropTypes.func,
        onChange: PropTypes.func,
        onMouseEnter: PropTypes.func,
        format: PropTypes.string,
        type: PropTypes.string,
        onMouseLeave: PropTypes.func,
        connectDragSource: PropTypes.func,
        isDraggable: PropTypes.bool,
        removeVisible: PropTypes.bool,
        removeEnabled: PropTypes.bool
    };

    render() {
        const {idx} = this.props;
        const rowStyle =/* this.props.type === "LineString" || "Polygon" ? { marginLeft: -5, marginRight: -5} :*/ {marginLeft: -5, marginRight: -5};
        return (
            <Row className="coordinateRow" style={rowStyle} onMouseEnter={() => {
                this.props.onMouseEnter(this.props.component);
            }} onMouseLeave={this.props.onMouseLeave}>
                <Col xs={1}>
                    {this.props.connectDragSource(<div
                        className="square-button-md no-border btn btn-default"
                        style={{display: "flex" /*workaround for firefox*/}}
                        >
                        <Glyphicon
                        glyph="menu-hamburger"
                        disabled={!this.props.isDraggable}
                        style={{pointerEvents: !this.props.isDraggable ? "none" : "auto"}}
                    /></div>)}
                </Col>
                <Col xs={5}>
                    <CoordinateEntry
                        format={this.props.format}
                        coordinate="lat"
                        idx={idx}
                        value={this.props.component.lat}
                        onChange={(dd) => this.props.onChange(idx, "lat", dd)}
                        constraints={{
                            decimal: {
                                lat: {
                                    min: -90,
                                    max: 90
                                },
                                lon: {
                                    min: -180,
                                    max: 180
                                }
                            }
                        }}
                    />
                </Col>
                <Col xs={5}>
                    <CoordinateEntry
                        format={this.props.format}
                        coordinate="lon"
                        idx={idx}
                        value={this.props.component.lon}
                        onChange={(dd) => this.props.onChange(idx, "lon", dd)}
                        constraints={{
                            decimal: {
                                lat: {
                                    min: -90,
                                    max: 90
                                },
                                lon: {
                                    min: -180,
                                    max: 180
                                }
                            }
                        }}
                    />
                </Col>
                <Col xs={1}>
                    <Toolbar
                        btnGroupProps={{ className: 'pull-right' }}
                        btnDefaultProps={{ className: 'square-button-md no-border'}}
                        buttons={
                        [
                            {
                                visible: this.props.removeVisible,
                                disabled: !this.props.removeEnabled,
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
