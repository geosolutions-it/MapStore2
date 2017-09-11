const React = require('react');
const PropTypes = require('prop-types');

const {DateTimePicker, Widget, WidgetPicker} = require('react-widgets');
require('react-widgets/lib/less/react-widgets.less');
function omitOwn(component, ...others) {
    let initial = Object.keys(component.constructor.propTypes);
    let keys = others.reduce((arr, compClass) => [
        ...arr,
        ...Object.keys(compClass.propTypes)], initial
    );

    let result = {};
    Object.keys(component.props).forEach(key => {
        if (keys.indexOf(key) !== -1) return;
        result[key] = component.props[key];
    });
    return result;
}
const whitelist = [
  'style',
  'className',
  'role',
  'id',
  'autocomplete',
  'size',
  'tabIndex',
  'maxLength',
  'name'
];
const whitelistRegex = [/^aria-/, /^data-/, /^on[A-Z]\w+/];
function pickElementProps(component) {
    const props = omitOwn(component);
    const result = {};
    Object.keys(props).forEach(key => {
        if (whitelist.indexOf(key) !== -1
            || whitelistRegex.some(r => !!key.match(r))) {
            result[key] = props[key];
        }
    });
    return result;
}

function isFirstFocusedRender(component) {
    return component._firstFocus || (component.state.focused && (component._firstFocus = true));
}
class DateTimeExpressionPicker extends DateTimePicker {
    static propTypes = {
        className: PropTypes.any,
        date: PropTypes.any,
        time: PropTypes.any,
        open: PropTypes.any,
        disabled: PropTypes.any,
        readOnly: PropTypes.any,
        dropUp: PropTypes.any
    }
    render() {
        let { className, date, time, open, disabled, readOnly, dropUp } = this.props;

        let { focused } = this.state;

        let elementProps = pickElementProps(this);

        let shouldRenderList = open || isFirstFocusedRender(this);

        let owns = '';
        if (date) owns += this.dateId;
        if (time) owns += ' ' + this.listId;

        return (
          <Widget
            {...elementProps}
            open={!!open}
            dropUp={dropUp}
            focused={focused}
            disabled={disabled}
            readOnly={readOnly}
            onKeyDown={this.handleKeyDown}
            onKeyPress={this.handleKeyPress}
            onBlur={this.focusManager.handleBlur}
            onFocus={this.focusManager.handleFocus}
            className={className + ' rw-datetime-picker'}
          >
            <WidgetPicker>
              {this.renderInput(owns.trim())}

              {this.renderButtons()}
            </WidgetPicker>

            {!!(shouldRenderList && time) && this.renderTimeList()}
            {!!(shouldRenderList && date) && this.renderCalendar()}
          </Widget>
      );
    }

}
module.exports = DateTimeExpressionPicker;
