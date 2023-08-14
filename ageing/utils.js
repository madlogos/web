//增加cp属性
function setCP(geoJsonData) {
    for (var i = 0; i < geoJsonData['features'].length; i++) {
        if (geoJsonData['features'][i]['properties'].hasOwnProperty('centroid')){
            geoJsonData['features'][i]['properties']['cp'] = geoJsonData['features'][i]['properties']['centroid']
        }else{
            geoJsonData['features'][i]['properties']['cp'] = geoJsonData['features'][i]['properties']['center']
        }
    }
    return geoJsonData
};
//异步获取地图json数据
async function getGeoJson(jsonName, set_cp=false, baseUrl=publicUrl) {
    if (baseUrl.charAt(baseUrl.length-1) !== '/') {
        baseUrl = baseUrl + '/'
    }
    ret = await $.getJSON(baseUrl + jsonName)
    if (set_cp) {
        ret = setCP(ret)
    }
    return ret
};
async function getJson(jsonName, baseUrl=publicUrl) {
    if (baseUrl.charAt(baseUrl.length-1) !== '/') {
        baseUrl = baseUrl + '/'
    }
    ret = await $.getJSON(baseUrl + jsonName)
    return ret
};
//抽取geojson线段
function getGeoJsonLines(geoJson, lineStyle={color: '#FFF', width: 0.25}) {
    let ret = [];
    for (let i=0; i<geoJson['features'].length; i++){
        let feature = geoJson['features'][i];
        for (let j=0; j<feature['geometry']['coordinates'].length; j++){
            let coord = feature['geometry']['coordinates'][j];
            ret.push({
                'name': feature['properties']['adcode'] + j, 
                'coords': coord[0],
                'lineStyle': lineStyle
            });
        }
    }
    return ret;
};
//加载js
async function loadScript(src, callback) {
    let script = document.createElement('script');
    let head = document.getElementsByTagName('head')[0];
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = src;
    if (script.addEventListener) {
        script.addEventListener('load', function () {
            callback();
        }, false);
    } else if (script.attachEvent) {
        script.attachEvent('onreadystatechange', function () {
            let target = window.event.srcElement;
            if (target.readyState == 'loaded') {
                callback();
            }
        });
    }
    head.appendChild(script);
};
//自适应大小计算
function fitSize(val, minVal=12, initWidth=1920){
    let nowClientWidth = document.documentElement.clientWidth;
    if (nowClientWidth < 1024) {
        return minVal + (val-minVal) * nowClientWidth/initWidth;
    }else{
        return minVal*0.66 + (val-minVal*0.66) * nowClientWidth/initWidth;
    }
};
//中国地图投影
function getGeoProj(geoName='中国'){
    let provName = geoName.substr(1,2);
    let refs = {'y': [25, 47], 'x': 105};
    switch(provName){
        case '北京': refs = {'y': [39.5, 40.4], 'x': 116.3}; break;
        case '天津': refs = {'y': [38.5, 39.5], 'x': 117.3}; break;
        case '河北': refs = {'y': [37.3, 41.0], 'x': 116.3}; break;
        case '山西': refs = {'y': [36.0, 40.0], 'x': 112.3}; break;
        case '内蒙': refs = {'y': [40.0, 51.3], 'x': 111.0}; break;
        case '辽宁': refs = {'y': [39.3, 42.3], 'x': 122.3}; break;
        case '吉林': refs = {'y': [42.0, 45.3], 'x': 126.3}; break;
        case '黑龙': refs = {'y': [45.0, 52.3], 'x': 128.3}; break;
        case '上海': refs = {'y': [31.0, 31.3], 'x': 121.3}; break;
        case '江苏': refs = {'y': [31.3, 34.3], 'x': 119.3}; break;
        case '浙江': refs = {'y': [28.0, 30.3], 'x': 120.0}; break;
        case '安徽': refs = {'y': [30.3, 33.3], 'x': 117.0}; break;
        case '福建': refs = {'y': [24.0, 27.3], 'x': 118.0}; break;
        case '江西': refs = {'y': [26.0, 29.0], 'x': 116.0}; break;
        case '山东': refs = {'y': [35.0, 37.3], 'x': 118.3}; break;
        case '河南': refs = {'y': [32.3, 35.3], 'x': 113.3}; break;
        case '湖北': refs = {'y': [30.0, 32.3], 'x': 112.3}; break;
        case '湖南': refs = {'y': [26.0, 29.0], 'x': 111.3}; break;
        case '广东': refs = {'y': [19.0, 24.3], 'x': 113.3}; break;
        case '广西': refs = {'y': [22.3, 25.3], 'x': 108.3}; break;
        case '海南': refs = {'y': [18.3, 19.3], 'x': 110.0}; break;
        case '重庆': refs = {'y': [29.0, 31.3], 'x': 107.3}; break;
        case '四川': refs = {'y': [27.3, 33.3], 'x': 104.0}; break;
        case '贵州': refs = {'y': [25.0, 28.3], 'x': 106.3}; break;
        case '云南': refs = {'y': [23.0, 27.3], 'x': 102.0}; break;
        case '西藏': refs = {'y': [29.0, 35.0], 'x': 88.3}; break;
        case '陕西': refs = {'y': [35.0, 38.0], 'x': 109.0}; break;
        case '甘肃': refs = {'y': [34.0, 41.0], 'x': 102.0}; break;
        case '青海': refs = {'y': [33.0, 38.0], 'x': 97.0}; break;
        case '宁夏': refs = {'y': [36.0, 38.3], 'x': 106.0}; break;
        case '新疆': refs = {'y': [36.3, 48.0], 'x': 85.0}; break;
        case '台湾': refs = {'y': [24.0, 27.3], 'x': 120.9}; break;
        case '香港': refs = {'y': [19.0, 24.3], 'x': 113.3}; break;
        case '澳门': refs = {'y': [19.0, 24.3], 'x': 113.3}; break;
        default: refs = {'y': [25, 47], 'x': 105};
    };
    return d3.geoConicConformal()
        .parallels(refs['y'])
        .rotate([-40, 50])
        .center([refs['x'], (47+refs['y'][0]+refs['y'][1])/3]);
}
