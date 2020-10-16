import axios from '@/axios/axios'
let localIndex = localStorage.getItem("roleListIndex");
if(localIndex){
    localIndex=parseInt(localIndex)
}else{
    localIndex = 1
}
const state = {
    roleList: [                       // 权限管理、成员管理列表
    ],
    roleListIndex: parseInt(localIndex) || 0
}
const mutations = {
    updateRoleList(state, data) {
        state.roleList = data
    },
    updateRoleIndex(state, i) {
        state.roleListIndex = i
        localStorage.setItem("roleListIndex", i)
    }
}
const actions = {
    loadRoleList(content,payload){
        axios.post('/api/get-auth-list')
        .then(
            res=>{
                let temp = [{auth_name:'甲方权限',cusTitle:true}]
                let partA = []
                let partB = []
                let partC = []
                res.data.forEach(element => {
                    if(element.company_type == 1){
                        partA.push(element)
                    }else if(element.company_type == 2){
                        partB.push(element)
                    }else{
                        partC.push(element)
                    }
                });
                temp.push(...partA,{auth_name:'乙方权限',cusTitle:true},...partB,{auth_name:'其他',cusTitle:true},...partC)
                // console.log('temp',temp)
                content.commit('updateRoleList',temp)
            }
        )
        .catch(
            err=>{
                console.log("出错了",err)
            }
        )
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
};
