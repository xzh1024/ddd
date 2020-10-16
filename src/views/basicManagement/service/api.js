export default {
    getDocumentList: '/api/get-document', //文档列表
    addDocument: '/api/document-add', //新增文档
    deleteDocument: '/api/document-delete', //删除文档
    
    getNoticeList: '/api/get-notice-list', //公告管理列表
    getNoticeInfo: '/api/get-notice-info', //公告详情
    addNotice: '/api/notice-add', //公告新增
    editNotice: '/api/notice-edit', //修改新增
    deleteNotice: '/api/notice-delete', //删除公告

    getCompanyList: '/api/get-company-list', //公司列表
    createCompany: '/api/create-company', //创建公司
    updateCompany: '/api/update-company', //更新公司名字
    deleteCompany: '/api/delete-company', //删除公司

    getProjectList: '/api/get-project-standard', //获取按项目分组的规范列表
    getSysStandard: '/api/get-sys-standard', //获取系统规范列表
    getStandardNodes: '/api/get-standard-nodes', //获取某规范的节点列表
    applySysStandard: '/api/apply-sys-standard', //应用系统规范
    createCustomStandard: '/api/create-standard', //创建规范（非系统规范）
    updateStandard: '/api/update-standard', //更新规范
    deleteStandard: '/api/delete-standard', //删除规范及其节点
    createNode: '/api/create-node', //创建节点
    updateNode: '/api/update-nodes', //更新节点
    deleteNode: '/api/delete-node', //删除节点

    getCategoryTree: '/api/get-category-tree', //获取整个类型树
    createCategory: '/api/create-category', //创建类型/分类
    deleteCategory: '/api/delete-category', //删除类型/分类
    updateCategory: '/api/update-category', //更新类型/分类
};