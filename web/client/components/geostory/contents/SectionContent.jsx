/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Content from './Content';
import enhanceSectionContent from './enhancers/enhanceSectionContent';

const DEFAULT_THRESHOLD = Array.from(Array(11).keys()).map(v => v / 10); // [0, 0.1, 0.2 ... 0.9, 1]
export default enhanceSectionContent({ visibilityEnhancerOptions: { threshold: DEFAULT_THRESHOLD } })(Content);
