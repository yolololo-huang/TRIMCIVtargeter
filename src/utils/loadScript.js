// src/utils/loadScript.js
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(script)
    script.onerror = () => reject(new Error(`Script load error: ${src}`))
    document.head.append(script)
  })
}
