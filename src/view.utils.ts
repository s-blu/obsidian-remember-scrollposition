import { MarkdownView } from "obsidian";

export class ViewUtils {
  static isViewInReadMode(view: MarkdownView) {
    // confusingly, if mode is "preview", the editor is in read mode - "source" is either livepreview or source mode.
    return view?.getMode() === "preview";
  }

  static getReadScrollContainer(view: MarkdownView) {
    return view?.contentEl?.querySelector(".markdown-reading-view .markdown-preview-view") as HTMLElement;
  }
}
