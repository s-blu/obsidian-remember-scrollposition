import { EditorRange, MarkdownView } from "obsidian";
import { RememberScrollpositionPluginData } from "./scrollposition.interface";

export class RememberScrollposition {
	scrollingDebounce: NodeJS.Timeout;

	static saveScrollPosition(
		view: MarkdownView,
		data: RememberScrollpositionPluginData,
		callback: (data: RememberScrollpositionPluginData) => void,
	) {
		if (!view?.file) return;
		console.log(
			"saving scroll position",
			view.editor.getScrollInfo(),
			// view.editor.cm.lineBlockAt(view.editor.getScrollInfo()?.top),
      view.editor.cm.scrollSnapshot(),
      view.editor.cm
		);
		console.log('getsel', view.editor.getSelection());

		const filepath = view.file.path;
		const scrollposition = view.editor.getScrollInfo()?.top ?? 0;
		const now = Date.now();
		const existingPos = data.scrollpositions.find(
			(p) => p.path === filepath,
		);



    const scrollSnapshot = view.editor.cm.scrollSnapshot().value.range;
    const currentLine = view.editor.cm.viewState.state.doc.lineAt(scrollSnapshot.head);
    //state.doc.lineAt(state.selection.main.head).number
    // view.editor.cm.viewState.state.doc

    console.log('currentLine', currentLine)
    const editorRange: EditorRange = {
      to: {
        line: currentLine.number,
        ch: 1 
      },
      from: {
        line: 0,
        ch: 1
      }
    }

    if (existingPos) {
			existingPos.range = editorRange;
			existingPos.scrollposition = scrollposition;
			existingPos.updated = now;
		} else {
			data.scrollpositions.push({
        range: editorRange,
				path: filepath,
				scrollposition,
				updated: now,
			});
		}

		callback(data);
	}

	static getLastScrollposition(
		view: MarkdownView,
		data: RememberScrollpositionPluginData,
	) {}

	static restoreScrollposition(
		view: MarkdownView,
		data: RememberScrollpositionPluginData,
	) {
		if (!view || !data) {
			console.error(
				"restoreScrollposition was called with invalid parameters.",
			);
			return;
		}
		console.log(
			"restoring scroll position, current: ",
			view.editor.getScrollInfo()?.top,
		);
		const currentScrollPosition = view.editor.getScrollInfo()?.top;
		// only try to set the scroll position if its on top. If its not, it was already updated before
		if (currentScrollPosition !== 0) return;

		const lastPosition = data.scrollpositions.find(
			(p) => p.path === view.file?.path,
		)?.scrollposition;

		// TODO check how old the scroll position is and ignore it if configured in settings

		if (lastPosition && currentScrollPosition === 0) {
			view.editor.scrollTo(null, lastPosition);
			console.log(
				"updated scrollposition to:",
				view.editor.getScrollInfo()?.top,
			);
		}
	}
}
