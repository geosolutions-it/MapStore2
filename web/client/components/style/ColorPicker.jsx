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
        style: PropTypes.object,
        disabled: PropTypes.bool,
        pickerProps: PropTypes.object
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
        onChangeColor: () => {},
        pickerProps: {}
    };

    state = {
        displayColorPicker: false
    };

    getStyle = () => {
        let color = this.state.color || this.props.value;
        let {r, g, b, a} = color;
        return this.props.line ?
        {
            color: `rgba(${ r }, ${ g }, ${ b }, ${ a })`,
            background: `rgba(${ 256 - r }, ${ 256 - g }, ${ 256 - b }, 1)`
        }
      :
        {
            background: `rgba(${ r }, ${ g }, ${ b }, ${ a })`,
            color: `rgba(${ 256 - r }, ${ 256 - g }, ${ 256 - b }, 1)`
        };
    };

    render() {
        return (
      <div>
        <div className={this.props.disabled ? "cp-disabled" : "cp-swatch" } style={this.getStyle()} onClick={ () => { if (!this.props.disabled) { this.setState({ displayColorPicker: !this.state.displayColorPicker }); } } }>
        {this.props.text}
        </div>
        { this.state.displayColorPicker ? <div className="cp-popover" style={{width: this.props.style && this.props.style.width}}>
          <div className="cp-cover" onClick={ () => { this.setState({ displayColorPicker: false, color: undefined}); this.props.onChangeColor(this.state.color); }}/>
          <SketchPicker {...this.props.pickerProps} color={ this.state.color || this.props.value} onChange={ (color) => { this.setState({ color: color.rgb }); }} />
        </div> : null }

      </div>
        );
    }
}

module.exports = ColorPicker;
