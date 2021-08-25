# 中国七普老龄化情况

## 项目结构

- 入口
  - <index.html>: 包括html代码和主体js
- 脚本
  - <charts.js>: 作图函数
  - <utils.js>: 辅助函数
- 数据
  - <src> 目录下各种地图geojson，精确到市级
  - <src/chnGeoJson.json>: 通过程序处理，将各市级地图合并为单个json
  - <src/ageingData.json>: 老龄化数据集，包括省级趋势`ageingData`和市级明细`ageingTrend`

## 说明

- 主要基于Echarts 5制图
- 需要用到bootcdn
- 修改<src/chnGeoJson.json>文件并commit，即可通过GitHub或Gitee的pages服务渲染为网页
