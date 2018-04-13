const React = require('react');
const PermissionEditor = require('../../../security/PermissionEditor');


module.exports = ({
    user,
    owner,
    // permissions,
    availablePermissions,
    displayPermissionEditor,
    availableGroups,
    groups,
    saving,
    resource,
    newGroup,
    newPermission,
    onNewGroupChoose = () => { },
    onAddPermission = () => { },
    onGroupsChange = () => { },
    onNewPermissionChoose = () => { }
}) => {
    if (displayPermissionEditor && user.name === owner || user.role === "ADMIN") {
        // Hack to convert map permissions to a simpler format, TODO: remove this
        /*
        if (permissions && permissions.SecurityRuleList && permissions.SecurityRuleList.SecurityRule) {
            this.localGroups = permissions.SecurityRuleList.SecurityRule.map(function(rule) {
                if (rule && rule.group && rule.canRead) {
                    return { name: rule.group.groupName, permission: rule.canWrite ? "canWrite" : "canRead" };
                }
            }
            ).filter(rule => rule);  // filter out undefined values
        } else {
            this.localGroups = groups;
        }*/
        return (
            <PermissionEditor
                disabled={!!saving}
                map={resource}
                user={user}
                availablePermissions={availablePermissions}
                availableGroups={availableGroups}
                groups={groups}
                newGroup={newGroup}
                newPermission={newPermission}
                onNewGroupChoose={onNewGroupChoose}
                onNewPermissionChoose={onNewPermissionChoose}
                onAddPermission={onAddPermission}
                onGroupsChange={onGroupsChange}
            />
        );
    }
};
