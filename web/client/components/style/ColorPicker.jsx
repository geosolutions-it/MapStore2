const PropTypes = require('prop-types');
const React = require('react');

const { SketchPicker } = require('react-color');
require('./colorpicker.css');

class ColorPicker extends React.Component {
    static propTypes = {
        value: PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number}),
        onChangeColor: PropTypes.func,
        text: PropTypes.string,
        line: PropTypes.bool,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        disabled: false,
        line: false,
        text: "Color",
        value: {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        },
        onChangeColor: () => {}
    };

    state = {
        displayColorPicker: false
    };

    getStyle = () => {
        let color = this.state.color || this.props.value;
        return this.props.line ?
        {
            color: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`,
            background: `rgba(${ 256 - color.r }, ${ 256 - color.g }, ${ 256 - color.b }, 1)`
        }
      :
        {
            background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`,
            color: `rgba(${ 256 - color.r }, ${ 256 - color.g }, ${ 256 - color.b }, 1)`
        };
    };

    render() {
        return (
      <div>
        <div className={this.props.disabled ? "cp-disabled" : "cp-swatch" }style={this.getStyle()} onClick={ () => { if (!this.props.disabled) { this.setState({ displayColorPicker: !this.state.displayColorPicker }); } } }>
        {this.props.text}
        </div>
        { this.state.displayColorPicker ? <div className="cp-popover">
          <div className="cp-cover" onClick={ () => { this.setState({ displayColorPicker: false, color: undefined}); this.props.onChangeColor(this.state.color); }}/>
          <SketchPicker color={ this.state.color || this.props.value} onChange={ (color) => { this.setState({ color: color.rgb }); }} />
        </div> : null }

      </div>
        );
    }
}

module.exports = ColorPicker;
