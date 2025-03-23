// src/utils/echartsSetup.js
import * as echarts from 'echarts'

export function setupHeatmap(chartElement, data, TRIMorder) {
  const myChart = echarts.init(chartElement)

  // 处理数据
  const transformedData = data.map((item) => ({
    value: [
      TRIMorder.indexOf(item.TRIMname1),
      TRIMorder.indexOf(item.TRIMname2),
      parseFloat(item.rmsd),
      parseFloat(item.tmscore)
    ],
    group1: item.group1,
    group2: item.group2
  }))

  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        const xLabel = TRIMorder[params.data.value[0]]
        const yLabel = TRIMorder[params.data.value[1]]
        const rmsd = params.data.value[2]
        const value = params.data.value[3]
        const group1 = params.data.group1
        const group2 = params.data.group2
        return `X: ${xLabel} (Group: ${group1})<br>Y: ${yLabel} (Group: ${group2})<br>TMscore: ${value}<br>rmsd:${rmsd}`
      }
    },
    grid: {
      height: 'auto',
      top: '10%',
      left: '6%'
    },
    xAxis: {
      type: 'category',
      data: TRIMorder,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 7
      },
      axisLine: {
        lineStyle: {
          width: 1
        }
      }
    },
    yAxis: {
      type: 'category',
      data: TRIMorder,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        fontSize: 7
      }
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        moveHandleSize: 3,
        borderRadius: [11, 11, 11, 11],
        handleSize: '200%',
        height: 10,
        bottom: '3%'
      },
      {
        type: 'slider',
        show: true,
        yAxisIndex: [0],
        left: '92%',
        moveHandleSize: 3,
        borderRadius: [11, 11, 11, 11],
        handleSize: '200%',
        width: 10
      },
      {
        type: 'inside',
        xAxisIndex: [0]
      },
      {
        type: 'inside',
        yAxisIndex: [0]
      }
    ],
    visualMap: {
      // handleSize: '125%',
      handleStyle: {
        borderColor: '#8c07dd'
      },
      type: 'continuous',
      precision: 2,
      itemHeight: 250,
      itemWidth: 20,
      text: ['high', 'low'],
      min: 0,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'right',
      top: '1%',
      inRange: {
        color: ['white', '#bbd0ff', '#8c07dd']
      },
      inactiveColor: 'red'
      // padding: [0, 0, 0, 0]
    },
    series: [
      {
        name: 'tmscore',
        type: 'heatmap',
        data: transformedData,
        emphasis: {
          itemStyle: {
            shadowBlur: 5,
            shadowColor: 'rgba(0, 0, 0, 2)'
          }
        }
      }
    ]
  }

  myChart.setOption(option)

  // 监听 dataZoom 事件
  myChart.on('dataZoom', function (params) {
    const zoom = params.batch[0].start / 100 // 假设 zoom 比例从 0 到 1
    const newFontSize = 7 + zoom * 15 // 基础大小为 7，最大增大 10

    // 更新 x 轴和 y 轴的标签字体大小
    myChart.setOption({
      xAxis: {
        axisLabel: {
          fontSize: newFontSize
        }
      },
      yAxis: {
        axisLabel: {
          fontSize: newFontSize
        }
      }
    })
  })
}
