import { EditorView } from "@codemirror/view"

export interface ObsidianCodemirror extends EditorView{
  viewState: EditorView,
}