// import { group } from 'console'

// https://observablehq.com/@d3/tree-of-life@146

function _chart(
  d3,
  data,
  cluster,
  setRadius,
  innerRadius,
  maxLength,
  setColor,
  outerRadius,
  width,
  height,
  legend,
  linkExtensionConstant,
  linkConstant,
  linkExtensionVariable,
  linkVariable
) {
  const root = d3
    .hierarchy(data, (d) => d.branchset)
    .sum((d) => (d.branchset ? 0 : 1))
    .sort((a, b) => a.value - b.value || d3.ascending(a.data.length, b.data.length))

  cluster(root)
  setRadius(root, (root.data.length = 0), innerRadius / maxLength(root))
  setColor(root)

  const svg = d3
    .create('svg')
    .attr('width', width) // 设置SVG的宽度
    .attr('height', height) // 设置SVG的高度
    .attr('viewBox', [-outerRadius, -outerRadius, width, width]) // 调整viewBox高度
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)

  svg
    .append('g')
    .attr('transform', 'translate(0, 0)') // 向下平移10px
    .call(legend)

  svg.append('style').text(`
    .link--active {
      stroke: #000;
      stroke-width: 1.5px;
    }

    .link-extension--active {
      stroke-opacity: .6;
    }

    .label--active {
      font-weight: bold;
      font-size: 15px;
    }
  `)

  const linkExtension = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#000')
    .attr('stroke-opacity', 0.25)
    .selectAll('path')
    .data(root.links().filter((d) => !d.target.children))
    .join('path')
    .each(function (d) {
      d.target.linkExtensionNode = this
    })
    .attr('d', linkExtensionConstant)

  const link = svg
    .append('g')
    .attr('transform', 'translate(0, 30)') // 向下平移10px
    .attr('fill', 'none')
    .attr('stroke', '#000')
    .selectAll('path')
    .data(root.links())
    .join('path')
    .each(function (d) {
      d.target.linkNode = this
    })
    .attr('d', linkConstant)
    .attr('stroke', (d) => d.target.color)

  const label = svg
    .append('g')
    .attr('transform', 'translate(0, 30)') // 向下平移10px
    .selectAll('text')
    .data(root.leaves())
    .join('text')
    .attr('dy', '.31em')
    .attr(
      'transform',
      (d) => `rotate(${d.x - 90}) translate(${innerRadius + 4},0)${d.x < 180 ? '' : ' rotate(180)'}`
    )
    .attr('text-anchor', (d) => (d.x < 180 ? 'start' : 'end'))
    .text((d) => d.data.name.replace(/_/g, ' '))
    .on('mouseover', mouseovered(true))
    .on('mouseout', mouseovered(false))

  function update(checked) {
    const t = d3.transition().duration(750)
    linkExtension.transition(t).attr('d', checked ? linkExtensionVariable : linkExtensionConstant)
    link.transition(t).attr('d', checked ? linkVariable : linkConstant)
  }

  function mouseovered(active) {
    return function (event, d) {
      d3.select(this).classed('label--active', active)
      if (d.linkExtensionNode) {
        d3.select(d.linkExtensionNode).classed('link-extension--active', active).raise()
      }
      let current = d
      while (current) {
        if (current.linkNode) {
          d3.select(current.linkNode).classed('link--active', active).raise()
        }
        current = current.parent
      }
    }
  }

  // Add legend interactivity
  svg
    .selectAll('g > rect')
    .style('cursor', 'pointer') // 添加cursor的style
    .on('click', function (event, d) {
      const rect = d3.select(this)
      const groupColor = rect.attr('fill')
      const isActive = rect.classed('selectedRECT')

      // Toggle the 'selected' class
      rect
        .classed('selectedRECT', !isActive)
        .attr('stroke', !isActive ? 'black' : null)
        .attr('stroke-width', !isActive ? '2px' : null)

      label
        .filter((l) => l.color === groupColor)
        .classed('label--active', !isActive)
        .style('stroke', !isActive ? groupColor : null)
        .style('font-weight', !isActive ? 'bold' : null)
      link
        .filter((l) => l.target.color === groupColor)
        .classed('link--active', !isActive)
        .style('stroke', !isActive ? groupColor : null)
    })

  return Object.assign(svg.node(), { update })
}

