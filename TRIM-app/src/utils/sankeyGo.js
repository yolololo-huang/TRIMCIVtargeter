// sankey-chart.js
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey'

export class SankeyChart {
  constructor(options = {}) {
    this.width = options.width || 900
    this.height = options.height || 900
    this.format = options.format || d3.format(',d')
  }

  create(data) {
    const width = this.width
    const height = this.height
    const format = this.format

    const svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, width, height + 1])
      .on('mouseout', () => {
        d3.selectAll(`path`).attr('stroke-opacity', 0.1)
      })

    const color = d3.scaleOrdinal(d3.schemeSet3)
    const order = { MF: 1, BP: 2, CC: 3 }
    // 创建 sankey 图布局
    const sankeyLayout = sankey()
      .nodeWidth(15)
      .nodePadding(8)
      .extent([
        [1, 50],
        [width - 1, height - 5]
      ])
      .nodeAlign(sankeyJustify) //没有用
      .nodeSort((a, b) => {
        if (a.name.startsWith('GO:') && b.name.startsWith('GO:')) {
          return order[a.go] - order[b.go]
        }
        return 0
      })
    const { nodes, links } = sankeyLayout(data)

    // 定义颜色
    const colors = {
      MF: d3.schemeSet3[4], // 第5个颜色
      BP: d3.schemeSet3[7],
      CC: d3.schemeSet3[10],
      TRIM: 'rgb(70, 0, 136, 0.3)'
    }
    const legendData = [
      { color: colors.MF, label: 'MF' },
      { color: colors.BP, label: 'BP' },
      { color: colors.CC, label: 'CC' },
      { color: colors.TRIM, label: 'TRIM' }
    ]

    const legend = svg.append('g').attr('transform', `translate(5, 5)`)

    const legendItem = legend
      .selectAll('g')
      .data(legendData)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${i * 100}, 0)`)

    legendItem
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => d.color)

    legendItem
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .text((d) => d.label)

    // 绘制节点
    svg
      .append('g')
      .attr('stroke', '#000')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('fill', (d) => {
        if (d.name.startsWith('TRIM')) {
          return colors.TRIM
        } else if (d.name.startsWith('GO:')) {
          if (d.go === 'MF') {
            return colors.MF
          } else if (d.go === 'BP') {
            return colors.BP
          } else if (d.go === 'CC') {
            return colors.CC
          }
        } else {
          return color(d.name) // 默认颜色
        }
      })
      .on('mouseover', (event, d) => {
        d.sourceLinks.forEach((e) => {
          d3.selectAll(`path.trajectory_${e.id}`).attr('stroke-opacity', 0.4)
        })
        d.targetLinks.forEach((e) => {
          d3.selectAll(`path.trajectory_${e.id}`).attr('stroke-opacity', 0.4)
        })
      })
      .on('mouseout', (event, d) => {
        d.sourceLinks.forEach((e) => {
          d3.selectAll(`path.trajectory_${e.id}`).attr('stroke-opacity', 0.1)
        })
      })
      .append('title')
      .text((d) => `${d.name}\n${format(d.value)}`)

    // 绘制连接
    const link = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.4)
      .selectAll('g')
      .data(links)
      .join('g')
      .style('mix-blend-mode', 'multiply')

    link
      .append('path')
      .attr('class', (d) => `trajectory_${d.id}`)
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d3.schemeSet1[4])
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', (d) => Math.max(1, d.width))

    link.append('title').text((d) => `${d.source.name} → ${d.target.name}\n${format(d.value)}`)

    // 添加文本标签
    svg
      .append('g')
      .style('font', '11px sans-serif')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.4em')
      .attr('text-anchor', (d) => (d.x0 < width / 2 ? 'start' : 'end'))
      .text((d) => d.name)
      .each(function (d) {
        if (d.name.startsWith('GO:')) {
          d3.select(this)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
              window.open(`https://www.ebi.ac.uk/QuickGO/term/${d.name}`, '_blank')
            })
            .on('mouseover', function () {
              d3.select(this).attr('fill', 'blue')
            })
            .on('mouseout', function () {
              d3.select(this).attr('fill', 'black')
            })
        }
      })
      .append('tspan')
      .attr('dy', 12)
      .attr('dx', -20)
      .attr('font-size', '9px sans-serif')
    // .text((d) => format(d.value))

    return svg.node()
  }
}
