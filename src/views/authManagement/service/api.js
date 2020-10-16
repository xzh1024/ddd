export default {
    staffList: '/api/account-list', //获取所有成员信息
    roleList: '/api/get-auth-list', //获取所有角色信息
    authList: '/api/get-auth-details-list', //权限列表
    authChange: '/api/auth-update', //权限列表
    oneStaffList:'/api/get-user-manage-info',   //获取具体某个成员的详细详细
    updataStaffInfo:'/api/update-user',   //更新成员的详细详细
    deleteStaff:'/api/account-disable',   //禁用成员
    addAuthGroup:'/api/auth-group-add',   //添加权限组
    deleteAuthGroup:'/api/auth-group-delete',   //删除权限组
    editAuthGroup:'/api/auth-group-update',   //编辑权限组
    accountAdd:'/api/add-account'             //添加账号
};
