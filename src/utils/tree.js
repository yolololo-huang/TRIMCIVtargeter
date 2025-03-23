import * as d3 from 'd3'

export function drawTreeOfLife(container, data, groupData) {
  const width = 500
  const height = 500
  const outerRadius = (width + 50) / 2
  const innerRadius = outerRadius - 100

  const cluster = d3
    .cluster()
    .size([360, innerRadius])
    .separation((a, b) => 1)
  const color = d3.scaleOrdinal(d3.schemePaired)

  const groupMap = new Map()
  groupData.forEach((item) => {
    groupMap.set(item.TRIMname1, item.group1)
  })

  function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0)
  }

  function setRadius(d, y0, k) {
    d.radius = (y0 += d.data.length) * k
    if (d.children) d.children.forEach((d) => setRadius(d, y0, k))
  }

  function setColor(d) {
    const group = groupMap.get(d.data.name)
    d.color = group ? color(group) : d.parent ? d.parent.color : null
    if (d.children) d.children.forEach(setColor)
  }

  function linkStep(startAngle, startRadius, endAngle, endRadius) {
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

  const root = d3
    .hierarchy(data, (d) => d.branchset)
    .sum((d) => (d.branchset ? 0 : 1))
    .sort((a, b) => a.value - b.value || d3.ascending(a.data.length, b.data.length))

  cluster(root)
  setRadius(root, (root.data.length = 0), innerRadius / maxLength(root))
  setColor(root)

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-outerRadius, -outerRadius, width, width])
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)

  svg.append('g').attr('transform', 'translate(0, 10)').call(legend)

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
    .attr('d', (d) => linkStep(d.source.x, d.source.radius, d.target.x, innerRadius))

  const link = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#000')
    .selectAll('path')
    .data(root.links())
    .join('path')
    .each(function (d) {
      d.target.linkNode = this
    })
    .attr('d', (d) => linkStep(d.source.x, d.source.y, d.target.x, d.target.y))
    .attr('stroke', (d) => d.target.color)

  const label = svg
    .append('g')
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

  function mouseovered(active) {
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid black')
      .style('padding', '5px')
      .style('display', 'none')
      .style('pointer-events', 'none')
      .style('font-size', '12px')

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

      if (active) {
        const group = groupMap.get(d.data.name) || 'Unknown'
        tooltip
          .style('display', 'block')
          .html(`Group: ${group}`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY + 10 + 'px')
      } else {
        tooltip.style('display', 'none')
      }
    }
  }

  svg.selectAll('g > rect').on('click', function (event, d) {
    const rect = d3.select(this)
    const groupColor = rect.attr('fill')
    const isActive = rect.classed('selected')

    rect
      .classed('selected', !isActive)
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

  function legend(svg) {
    const g = svg
      .selectAll('g')
      .data(color.domain())
      .join('g')
      .attr('transform', (d, i) => `translate(${-outerRadius + i * 30},${-outerRadius + 10})`)

    g.append('rect').attr('width', 20).attr('height', 20).attr('fill', color)

    g.append('text')
      .attr('x', 9)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d) => d)
  }

  return svg.node()
}
