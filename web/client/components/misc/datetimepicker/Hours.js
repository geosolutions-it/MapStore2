import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getLocalTimePart } from '../../../utils/TimeUtils';

const getDates = (step) => {
    let min = moment().startOf('day');
    const max = moment().startOf('day').add(1, 'd');
    let times = [];
    let startDay = min.date();

    while (min.date() === startDay && min.isBefore(max)) {
        times.push({
            date: min.toDate(),
            label: min.format('LT')
        });
        min = min.add(step || 30, 'm');
    }
    return times;
};

class Hours extends Component {

    static propTypes = {
        onSelect: PropTypes.func,
        onMouseDown: PropTypes.func,
        disabled: PropTypes.bool,
        style: PropTypes.object,
        value: PropTypes.string,
        type: PropTypes.string
    }
    static defaultProps = {
        onSelect: () => { },
        onMouseDown: () => {},
        disabled: false,
        style: {},
        value: '',
        type: ''
    }

    state = { focusedItemIndex: -1, times: [] };

    componentDidMount() {
        this.setState({ times: getDates() });  // eslint-disable-line -- TODO: need to be fixed
    }

    render() {
        const { focusedItemIndex, times } = this.state;
        const { onMouseDown, onSelect, disabled, style, value, type } = this.props;
        let selectedVal = type === 'date-time' ? (value?.split(" ")[1] || "") : value;      // in case of date-time --> extract hours from selected passed value ex.: 01/01/2024 10:00:00
        return (
            <ul id="rw_1_time_listbox Select-option" style={{ position: 'relative', ...style }} ref={this.attachListRef} tabIndex="0" className="rw-list" role="listbox" aria-labelledby="rw_1_input" aria-live="false" aria-hidden="true" aria-activedescendant="rw_1_time_listbox__option__11">
                {times.map((time, index) => <li key={time.label} onMouseDown={disabled ? () => {} : onMouseDown} onClick={disabled ? () => {} : () => onSelect(time)} ref={instance => {this.itemsRef[index] = instance;}} role="option" tabIndex="0" aria-selected="false" className={`rw-list-option ${(selectedVal === getLocalTimePart(time.date) || focusedItemIndex === index ) && !disabled ? 'rw-state-focus is-selected' : ''} ${disabled ? 'rw-state-disabled' : ''}`} id="rw_1_time_listbox__option__0">{time.label}</li>)}
            </ul>
        );
    }

    handleKeyDown = event => {
        let { key } = event;
        let { focusedItemIndex, times } = this.state;
        if (key === 'Enter') {
            const focusedItem = times[focusedItemIndex];
            this.props.onSelect(focusedItem);
            event.preventDefault();
        } else if (key === 'ArrowDown') {
            event.preventDefault();
            const index = focusedItemIndex + 1;
            this.scrollDown(index);
            if (index < times.length) {
                this.setState({ focusedItemIndex: index });
            }
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            const index = focusedItemIndex - 1;
            this.scrollUp(index);
            if (index > -1) {
                this.setState({ focusedItemIndex: index });
            }
        }
    }

    scrollDown = index => {
        const item = this.itemsRef[index];
        if (item && item.offsetTop > this.listRef.offsetHeight) {
            this.listRef.scrollTop = item.offsetTop - this.listRef.offsetTop;
        }
    }

    scrollUp = index => {
        const item = this.itemsRef[index];
        if (item) {
            const topScroll = this.listRef.scrollTop;
            const itemTop = item.offsetTop;
            if (topScroll && (itemTop < topScroll)) {
                this.listRef.scrollTop = item.offsetTop - this.listRef.offsetTop;
            }
        }
    }

    attachListRef = ref => (this.listRef = ref)

    itemsRef = {};
}

export default Hours;
