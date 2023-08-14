
/*
 * @Author: wyy
 * @Date: 2021-08-25 09:10:47
 * @LastEditors: wyy
 * @LastEditTime: 2021-08-25 17:34:20
 * @Descripttion: 
 */

//echarts绘图
function initEchartsTlMap(geoJson, name, chart, bounding_coords=null, show_label=true) {
    
    echarts.registerMap(name, geoJson);
    let option = {
        timeline: {
            data: Object.keys(ageingTrend),
            autoPlay: true,
            playInterval: 3000
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        tooltip: {
            show: true,
            formatter: function(params) {
                if (isNaN(params.value)){
                    return params.marker + ' ' + params.name + ' <b>无数据</b>';
                }else{
                    return params.marker + ' ' + params.name + ' <b>' + params.value + '%</b>';
                }
            }
        },
        options: [],
        series: []
    }
    for (var yr in ageingTrend) {
        option['options'].push({
            title: {
                text: '常住人口老龄化率',
                subtext: yr,
                left: 'center'
            },
            series: [{
                name: '老龄化率',
                data: ageingTrend[yr],
                itemStyle: {
                    borderColor: "#EEE"
                }
            }],
            visualMap: {
                min: 5,
                max: 35,
                text: ['高', '低'],
                realtime: false,
                calculable: true,
                inRange: {
                    color: ['#FDE725', '#440154']
                }
            },
            boundingCoords: bounding_coords
        })
        option['series'].push({
            type: 'map',
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            map: name,
            roam: true,
            label: {
                show: show_label,
                formatter: function(params) {
                    if (isNaN(params.value)) {
                        return ''
                    }else{
                        return params.value + '%'
                    }
                },
                color: "#FFF",
                backgroundColor: "#00000055",
                bordercolor: "#DDD"
            },
            itemStyle: {
                borderColor: "#EEE"
            }
        })
    };
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
};
function initEchartsTotalMap(geoJson, name, bgGeoJson, chart, topn=30) {
    echarts.registerMap(name, geoJson);
    echarts.registerMap('分省', bgGeoJson);
    linesData = getGeoJsonLines(bgGeoJson);
    let vizData = [];
    for (var k in ageingData) {
        if (k !== '中华人民共和国') {
            for (var i=0; i<ageingData[k].length; i++){
                if (! isNaN(ageingData[k][i].value)) {
                    vizData.push(ageingData[k][i])
                }
            }                    
        }
    }
    vizData = vizData.sort((x, y) => Number(x.value) - Number(y.value));
    vizData = vizData.slice(vizData.length-topn, vizData.length).concat(
        vizData.slice(0, vizData.length-topn));
    let option = {
        title: {
            text: '常住人口老龄化率',
            subtext: 2020,
            left: 'center'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        geo: {
            map: '分省',
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            itemStyle: {
                areaColor: "transparent",
                borderColor: '#DDD',
                borderWidth: 1
            },
            boundingCoords: [[78, 50], [130, 20]]
        },
        tooltip: {
            show: true,
            formatter: function(params) {
                if (isNaN(params.value)) {
                    return params.marker + ' ' + params.name + ' <b>无数据</b>';
                }else{
                    return params.marker + ' ' + params.name + ' <b>' + params.value + '%</b>';
                }
            }
        },
        visualMap: {
            min: 5,
            max: 35,
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
                color: ['#FDE725', '#440154']
            }
        },
        series: [{
            type: 'map',
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            map: name,
            name: '老龄化率',
            data: vizData,
            itemStyle: {
                borderColor: "rgba(255,255,255,0)",
                borderWidth: 0.1
            },
            boundingCoords: [[78, 50], [130, 20]]
        }, {
            type: 'lines',
            name: '背景',
            data: linesData,
            large: true,
            polyline: true,
            coordinateSystem: 'geo',
            z: 10,
            tooltip: {
                show: false
            },
            lineStyle: {
                color: "#DDD",
                width: 0.5,
                opacity: 0.75
            }
        }]
    };
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
};
function initEchartsTotalBar(dataJson, chart, topn=30, show_label=true) {
    
    let newJson = [];
    for (let k in dataJson){
        for (let i = 0; i<dataJson[k].length; i++) {
            let v = dataJson[k][i];
            if (['黑龙江省', '吉林省', '辽宁省'].includes(k)) {
                v['片区'] = '东北'
            }else if (['内蒙古自治区', '河北省', '山西省', '北京市', '天津市'].includes(k)) {
                v['片区'] = '华北'
            }else if (['上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '台湾省'].includes(k)) {
                v['片区'] = '华东'
            }else if (['河南省', '湖北省', '湖南省'].includes(k)) {
                v['片区'] = '华中'
            }else if (['广东省‘, ’广西壮族自治区', '海南省', '香港特别行政区', '澳门特别行政区'].includes(k)) {
                v['片区'] = '华南'
            }else if (['重庆市', '四川省', '贵州省', '云南省', '西藏自治区'].includes(k)) {
                v['片区'] = '西南'
            }else if (['陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'].includes(k)) {
                v['片区'] = '西北'
            }
            v['parent'] = k;
            if (! isNaN(v['value'])){
                newJson.push(v);                        
            }
        }
    }
    newJson = newJson.sort((x, y) => Number(x.value) - Number(y.value));
    let visData = {'东北': [], '华北': [], '华东': [], '华中': [], '华南': [], '西北': [], '西南': []};
    let axisLbl = [];
    let placeHolders = [];
    for (let i=0; i<topn; i++) {
        placeHolders.push(newJson[newJson.length-1]['value']);
        for (let k in visData){
            if (k === newJson[newJson.length-topn+i]['片区']){
                visData[k].push(newJson[newJson.length-topn+i]['value']);
            }else{
                visData[k].push(null);
            }
        }
        axisLbl.push(newJson[newJson.length-topn+i]['name']);
    }
    let option = {
        title: {
            text: '老龄化前' + topn + '名',
            subtext: '2020',
            left: 'center'
        },
        grid: {
            left: '15%',
            right: '20%',
            bottom: '5%'
        },
        tooltip: {
            show: true,
            formatter: function(params){
                if (isNaN(params.value)) {
                    return params.seriesName + '<br>' + params.marker + '  ' +
                        params.name + '<span style="font-weight:bold;padding-left:1em">无数据</span>' 
                }else{
                    return params.seriesName + '<br>' + params.marker + '  ' +
                        params.name + '<span style="font-weight:bold;padding-left:1em">' + 
                        params.value + '%</span>' 
                }
            }
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        legend: {
            show: true,
            left: 'right',
            top: 'middle',
            orient: 'vertical',
            data: ['东北', '华北', '华东', '华中', '华南', '西南', '西北'],
            textStyle: {
                fontSize: fitSize(16, 8)
            }
        },
        yAxis: {
            show: true,
            type: 'category',
            splitLine: {
                lineStyle: {
                    color: "#EEE"
                }
            },
            data: axisLbl,
            axisLabel: {
                fontSize: fitSize(14, 7)
            },
            axisTick: {
                show: false
            }
        },
        xAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: "#EEE"
                }
            },
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [{
            name: '老龄化率',
            type: 'bar',
            data: placeHolders,
            itemStyle: {
                color: 'transparent'
            },
            barGap: '-50%',
            tooltip: {
                show: false
            },
            z: 3
        }, {
            name: '东北',
            type: 'bar',
            stack: 'total',
            data: visData['东北'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }, {
            name: '华北',
            type: 'bar',
            stack: 'total',
            data: visData['华北'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }, {
            name: '华东',
            type: 'bar',
            stack: 'total',
            data: visData['华东'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }, {
            name: '华中',
            type: 'bar',
            stack: 'total',
            data: visData['华中'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }, {
            name: '华南',
            type: 'bar',
            stack: 'total',
            data: visData['华南'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }, {
            name: '西南',
            type: 'bar',
            stack: 'total',
            data: visData['西南'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }, {
            name: '西北',
            type: 'bar',
            stack: 'total',
            data: visData['西北'],
            emphasis: {
                focus: 'self'
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }],
        color: ['#c1232b', '#fcce10', '#e87c25', '#b5c334', '#fe8463', '#27727b', '#f3a43b', '#60c0dd']
    }
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
};
function initEchartsChangeBar(dataJson, chart, base=2010, compare=2020, show_label=true) {
    
    let option = {
        title: {
            text: '各省老龄化率变迁',
            subtext: base + ' ~ ' + compare,
            left: 'center'
        },
        grid: {
            left: '20%',
            right: '5%',
            bottom: '5%'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        tooltip: {
            show: true
        },
        yAxis: {
            show: !show_label,
            type: 'category',
            splitLine: {
                lineStyle: {
                    color: "#EEE"
                }
            },
            axisLabel: {
                fontSize: fitSize(10, 7)
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            data: []
        },
        xAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: "#EEE"
                }
            },
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [{
            name: base.toString(),
            type: 'scatter',
            label: {
                show: show_label,
                position: 'left',
                distance: 10,
                color: '#666',
                formatter: function(params){
                    return '{lbl|' + params.name +  '}{txt|' + params.value[0] + '%}'

                },
                rich: {
                    lbl: {
                        fontWeight: 'bold'
                    },
                    txt: {
                        padding: [0, 0, 0, 10]
                    }
                }
            },
            tooltip: {
                formatter: function(params){
                    return params.seriesName + '<br>' + params.marker + '  ' +
                        params.name + '<span style="font-weight:bold;padding-left:1em">' + 
                        params.value[0] + '%</span>'
                }
            },
            color: '#FDE725',
            data: []
        }, {
            name: compare.toString(),
            type: 'scatter',
            tooltip: {
                formatter: function(params){
                    return params.seriesName + '<br>' + params.marker + '  ' +
                        params.name + '<span style="font-weight:bold;padding-left:1em">' + 
                        params.value[0] + '%</span>' 
                }
            },
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#666',
                formatter: function(params){
                    return params.value[0] + '%'
                }
            },
            color: '#440154',
            data: []
        }, {
            name: '辅助',
            type: 'bar',
            stack: '变化',
            barWidth: 3,
            tooltip: {
                show: false
            },
            itemStyle: {
                barBorderColor: 'rgba(255,255,255,0)',
                color: 'rgba(255,255,255,0)'
            },
            emphasis: {
                itemStyle: {
                    barBorderColor: 'rgba(255,255,255,0)',
                    color: 'rgba(255,255,255,0)'
                }
            },
            data: []
        }, {
            name: '变迁',
            type: 'bar',
            stack: '变化',
            tooltip: {
                formatter: function(params){
                    return params.seriesName + '<br>' + params.marker + '  ' +
                        params.name + '<span style="font-weight:bold;padding-left:1em">' + 
                        params.value + '%</span>' 
                }
            },
            barWidth: 3,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(
                    0, 0, 1, 0,
                    [
                        {offset: 0, color: '#FDE725'},
                        {offset: 1, color: '#440154'}
                    ]
                )
            },
            data: []
        }]
    }
    let compareArray = dataJson[compare].sort((x, y) => Number(x.value) - Number(y.value));
    for (var i=0; i<compareArray.length; i++){
        option['yAxis']['data'].push(compareArray[i]['name']);
        option['series'][1]['data'].push([compareArray[i]['value'], i]);
        for (var j=0; j<dataJson[base].length; j++) {
            if (dataJson[base][j]['name'] === compareArray[i]['name']) {
                option['series'][0]['data'].push([dataJson[base][j]['value'], i])
                option['series'][2]['data'].push(dataJson[base][j]['value'])
                option['series'][3]['data'].push(
                    (compareArray[i]['value']-dataJson[base][j]['value']).toFixed(1))
            }
        }
    };
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
};
function initEchartsDrillMap(geoJson, name, chart, alladcode, show_label=true, border_color='#EEE') {
    let seriesData;
    try{
        seriesData = ageingData[name].sort((x, y) => Number(x.value) - Number(y.value))
    }catch{
        seriesData = null
    }
    echarts.registerMap(name, geoJson);
    let option = {
        title: {
            text: name,
            subtext: 2020,
            left: 'center'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        tooltip: {
            show: true,
            formatter: function(params) {
                if (isNaN(params.value)){
                    return params.marker + ' ' + params.name + ' <b>无数据</b>';
                }else{
                    return params.marker + ' ' + params.name + ' <b>' + params.value + '%</b>';
                }
            }
        },
        visualMap: {
            min: 5,
            max: 35,
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
                color: ['#FDE725', '#440154']
            }
        },
        series: [{
            type: 'map',
            map: name,
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            roam: true,
            name: '老龄化率',
            data: seriesData,
            label: {
                show: show_label,
                formatter: function(params) {
                    if (isNaN(params.value)) {
                        return('')
                    }else{
                        return(params.value + '%')
                    }
                },
                color: "#FFF",
                backgroundColor: "#00000055",
                bordercolor: "#DDD"
            },
            itemStyle: {
                borderColor: border_color,
                borderWidth: 0.5
            }
        }]
    }
    if (name=='中华人民共和国'){
        option['boundingCoords'] = [[78, 50], [130, 20]]
    }
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
    // 解绑click事件
    chart.off("click");
    //给地图添加监听事件
    chart.on('click', params => {
        let clickRegion = alladcode.filter(areaJson => areaJson.name === params.name);
        let mapName = params.name;
        let mapCode = 100000;
        if (clickRegion !== undefined){
            mapCode = parseInt(clickRegion[0].adcode)
        }
        if (Math.floor(mapCode/100) * 100 !== mapCode) {
            mapName = '中华人民共和国'
        }
        getGeoJson(mapCode + '_full.json').then(regionGeoJson => {
            initEchartsDrillBar(ageingData, mapName, chartDrillBar, showLabel.checked);            
            initEchartsDrillMap(regionGeoJson, mapName, chart, alladcode, showLabel.checked);
        }).catch(err => {
            getGeoJson('100000_full.json', true).then(chinaGeoJson => {
                initEchartsDrillBar(ageingData, '中华人民共和国', chartDrillBar, showLabel.checked)
                initEchartsDrillMap(chinaGeoJson, '中华人民共和国', chart, alladcode,showLabel.checked);
            })
        });
        // try{
        //     loadScript('src/' + clickRegionCode + '.js', () => {
        //         initEchartsDrillMap(chnGeoJsons[params.name], params.name, chart, alladcode, showLabel.checked)
        //     })
        //     initEchartsDrillBar(ageingData, params.name, chartDrillBar, showLabel.checked);
        // }catch{
        //     initEchartsDrillMap(chnGeoJsons['中华人民共和国'], '中华人民共和国', chart, alladcode, showLabel.checked)
        //     initEchartsDrillBar(ageingData, '中华人民共和国', chartDrillBar, showLabel.checked);
        // }
    })
};
function initEchartsDrillBar(dataJson, name, chart, show_label=true){            
    let vizData = dataJson[name];
    vizData = vizData.sort((x, y) => Number(x.value) - Number(y.value));
    let axisLbl = [];
    let axisFontSize = fitSize(16, 12);
    if (name === '中华人民共和国') {
        axisFontSize = fitSize(12, 9);
    }else if (name === '重庆市') {
        axisFontSize = fitSize(10, 12);
    }
    let barData = [];
    for (let i = 0; i<vizData.length; i++) {
        axisLbl.push(vizData[i].name);
        barData.push(vizData[i].value);
    }
    let option = {
        title: {
            text: name,
            subtext: '2020',
            left: 'center'
        },
        grid: {
            left: '25%',
            bottom: '5%'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        tooltip: {
            show: true,
            formatter: function(params) {
                if (isNaN(params.value)){
                    return params.marker + ' ' + params.name + ' <b>无数据</b>';
                }else{
                    return params.marker + ' ' + params.name + ' <b>' + params.value + '%</b>';
                }
            }
        },
        visualMap: {
            show: false,
            min: 5,
            max: 35,
            text: ['高', '低'],
            dimension: 0,
            realtime: false,
            calculable: true,
            inRange: {
                color: ['#FDE725', '#440154']
            }
        },
        yAxis: {
            show: true,
            type: 'category',
            splitLine: {
                lineStyle: {
                    color: "#EEE"
                }
            },
            data: axisLbl,
            axisLabel: {
                fontSize: axisFontSize
            },
            axisTick: {
                show: false
            }
        },
        xAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: "#EEE"
                }
            },
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [{
            name: '老龄化率',
            type: 'bar',
            data: barData,
            label: {
                show: show_label,
                position: 'right',
                distance: 10,
                color: '#999',
                formatter: function(params){
                    if (params.value !== null){
                        return params.value + '%'
                    }
                }
            }
        }]
    }
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
}
function initEchartsAdmMap(geoJson, name, chart, alladcode, show_label=true, border_color='#999') {
    const nColors = 15;
    let vizData = {'●': [], '○': []};
    let codeDict = {};
    let keyPattern = {'province': /(省|市|特别行政区)$/, 'city': /市$/, 'district': /[区區]$/}
    let features = geoJson['features'];
    try{
        features = features.sort((x, y) => {
            if (Object.keys(x.properties).includes('centroid')){
                xc = x.properties.centroid
            }else if (Object.keys(x.properties).includes('center')){
                xc = x.properties.center
            }else{
                xc = [x.properties.adcode, x.properties.adcode]
            }
            if (Object.keys(y.properties).includes('centroid')){
                yc = y.properties.centroid
            }else if (Object.keys(y.properties).includes('center')){
                yc = y.properties.center
            }else{
                yc = [y.properties.adcode, y.properties.adcode]
            }
            xc[1] - yc[1] + (xc[0] - yc[0]) / 2
        })
    }catch{
        features = features.sort((x, y) => {
            x.properties.adcode - y.properties.adcode
        })
    }
    for (let i=0; i<features.length; i++) {
        let feature = features[i];
        let lvl = feature['properties']['level'];
        let adname = feature['properties']['name'];
        let val = i % nColors + 1;
        if (adname.search(keyPattern[lvl]) > 0){
            vizData['●'].push({
                'name': adname, 'value': val
            })
        }else{
            vizData['○'].push({
                'name': adname, 'value': val
            })
        }
        codeDict[adname] = feature.properties.adcode;
    }
    echarts.registerMap(name, geoJson);
    let option = {
        title: {
            text: name,
            left: 'center'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        tooltip: {
            show: false
        },
        geo: {
            map: name,
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            roam: true,
            itemStyle: {
                borderColor: border_color,
                areaColor: '#F6F6F6',
                borderWidth: 0.75,
                borderType: 'dashed'
            },
            label: {
                show: show_label,
                fontSize: fitSize(14, 10),
                formatter: function(params){
                    let adcode = alladcode.filter(areaJson => areaJson.name === params.name);
                    let lvl = '';
                    if (typeof(adcode) !== 'undefined' && adcode.length > 0){
                        lvl = adcode[0].level
                    }
                    if (
                        (lvl == 'city' && params.name.search(/市$/) > 0) ||
                        (lvl == 'district' && params.name.search(/[区區]$/) > 0)) {
                        return '{key|' + params.name + '}'
                    }else if (
                        (lvl == 'province' && params.name.search(/自治区$/) > 0) ||
                        (lvl == 'city' && params.name.search(/(地区|[县縣])$/) > 0) ||
                        (lvl == 'district' && params.name.search(/[县乡郷镇鎮]$/) > 0)){
                        return '{low|' + params.name + '}'
                    }else{
                        return '{nml|' + params.name + '}'
                    }
                },
                rich: {
                    key: {
                        color: '#333',
                        fontWeight: 'bold'
                    },
                    nml: {
                        color: '#666',
                        fontWeight: 'bold'
                    },
                    low: {
                        color: '#666'
                    }
                }
            }
        },
        visualMap: {
            show: false,
            type: 'piecewise',
            min: 1,
            max: nColors,
            splitNumber: nColors,
            inRange: {
                color: [
                    '#c1232b33', '#27727b33', '#fcce1033', '#e87c2533', '#b5c33433',
                    '#fe846333', '#60c0dd33', '#fad86033', '#f3a43b33', '#9bca6333',
                    '#d7504b33', '#26c0c033', '#f4e00133', '#f0805a33', '#c6e57933'
                    ],
                opacity: 0.25
            }
        },
        series: [{
            type: 'map',
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            name: '●',
            map: name,
            geoIndex: 0,
            data: vizData['●'],
            itemStyle: {
                borderColor: "rgba(255,255,255,0)",
                borderStyle: 'dashed'
            },
            showLegendSymbol: true,
            tooltip: {
                show: true,
                formatter: function(params) {
                    return '名称: <b>' + params.name + '</b><br>代码: <b>' + 
                        codeDict[params.name] + '</b>'
                }
            },
            label: {
                show: show_label,
                fontSize: fitSize(14, 10),
                color: '#666',
                fontWeight: 'bold'
            },
            emphasis: {
                label: {
                    show: false
                }
            },
            z: 3
        }, {
            type: 'map',
            projection: {
                project: (point) => getGeoProj(name)(point),
                unproject: (point) => getGeoProj(name).invert(point)
            },
            name: '○',
            map: name,
            geoIndex: 0,
            data: vizData['○'],
            itemStyle: {
                borderColor: "rgba(255,255,255,0)",
                borderStyle: 'dashed'
            },
            showLegendSymbol: true,
            tooltip: {
                show: true,
                formatter: function(params) {
                    return '名称: <b>' + params.name + '</b><br>代码: <b>' + 
                        codeDict[params.name] + '</b>'
                }
            },
            emphasis: {
                label: {
                    show: false
                }
            },
            label: {
                show: show_label,
                fontSize: fitSize(14, 10),
                color: '#666'
            },
            z: 3
        }]
    }
    chart.setOption(option, true);
    chart.resize();
    chart.hideLoading();
    // 解绑click事件
    chart.off("click");
    //给地图添加监听事件
    chart.on('click', params => {
        let clickRegion = alladcode.filter(areaJson => areaJson.name === params.name);
        let mapName = params.name
        if (typeof(clickRegion) === 'undefined' ||
        parseInt(clickRegion[0].adcode/100)*100 !== clickRegion[0].adcode) {
            clickRegion = [{'adcode': 100000}];
            mapName = '中华人民共和国';
        }
        getGeoJson(clickRegion[0].adcode + '_full.json').then(regionGeoJson => {
            initEchartsAdmMap(regionGeoJson, mapName, chart, alladcode, showLabel.checked);
        }).catch(err => {
            getGeoJson('100000_full.json', true).then(chinaGeoJson => {
                initEchartsAdmMap(chinaGeoJson, '中华人民共和国', chart, alladcode, showLabel.checked)   
            })
        });
    })
};
