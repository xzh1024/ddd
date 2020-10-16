/**
 * Created by 栗子哥哥 on 2017/8/28.
 */

"use strict";

var sort = require('./sort.js')

module.exports =  function Sort(array,value,options) {
    if(!Array.isArray(array)){
        throw new TypeError("Expected a plain array")
    }
    /*
    * 默认排序方法
    * */
    var defaultOptions = {
        SpellSort:true,                    //中文是否按拼音首字母排序
        SpellUp:true,                      //中文是否按拼音首字母正序排序，即a-z
        NumberUp: true,                    //数字从大往小排序
        EnglishBeforeChinese:true,         //中英文排序是否英文在前
        EnglishUp:true,                    //英文排序是否按正序排序， 即a-z
    };
    var opt = Object.assign({},defaultOptions,options);
    array  = array || [];
    array.sort(function (a,b) {
        //return -1 0 1
        return value?sort(a[value],b[value],opt):sort(a,b,opt)
    })
    return array 
}






