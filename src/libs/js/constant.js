/**
 * 系统常量配置
 */
// 加密密钥
const secretStr = '75f362af7c4424918826a9e987505aea';

// 文件上传参数
const bucket = 'documents-1301661509';
const region = 'ap-chongqing';
const prefix = 'https://' + bucket + '.cos.' + region + '.myqcloud.com/';
const tcuParams = {
    bucket: bucket,
    region: region,
    prefix: prefix
};

const sysMenuList = [
    {
        id: 1,
        key: 'project',
        name: '项目选择',
        path: '/project'
    },
    {
        id: 2,
        key: 'task_import',
        name: '任务录入',
        path: '/taskEntry'
    },
    {
        id: '2-1',
        key: 'task_cp_a',
        name: '任务录入',
        path: '/taskEntry'
    },
    {
        id: 3,
        key: 'task_general',
        name: '任务总况',
        path: '/taskSummary'
    },
    {
        id: '3-1',
        key: 'task_cp_b',
        name: '任务总况',
        path: '/taskSummary'
    },
    {
        id: 4,
        key: 'user_general',
        name: '人力总况',
        path: '/human'
    },
    {
        id: 5,
        key: 'commit_form_t',
        name: '项目提单',
        path: '/ladBill'
    },
    {
        id: '5-1',
        key: 'commit_form',
        name: '项目提单',
        path: '/ladBill'
    },
    {
        id: 6,
        key: 'basic_manage',
        name: '基本管理',
        path: '/basic'
    },
    {
        id: 7,
        key: 'auth_list',
        name: '权限管理',
        path: '/authority'
    }
];

// 默认权限组
const defaultAuthGroups = [
    {
        id: 1,
        name: '基地管理'
    },
    {
        id: 2,
        name: '项目组'
    },
    {
        id: 3,
        name: '支持部门'
    },
    {
        id: 4,
        name: 'CP管理'
    },
    {
        id: 5,
        name: 'CP制作人'
    }
];

// 文件类型
const fileTypes = {
    'img': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    '3d': ['.fbx', '.json', '.stl', '.obj', '.3ds'],
    'word': ['.doc', 'docx', '.xls', '.xlsx', '.pdf'],
    'video': ['.mp4', '.mov', '.mkv', '.webm'],
    'audio': ['.mp3', '.ogg', '.wav'],
    'zip': ['.zip', '.rar']
};

// 任务状态
const taskStatus = {
    1: '待报价',
    2: '已报价',
    3: '已预警',
    4: '待确认',
    5: '已确认',
    101: '录入中',
    102: '待开始',
    103: '进行中',
    104: '已暂停',
    105: '已终止',
    106: '已逾期',
    107: '待审核',
    108: '已驳回',
    109: '逾期完成',
    110: '已完成',
    111: '今日到期',
    201: '待开始',
    202: '进行中',
    203: '已暂停',
    204: '已终止',
    205: '已逾期',
    206: '待审核',
    207: '已驳回',
    208: '逾期完成',
    209: '已完成',
    210: '今日到期'
};

export default {
    secretStr,
    tcuParams,
    sysMenuList,
    defaultAuthGroups,
    fileTypes,
    taskStatus
};
