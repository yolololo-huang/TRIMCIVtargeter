import * as d3 from 'd3'

export function drawRadialBarChart(container, TRIMsTrueGeneNum, onRadialBarClick, disease) {
  const containerElement = document.querySelector(container)
  const { width: containerWidth, height: containerHeight } =
    containerElement.getBoundingClientRect()

  const margin = { top: 0, right: 0, bottom: 0, left: 0 }
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom
  const innerRadius = width * 0.2
  const outerRadius = Math.min(width, height) * 0.45

  const data = Object.entries(TRIMsTrueGeneNum)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => a.value - b.value)

  // Angular x-scale
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 2 * Math.PI])
    .align(0)
    .paddingInner(0.2)

  // Radial y-scale
  const y = d3
    .scaleRadial()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([innerRadius, outerRadius - 20])

  // Color scale
  const gradient = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.key))
    .range(d3.schemeBlues[9])

  // const gradient = d3.scaleSequential(d3.schemeBlues[4])
  const arc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius((d) => y(d.value))
    .startAngle((d) => x(d.key))
    .endAngle((d) => x(d.key) + x.bandwidth())
    .padAngle(0.02)
    .padRadius(innerRadius)

  const svg = d3
    .select(containerElement)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('style', 'width: 100%; height: auto; font: 10px sans-serif;')

  // 在 innerRadius 内的空白圆中添加文字
  svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .selectAll('tspan')
    .data(`TRIMCIV targets in \n ${disease.toUpperCase()}`.split('\n'))
    .enter()
    .append('tspan')
    .attr('x', 0)
    .attr('y', (d, i) => `${i * 1.5}em`) // Increased line spacing
    .text(d => d)
  // Draw the bars with transition using .join
  svg
    .append('g')
    .selectAll('path')
    .data(data)
    .join((enter) =>
      enter
        .append('path')
        .attr('fill', (d) => gradient(d.value)) // Apply gradient color
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius((d) => y(d.value)) // Set the final outer radius
            .startAngle(0) // Start all bars at the top (0 degrees)
            .endAngle(0) // Start with no width
        )
        .transition() // Add transition on enter
        .duration(1500) // Duration of the animation
        .attrTween('d', function (d) {
          const interpolateStartAngle = d3.interpolate(0, x(d.key))
          const interpolateEndAngle = d3.interpolate(0, x(d.key) + x.bandwidth())
          return function (t) {
            return d3
              .arc()
              .innerRadius(innerRadius)
              .outerRadius(y(d.value))
              .startAngle(interpolateStartAngle(t))
              .endAngle(interpolateEndAngle(t))()
          }
        })
    )
    .on('click', (event, d) => {
      if (typeof onRadialBarClick === 'function') {
        onRadialBarClick(d.key, disease)
      }
    })
    .style('cursor', 'pointer')
    .append('title')
    .text((d) => `${d.key}: ${d.value}`)

  // Add x-axis labels outside the bars, oriented outward
  svg
    .append('g')
    .attr('text-anchor', 'middle')
    .selectAll('g')
    .data(data)
    .join('g')
    .attr(
      'transform',
      (d) => `
          rotate(${((x(d.key) + x.bandwidth() / 2) * 180) / Math.PI - 90})
          translate(${outerRadius - 20}, 0)
      `
    )
    .append('text')
    .attr(
      'transform',
      (d) =>
        (x(d.key) + x.bandwidth() / 2) % (2 * Math.PI) < Math.PI
          ? 'rotate(0)' // Keep the text upright for the top half
          : 'rotate(180)' // Flip the text for the bottom half
    )
    .attr(
      'text-anchor',
      (d) =>
        (x(d.key) + x.bandwidth() / 2) % (2 * Math.PI) < Math.PI
          ? 'start' // Align text to start for the top half
          : 'end' // Align text to end for the bottom half
    )
    .style('font-size', '8px')
    .text((d) => d.key)

  // Add y-axis ticks
  svg
    .append('g')
    .attr('text-anchor', 'end')
    .call((g) =>
      g
        .selectAll('g')
        .data(y.ticks(3).slice(1))
        .join('g')
        .append('circle')
        .attr('stroke', '#d2d5d6')
        .attr('stroke-opacity', 0.5)
        .attr('fill', 'none')
        .attr('r', y)
    )
    .call((g) =>
      g
        .selectAll('g')
        .data(y.ticks(3).slice(1))
        .join('g')
        .append('text')
        .style('font-size', '8px')
        .attr('x', -6)
        .attr('y', (d) => -y(d))
        .attr('dy', '0.35em')
        .text((d) => d)
    )

  return svg.node()
}
