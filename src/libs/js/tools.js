import Constant from '@libs/js/constant';
import _ from 'lodash';

export default class Tools {
    /**
     * 获取随机数
     * min: 最小长度
     * max: 最大长度
     */
    static getRangeRandom(min, max) {
        let returnStr = '';
        const range = (max ? Math.round(Math.random() * (max - min)) + min : min);
        const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        
        for (let i = 0; i < range; i++) {
            const index = Math.round(Math.random() * (arr.length - 1));
            returnStr += arr[index];
        }
        return returnStr;
    }
    
    /**
     * 字节转换
     * @param bytes
     * @returns {string}
     */
    static byteSizeConversion(bytes) {
        const unit = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        if (bytes <= 0) {
            return '0Byte';
        } else {
            const e = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, e)).toFixed(2) + unit[e];
        }
    }
    
    /**
     * 路径转换
     * @param str
     * @returns {*}
     */
    static switchSymbolToLine(str) {
        if (str.indexOf(',') !== -1 || str.indexOf('，') !== -1) {
            str = str.replace(/,/g, '-');
            str = str.replace(/，/g, '-');
        }
        return str;
    }
    
    /**
     * 秒数转化为标准日期
     * @param number
     * @returns {string}
     */
    static switchSecondsToDate(number) {
        number = typeof number === 'number' ? number : Number(number);
        const date = new Date(number * 1000);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const seconds = date.getSeconds();
        return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
    }
    
    /**
     * 判断文件类型
     * @param path
     * @returns {string}
     */
    static judgeFileType(path) {
        if (!path) return;
        const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
        let type = '';
        const fileTypes = Constant.fileTypes;
        if (fileTypes.img.includes(ext)) {
            type = 'img';
        } else if (fileTypes['3d'].includes(ext)) {
            type = '3d';
        } else if (fileTypes.word.includes(ext)) {
            type = 'word';
        } else if (fileTypes.video.includes(ext)) {
            type = 'video';
        } else if (fileTypes.audio.includes(ext)) {
            type = 'audio';
        } else if (fileTypes.zip.includes(ext)) {
            type = 'zip';
        } else {
            type = 'unknown';
        }
        return type;
    }
    
    /**
     * 确认删除框
     * @param vm
     * @param content
     * @param callback
     */
    static deleteConfirm(vm, content, callback) {
        vm.$confirm(content.text || '此操作将删除该数据，是否继续？', content.title || '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            roundButton: true,
            lockScroll: false
        }).then(() => {
            callback()
                .then((data) => {
                    if (data && data.err_code === 0) {
                        vm.$message.success(data.info || content.message || '删除成功');
                    }
                });
        }).catch(() => {
            console.log('已取消');
        });
    }
    
    /**
     * @desc 根据时长 秒 转为 hh:mm:ss
     * @duration duration 时长
     * @return String '24:00:00'
     */
    static switchDurationToTime(duration) {
        if (duration <= 0) {
            return '00:00';
        }
        if (duration > 0 && duration < 60) {
            return '00:' + (Array(2)
                .join('0') + parseInt(duration)).slice(-2);
        }
        if (duration >= 60 && duration < 3600) {
            const minutes = (Array(2)
                .join('0') + (parseInt(duration / 60))).slice(-2);
            const seconds = (Array(2)
                .join('0') + (parseInt(duration % 60))).slice(-2);
            return minutes + ':' + seconds;
        }
        if (duration >= 3600) {
            const hours = (Array(2)
                .join('0') + (parseInt(duration / 3600))).slice(-2);
            const minutes = (Array(2)
                .join('0') + (parseInt((duration % 3600) / 60))).slice(-2);
            const seconds = (Array(2)
                .join('0') + (parseInt(duration % 60))).slice(-2);
            return hours + ':' + minutes + ':' + seconds;
        }
    }
    
    //获取两个对象不同的地方，返回新的对象
    static ObjDifference(object, base) {
        function changes(object, base) {
            return _.transform(object, function (result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }
        
        return changes(object, base);
    }
    
    /**
     * 筛选任务状态并返回数组形式
     * type: 1主任务 2子任务 3节点
     */
    static CoverTaskStatusArray(type) {
        const taskStatusArray = [];
        for (let item in Constant.taskStatus) {
            if (type === 1) {
                if (item >= 1 && item <= 6) {
                    taskStatusArray.push({
                        id: Number(item),
                        name: Constant.taskStatus[item]
                    });
                }
            } else if (type === 2) {
                if (item >= 102 && item <= 111) {
                    taskStatusArray.push({
                        id: Number(item),
                        name: Constant.taskStatus[item]
                    });
                }
            } else if (type === 3) {
                if (item >= 201 && item <= 210) {
                    taskStatusArray.push({
                        id: Number(item),
                        name: Constant.taskStatus[item]
                    });
                }
            }
        }
        return taskStatusArray;
    }
    
    /**
     * 下载函数
     * url 文件地址
     */
    static download(url) {
        const a = document.createElement('a');
        a.href = `${url}&response-content-type=application/octet-stream&response-content-disposition=attachment`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    static downloadFile(url, filename) {
        const image = new Image();
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url + "&time=" + new Date().getTime();
        const canvas = document.createElement("canvas");
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            canvas
                .getContext("2d")
                .drawImage(image, 0, 0, image.width, image.height);
            canvas.toBlob((blob) => {
                this.downloadBlobFile(blob, filename);
            });
        };
        image.onerror = () => {
            this.download(url);
        };
    }
    
    static downloadBlobFile(data, filename) {
        const link = document.createElement("a");
        const url = window.URL.createObjectURL(new Blob([data]));
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    
    // 验证数据是否为空（空值时返回true，null、undefined、空字符串、空数组、空对象都被设定为空）
    static isEmpty(value) {
        switch (typeof value) {
            case "undefined": {
                return true;
            }
            case "string": {
                return value.length === 0;
            }
            case "object": {
                if (Array.isArray(value)) {
                    return value.length === 0;
                } else if (value === null) {
                    return true;
                } else {
                    return Object.keys(value).length === 0;
                }
            }
            default: {
                return false;
            }
        }
    };
}
