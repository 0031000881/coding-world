import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'

const LANG_EXTENSIONS = {
  html: [html()],
  css: [css()],
  js: [javascript()],
}

export default function CodeEditorPanel({ language, value, onChange }) {
  return (
    <div className="editor-panel">
      <CodeMirror
        value={value}
        height="100%"
        theme="dark"
        extensions={LANG_EXTENSIONS[language]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
        }}
      />
    </div>
  )
}
