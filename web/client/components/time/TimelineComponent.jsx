const vis = require('vis/dist/vis-timeline-graph2d.min');
require('vis/dist/vis-timeline-graph2d.min.css');
const React = require('react');
const PropTypes = require('prop-types');
const { difference, keys, intersection, each, omit, assign } = require('lodash');

const noop = function () { };
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
        const { items, groups, options, selection, customTimes, readOnly } = this.props;

        const itemsChange = items !== nextProps.items;
        const groupsChange = groups !== nextProps.groups;
        const optionsChange = options !== nextProps.options;
        const customTimesChange = customTimes !== nextProps.customTimes;
        const selectionChange = selection !== nextProps.selection;
        const readOnlyChange = readOnly !== nextProps.readOnly;
        return (
            itemsChange ||
            groupsChange ||
            optionsChange ||
            customTimesChange ||
            selectionChange ||
            readOnlyChange
        );
    }
    componentDidUpdate(prevProps) {
        this.init(prevProps);
    }
    componentWillUnmount() {
        this.$el.destroy();
    }


    render() {
        return <div ref="container" className={this.props.readOnly ? 'read-only-timeline' : ''} />;
    }


    init(prevProps = {}) {
        const {
            items,
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

            this.$el.setWindow(options.start, options.end, {
                animation: animate
            });
        }

        this.$el.setOptions(timelineOptions);

        if (groups.length > 0) {
            const groupsDataset = new vis.DataSet();
            groupsDataset.add(groups);
            this.$el.setGroups(groupsDataset);
        }

        /*
        ** the init() function keeps re-triggered with change of some props
        * when the item is set at the first init(), it return no range (vis-timeline.js)
        * in this case we emit 'change' action to create a view range from th new items.
        **/
        if (items && items !== prevProps.items) {
            if (items.length > 0) {
                // first setItems is triggerd only when the component receive items. trigger 'change' event to create  view range.
                if (!this.$el.initialFitDone) {
                    this.$el.setItems(items);
                    this.$el.emit('changed');
                } else {
                    // when we have a change in items we perform set item (e.g zoom /move events)
                    this.$el.setItems(items);
                }
                // when there is a view range but no items on the timeline (e.g. user moved the timeline where there are no data). we re-set items again
            } else if (this.$el.initialRangeChangeDone) {
                this.$el.setItems(items);
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

        // disable events on readOnly
        if (this.props.readOnly !== prevProps.readOnly || this.props.readOnly && customTimeKeysToAdd.length > 0) {
            each(this.$el.customTimes, time => {
                if (this.props.readOnly) {
                    time.hammer.off("panstart panmove panend");
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
