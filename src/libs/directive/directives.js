import Vue from 'vue';
import {addResizeListener, removeResizeListener} from 'element-ui/src/utils/resize-event';

// Drag
const drag = Vue.directive('drag', {
    bind: function (el, binding) {
        const ele = el;
        let downXY, moveXY, upXY;
        ele.onmousedown = function (e) {
            e.stopPropagation();
            const node = binding.arg === 'parent' ? ele.parentNode : ele;
            const disX = e.clientX - node.offsetLeft;
            const disY = e.clientY - node.offsetTop;
            downXY = {x: e.clientX, y: e.clientY};
            document.onmousemove = function (e) {
                e.stopPropagation();
                const left = e.clientX - disX;
                const top = e.clientY - disY;
                node.style.left = left + 'px';
                node.style.top = top + 'px';
                moveXY = {x: e.pageX, y: e.pageY};
            };
            document.onmouseup = function (e) {
                e.stopPropagation();
                const bodyHeight = document.body.clientHeight;
                node.style.left = 'auto';
                node.style.right = '0';
                if (bodyHeight - node.clientHeight <= node.offsetTop) {
                    node.style.top = bodyHeight - node.clientHeight + 'px';
                }
                if (node.offsetTop < node.clientHeight) {
                    node.style.top = '0';
                }
                upXY = {x: e.clientX, y: e.clientY};
                if (binding.value) {
                    binding.value({downXY: downXY, moveXY: moveXY, upXY: upXY});
                }
                document.onmousemove = null;
                document.onmousedown = null;
            };
        };
    }
});

