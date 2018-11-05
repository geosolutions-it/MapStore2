const React = require('react');
const PropTypes = require('prop-types');
const ColorUtils = require('../../utils/ColorUtils');
const ColorRampItem = require('./EqualIntervalComponents/ColorRampItem');
const DropdownList = require('react-widgets').DropdownList;
const {head} = require('lodash');

class ColorRangeSelector extends React.Component {

    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        samples: PropTypes.number,
        onChange: PropTypes.func,
        items: PropTypes.array,
        rampFunction: PropTypes.func,
        disabled: PropTypes.bool
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        samples: 5,
        onChange: () => {},
        items: [{
            name: 'global.colors.blue',
            schema: 'sequencial',
            options: {base: 190, range: 20}
        }, {
            name: 'global.colors.red',
            schema: 'sequencial',
            options: {base: 10, range: 4}
        }, {
            name: 'global.colors.green',
            schema: 'sequencial',
            options: {base: 120, range: 4}
        }, {
            name: 'global.colors.brown',
            schema: 'sequencial',
            options: {base: 30, range: 4, s: 1, v: 0.5}
        }, {
            name: 'global.colors.purple',
            schema: 'sequencial',
            options: {base: 300, range: 4}
        }, {
            name: 'global.colors.random',
            schema: 'qualitative',
            options: {base: 190, range: 340, options: {base: 10, range: 360, s: 0.67, v: 0.67}}
        }],
        disabled: false
    };
    getValue = () => {
        return head(this.getItems().filter( (i = {}) => i === this.props.value || i.name === (this.props.value && this.props.value.name)));
    }
    getItems = () => {
        return this.props.items.map(({options = {}, ...item}) => ({
            ...item,
            options,
            ramp: this.props.rampFunction ? this.props.rampFunction(item, options) : (ColorUtils.sameToneRangeColors(options.base, options.range, this.props.samples + 1, options.options) || ["#AAA"]).splice(1)
        }));
    }

    render() {
        const items = this.getItems();
        return (
            <DropdownList
                className="color-range-selector"
                data={items}
                disabled={this.props.disabled}
                valueComponent={(props) => <ColorRampItem {...props} data={items} />}
                itemComponent={ColorRampItem}
                value={this.getValue()}
                onChange={(ramp) => {
                    this.props.onChange(ramp);
                }}/>
        );
    }
}

module.exports = ColorRangeSelector;
