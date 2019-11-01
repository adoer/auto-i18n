/* eslint-disable */
const i18n = ( argObj, fs, path, vue) => {
const scanPath = argObj.scanPath;
const writeFileDirZh = argObj.writePath + '\\zh.js';
const writeFileDirEn =  argObj.writePath + '\\en.js';
const prefixA = argObj.prefixA;
let dirArr = [];
let [prefix, name_index] = ['TRANSLATE_', 0];
// 汉字Map
let mapData = { 
    /* '工号': {
        key: prefix + name_index,
        value: '工号',
    } */
};
let keyArr = [];

/**
 * 获取zh.js中的数据并转化为mapData格式
 * @param {String} curStr 获取的汉字
 */
const initMapData = (dir) =>{
    let curEnDir = path.resolve(dir);
     if (fs.existsSync(curEnDir)){
        let data = fs.readFileSync(curEnDir, 'utf8');
        if (data){
            let curMap = {};
            data = data.split('\r');
            data = data.slice(1, data.length - 1);
            let last = data[data.length-1].split(':');
            last = last[0].split('_');
            name_index = Number(last[1].replace('\"','')) + 1;
            data.forEach( el =>{
                let curEl = el.trim();
                curEl = curEl.substr(1, curEl.length - 3);
                curEl = curEl.split('": "');
                curMap[curEl[1]] = {};
                curMap[curEl[1]].key = curEl[0];
                curMap[curEl[1]].value = curEl[1];
            });
            mapData = curMap;
        }
    }
}

/**
 * 生成日志
 * @param
 */
const buildLog = (txt) =>{
    vue.consoleData.push({
        time: vue.getDate(),
        txt: txt
    });
}

/**
 * 获取key
 * @param {String} curStr 获取的汉字
 */
const getKey = (curStr) =>{
    let curKey = prefix + name_index;
    if ( !mapData[curStr] ){
        mapData[curStr] = {};
        mapData[curStr].value = curStr;
        mapData[curStr].key = curKey;
        name_index++;
    }else {
        curKey = mapData[curStr].key;
    }
    return curKey;
}

/**
 * 初始化英文包
 * @param {Array} zhData zh数据
 */
const initEn = () =>{
    let curMap = {};
    let writeMap = {};
    let curEnDir = path.resolve(writeFileDirEn);
    if (fs.existsSync(curEnDir)){
        let data = fs.readFileSync(curEnDir, 'utf8');
        if (data){
            data = data.split('\r');
            data = data.slice(1, data.length - 1);
            data.forEach( el =>{
                let curEl = el.trim();
                curEl = curEl.substr(1, curEl.length - 3);
                curEl = curEl.split('": "');
                curMap[curEl[0]] = curEl[1];
            });
        }
    }

    keyArr.forEach( el =>{
        if (curMap[el]) {
            writeMap[el] = curMap[el];
        }else {
            writeMap[el] = '请翻译'
        }
    });
    return objToJsStr(writeMap);
}

/**
 * 数组转化为写入js的字符串格式
 * @param {Array}
 */
const objToJsStr = (obj) =>{
    let curStr = '';
    if ( JSON.stringify(obj) !== '{}' ){
        curStr = JSON.stringify(obj);
        curStr = curStr.replace(/\{|\}/g,'');
        curStr = curStr.replace(/\,\"/g,',\r   "');
        curStr = curStr.replace(/\"\:\"/g,'": "');
        curStr = 'export default {\r   ' + curStr;
        curStr = curStr + ',\r}';
    }
    return curStr;
}

/**
 * 格式化
 * @param {Object} 需要转化的Map
 */
const objFormatJs = (obj) =>{
    if ( JSON.stringify(obj) !== '{}' ){
        let curObjMap = {};
        let curMap = {};
        for (const item in obj) { 
            curObjMap[obj[item].key] = obj[item].value;
        }
        keyArr.forEach( el =>{
            if (curObjMap[el]) {
                curMap[el] = curObjMap[el];
            }else {
                curMap[el] = '请翻译'
            }
        });
        // 写入zh.js
        fs.writeFile(path.resolve(writeFileDirZh), objToJsStr(curMap), 'utf8', (err) => {
            if (err) throw err;
            buildLog(`构建 ${path.resolve(writeFileDirZh)} 成功`);
        });
        /* 
            写入en.js之前，先对比zh.js 与 en.js的差异
        */
        fs.writeFile(path.resolve(writeFileDirEn), initEn(curMap), 'utf8', (err) => {
            if (err) throw err;
            buildLog(`构建 ${path.resolve(writeFileDirEn)} 成功`);
        });

    }else {
        buildLog(`语言包没有可更新的变动`);
    }
}

/**
 * 国际化
 * @param {String} data 需要国际化的数据
 */
const toI18n = (data, dir) =>{
    data = data.split('\r');
    let scriptIndex = data.findIndex( el =>{
        return /\<script/.test(el);
    })
    data.forEach( (el, i) => {
        // 含有 noAuto 不做任何处理
        if (/noAuto/g.test(el)){
            return;
        } 
        // .vue文件
        if ( /\.vue/.test(dir) ){
            // 识别$t('阿达') 这种
            let pattB = /\$t\(\'\S+ *\S* *\S*\'\)/g;
            // template 里面
            if ( i < scriptIndex ){
                // 识别类似 >阿萨，德< 这种
                let pattA1 = /\>\S*[\u4E00-\u9FA5]+\S* *[\u4E00-\u9FA5]*\S*\</g;
                // 识别 label="账号: " 这种
                let pattC = / \S+\=\"[\u4E00-\u9FA5]+\S* ?\S*[\u4E00-\u9FA5]+ ?:? ?：?？?\"/g;
                if( pattB.test(el) ){
                    // 国际化里有中文
                    if( /[\u4E00-\u9FA5]+/g.test(el) ) {
                        // 替换为英文key
                        data[i] = el.replace(pattB,(a, b, c)=>{
                            let cur = a.replace(/(\$t\()|\'|\)/g, '');
                            let curKey = getKey(cur);
                            keyArr.push(curKey);
                            return `$t('${curKey}')`;
                        });
                    }else {
                        el.replace(pattB,(a, b, c)=>{
                            let cur = a.replace(/(\$t\()|\'|\)/g, '');
                            keyArr.push(cur);
                        });
                    }
                }else if( pattA1.test(el) ){
                    data[i] = el.replace(pattA1,(a, b, c)=>{
                        let cur = a.replace(/\>|\</g, '');
                        let curKey = getKey(cur);
                        keyArr.push(curKey);
                        return `>{{$t('${curKey}')}}<`;
                    });
                }else if( pattC.test(el) ) {
                    data[i] = el.replace(pattC,(a, b, c)=>{
                        let cur = a.replace(/( \S+ ?\=\")|\"/g, '');
                        let curKey = getKey(cur);
                        keyArr.push(curKey);
                        let backCur = a.substr(1);
                        backCur = backCur.replace(/\"[\u4E00-\u9FA5]+\S* ?[\u4E00-\u9FA5]*\S* ?\"/g, (d) =>{
                            return `"$t('${curKey}')"`
                        });
                        return ` :${backCur}`;
                    });
                }
            // script 里面
            }else {
                // 如果是在普通js里前缀为this, ts里的话加(this as any)
                let prefixThis = prefixA || 'this';
                if (/lang=\"ts\"/.test(data[scriptIndex])){
                    prefixThis = prefixA || '(this as any)'
                }
                // 识别类似 '（解除授权后，用户的角色为view）' 这种
                let pattJs2 = /\' ?\S*[\u4E00-\u9FA5]+ *\S* *\S*[\u4E00-\u9FA5]+？?！? ?\'/g;
                if ( pattB.test(el) ){
                    // 国际化里有中文
                    if( /[\u4E00-\u9FA5]+/g.test(el) ) {
                       // 替换为英文key
                        data[i] = el.replace(pattB,(a, b, c)=>{
                            let cur = a.replace(/(\$t\()|\'|\)/g, '');
                            let curKey = getKey(cur);
                            keyArr.push(curKey);
                            return `$t('${curKey}')`;
                        }); 
                    }else {
                        el.replace(pattB,(a, b, c)=>{
                            let cur = a.replace(/(\$t\()|\'|\)/g, '');
                            keyArr.push(cur);
                        });
                    }
                }else if( pattJs2.test(el) ){
                    data[i] = el.replace(pattJs2,(a, b, c)=>{
                        let cur = a.replace(/\'/g,'');
                        let curKey = getKey(cur);
                        keyArr.push(curKey);
                        return `${prefixThis}.$t('${curKey}')`;
                    });
                }
            }
        }
    });
    data = data.join('\r');
    return {
        orginStr: data,
    };
}



/**
 * 文件遍历方法
 * @param inputPath 需要遍历的文件路径
 */

const getDirTree = ( inputPath, callback) => {
     let files = fs.readdirSync(inputPath, 'utf8');
     files.forEach(el =>{
        let filePath = inputPath + '\\' + el;
         let fileState = fs.statSync(filePath);
         if(fileState.isDirectory()){ // 如果是目录 递归
             getDirTree(filePath);
         }else{
             // 过滤文件
            /*  const b = /(\\common)|(shims-)|(config\\monit)/;
             const c = filePath.indexOf('appCenter') > 0;
             const checkFiles = filterArr.filter(el =>{
                 return filePath.indexOf(el) > -1;
             }) */
            if( /\.vue/.test(filePath) && eval(argObj.filter).test(filePath) ){
                dirArr.push(filePath);
            }
         }
     });
     callback && callback.call();
}

/**
 * 生成资源文件
 * @param
 */
const buildAllSource = ()=>{
    for(let dir of dirArr){
        let data1 = fs.readFileSync(path.resolve(dir), 'utf8');
        let data2 = toI18n(data1, dir);
        fs.writeFile(path.resolve(dir), data2.orginStr, 'utf8', (err) => {
            if (err) throw err;
            buildLog(`国际化完成 ${path.resolve(dir)}`);
        });
    }
    keyArr = [...new Set(keyArr)];
    objFormatJs(mapData);
}
  initMapData(writeFileDirZh);
  getDirTree(scanPath);
  buildAllSource();
};

export {
  i18n
}