import { connect } from 'react-redux';
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { bindActionCreators } from 'redux';

import { changeGroupMetadata, editGroup, saveGroup, searchUsers } from '../../../actions/usergroups';
import GroupDialog from '../../../components/manager/users/GroupDialog';

const mapStateToProps = (state) => {
    const usergroups = state && state.usergroups;
    return {
        modal: true,
        availableUsers: usergroups && usergroups.availableUsers,
        availableUsersCount: usergroups && usergroups.availableUsersCount,
        availableUsersLoading: usergroups && usergroups.availableUsersLoading,
        show: usergroups && !!usergroups.currentGroup,
        group: usergroups && usergroups.currentGroup
    };
};
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        searchUsers: searchUsers.bind(null),
        onChange: changeGroupMetadata.bind(null),
        onClose: editGroup.bind(null, null),
        onSave: saveGroup.bind(null)
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupDialog);
