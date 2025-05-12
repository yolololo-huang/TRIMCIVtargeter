// https://observablehq.com/@howardyao/sequence-alignment-dashboard@702
import define1 from './e93997d5089d7165@2303.js'
import define2 from './26670360aa6f343b@209.js'
import define3 from './f3d342db2d382751@886.js'

function _1(md) {
  return md`
# Sequence Alignment Dashboard
  `
}

function _pills(html) {
  const pillData = [
    'd3-Array',
    'd3-rollup',
    'd3-group',
    'Vega-lite',
    'vl.selectInterval',
    'vl.selectSingle',
  ]
  return html`
    <div class="pill-box">
      <div class="pill-box__pills">
        ${pillData.map(
          (d) =>
            '<div class="pill-box__pill"><span class="pill-box__pill-text">' +
            d +
            '</span><span class="pill-box__pill-icon"><i class="fa fa-tag"></i></span></div>'
        )}
      </div>
    </div>
  `
}

function _3(html, data_viz) {
  return html`<p>
      Protein sequences alignment dynamic dashboard. The idea of this visualization is borrowed from
      <a target="_blank" href="https://dash.plotly.com/dash-bio">Plotly Dash Bio</a>. The fasta file
      parser is from <a target="_blank" href="https://stephenshank.com/">stephenshank.com</a>. The
      mini-map can be used as a brush selector to choose a region of the alignment chart to show the
      details of protein sequences and corresponding conversion rates. Concensus is comprised of the
      mode of Amino Acids from different proteins on each position (column) and the conversion rate
      is the count of model over the count of total number of proteins
      (${Array.from(new Set(data_viz.heatmap.map((d) => d.n))).length - 1} in the demo dataset).
    </p>
    <small
      >fasta data file:
      <a
        target="_blank"
        href="https://raw.githubusercontent.com/plotly/dash-bio-docs-files/master/alignment_viewer_p53.fasta"
        >https://raw.githubusercontent.com/plotly/dash-bio-docs-files/master/alignment_viewer_p53.fasta</a
      ></small
    >`
}

function _file(Inputs) {
  return Inputs.file({ label: 'Import fasta file', accept: '.fasta' })
}

function _dashboard(vl, data_viz, d3, data) {
  const brush = vl
    .selectInterval()
    .encodings('x')
    .init({ x: [0, 40] })
  const hover = vl
    .selectSingle('hover')
    .on('mouseover')
    .encodings('x')
    .nearest(true)
    .clear('mouseout')
  const proteinList = Array.from(new Set(data_viz.heatmap.map((d) => d.n)))

  const scale = {
    domain: Array.from(new Set(data_viz.heatmap.map((d) => d.v))),
    range: d3.schemeSet3.concat(d3.schemeSet2).concat(['#ddd']),
  }

  const heatmap = vl
    .data(data_viz.heatmap)
    .layer(
      vl
        .markRect()
        .params(hover)
        .encode(
          vl.y().fieldN('n').axis({ title: null }),
          vl
            .x()
            .fieldN('k')
            .axis({
              domain: false,
              title: null,
              values: d3.range(0, data.total_len, 20),
              labelAngle: 0,
              orient: 'top',
            }),
          vl.color().fieldN('v').scale(scale).legend(null)
        ),
      vl.markText({ align: 'center' }).encode(
        vl.y().fieldN('n'),
        vl.x().fieldN('k'),
        vl.text().fieldN('v'),
        vl.tooltip([
          { field: 'n', title: 'Protein' },
          { field: 'k', title: 'Position' },
          { field: 'v', title: 'Sequence' },
          { field: 'mode', title: 'Mode' },
        ])
      )
    )
    .width(860)
    .height(800)
    .transform(vl.filter(brush))

  const miniMap = vl
    .markTick()
    .data(data_viz.heatmap)
    .encode(
      vl.x().fieldQ('k').axis(false),
      vl.y().fieldN('n').axis(false),
      vl.color().fieldN('v').legend(null),
      vl.color().value('lightgray').if(brush, vl.color().fieldN('v').scale(scale).legend(null))
    )
    .height(150)
    .params(brush)
    .width(300)

  const barChart = vl
    .markBar()
    .data(data_viz.bar)
    .encode(
      vl
        .x()
        .fieldO('k')
        .axis({ title: null, values: d3.range(0, data.total_len, 20), labelAngle: 0 }),
      vl.y().fieldQ('Conversion Rate'),
      vl.color().fieldQ('Conversion Rate').scale({ scheme: 'yellowgreenblue' }).legend(null),
      vl.tooltip([
        { field: 'Conversion Rate', format: '.2f' },
        { field: 'k', title: 'Position' },
      ])
    )
    .height(150)
    .width(500)
    .transform(vl.filter(brush))

  return vl
    .vconcat(vl.hconcat(miniMap, barChart), heatmap)
    .config({ view: { stroke: 'transparent' } })
    .render()
}

