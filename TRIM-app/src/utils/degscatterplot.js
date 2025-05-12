import {
  scaleLinear,
  axisLeft,
  axisBottom,
  transition,
  select,
  zoom,
  interpolateRound,
  zoomIdentity,
} from 'd3'

const scatterPlot = () => {
  let width
  let height
  let data
  let xValue
  let yValue
  let margin
  let radius
  let onClick = null
  let selectedGeneNames = []

  const my = (selection) => {
    // Clear previous elements
    selection.selectAll('*').remove()

    const x = scaleLinear()
      .domain([-9, 9])
      .range([margin.left, width - margin.right])

    const y = scaleLinear()
      .domain([-9, 9])
      .range([height - margin.bottom, margin.top])

    const marks = data.map((d) => {
      return {
        originalData: d,
        x: x(xValue(d)),
        y: y(yValue(d)),
        TRIM: d['tag'] === 'TRIM',
        target: d['tag'] === 'target',
      }
    })

    const t = transition().duration(1000)

    const positionCircles = (circles) => {
      circles.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    }

    const initializeRadius = (circles) => {
      circles.attr('r', 0)
    }

    const growRadius = (enter) => {
      enter.transition(t).attr('r', radius)
    }

    const tooltip = (selection) => {
      selection
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
          select('body')
            .append('div')
            .style('position', 'absolute')
            .style('background', 'white')
            .style('border', '1px solid black')
            .style('padding', '5px')
            .style('left', event.pageX + 25 + 'px')
            .style('top', event.pageY + 25 + 'px')
            .attr('class', 'hover-text')
            .html(() => {
              return `
          <div>gene_name: ${d.originalData['gene_name']}</div>
          <div>logFC_x: ${d.originalData['logFC_x']},adj_P_Val_x: ${d.originalData['adj_P_Val_x']}</div>
          <div>logFC_y: ${d.originalData['logFC_y']},adj_P_Val_y: ${d.originalData['adj_P_Val_y']}</div>
          `
            })
        })
        .on('mouseout', () => {
          select('.hover-text').remove()
        })
    }

    const styleCircles = (selection) => {
      selection.style('fill', (d) => {
        const logFC_x = xValue(d.originalData)
        const adjPVal_x = d.originalData['adj_P_Val_x']
        const logFC_y = yValue(d.originalData)
        const adjPVal_y = d.originalData['adj_P_Val_y']
        if (d.TRIM) {
          return 'rgba(144, 25, 255, 0.8)'
        } else if (
          (logFC_x > 1 && adjPVal_x < 0.05 && logFC_y > 1 && adjPVal_y < 0.05) ||
          (logFC_x < -1 && adjPVal_x < 0.05 && logFC_y < -1 && adjPVal_y < 0.05)
        ) {
          return 'rgba(64, 64, 64, 0.5)' // darkgray with transparency
        } else if (
          (logFC_x > 1 && adjPVal_x < 0.05 && adjPVal_y > 0.05) ||
          (logFC_x < -1 && adjPVal_x < 0.05 && adjPVal_y > 0.05) ||
          (logFC_y > 1 && adjPVal_y < 0.05 && adjPVal_x > 0.05) ||
          (logFC_y < -1 && adjPVal_y < 0.05 && adjPVal_x > 0.05)
        ) {
          return 'rgba(64, 64, 64, 0.2)'
        } else {
          return 'rgba(211, 211, 211, 0.2)' // lightgray with transparency
        }
      })
    }

    const circles = selection
      .selectAll('circle')
      .data(marks)
      .join(
        (enter) =>
          enter
            .append('circle')
            .call(positionCircles)
            .call(initializeRadius)
            .call(growRadius)
            .call(styleCircles)
            .call(tooltip),
        (update) =>
          update
            .call((update) => update.transition(t).call(positionCircles))
            .call(styleCircles)
            .call(tooltip),
        (exit) => exit.remove()
      )
      .classed('selected', (d) => selectedGeneNames.includes(d.originalData['gene_name']))
      .attr('stroke', (d) =>
        selectedGeneNames.includes(d.originalData['gene_name']) ? 'black' : null
      )
      .attr('stroke-width', (d) =>
        selectedGeneNames.includes(d.originalData['gene_name']) ? 2 : null
      )
      .on('click', function (event, d) {
        const isSelected = select(event.target).classed('selected')
        if (isSelected) {
          select(event.target)
            .classed('selected', false)
            .attr('stroke', null)
            .attr('stroke-width', null)
        } else {
          const target = select(event.target)
            .classed('selected', true)
            .attr('stroke', 'yellow')
            .attr('stroke-width', 5)

          // 添加闪烁效果
          let blinkCount = 0
          const blinkInterval = setInterval(() => {
            if (blinkCount < 12) {
              // 3秒内闪烁12次（每次闪烁包含一次显示和一次隐藏）
              target.attr('stroke', blinkCount % 2 === 0 ? 'yellow' : null)
              blinkCount++
            } else {
              clearInterval(blinkInterval)
              // 三秒后移除样式
              target.classed('selected', false).attr('stroke', null).attr('stroke-width', null)
            }
          }, 250) // 每次闪烁间隔 250 毫秒
        }
        if (onClick) onClick(d.originalData['gene_name'], !isSelected) // 调用 onClick 回调，并传递选中状态
      })

    const k = height / width
    const xAxis = (g, x) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(axisBottom(x).ticks(12))
        .call((g) => g.select('.domain').attr('display', 'none'))
    const yAxis = (g, y) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(axisLeft(y).ticks(12 * k))
        .call((g) => g.select('.domain').attr('display', 'none'))

    const gx = selection.append('g')
    const gy = selection.append('g')
    const gGrid = selection.append('g')

    const grid = (g, x, y) =>
      g
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1)
        .call((g) =>
          g
            .selectAll('.x')
            .data(x.ticks(12))
            .join(
              (enter) => enter.append('line').attr('class', 'x').attr('y2', height),
              (update) => update,
              (exit) => exit.remove()
            )
            .attr('x1', (d) => 0.5 + x(d))
            .attr('x2', (d) => 0.5 + x(d))
        )
        .call((g) =>
          g
            .selectAll('.y')
            .data(y.ticks(12 * k))
            .join(
              (enter) => enter.append('line').attr('class', 'y').attr('x2', width),
              (update) => update,
              (exit) => exit.remove()
            )
            .attr('y1', (d) => 0.5 + y(d))
            .attr('y2', (d) => 0.5 + y(d))
        )

    const zoomed = ({ transform }) => {
      const zx = transform.rescaleX(x).interpolate(interpolateRound)
      const zy = transform.rescaleY(y).interpolate(interpolateRound)
      circles
        .attr('cx', (d) => zx(xValue(d.originalData)))
        .attr('cy', (d) => zy(yValue(d.originalData)))
      gx.call(xAxis, zx)
      gy.call(yAxis, zy)
      gGrid.call(grid, zx, zy)
    }

    const zoomBehavior = zoom().scaleExtent([1, 50]).on('zoom', zoomed)
    selection.call(zoomBehavior).call(zoomBehavior.transform, zoomIdentity)
  }

  my.width = function (_) {
    return arguments.length ? ((width = +_), my) : width
  }

  my.height = function (_) {
    return arguments.length ? ((height = +_), my) : height
  }

  my.data = function (_) {
    return arguments.length ? ((data = _), my) : data
  }

  my.xValue = function (_) {
    return arguments.length ? ((xValue = _), my) : xValue
  }

  my.yValue = function (_) {
    return arguments.length ? ((yValue = _), my) : yValue
  }

  my.margin = function (_) {
    return arguments.length ? ((margin = _), my) : margin
  }

  my.radius = function (_) {
    return arguments.length ? ((radius = +_), my) : radius
  }

  my.onClick = function (_) {
    return arguments.length ? ((onClick = _), my) : onClick
  }

  my.selectedGeneNames = function (_) {
    return arguments.length ? ((selectedGeneNames = _), my) : selectedGeneNames
  }

  return my
}

const parseRow = (d, columns) => {
  const row = {}
  columns.forEach((column) => {
    row[column] = d[column]
  })
  return row
}

export { parseRow, scatterPlot }
