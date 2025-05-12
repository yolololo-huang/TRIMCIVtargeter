import * as d3 from 'd3'
import * as Plot from '@observablehq/plot'
export const RadarR = (points, options = {}) => {
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
  //给points数据再增加一个键值对，absValue,值为其value的绝对值
  points.forEach((point) => {
    point.absValue = Math.abs(point.value)
  })

  points.sort((a, b) => a.absValue - b.absValue)
  // 根据所有 unique keys 创建轴线
  const uniqueKeys = Array.from(new Set(points.map((point) => point.key)))
  const longitude = d3.scalePoint(uniqueKeys, [180, -180]).padding(0.5).align(1)

  // 对数据点按 name 分组，并确保每组数据按 key 排序
  const groupedPoints = d3.group(points, (d) => d.name)

  const sortedPoints = Array.from(groupedPoints.values()).map((group) =>
    group.sort((a, b) => uniqueKeys.indexOf(a.key) - uniqueKeys.indexOf(b.key))
  )
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
      Plot.link(uniqueKeys, {
        x1: longitude,
        y1: 90 - 1,
        x2: 0,
        y2: 90,
        stroke: 'white',
        strokeOpacity: 0.5,
        strokeWidth: 2.5,
      }),

      // 刻度标签
      Plot.text([1, 0.8, 0.6, 0.4, 0.2], {
        x: 180,
        y: (d) => 90 - d,
        dx: 2,
        textAnchor: 'start',
        text: (d) => `${'+/-' + d}`,
        fill: 'currentColor',
        stroke: 'white',
        fontSize: config.labelFontSize,
      }),

      // axes labels
      Plot.text(uniqueKeys, {
        x: longitude,
        y: 90 - 0.95,
        dx: (d) => (longitude(d) > 0 ? 10 : -10),
        dy: -10,
        text: Plot.identity,
        lineWidth: 5,
      }),

      // 数据区域
      ...sortedPoints.map((group) =>
        Plot.area(group, {
          x1: ({ key }) => longitude(key),
          y1: ({ value }) => 90 - Math.abs(value),
          x2: 0,
          y2: 90,
          fill: 'name',
          stroke: 'name',
          strokeOpacity: 1,
          curve: 'cardinal-closed',
          fillOpacity: 0.1,
        })
      ),

      // 数据点
      Plot.dot(points, {
        x: ({ key }) => longitude(key),
        y: ({ value }) => 90 - Math.abs(value),
        fill: 'name',
        stroke: 'white',
        r: 4,
      }),

      // 交互标签
      Plot.text(
        points,
        Plot.pointer({
          x: ({ key }) => longitude(key),
          y: ({ value }) => 90 - Math.abs(value),
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

  // 添加交互效果（与之前一致）
  const svg = d3.select(chart)

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