function _update(chart, showLength) {
  return chart.update(showLength)
}

function _cluster(d3, innerRadius) {
  return d3
    .cluster()
    .size([360, innerRadius])
    .separation((a, b) => 1)
}

function _color(d3) {
  const color = d3.scaleOrdinal(d3.schemePaired) //
  return color
}

function _maxLength(d3) {
  return function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0)
  }
}

function _setRadius() {
  return function setRadius(d, y0, k) {
    d.radius = (y0 += d.data.length) * k
    if (d.children) d.children.forEach((d) => setRadius(d, y0, k))
  }
}

function _setColor(color, groupMap) {
  return function setColor(d) {
    const group = groupMap.get(d.data.name)
    d.color = group ? color(group) : d.parent ? d.parent.color : null
    if (d.children) d.children.forEach(setColor)
  }
}

function _linkVariable(linkStep) {
  return function linkVariable(d) {
    return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius)
  }
}

function _linkConstant(linkStep) {
  return function linkConstant(d) {
    return linkStep(d.source.x, d.source.y, d.target.x, d.target.y)
  }
}

function _linkExtensionVariable(linkStep, innerRadius) {
  return function linkExtensionVariable(d) {
    return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius)
  }
}

function _linkExtensionConstant(linkStep, innerRadius) {
  return function linkExtensionConstant(d) {
    return linkStep(d.target.x, d.target.y, d.target.x, innerRadius)
  }
}

function _linkStep() {
  return function linkStep(startAngle, startRadius, endAngle, endRadius) {
    const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI))
    const s0 = Math.sin(startAngle)
    const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI))
    const s1 = Math.sin(endAngle)
    return (
      'M' +
      startRadius * c0 +
      ',' +
      startRadius * s0 +
      (endAngle === startAngle
        ? ''
        : 'A' +
          startRadius +
          ',' +
          startRadius +
          ' 0 0 ' +
          (endAngle > startAngle ? 1 : 0) +
          ' ' +
          startRadius * c1 +
          ',' +
          startRadius * s1) +
      'L' +
      endRadius * c1 +
      ',' +
      endRadius * s1
    )
  }
}

function _legend(color, outerRadius) {
  return (svg) => {
    const g = svg
      .selectAll('g')
      .data(color.domain())
      .join('g')
      .attr('transform', (d, i) => `translate(${-outerRadius + i * 30},${-outerRadius})`)

    g.append('rect').attr('width', 20).attr('height', 20).attr('fill', color)

    g.append('text')
      .attr('x', 9) //中心位置
      .attr('y', 30) // 放在rectangle下面
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d) => d)
  }
}

// 修改文件
async function _data(parseNewick, FileAttachment) {
  return parseNewick(await FileAttachment('TRIMs_clustaW_trimai.fasta.treefile').text())
}
// 添加groups数据
async function _groupData(FileAttachment) {
  return await FileAttachment('TRIMs_infoTab.json').json()
}

function _width() {
  return 550 // 将宽度设为500
}

function _height() {
  return 550 // 设置高度
}

function _outerRadius(width) {
  return width / 2
}

function _innerRadius(outerRadius) {
  return outerRadius - 100 // 减小内半径
}

function _parseNewick() {
  return function parseNewick(a) {
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
      var n = s[t]
      switch (n) {
        case '(':
          var c = {}
          ;(r.branchset = [c]), e.push(r), (r = c)
          break
        case ',':
          var c = {}
          e[e.length - 1].branchset.push(c), (r = c)
          break
        case ')':
          r = e.pop()
          break
        case ':':
          break
        default:
          var h = s[t - 1]
          ')' == h || '(' == h || ',' == h ? (r.name = n) : ':' == h && (r.length = parseFloat(n))
      }
    }
    return r
  }
}

