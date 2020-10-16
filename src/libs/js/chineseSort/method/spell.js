/**
 * Created by 栗子哥哥 on 2017/8/30.
 */

var dict = require('./pinyin_dict_firstletter')


/**
 * 获取汉字的拼音首字母
 * @param str 汉字字符串，如果遇到非汉字则原样返回
 */
var getFirstLetter= function(str)
{
    if(!str || /^ +$/g.test(str)) return '';
    var result = [];
    for(var i=0; i<str.length; i++)
    {
        var unicode = str.charCodeAt(i);
        var ch = str.charAt(i);
        if(unicode >= 19968 && unicode <= 40869)
        {
            ch = dict.all.charAt(unicode-19968);
        }
        result.push(ch);
    }
    return result.join(''); //直接将数组拼接成字符串
   


};

module.exports  = function (A,B,Opt) {
    var APY = getFirstLetter(A)
    var BPY = getFirstLetter(B)
    var order = dict.pyOrder;
    return Opt.SpellUp ? order[APY] - order[BPY] : order[BPY] - order[APY]
}