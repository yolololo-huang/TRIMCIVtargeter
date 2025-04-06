import * as d3 from 'd3'

export function createChordDiagram(chord_names, matrix, clickedTitle, clickedEntry) {
  const screenWidth = window.innerWidth

  const margin = { left: 0, top: 0, right: 0, bottom: 0 },
    width = Math.min(screenWidth, 850) - margin.left - margin.right,
    height = (Math.min(screenWidth, 850) * 5) / 6 - margin.top - margin.bottom

  const outerRadius = Math.min(width, height) / 2 - 100,
    innerRadius = outerRadius * 0.95

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
  const outerArc = d3
    .arc()
    .innerRadius(outerRadius + 40)
    .outerRadius(outerRadius + 50)

  const layout = d3.chord().padAngle(0.04).sortSubgroups(d3.descending).sortChords(d3.ascending)

  const path = d3.ribbon().radius(innerRadius)

  const svg = d3
    .select('#chord-diagram')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('id', 'circle')
    .attr(
      'transform',
      `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`
    )

  svg.append('circle').attr('r', outerRadius).style('fill', 'white')

  const chords = layout(matrix)

  const group = svg
    .selectAll('.group')
    .data(chords.groups)
    .enter()
    .append('g')
    .attr('class', 'group')
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)

  group.append('title').text((d, i) => ` ${chord_names[i].group} : ${chord_names[i].name}`)

  group
    .append('path')
    .attr('id', (d, i) => `group${i}`)
    .attr('d', arc)
    .style('fill', (d, i) => chord_names[i].color)

  group
    .append('text')
    .each((d) => {
      d.angle = (d.startAngle + d.endAngle) / 2
    })
    .attr('dy', '.25em')
    .attr('class', 'titles')
    .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
    .attr('transform', (d) => {
      return `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${innerRadius + 15})${d.angle > Math.PI ? 'rotate(180)' : ''}`
    })
    .style('cursor', 'pointer')
    .style('font-size', '10px')
    .style('fill',(d,i) => chord_names[i].group === 'CIV' ? '#8c07dd' : null)
    .text((d, i) => chord_names[i].name)
    .on('click', (event, d) => {
      clickedTitle.value = chord_names[d.index].Entry ? chord_names[d.index].name : ''
      clickedEntry.value = chord_names[d.index].Entry ? chord_names[d.index].Entry : ''
    })

  const chord = svg
    .selectAll('.chord')
    .data(chords)
    .enter()
    .append('path')
    .attr('class', 'chord')
    .style('fill', (d) => chord_names[d.source.index].color)
    .attr('d', path)

  chord
    .append('title')
    .text(
      (d) =>
        `${chord_names[d.source.index].name} → ${chord_names[d.target.index].name}: ${d.source.value}\n${chord_names[d.target.index].name} → ${chord_names[d.source.index].name}: ${d.target.value}`
    )

  function mouseover(event, d) {
    chord.style('opacity', (p) =>
      p.source.index !== d.index && p.target.index !== d.index ? 0.05 : 1
    )
  }

  function mouseout(event, d) {
    chord.style('opacity', 1)
  }

  // 添加 C domain 和 N domain 的 arc 和 text
  const domainGroups = [
    { start: 77, end: 81, text: 'N domain' },
    { start: 82, end: 93, text: 'C domain' }
  ]

  domainGroups.forEach((domain, index) => {
    const domainArc = {
      startAngle: chords.groups[domain.start].startAngle,
      endAngle: chords.groups[domain.end].endAngle
    }
    const angle = (domainArc.startAngle + domainArc.endAngle) / 2
    svg
      .append('path')
      .attr('d', outerArc(domainArc))
      .style('fill', index === 0 ? '#1e90ff' : '#8c07dd')

    svg
      .append('text')
      .attr('dy', '.35em')
      .attr('transform', () => {
        return `rotate(${(angle * 180) / Math.PI - 90}) translate(${outerRadius + 60})${angle > Math.PI ? 'rotate(90)' : ''}`
      })
      .style('text-anchor', 'middle')
      .text(domain.text)
  })
}