function _d3(require) {
  return require('d3@6')
}

//添加变量
function _groupMap(groupData) {
  const map = new Map()

  groupData.forEach((group) => {
    if (group.members && Array.isArray(group.members)) {
      group.members.forEach((member) => {
        if (member.TRIM_name && group.group) {
          map.set(member.TRIM_name, group.group)
        }
      })
    }
  })

  return map
}

export default function define(runtime, observer) {
  const main = runtime.module()
  function toString() {
    return this.url
  }
  const fileAttachments = new Map([
    [
      'TRIMs_clustaW_trimai.fasta.treefile',
      {
        url: new URL('@/assets/TRIMs_clustaW_trimai.fasta.treefile', import.meta.url).href,
        mimeType: 'text/plain',
        toString,
      },
    ],
    [
      'TRIMs_infoTab.json',
      {
        url: new URL('@/assets/TRIMs_infoTab.json', import.meta.url).href,
        mimeType: 'application/json',
        toString,
      },
    ],
  ])

  main.builtin(
    'FileAttachment',
    runtime.fileAttachments((name) => fileAttachments.get(name))
  )
  main
    .variable(observer('showLength'))
    .define('showLength', ['Generators', 'viewof showLength'], (G, _) => G.input(_))
  main
    .variable(observer('chart'))
    .define(
      'chart',
      [
        'd3',
        'data',
        'cluster',
        'setRadius',
        'innerRadius',
        'maxLength',
        'setColor',
        'outerRadius',
        'width',
        'height',
        'legend',
        'linkExtensionConstant',
        'linkConstant',
        'linkExtensionVariable',
        'linkVariable',
        'groupMap',
      ],
      _chart
    )
  main.variable(observer('update')).define('update', ['chart', 'showLength'], _update)
  main.variable(observer('cluster')).define('cluster', ['d3', 'innerRadius'], _cluster)
  main.variable(observer('color')).define('color', ['d3'], _color)
  main.variable(observer('maxLength')).define('maxLength', ['d3'], _maxLength)
  main.variable(observer('setRadius')).define('setRadius', _setRadius)
  main.variable(observer('setColor')).define('setColor', ['color', 'groupMap'], _setColor) // 更新为使用 groupMap
  main.variable(observer('linkVariable')).define('linkVariable', ['linkStep'], _linkVariable)
  main.variable(observer('linkConstant')).define('linkConstant', ['linkStep'], _linkConstant)
  main
    .variable(observer('linkExtensionVariable'))
    .define('linkExtensionVariable', ['linkStep', 'innerRadius'], _linkExtensionVariable)
  main
    .variable(observer('linkExtensionConstant'))
    .define('linkExtensionConstant', ['linkStep', 'innerRadius'], _linkExtensionConstant)
  main.variable(observer('linkStep')).define('linkStep', _linkStep)
  main.variable(observer('legend')).define('legend', ['color', 'outerRadius'], _legend)
  main.variable(observer('data')).define('data', ['parseNewick', 'FileAttachment'], _data) // 更新 data 定义
  main.variable(observer('groupData')).define('groupData', ['FileAttachment'], _groupData) // 新增 groupData
  main.variable(observer('groupMap')).define('groupMap', ['groupData'], _groupMap) // 新增 groupMap
  main.variable(observer('width')).define('width', _width)
  main.variable(observer('height')).define('height', _height)
  main.variable(observer('outerRadius')).define('outerRadius', ['width'], _outerRadius)
  main.variable(observer('innerRadius')).define('innerRadius', ['outerRadius'], _innerRadius)
  main.variable(observer('parseNewick')).define('parseNewick', _parseNewick)
  main.variable(observer('d3')).define('d3', ['require'], _d3)
  return main
}
