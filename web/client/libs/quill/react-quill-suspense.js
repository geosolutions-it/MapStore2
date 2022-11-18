

import { lazy } from 'react';
import withSuspense from '../../components/misc/withSuspense';

export default withSuspense()(lazy(() => import('./react-quill')));
