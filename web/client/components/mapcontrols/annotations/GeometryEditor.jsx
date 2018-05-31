const React = require('react');
const PropTypes = require('prop-types');
const CoordinatesEditor = require('./CoordinatesEditor');
const {getComponents} = require('../../../utils/AnnotationsUtils');

class GeometryEditor extends React.Component {
    static propTypes = {
        id: PropTypes.number,
        components: PropTypes.array,
        onRemove: PropTypes.func,
        onlyRows: PropTypes.bool,
        onChange: PropTypes.func,
        transitionProps: PropTypes.object,
        selected: PropTypes.object,
        isDraggable: PropTypes.bool,
        featureType: PropTypes.string,
        drawing: PropTypes.bool,
        onComplete: PropTypes.func,
        onChangeRadius: PropTypes.func,
        onSetInvalidSelected: PropTypes.func,
        onChangeText: PropTypes.func,
        completeGeometry: PropTypes.bool
    };

    static defaultProps = {
        id: 0,
        selected: {},
        components: [],
        onRemove: null,
        onlyRows: false,
        onChange: () => {},
        onComplete: () => {},
        onChangeRadius: () => {},
        onSetInvalidSelected: () => {},
        onChangeText: () => {},
        transitionProps: {
            transitionName: "switch-panel-transition",
            transitionEnterTimeout: 300,
            transitionLeaveTimeout: 300
        },
        isDraggable: false,
        completeGeometry: false
    };

    state = {
        components: []
    }

    render() {
        // const {coordinates, type} = this.props.selected && this.props.selected.geometry || {coordinates: [[]] /*[[[-9, 42], [-7, 44]]]*/};
        return (<CoordinatesEditor
            items={[]}
            isDraggable={this.props.selected && this.props.selected.properties && this.props.selected.properties.isValidFeature}
            type={this.props.featureType}
            completeGeometry={this.props.completeGeometry}
            components={this.props.selected && this.props.selected.geometry && this.props.selected.geometry.coordinates && this.props.selected.geometry.coordinates.length ? getComponents(this.props.selected.geometry) : []}
            properties={this.props.selected && this.props.selected.properties || {}}
            onComplete={() => {}}
            onChangeRadius={this.props.onChangeRadius}
            onSetInvalidSelected={this.props.onSetInvalidSelected}
            onChangeText={this.props.onChangeText}
            onChange={(components, radius, text) => {
                let coords = components.map(c => [c.lon, c.lat]);
                this.props.onChange(coords, radius, text);
            }}/>);
    }

}

module.exports = GeometryEditor;
