/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const moment = require('moment');

// const vis = require('vis/index-timeline-graph2d'); // debug version. Doesn't work with uglify plugin, probably because of this issue: https://github.com/almende/vis/issues/3290
const vis = require('vis/dist/vis-timeline-graph2d.min');
/*
 * This override enables editing for BackgroundItem
 */
vis.timeline.components.items.BackgroundItem.prototype._createDomElement = function() {
    if (!this.dom) {
        // create DOM
        this.dom = {};

        // background box
        this.dom.box = document.createElement('div');
        // className is updated in redraw()

        // frame box (to prevent the item contents from overflowing
        this.dom.frame = document.createElement('div');
        this.dom.frame.className = 'vis-item-overflow';
        this.dom.box.appendChild(this.dom.frame);

        // contents box
        this.dom.content = document.createElement('div');
        this.dom.content.className = 'vis-item-content';
        this.dom.frame.appendChild(this.dom.content);

        // Note: we do NOT attach this item as attribute to the DOM,
        //       such that background items cannot be selected
        this.dom.box['timeline-item'] = this; // <-- un-commented from original timeline

        this.dirty = true;
    }
};

require('vis/dist/vis-timeline-graph2d.min.css');


const { difference, differenceBy, keys, intersection, intersectionBy, each, omit, assign } = require('lodash');

const noop = () => { };

const events = [
    'currentTimeTick',
    'click',
    'contextmenu',
    'doubleClick',
    'groupDragged',
    'changed',
    'rangechange',
    'rangechanged',
    'select',
    'drop',
    'timechange',
    'timechanged',
    'mouseOver',
    'mouseMove',
    'mouseleave',
    'itemover',
    'itemout',
    'mouseDown',
    'mouseUp'
];

const eventPropTypes = {};
const eventDefaultProps = {};


each(events, event => {
    eventPropTypes[event] = PropTypes.func;
    eventDefaultProps[`${event}Handler`] = noop;
    return [eventPropTypes, eventDefaultProps];
});

const types = {
    items: PropTypes.array,
    rangeItems: PropTypes.array,
    groups: PropTypes.array,
    options: PropTypes.object,
    selectionOptions: PropTypes.object,
    selection: PropTypes.array,
    customTimes: PropTypes.shape({
        datetime: PropTypes.instanceOf(Date),
        id: PropTypes.string
    }),
    animate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    currentTime: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
        PropTypes.number
    ])
};

const defaults = {
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {}
};

/**
 * Wrapper for visjs-timeline in react
 * This wrapper adds also some functionalities:
 *  - read-only that disables customTimes
 */
class Timeline extends React.Component {
    static propTypes = assign(types, eventPropTypes);
    static defaultProps = assign(defaults, eventDefaultProps);
    constructor(props) {
        super(props);
        this.state = {
            customTimes: []
        };
    }
    componentDidMount() {
        const { container } = this.refs;

        this.$el = new vis.Timeline(container, undefined, this.props.options);

        events.forEach(event => this.$el.on(event, this.props[`${event}Handler`]));

        this.init();
    }
    shouldComponentUpdate(nextProps) {
        const { items, groups, options, selection, customTimes, readOnly, rangeItems } = this.props;

        const itemsChange = items !== nextProps.items;
        const groupsChange = groups !== nextProps.groups;
        const optionsChange = options !== nextProps.options;
        const customTimesChange = customTimes !== nextProps.customTimes;
        const selectionChange = selection !== nextProps.selection;
        const readOnlyChange = readOnly !== nextProps.readOnly;
        const rangeItemsChange = rangeItems !== nextProps.rangeItems;
        return (
            itemsChange ||
            groupsChange ||
            optionsChange ||
            customTimesChange ||
            selectionChange ||
            readOnlyChange ||
            rangeItemsChange
        );
    }
    componentDidUpdate(prevProps) {
        this.init(prevProps);
    }
    componentWillUnmount() {
        this.$el.destroy();
    }


