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
}
