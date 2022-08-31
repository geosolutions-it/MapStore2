/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { lazy } from 'react';

import QuillEditor from './QuillEditor';
import withSuspense from '../../../../misc/withSuspense';

const DraftJSEditor = withSuspense()(lazy(() => import('./DraftJSEditor')));

export default {
    QuillEditor,
    DraftJSEditor
};
