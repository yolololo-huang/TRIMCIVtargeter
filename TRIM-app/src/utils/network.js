import * as d3 from 'd3'

// ForceGraph 函数
function ForceGraph(
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
  },
  {
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = (d) => d.color, // node stroke fill (if not using a group color encoding)
    nodeStroke = '#fff', // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 6, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = '#999', // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = 'round', // link stroke linecap
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 540, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation, // when this promise resolves, stop the simulation
    onNodeClick // 添加节点点击回调函数
  } = {}
) {
  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern)
  const R = typeof nodeRadius !== 'function' ? null : d3.map(nodes, nodeRadius)
  const LS = d3.map(links, linkSource).map(intern)
  const LT = d3.map(links, linkTarget).map(intern)
  if (nodeTitle === undefined) nodeTitle = (_, i) => N[i]
  const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle)
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern)
  const W = typeof linkStrokeWidth !== 'function' ? null : d3.map(links, linkStrokeWidth)
  const L = typeof linkStroke !== 'function' ? null : d3.map(links, linkStroke)

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (d, i) => ({ ...d, id: N[i] }))
  links = d3.map(links, (d, i) => ({ ...d, source: LS[i], target: LT[i] }))

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G)

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors)

  // Set initial positions for nodes to be within the SVG bounds.
  nodes.forEach((node) => {
    node.x = (Math.random() - 0.5) * width
    node.y = (Math.random() - 0.5) * height
  })

  // Construct the forces.
  const forceNode = d3.forceManyBody().strength(-30) // 调整节点之间的排斥力
  const forceLink = d3
    .forceLink(links)
    .id(({ index: i }) => N[i])
    .distance(100) // 增加连线距离
  if (nodeStrength !== undefined) forceNode.strength(nodeStrength)
  if (linkStrength !== undefined) forceLink.strength(linkStrength)

  const simulation = d3
    .forceSimulation(nodes)
    .force('link', forceLink)
    .force('charge', forceNode)
    .force('center', d3.forceCenter(0, 0)) // 确保中心力在 (0, 0)
    .force('x', d3.forceX().strength(0.05)) // 添加 X 方向的力
    .force('y', d3.forceY().strength(0.1)) // 添加 Y 方向的力
    .on('tick', ticked)

  const svg = d3
    .create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

  const link = svg
    .append('g')
    .attr('stroke', typeof linkStroke !== 'function' ? linkStroke : null)
    .attr('stroke-opacity', linkStrokeOpacity)
    .attr('stroke-width', typeof linkStrokeWidth !== 'function' ? linkStrokeWidth : null)
    .attr('stroke-linecap', linkStrokeLinecap)
    .selectAll('line')
    .data(links)
    .join('line')

  const node = svg
    .append('g')
    .attr('stroke', nodeStroke)
    .attr('stroke-opacity', nodeStrokeOpacity)
    .attr('stroke-width', nodeStrokeWidth)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', nodeRadius)
    .attr('fill', nodeFill)
    .call(drag(simulation))

  const text = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text((d) => d.id)
    .attr('font-size', '10px')
    .call(drag(simulation))

  // 添加节点点击事件
  node.on('click', (event, d) => {
    if (onNodeClick) {
      onNodeClick(d.id)
    }
  })

  if (W) link.attr('stroke-width', ({ index: i }) => W[i])
  if (L) link.attr('stroke', ({ index: i }) => L[i])
  if (R) node.attr('r', ({ index: i }) => R[i])
  if (T) node.append('title').text(({ index: i }) => T[i])
  if (invalidation != null) invalidation.then(() => simulation.stop())

  function intern(value) {
    return value !== null && typeof value === 'object' ? value.valueOf() : value
  }

  function ticked() {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)

    node
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .style('cursor', 'pointer')

    text.attr('x', (d) => d.x - 10).attr('y', (d) => d.y - 10)
  }

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      const radius = typeof nodeRadius === 'function' ? nodeRadius(event.subject) : nodeRadius
      event.subject.fx = Math.max(-width / 2 + radius, Math.min(width / 2 - radius, event.x))
      event.subject.fy = Math.max(-height / 2 + radius, Math.min(height / 2 - radius, event.y))
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
  }

  return Object.assign(svg.node(), { scales: { color } })
}

export default ForceGraph
