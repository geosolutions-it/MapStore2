import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import PagedCombobox from '../combobox/PagedCombobox';
// import localizedProps from '../enhancers/localizedProps';

// const Select = localizedProps(['placeholder', 'clearValueText', 'noResultsText'])(require('react-select').default);
const getDates = (step) => {
    let min = moment().startOf('day');
    const max = moment().startOf('day').add(1, 'd');
    let times = [];
    let startDay = min.date();

    while (min.date() === startDay && min.isBefore(max)) {
        times.push({
            value: min.toDate(),
            label: min.format('LT')
        });
        min = min.add(step || 30, 'm');
    }
    return times;
};

class TimePicker extends Component {

    static propTypes = {
        onSelect: PropTypes.func,
        onMouseDown: PropTypes.func,
        disabled: PropTypes.bool
    }
    static defaultProps = {
        onSelect: () => { },
        onMouseDown: () => { },
        disabled: false
    }

    state = { focusedItemIndex: 0, times: [], selectedMember: "", openSelectMember: false };

    componentDidMount() {
        this.setState({ times: getDates() });
    }

    render() {
        // const { times } = this.state;
        // const { onMouseDown, onSelect, disabled } = this.props;
        const placeholder = this.context.intl ? this.context.intl.formatMessage({ id: 'usergroups.selectMemberPlaceholder' }) : 'Select time from list';

        return (
        // <div>

            //     <select className="custom-select">
            //         <option value="" disabled>
            //             {placeholder}
            //         </option>
            //         {times.map((item, idx) =>
            //             <option key={"time-" + idx} className={item.value === this.state.selectedMember ? 'active' : ''} value={item.value}>
            //                 {item.label}
            //             </option>
            //         )}
            //     </select>
            // </div>
            <PagedCombobox
                data={getDates()}
                // textField={"label"}
                // valueField={"value"}
                // parentsFilter={{}}
                // filter={"startsWith"}
                open={this.state.openSelectMember}
                onToggle={this.handleToggleSelectMember}
                onChange={(selected) => {
                    if (typeof selected === 'string') {
                        this.selectMemberPage = 0;
                        this.setState({selectedMember: selected});
                        this.searchUsers(selected, true);
                        return;
                    }
                    if (selected.value) {
                        this.setState({selectedMember: selected.label});
                        // this.selectMemberPage = 0;
                    }
                }}
                placeholder={placeholder}
                // pagination={pagination}
                selectedValue={this.state.selectedMember}
                onSelect={() => {}}
                stopPropagation
                // dropUp

            />
        // <ul id="rw_1_time_listbox" style={{ position: 'relative' }} ref={this.attachListRef} tabIndex="0" className="rw-list" role="listbox" aria-labelledby="rw_1_input" aria-live="false" aria-hidden="true" aria-activedescendant="rw_1_time_listbox__option__11">
        //     {times.map((time, index) => <li key={time.label} onMouseDown={disabled ? () => {} : onMouseDown} onClick={disabled ? () => {} : () => onSelect(time)} ref={instance => {this.itemsRef[index] = instance;}} role="option" tabIndex="0" aria-selected="false" className={`rw-list-option ${focusedItemIndex === index && !disabled ? 'rw-state-focus' : ''} ${disabled ? 'rw-state-disabled' : ''}`} id="rw_1_time_listbox__option__0">{time.label}</li>)}
        // </ul>
        );
    }
    handleToggleSelectMember = () => {
        this.setState(prevState => ({
            openSelectMember: !prevState.openSelectMember
        }));
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

export default TimePicker;
