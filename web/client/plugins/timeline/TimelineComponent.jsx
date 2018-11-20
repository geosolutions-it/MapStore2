const vis = require('vis/dist/vis-timeline-graph2d.min');
require('vis/dist/vis-timeline-graph2d.min.css');
const React = require('react');
const PropTypes = require('prop-types');
const {difference, keys, intersection, each, omit, assign} = require('lodash');

const noop = function() {};
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
    return [eventPropTypes, eventDefaultProps ];
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
      const { items, groups, options, selection, customTimes } = this.props;

      const itemsChange = items !== nextProps.items || (items || []).length !== (nextProps.items || []).length;
      const groupsChange = groups !== nextProps.groups;
      const optionsChange = options !== nextProps.options;
      const customTimesChange = customTimes !== nextProps.customTimes;
      const selectionChange = selection !== nextProps.selection;

      return (
        itemsChange ||
        groupsChange ||
        optionsChange ||
        customTimesChange ||
        selectionChange
    );
  }
  componentDidUpdate() {
      this.init();
  }
  componentWillUnmount() {
      this.$el.destroy();
  }


  render() {
      return <div ref="container" />;
  }


  init() {
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

      this.$el.setItems(items);
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
  }

}


module.exports = Timeline;
