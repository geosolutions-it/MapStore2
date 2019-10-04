const React = require('react');
const PropTypes = require('prop-types');
const CoordinatesEditor = require('./CoordinatesEditor');
const {getComponents} = require('../../../utils/AnnotationsUtils');

class GeometryEditor extends React.Component {
    static propTypes = {
        components: PropTypes.array,
        options: PropTypes.object,
        onRemove: PropTypes.func,
        onChange: PropTypes.func,
        transitionProps: PropTypes.object,
        selected: PropTypes.object,
        featureType: PropTypes.string,
        format: PropTypes.string,
        onComplete: PropTypes.func,
        onHighlightPoint: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onChangeRadius: PropTypes.func,
        onSetInvalidSelected: PropTypes.func,
        aeronauticalOptions: PropTypes.object,
        onChangeText: PropTypes.func
    };

    static defaultProps = {
        selected: {},
        options: {},
        components: [],
        onRemove: null,
        onChange: () => {},
        onComplete: () => {},
        onChangeRadius: () => {},
        onHighlightPoint: () => {},
        onChangeFormat: () => {},
        onSetInvalidSelected: () => {},
        onChangeText: () => {},
        transitionProps: {
            transitionName: "switch-panel-transition",
            transitionEnterTimeout: 300,
            transitionLeaveTimeout: 300
        }
    };

    render() {
        return (<CoordinatesEditor
            {...this.props.options}
            items={[]}
            isDraggable
            type={this.props.featureType}
            components={this.props.selected && this.props.selected.geometry && this.props.selected.geometry.coordinates && this.props.selected.geometry.coordinates.length ? getComponents(this.props.selected.geometry) : []}
            properties={this.props.selected && this.props.selected.properties || {}}
            onComplete={() => {}}
            onChangeRadius={this.props.onChangeRadius}
            aeronauticalOptions={this.props.aeronauticalOptions}
            onChangeFormat={this.props.onChangeFormat}
            format={this.props.format}
            onHighlightPoint={this.props.onHighlightPoint}
            onSetInvalidSelected={this.props.onSetInvalidSelected}
            onChangeText={this.props.onChangeText}
            onChange={(components, radius, text) => {
                let coords = components.map(c => [c.lon, c.lat]);
                this.props.onChange(coords, radius, text);
            }}/>);
    }

}

module.exports = GeometryEditor;
