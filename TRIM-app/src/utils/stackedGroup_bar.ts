import {
  select,
  scaleBand,
  axisBottom,
  axisLeft,
  scaleLinear,
  stack,
  max,
  group,
  transition,
} from 'd3'

interface Dataset {
  disease: string
  dataset: string
  [key: string]: any
}

type OnBarClick = (disease: string) => void

export function drawStackedBarGraph(
  container: string,
  datasets: Dataset[],
  keys: string[],
  colors: { [key: string]: string },
  descending: boolean = true,
  onBarClick: OnBarClick | null = null
): void {
  const containerElement = document.querySelector(container)
  if (!containerElement) return

  const { width: containerWidth, height: containerHeight } =
    containerElement.getBoundingClientRect()

  const margin = { top: 20, right: 20, bottom: 20, left: 60 }
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom

  const svg = select(containerElement)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')

  const tooltip = select(containerElement)
    .append('div')
    .style('position', 'absolute')
    .style('padding', '5px')
    .style('background', 'rgba(255, 255, 255, 0.9)')
    .style('border', '1px solid #ccc')
    .style('border-radius', '4px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('font-size', '10px')

  const sumValues = (data: Dataset) => keys.reduce((acc, key) => acc + data[key], 0)

  let sortedDatasets = datasets
  if (descending) {
    sortedDatasets = datasets
      .slice()
      .sort((a, b) => sumValues(b) - sumValues(a) || a.dataset.localeCompare(b.dataset))
  }

  const groupedData = group(sortedDatasets, (d) => d.disease)
  let diseases = [...groupedData.keys()]
  if (descending) {
    diseases = diseases.sort(
      (a, b) => sumValues(groupedData.get(b)![0]) - sumValues(groupedData.get(a)![0])
    )
  }

  const stackGenerator = stack<Dataset>().keys(keys)
  const extent = [0, max(datasets, (d) => sumValues(d))!]
  const yScale = scaleLinear().domain(extent).range([height, 0])

  const x0Scale = scaleBand().domain(diseases).range([0, width]).padding(0.2)

  const xAxis = axisBottom(x0Scale).tickFormat((d) => String(d).toUpperCase())
  const yAxis = axisLeft(yScale)
  const t = transition().duration(1000)

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
    .transition(t)
    .call(xAxis)

  svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis)

  const maxBarWidth = 12

  groupedData.forEach((data, disease) => {
    const xCenter = x0Scale(disease)! + x0Scale.bandwidth() / 2
    const offset = x0Scale.step() / 2
    const numBars = data.length

    if (descending) {
      data = data.sort((a, b) => sumValues(b) - sumValues(a))
    }
    const barWidth = Math.min((xCenter + offset - (xCenter - offset)) / numBars, maxBarWidth)

    const xScaleForBars = scaleBand()
      .domain(data.map((d) => d.dataset))
      .range([xCenter - (barWidth * numBars) / 2, xCenter + (barWidth * numBars) / 2])
      .paddingInner(0)

    const layers = stackGenerator(data)

    const initHeight = (rects: any) => {
      rects.attr('y', height + margin.top).attr('height', 0)
    }
    const growHeight = (enter: any) => {
      enter
        .transition(t)
        .attr('y', (d: any) => margin.top + yScale(d[1]))
        .attr('height', (d: any) => yScale(d[0]) - yScale(d[1]))
    }

    layers.forEach((layer, layerIndex) => {
      svg
        .selectAll(`.bar-${disease}-${layerIndex}`)
        .data(layer)
        .join((enter) =>
          enter
            .append('rect')
            .attr(
              'x',
              (d: any) =>
                margin.left +
                xScaleForBars(d.data.dataset)! +
                (xScaleForBars.bandwidth() - barWidth) / 2
            )
            .call(initHeight)
            .call(growHeight)
            .attr('width', barWidth)
            .attr('fill', (d: any) => colors[keys[layerIndex]])
            .attr('stroke', 'rgba(143, 118, 255, 1)')
        )
        .on('mouseover', (event: MouseEvent, d: any) => {
          const dataset = d.data
          dataset.total_gene = +dataset.deg_num + +dataset.nodeg_num
          tooltip
            .style('opacity', 1)
            .html(
              `disease: ${dataset.disease}<br>
              dataset: ${dataset.dataset}<br>
              True/False prediction: ${dataset.True}/${dataset.False}<br>
              calculated target/DEGs: ${dataset.deg_cal}/${dataset.deg_num}<br>
              Total genes: ${dataset.total_gene}<br>`
            )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`)
        })
        .on('mousemove', (event: MouseEvent) => {
          tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`)
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0)
        })
        .on('click', (event: MouseEvent, d: any) => {
          const disease = d.data.disease
          if (typeof onBarClick === 'function') {
            onBarClick(disease)
          }
        })
        .style('cursor', 'pointer')
    })
  })
}