async function _data(file, a, d3) {
  // const url = 'https://raw.githubusercontent.com/plotly/dash-bio-docs-files/master/alignment_viewer_p53.fasta'
  const url = new URL('@/assets/TRIMs_MegaClustaW_76trimmed.fasta', import.meta.url).href
  const raw = (
    file === null ? a.fastaParser(await d3.text(url)) : a.fastaParser(await file.text())
  ).map((d) => ({
    ...d,
    seq_len: d.seq.length,
    seq_name: d.header, //.split('|')[2].split(' ')[0]
  }))

  const max_len = d3.max(raw, (d) => d.seq_len)

  const raw1 = raw.map((d) => ({
    ...d,
    seq_full_str: d.seq + '-'.repeat(max_len - d.seq_len),
    seq_full: [...(d.seq + '-'.repeat(max_len - d.seq_len))].map((n, i) => ({
      k: i,
      v: n,
      n: d.seq_name,
    })),
  }))

  const derive = raw1.map((k) => k.seq_full.map((j) => ({ n: j.n, k: j.k, v: j.v }))).flat()

  return { raw: raw1, derive: derive, total_len: max_len }
}

function _data_viz(data, d3) {
  const raw_len = data.raw.length
  const countCol = d3
    .flatRollup(
      data.derive,
      (v) => v.length,
      (d) => d.k,
      (d) => d.v
    )
    .map(([k, v, cnt]) => ({ k, v, cnt }))

  const conversion = d3
    .groups(countCol, (d) => d.k)
    .map((n) => d3.greatest(n[1], (a) => a.cnt))
    .map((d) => ({ ...d, 'Conversion Rate': d.cnt / raw_len }))

  const derive2 = data.derive.map((d) => ({
    ...d,
    mode: conversion.filter((j) => j.k === d.k)[0].v,
  }))

  const data_viz = derive2.concat(
    conversion.map((d) => ({ n: 'Concensus', k: d.k, v: d.v, mode: d.v }))
  )

  return { heatmap: data_viz, bar: conversion }
}

function _8(md) {
  return md`
## Appendix
  `
}

function _a(require) {
  return require('https://stephenshank.com/bundle.js')
}

function _pillCss(html) {
  return html`
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.5.0/css/all.css"
      integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />
    <style>
      .pill-box {
        font-family:
          Open Sans,
          Arial,
          sans-serif;
        display: flex;
        padding-left: 0px;
        padding-bottom: 0px;
        line-height: 32px;
        align-items: center;
      }
      .pill-box__pills {
        display: flex;
      }
      .pill-box__pill {
        text-decoration: none;
        color: #fff;
        font-size: 8px;
        font-weight: bold;
        padding: 0 4px 0 15px;
        line-height: 32px;
        display: inline-block;
        text-align: center;
        background-color: #307abb;
        margin-right: 10px;
        border-radius: 16px;
      }
      .pill-box__pill-text {
        pointer-events: none;
      }
      .pill-box__pill-icon {
        display: inline-block;
        background-color: #fff;
        border-radius: 12px;
        color: #307abb;
        line-height: 24px;
        height: 24px;
        width: 24px;
        margin-left: 0px;
        cursor: pointer;
      }
    </style>
    <code>pillCSS</code>
  `
}

export default function define(runtime, observer) {
  const main = runtime.module()
  main.variable(observer()).define(['md'], _1)
  main.variable(observer('pills')).define('pills', ['html'], _pills)
  main.variable(observer()).define(['html', 'data_viz'], _3)
  main.variable(observer('viewof file')).define('viewof file', ['Inputs'], _file)
  main
    .variable(observer('file'))
    .define('file', ['Generators', 'viewof file'], (G, _) => G.input(_))
  main
    .variable(observer('viewof dashboard'))
    .define('viewof dashboard', ['vl', 'data_viz', 'd3', 'data'], _dashboard)
  main
    .variable(observer('dashboard'))
    .define('dashboard', ['Generators', 'viewof dashboard'], (G, _) => G.input(_))
  main.variable(observer('data')).define('data', ['file', 'a', 'd3'], _data)
  main.variable(observer('data_viz')).define('data_viz', ['data', 'd3'], _data_viz)
  main.variable(observer()).define(['md'], _8)
  main.variable(observer('a')).define('a', ['require'], _a)
  const child1 = runtime.module(define1)
  main.import('checkbox', child1)
  const child2 = runtime.module(define2)
  main.import('vl', child2)
  const child3 = runtime.module(define3)
  main.import('Plot', child3)
  main.import('d3', child3)
  main.variable(observer('pillCss')).define('pillCss', ['html'], _pillCss)
  return main
}