    render() {
        return <div ref="container" className={this.props.readOnly ? 'read-only-timeline' : ''} onMouseOut={this.props.onMouseOutHandler} />;
    }
    /**
     * forces the re-render of all items
     */
    setAllItems = items => {
        // force reset
        this.$el.setItems([...(items || []), ...(this.props.rangeItems || [])]);
    }
    /**
     * manages items update, managing peculiar cases that happen during initialization
     */
    setItems = items => {
        /*
        ** the init() function keeps re-triggered with change of some props
        * when the item is set at the first init(), it return no range (vis-timeline.js)
        * in this case we emit 'change' action to create a view range from th new items.
        **/
        if ((items.length || 0) + (this.props.rangeItems && this.props.rangeItems.length || 0) > 0) { // TODO: verify if necessary to check > 0 length
            // first setItems is triggered only when the component receive items. trigger 'change' event to create  view range.
            if (!this.$el.initialFitDone) {
                this.setAllItems(items);
                this.$el.emit('changed');
            } else {
                // when we have a change in items we perform set item (e.g zoom /move events)
                this.setAllItems(items);
            }
            // when there is a view range but no items on the timeline (e.g. user moved the timeline where there are no data). we re-set items again
        } else if (this.$el.initialRangeChangeDone) {
            this.setAllItems(items);
        }
    };

    init(prevProps = {}) {
        const {
            items,
            rangeItems,
            groups,
            options,
            selection,
            selectionOptions = {},
            customTimes,
            animate = true,
            currentTime
        } = this.props;

        let timelineOptions = options;

        if (animate) {
            // If animate option is set, we should animate the timeline to any new
            // start/end values instead of jumping straight to them
            timelineOptions = omit(options, 'start', 'end');
            if (options.start && options.end) {
                this.$el.setWindow(options.start, options.end, {
                    animation: animate
                });
            // avoid no-range initialization that causes not visible timeline
            } else {
                this.$el.setWindow(moment().subtract(1, 'month'), moment().add(1, 'month'), {
                    animation: animate
                });
            }
        }

        this.$el.setOptions(timelineOptions);

        if (groups.length > 0) {
            const groupsDataset = new vis.DataSet();
            groupsDataset.add(groups);
            this.$el.setGroups(groupsDataset);
        }


        if (items && items !== prevProps.items) {
            this.setItems(items);
        // optimization for rangeItems
        } else if (rangeItems !== prevProps.rangeItems) {
            // rangeItems must have an ID.
            // so they can be updated without re-rendering all other items
            // this is typically used when editing range.
            const dataSet = this.$el && this.$el.itemsData && this.$el.itemsData.getDataSet();
            if (dataSet) {
                const itemsToUpdate = intersectionBy(rangeItems || [], prevProps.rangeItems || [], "id");
                const itemsToAdd = differenceBy(rangeItems || [], prevProps.rangeItems || [], "id");
                const itemsToDelete = differenceBy(prevProps.rangeItems || [], rangeItems || [], "id");
                itemsToUpdate.map( i => dataSet.update(i));
                itemsToAdd.map(i => dataSet.add(i));
                itemsToDelete.map(({id}) => dataSet.remove(id));
            } else {
                this.setItems(items);
            }
        }

        this.$el.setSelection(selection, selectionOptions);

        if (currentTime) {
            this.$el.setCurrentTime(currentTime);
        }

        // diff the custom times to decipher new, removing, updating
        const customTimeKeysPrev = keys(this.state.customTimes);
        const customTimeKeysNew = keys(customTimes);
        const customTimeKeysToAdd = difference(
            customTimeKeysNew,
            customTimeKeysPrev
        );
        const customTimeKeysToRemove = difference(
            customTimeKeysPrev,
            customTimeKeysNew
        );
        const customTimeKeysToUpdate = intersection(
            customTimeKeysPrev,
            customTimeKeysNew
        );

        // NOTE this has to be in arrow function so context of `this` is based on
        // this.$el and not `each`
        each(customTimeKeysToRemove, id => this.$el.removeCustomTime(id));
        each(customTimeKeysToAdd, id => {
            const datetime = customTimes[id];
            this.$el.addCustomTime(datetime, id);
        });
        each(customTimeKeysToUpdate, id => {
            const datetime = customTimes[id];
            this.$el.setCustomTime(datetime, id);
        });

        // store new customTimes in state for future diff
        this.setState({ customTimes });

        // disable customTimes events on readOnly
        if (this.props.readOnly !== prevProps.readOnly || this.props.readOnly && customTimeKeysToAdd.length > 0) {
            each(this.$el.customTimes, time => {
                if (this.props.readOnly) {
                    time.hammer.off("panstart panmove panend");
                // restore only if switched from readOnly=true to false
                } else if (prevProps.readOnly === true) {
                    time.hammer.on('panstart', time._onDragStart.bind(time));
                    time.hammer.on('panmove', time._onDrag.bind(time));
                    time.hammer.on('panend', time._onDragEnd.bind(time));
                }
            });
        }
    }
}

module.exports = Timeline;
