import CosAuth from '@libs/js/cos-auth.min';
import Constant from '@libs/js/constant';
import {SystemGlobalRequest} from "commonHttp";
import {Env} from "./utils";
import Tools from '@libs/js/tools';
import md5 from 'md5';

// Get Signature
const Authorization = function (options, callback) {
    const env = Env();
    const url = `${env.url}/api/cos-getacc`;
    const xhr = new XMLHttpRequest();
    xhr.open('post', url, true);
    xhr.setRequestHeader('token', localStorage.token);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    const random = Tools.getRangeRandom(12, 16);
    const secretStr = Constant.secretStr;
    const secret = md5(secretStr + random);
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let credentials;
                try {
                    credentials = (new Function('return ' + xhr.responseText))().data;
                } catch (e) {
                    console.log(e);
                }
                if (credentials) {
                    callback(null, {
                        path: credentials.Path,
                        XCosSecurityToken: credentials.Token,
                        Authorization: CosAuth({
                            SecretId: credentials.TmpSecretId,
                            SecretKey: credentials.TmpSecretKey,
                            Method: 'post',
                            Pathname: '/'
                        })
                    });
                } else {
                    if (xhr.response && JSON.parse(xhr.response).err_code === 1) {
                        callback('unLogin');
                        return;
                    }
                    callback('获取签名出错.');
                }
            } else {
                callback('获取签名出错.');
            }
        }
    };
    xhr.send(`type=${options.type}&a_ran=${random}&a_str=${secret}`);
};

// Url Encode
const camSafeUrlEncode = (str) => {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
};

// Accept upload result
const AcceptUploadResult = (key, eTag) => {
    const url = Constant.tcuParams.prefix + camSafeUrlEncode(key).replace(/%2F/g, '/');
    return {
        url: url,
        eTag: eTag
    };
};

// Backend verify
const UploadedFileVerify = async (data, callback) => {
    let res = await SystemGlobalRequest.getVerifyUploadedFile(data);
    if (res.err_code === 0) {
        callback(res.data);
    }
};

export default {
    Authorization,
    AcceptUploadResult,
    UploadedFileVerify
};
