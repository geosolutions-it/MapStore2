import { connect } from 'react-redux';
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { bindActionCreators } from 'redux';

import { changeUserMetadata, editUser, saveUser } from '../../../actions/users';
import UserDialog from '../../../components/manager/users/UserDialog';

const mapStateToProps = (state) => {
    const users = state && state.users;
    return {
        modal: true,
        show: users && !!users.currentUser,
        user: users && users.currentUser,
        groups: users && users.groups,
        hidePasswordFields: users && users.currentUser && state.security && state.security.user && state.security.user.id === users.currentUser.id
    };
};
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        onChange: changeUserMetadata.bind(null),
        onClose: editUser.bind(null, null),
        onSave: saveUser.bind(null)
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDialog);
