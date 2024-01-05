import Editor from '@monaco-editor/react';
import { editor as monacoEditor } from 'monaco-editor';
import { useEffect, useState } from 'react';

export default function Home() {
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  useEffect(() => {
    editor?.updateOptions({
      mouseWheelZoom: true
    })
  }, [editor])

  return (
    <>
      <Editor height="100vh" language="markdown" onMount={(editor, _monaco) => setEditor(editor)} />
    </>
  )
}
