import Layout from '@views/layout/Layout';

const routers = [
    {
        path: '/',
        name: 'root',
        redirect: '/login'
    },
    {
        path: '/demo',
        name: 'demo',
        redirect: '/demo',
        component: Layout,
        children: [
            {
                path: '/demo',
                name: 'uiDemo',
                meta: {
                    title: 'DEMO'
                },
                component: () => import(/* webpackChunkName: 'demo' */ '@views/demo/demo')
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        meta: {
            title: '登录'
        },
        component: () => import(/* webpackChunkName: 'login' */ '@views/login/login')
    },
    {
        path: '/permission',
        name: 'permission',
        meta: {
            title: '权限授权'
        },
        component: () => import(/* webpackChunkName: 'permission' */ '@views/login/permission')
    },
    {
        path: '/project',
        name: 'projectIndex',
        meta: {
            title: '项目列表'
        },
        redirect: '/project/list',
        component: Layout,
        children: [
            {
                path: '/project/list',
                name: 'projectList',
                meta: {
                    title: '项目选择'
                },
                component: () => import(/* webpackChunkName: 'project-index' */ '@views/projectSelection/pages/project-index')
            }
        ]
    },
    {
        path: '/taskSummary',
        name: 'taskSummary',
        meta: {
            title: '任务总况'
        },
        redirect: '/taskSummary/index',
        component: Layout,
        children: [
            {
                path: '/taskSummary/index',
                name: 'taskSummaryIndex',
                meta: {
                    title: '任务总况'
                },
                component: () => import(/* webpackChunkName: 'task-summary-index' */ '@views/taskSummary/task-summary-index')
            }
        ]
    },
    {
        path: '/taskEntry',
        name: 'taskEntry',
        meta: {
            title: '任务录入'
        },
        redirect: '/taskEntry/index',
        component: Layout,
        children: [
            {
                path: '/taskEntry/index',
                name: 'taskEntry-index',
                meta: {
                    title: '任务录入'
                },
                component: () => import(/* webpackChunkName: 'task-entry-index' */ '@views/taskEntry/pages/taskEntry-index')
            }
        ]
    },
    {
        path: '/human',
        name: 'human',
        meta: {
            title: '人力总况'
        },
        redirect: '/human/index',
        component: Layout,
        children: [
            {
                path: '/human/index',
                name: 'humanIndex',
                meta: {
                    title: '人力总况'
                },
                component: () => import(/* webpackChunkName: 'human-summary-index' */ '@views/humanSummary/human-summary-index')
            },
        ]
    },
    {
        path: '/authority',
        name: 'authority',
        meta: {
            title: '权限管理'
        },
        redirect: '/authority/index',
        component: Layout,
        children: [
            {
                path: '/authority/index',
                name: 'authorityIndex',
                redirect: '/authority/staffManagement',
                component: () => import(/* webpackChunkName: 'authority-index' */ '@views/authManagement/authority-index'),
                children: [
                    {
                        path: '/authority/staffManagement',
                        name: 'staffManagement',
                        meta: {
                            title: '成员管理'
                        },
                        component: () => import(/* webpackChunkName: 'authority-index' */ '@views/authManagement/pages/staffManagement')
                    },
                    {
                        path: '/authority/authManagement',
                        name: 'authManagement',
                        meta: {
                            title: '权限设置'
                        },
                        component: () => import(/* webpackChunkName: 'authority-index' */ '@views/authManagement/pages/authManagement')
                    }
                ]
            }
        ]
    },
    {
        path: '/ladBill',
        name: 'bill',
        meta: {
            title: '项目提单'
        },
        redirect: '/ladBill/ladingbill',
        component: Layout,
        children: [
            {
                path: '/ladBill/ladingbill',
                name: 'ladingbill',
                meta: {
                    title: '项目提单'
                },
                component: () => import(/* webpackChunkName: 'bill-index' */ '@views/ladingBill/lading-bill')
            }
        ]
    },
    {
        path: '/basic',
        name: 'basic',
        meta: {
            title: '基本管理'
        },
        redirect: '/basic/index',
        component: Layout,
        children: [
            {
                path: '/basic/index',
                name: 'basicIndex',
                redirect: '/basic/document',
                component: () => import(/* webpackChunkName: 'basic-index' */ '@views/basicManagement/basic-index'),
                children: [
                    {
                        path: '/basic/document',
                        name: 'documentManagement',
                        meta: {
                            title: '文档管理'
                        },
                        component: () => import(/* webpackChunkName: 'document-management' */ '@views/basicManagement/pages/ducment')
                    },
                    {
                        path: '/basic/notice',
                        name: 'noticeManagement',
                        meta: {
                            title: '公告管理'
                        },
                        component: () => import(/* webpackChunkName: 'notice-management' */ '@views/basicManagement/pages/notice')
                    },
                    {
                        path: '/basic/company',
                        name: 'companyManagement',
                        meta: {
                            title: '公司管理'
                        },
                        component: () => import(/* webpackChunkName: 'company-management' */ '@views/basicManagement/pages/company')
                    },
                    {
                        path: '/basic/node',
                        name: 'nodeManagement',
                        meta: {
                            title: '节点管理'
                        },
                        component: () => import(/* webpackChunkName: 'node-management' */ '@views/basicManagement/pages/node')
                    },
                    {
                        path: '/basic/work',
                        name: 'workType',
                        meta: {
                            title: '工作类型'
                        },
                        component: () => import(/* webpackChunkName: 'work-type-management' */ '@views/basicManagement/pages/work')
                    }
                ]
            }
        ]
    },
    {
        path: '/message',
        name: 'message',
        meta: {
            title: '消息'
        },
        redirect: '/message/index',
        component: Layout,
        children: [
            {
                path: '/message/index',
                name: 'messageIndex',
                meta: {
                    title: '消息通知'
                },
                component: () => import(/* webpackChunkName: 'message-index' */ '@views/documentNotify/pages/message/message-index')
            }
        ]
    },
    {
        path: '/document',
        name: 'document',
        meta: {
            title: '说明文档'
        },
        redirect: '/document/index',
        component: Layout,
        children: [
            {
                path: '/document/index',
                name: 'documentIndex',
                meta: {
                    title: '说明文档'
                },
                component: () => import(/* webpackChunkName: 'document-index' */ '@views/documentNotify/pages/document/document-index')
            }
        ]
    }
];

export default routers;
