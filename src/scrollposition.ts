import { MarkdownView } from "obsidian";
import { RememberScrollpositionPluginData } from "./scrollposition.interface";

export class RememberScrollposition {
  scrollingDebounce: NodeJS.Timeout;

  static saveScrollPosition(
    view: MarkdownView,
    data: RememberScrollpositionPluginData,
    callback: (data: RememberScrollpositionPluginData) => void,
  ) {
    console.log("attempting to save scroll position")
    if (!view?.file) return;
    // TODO check if you can get the line info from within official obsidian API 
    // @ts-ignore cm is not part of the official API and I feel bad 
    const cm = view.editor?.cm; 

    if (!cm) {
      console.error('No access to codemirror instance available, thus cannot retrieve necessary information to save scroll position. Exiting.')
      return;
    }

    const filepath = view.file.path;
    const existingPos = data.scrollpositions.find((p) => p.path === filepath);
    const now = Date.now();

    const editorRange = RememberScrollposition.retrieveEditorRangeForCurrentPosition(cm)

    if (existingPos) {
      existingPos.editorRange = editorRange;
      existingPos.updated = now;
    } else {
      data.scrollpositions.push({
        editorRange: editorRange,
        path: filepath,
        updated: now,
      });
    }

    callback(data);
  }

  // TODO figure out if you can type that private variable correctly
  static retrieveEditorRangeForCurrentPosition(codemirror: any) {
    // TODO some checks might be a good idea before traversing a dozens of child properties
    const scrollSnapshot = codemirror.scrollSnapshot().value;
    // TODO can I add the view heigh to range.head to use the line from the bottom?
    const currentLine = codemirror.viewState.state.doc.lineAt(scrollSnapshot.range.head);

    return {
      to: {
        line: currentLine.number,
        ch: 1,
      },
      from: {
        line: 0,
        ch: 1,
      },
    };
  }

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
    const currentScrollPosition = view.editor?.getScrollInfo()?.top;
    console.log(
      `attempt to restore scroll position for ${view.file?.path}, current: ${currentScrollPosition}`
    );
    

    // only try to set the scroll position if its on top. If its not, it was already updated before
    if (currentScrollPosition !== 0) return;

    const lastPosition = data.scrollpositions.find(
      (p) => p.path === view.file?.path,
    );

    // TODO check how old the scroll position is and ignore it if configured in settings
    if (lastPosition && currentScrollPosition === 0) {
      console.log("dispatching scrollIntoView", lastPosition);

      // @ts-ignore cm is not part of the official API and I feel bad 
      view.editor.cm.dispatch({
        effects: view.editor.scrollIntoView(lastPosition.editorRange, true),
      });
    }
  }
}
