import * as d3 from 'd3'
import * as Plot from '@observablehq/plot'

export const RadarZR = (points, options = {}) => {
  const defaultOptions = {
    width: 450,
    height: 450,
    backgroundColor: 'white',
    strokeColor: 'black',
    fillOpacity: 0.03,
    strokeOpacity: 0.3,
    labelFontSize: 8,
  }

  const config = { ...defaultOptions, ...options }
  points.forEach((point) => {
    point.absValue = Math.abs(point.value)
  })

  points.sort((a, b) => a.absValue - b.absValue)
  const uniquePoints = Array.from(new Map(points.map((point) => [point.key, point])).values())

  const maxAbsValue = Math.max(...uniquePoints.map((d) => Math.abs(d.value))) + 10
  const normalizedPoints = uniquePoints.map((d) => ({
    ...d,
    normalizedValue: Math.abs(d.value) / maxAbsValue,
  }))
  const longitude = d3
    .scalePoint(new Set(Plot.valueof(uniquePoints, 'key')), [180, -180])
    .padding(0.5)
    .align(1)
  // const angleScale = d3
  //   .scaleLinear()
  //   .domain([0, longitude.domain().length - 1])
  //   .range([0, 360])
  const valueExtent = d3.extent(normalizedPoints, (d) => d.normalizedValue)
  const maxValue = valueExtent[1] // 最大值应该是1，因为已经归一化
  const minValue = 0
  const labelPoints = d3.range(5).map((i) => minValue + (i * (maxValue - minValue)) / 4)

  // 创建图表
  const chart = Plot.plot({
    width: config.width,
    height: config.height,
    projection: {
      type: 'azimuthal-equidistant',
      rotate: [0, -90],
      domain: d3.geoCircle().center([0, 90]).radius(1.1)(),
    },
    color: { legend: true },
    marks: [
      // 背景同心圆
      Plot.geo([1, 0.8, 0.6, 0.4, 0.2], {
        geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
        stroke: config.strokeColor,
        fill: config.strokeColor,
        strokeOpacity: config.strokeOpacity,
        fillOpacity: config.fillOpacity,
        strokeWidth: 0.5,
      }),

      // 轴线
      Plot.link(longitude.domain(), {
        x1: longitude,
        y1: 90 - 1,
        x2: 0,
        y2: 90,
        stroke: 'white',
        strokeOpacity: 0.5,
        strokeWidth: 2.5,
      }),

      // 刻度标签
      Plot.text(
        labelPoints.slice(0, 4).map((d) => ({ value: d })),
        {
          x: 180,
          y: (d) => 90 - d.value,
          text: (d) => -(d.value * maxAbsValue).toFixed(0),
          textAnchor: 'start',
          fill: 'currentColor',
          stroke: 'white',
          fontSize: config.labelFontSize,
          dy: -4,
        }
      ),
      // axes labels
      Plot.text(longitude.domain(), {
        x: longitude,
        y: 90 - 1,
        text: Plot.identity,
        lineWidth: 5,
      }),
      // 数据区域
      Plot.area(normalizedPoints, {
        x1: ({ key }) => longitude(key),
        y1: ({ normalizedValue }) => 90 - normalizedValue,
        x2: 0,
        y2: 90,
        fill: 'name',
        stroke: 'name',
        strokeOpacity: 1,
        curve: 'cardinal-closed',
        fillOpacity: 0.1, // 初始透明度
        // title: (d) => `${d.name}\n${d.key}: ${(100 * d.value).toFixed(0)}%` // 添加悬停提示
      }),

      // 数据点
      Plot.dot(normalizedPoints, {
        x: ({ key }) => longitude(key),
        y: ({ normalizedValue }) => 90 - normalizedValue,
        fill: 'name',
        stroke: 'white',
        r: 4,
        // title: (d) => `${d.name}\n${d.key}: ${(100 * d.value).toFixed(0)}%` // 添加悬停提示
      }),

      // 交互标签
      Plot.text(
        normalizedPoints,
        Plot.pointer({
          x: ({ key }) => longitude(key),
          y: ({ normalizedValue }) => 90 - normalizedValue,
          text: (d) => `${d.value}`,
          textAnchor: 'start',
          dx: 4,
          fill: 'currentColor',
          stroke: 'white',
          maxRadius: 10,
        })
      ),
    ],
    style: {
      backgroundColor: config.backgroundColor,
    },
  })

  // 添加交互效果
  const svg = d3.select(chart)

  // 为区域添加交互效果
  svg
    .selectAll("g[aria-label='area'] path")
    .style('transition', 'fill-opacity 0.2s')
    .on('mouseover', function () {
      svg
        .selectAll("g[aria-label='area'] path")
        .style('fill-opacity', 0.05)
        .style('stroke-opacity', 1)
      d3.select(this).style('fill-opacity', 0.3)
    })
    .on('mouseout', function () {
      svg
        .selectAll("g[aria-label='area'] path")
        .style('fill-opacity', 0.1)
        .style('stroke-opacity', 1)
    })

  // 为数据点添加交互效果
  svg
    .selectAll("g[aria-label='dot'] circle")
    .style('transition', 'r 0.2s')
    .on('mouseover', function () {
      d3.select(this).transition().duration(200).attr('r', 6)
    })
    .on('mouseout', function () {
      d3.select(this).transition().duration(200).attr('r', 4)
    })
  svg.selectAll("g[aria-label='link'] path").style('stroke-opacity', 0.5)

  return chart
}
