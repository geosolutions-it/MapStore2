import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

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
        onMouseDown: PropTypes.func
    }
    static defaultProps = {
        onSelect: () => { },
        onMouseDown: () => {}
    }

    state = { focusedItemIndex: 0, times: [] };

    componentDidMount() {
        this.setState({ times: getDates() });
    }

    render() {
        const { focusedItemIndex, times } = this.state;
        return (
            <ul id="rw_1_time_listbox" style={{ position: 'relative' }} ref={this.attachListRef} tabIndex="0" className="rw-list" role="listbox" aria-labelledby="rw_1_input" aria-live="false" aria-hidden="true" aria-activedescendant="rw_1_time_listbox__option__11">
                {times.map((time, index) => <li key={time.label} onMouseDown={this.props.onMouseDown} onClick={() => this.props.onSelect(time)} ref={instance => {this.itemsRef[index] = instance;}} role="option" tabIndex="0" aria-selected="false" className={`rw-list-option ${focusedItemIndex === index ? 'rw-state-focus' : ''}`} id="rw_1_time_listbox__option__0">{time.label}</li>)}
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
