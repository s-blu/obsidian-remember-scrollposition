import { MarkdownView } from "obsidian";


export class RememberScrollposition {
  scrollingDebounce: NodeJS.Timeout;

  static saveScrollPosition(app, data, callback) {
    console.log("Scrolling has stopped.");
    const view = app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.file) {
      const lastPosition = view.editor.getScrollInfo()?.top ?? 0;
      RememberScrollposition.saveScrollPositionToData(data, view.file.path, lastPosition, callback)
    }
  }

  // TODO extract interfaces and type data correctly
  static async saveScrollPositionToData(data: any, filepath: string, scrollposition: number, callback) {
    console.log('save scroll pos', filepath, scrollposition)
		const now = Date.now();
		const existingPos = data.scrollpositions.find(p => p.path === filepath);

		if (existingPos) {
			existingPos.scrollposition = scrollposition;
			existingPos.updated = now;
		} else {
			data.scrollpositions.push({
				path: filepath,
				scrollposition,
				updated: now
			});
		}

		callback(data);
	}

  static restoreScrollposition(view, lastPosition: number) {
    const currentScrollPosition =
    view.editor.getScrollInfo()?.top;
  // TODO check if there's a saved scroll position and restore the correct position
  console.log(
    "received view, current scrollposition:",
    view.editor.getScrollInfo()?.top
  );
  // only try to set the scroll position if its on top. If its not, it was already updated before
  if (currentScrollPosition === 0) {
    view.editor.scrollTo(null, lastPosition);
    console.log(
      "updated scrollposition:",
      view.editor.getScrollInfo()?.top
    );
  }
  }
}