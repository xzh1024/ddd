import loading from '@components/common/loading';
import noData from '@components/common/noData';
import pagination from '@components/common/pagination';
import cpTooltip from '@components/cpTooltip/cpTip';

const globalComponents = {
    install: (Vue) => {
        Vue.component(loading.name, loading);
        Vue.component(noData.name, noData);
        Vue.component(pagination.name, pagination);
        Vue.component(cpTooltip.name, cpTooltip);
    }
};

export default globalComponents;
