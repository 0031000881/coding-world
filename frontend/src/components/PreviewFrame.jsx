import { useMemo } from 'react'

export default function PreviewFrame({ html, css, js }) {
  const srcDoc = useMemo(() => {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${css || ''}</style>
  </head>
  <body>
    ${html || ''}
    <script>
      window.onerror = function (message, source, lineno, colno, error) {
        window.parent.postMessage({ type: 'cw-preview-error', message: String(message) }, '*');
        return true;
      };
      try {
        ${js || ''}
      } catch (err) {
        window.parent.postMessage({ type: 'cw-preview-error', message: err.message }, '*');
      }
    <\/script>
  </body>
</html>`
  }, [html, css, js])

  return (
    <iframe
      title="Live preview"
      className="preview-frame"
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-modals"
    />
  )
}
