/**
 * Created by 栗子哥哥 on 2017/8/29.
 */

"use strict";


var charSort = require('./charSort')

module.exports = function(a,b,options){
    var result;
    if(!isNaN(a)&&!isNaN(b)){
        result =(a===b)?0:(options.NumberUp?(a>b?1:-1):(a>b?-1:1))
    }
    else if(!isNaN(a)&&isNaN(b) || isNaN(a)&&!isNaN(b)){
        result = isNaN(a) ? -1 : 1;
    }
    else{
        a = String(a); b= String(b);
        a = a.replace(/^\s+|\s+$/gm,'');
        b = b.replace(/^\s+|\s+$/gm,'');
        var aChaArr =  a.split("") || [];
        var bChaArr =  b.split("") || [];
        var aLength = aChaArr.length;
        var bLength = bChaArr.length;
        var longLength = aLength>bLength?aLength:bLength;
        if(!(aLength&&bLength)){
            return result =  aLength > bLength ? -1 : 1;
        }
        else{
            for(var i=0;i<longLength;i++){
                var num = charSort(aChaArr[i],bChaArr[i],options);
                if( num !== 0){
                    result = num;
                    break;
                }
            }
        }
    }
    return result
}
