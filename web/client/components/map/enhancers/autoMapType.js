import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { mapTypeSelector } from '../../../selectors/maptype';
export default connect(createSelector(mapTypeSelector, mapType => ({mapType})));
