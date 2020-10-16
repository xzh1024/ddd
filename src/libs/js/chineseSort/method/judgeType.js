/**
 * Created by 栗子哥哥 on 2017/8/29.
 */

var staticType = require("./staticType")

module.exports = function (cha) {
    var charNum = parseInt(cha);
    var reg =cha&&cha.replace(/[\u0391-\uFFE5]/g,"aa").length;
    if(!isNaN(charNum)){
        return  staticType.Number
    }
    else if(reg ===2){
        return  staticType.Chinese
    }
    else if(/[A-Z]/.test(cha)){
        return  staticType.UpperCaseEnglish
    }
    else if(/[a-z]/.test(cha)){
        return  staticType.LowerCaseEnglish
    }
    else{
        return staticType.SpecialCharacter  
    }
}