// Scroll method
const scrollMethod = function (el, binding) {
    const arg = binding.arg;
    const modifiers = binding.modifiers;
    const constant = {
        vertical: {
            key: 'vertical',
            scroll: 'scrollTop',
            size: 'clientHeight',
            scrollSize: 'scrollHeight',
            axis: 'Y',
            client: 'clientY',
            offset: 'offsetHeight',
            direction: 'top'
        },
        horizontal: {
            key: 'horizontal',
            scroll: 'scrollLeft',
            size: 'clientWidth',
            scrollSize: 'scrollWidth',
            axis: 'X',
            client: 'clientX',
            offset: 'offsetWidth',
            direction: 'left'
        }
    };
    
    // Vertical
    const verticalDom = document.createElement('div');
    verticalDom.className = 'scroll-track-bar scroll-fix-vertical';
    const verticalPieceDom = document.createElement('div');
    verticalPieceDom.className = 'scroll-fix-vertical-piece thumb-bar';
    verticalDom.appendChild(verticalPieceDom);
    
    // Horizontal
    const horizontalDom = document.createElement('div');
    horizontalDom.className = 'scroll-track-bar scroll-fix-horizontal';
    const horizontalPieceDom = document.createElement('div');
    horizontalPieceDom.className = 'scroll-fix-horizontal-piece thumb-bar';
    horizontalDom.appendChild(horizontalPieceDom);
    
    setTimeout(() => {
        const parentNode = el.parentNode ? `.${el.parentNode.classList[0]}` : '';
        if (arg === 'table') {
            let headerEle = null;
            let headerHeight = 0;
            if (!modifiers.header) {
                headerEle = document.querySelector(`${parentNode} .el-table .el-table__header-wrapper`);
                headerHeight = headerEle && headerEle.clientHeight;
            }
            const bodyEle = document.querySelector(`${parentNode} .el-table .el-table__body-wrapper`);
            const tableEle = document.querySelector(`${parentNode} .el-table .el-table__body-wrapper .el-table__body`);
            const tableWidth = tableEle.clientWidth;
            const tableHeight = tableEle.clientHeight;
            el.style.height = '100%';
            bodyEle.style.height = `calc(100% - ${headerHeight - 17}px)`;
            bodyEle.style.width = 'calc(100% + 17px)';
            bodyEle.style.overflow = 'scroll';
    
            const bodyHeight = bodyEle.clientHeight;
            verticalDom.style.height = el.clientHeight - headerHeight - 2 + 'px';
            verticalDom.style.top = headerHeight + 1 + 'px';
            calculationMethod({
                direction: constant.vertical.key,
                dom: bodyEle,
                scrollDom: verticalDom,
                pieceDom: verticalPieceDom,
                size: bodyHeight,
                oversize: tableHeight,
                resizeDom: tableEle
            });
            calculationMethod({
                direction: constant.horizontal.key,
                dom: bodyEle,
                scrollDom: horizontalDom,
                pieceDom: horizontalPieceDom,
                size: el.clientWidth,
                oversize: tableWidth,
                resizeDom: tableEle
            });
            addResizeListener(tableEle, calculationScrollPiece);
        } else {
            // Scroll dom & children dom style setting
            const childEle = el.firstChild;
            const childEleHeight = childEle.clientHeight;
            el.style.width = `calc(100% + 17px)`;
            const elHeight = el.clientHeight;
            el.style.overflowY = 'scroll';
            calculationMethod({
                direction: constant.vertical.key,
                dom: el,
                scrollDom: verticalDom,
                pieceDom: verticalPieceDom,
                size: elHeight,
                oversize: childEleHeight,
                resizeDom: childEle
            });
            addResizeListener(childEle, calculationScrollPiece);
        }
    });
    
    // Real time calculation scroll bar
    const calculationScrollPiece = function () {
        const parentNode = el.parentNode ? `.${el.parentNode.classList[0]}` : '';
        const view = arg === 'table' ? document.querySelector(`${parentNode} .el-table .el-table__body-wrapper`) : el;
        const overView = arg === 'table' ? document.querySelector(`${parentNode} .el-table .el-table__body-wrapper .el-table__body`) : el.firstChild;
        const sizeWidth = view ? view.clientWidth : 0;
        const sizeHeight = view ? view.clientHeight : 0;
        const oversizeWidth = overView ? overView.clientWidth : 0;
        const oversizeHeight = overView ? overView.clientHeight : 0;
        if (!oversizeWidth || !oversizeHeight) return;
        const verPercent = sizeHeight / oversizeHeight * 100;
        const horPercent = sizeWidth / oversizeWidth * 100;
        horizontalPieceDom.style.width = horPercent >= 100 ? 0 : `${horPercent}%`;
        verticalPieceDom.style.height = verPercent >= 100 ? 0 : `${verPercent}%`;
        // horizontalDom.style.opacity = oversizeWidth - 17 <= sizeWidth ? '0' : '1';\
        // verticalDom.style.opacity = oversizeHeight <= sizeHeight ? '0' : '1';\
    };
    
    // Scroll Method
    const calculationMethod = function (args) {
        const {direction, dom, scrollDom, pieceDom} = args;
        if (arg === 'table') {
            el.appendChild(scrollDom);
        } else {
            el.parentNode.appendChild(scrollDom);
        }
        
        if (direction === 'vertical') {
            dom.addEventListener('scroll', function () {
                pieceDom.style.transform = `translate${constant[direction].axis}(${(dom[constant[direction].scroll] * 100) / dom[constant[direction].size]}%)`;
            });
        }
        
        scrollDom.onmousedown = function (e) {
            if (e.ctrlKey || e.button === 2) return;
            e.stopPropagation();
            const offset = Math.abs(e.target.getBoundingClientRect()[constant[direction].direction] - e[constant[direction].client]);
            const thumbHalf = (pieceDom[constant[direction].offset] / 2);
            const thumbPositionPercentage = ((offset - thumbHalf) * 100 / scrollDom[constant[direction].offset]);
            dom[constant[direction].scroll] = thumbPositionPercentage * dom[constant[direction].scrollSize] / 100;
            if (direction === 'horizontal') {
                pieceDom.style.transform = `translate${constant[direction].axis}(${(dom[constant[direction].scroll] * 100) / dom[constant[direction].size]}%)`;
            }
        };
        
        pieceDom.onmousedown = function (e) {
            e.stopPropagation();
            const prevPage = (e.currentTarget[constant[direction].offset] - (e[constant[direction].client] - e.currentTarget.getBoundingClientRect()[constant[direction].direction])) || 0;
            document.onselectstart = () => false;
            document.onmousemove = function (e) {
                if (!prevPage) return;
                const offset = ((scrollDom.getBoundingClientRect()[constant[direction].direction] - e[constant[direction].client]) * -1);
                const thumbClickPosition = (pieceDom[constant[direction].offset] - prevPage);
                const thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / scrollDom[constant[direction].offset]);
                dom[constant[direction].scroll] = thumbPositionPercentage * dom[constant[direction].scrollSize] / 100;
                if (direction === 'horizontal') {
                    pieceDom.style.transform = `translate${constant[direction].axis}(${(dom[constant[direction].scroll] * 100) / dom[constant[direction].size]}%)`;
                }
            };
            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmousedown = null;
                document.onselectstart = null;
            };
        };
    };
};

const scroll = Vue.directive('scroll', {
    bind: function (el, binding) {
        scrollMethod(el, binding);
    }
});

export default {drag, scroll};
