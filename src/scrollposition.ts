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
    console.log("saving scroll position");

    const filepath = view.file.path;
    const scrollposition = view.editor.getScrollInfo()?.top ?? 0;
    const now = Date.now();

    const existingPos = data.scrollpositions.find((p) => p.path === filepath);

    const cmState = view.editor.cm.viewState.state;

    const scrollSnapshot = view.editor.cm.scrollSnapshot().value;
    const currentLine = cmState.doc.lineAt(scrollSnapshot.range.head);

    // TODO check if the scroll position gets more precise when using https://discuss.codemirror.net/t/smooth-scroll-to-selection-position/4875
    //console.log('coordsatpos', view.editor.cm.coordsAtPos(scrollSnapshot.head))
    //console.log('scrolldom', view.editor.cm.scrollDOM.getBoundingClientRect())
    const editorRange: EditorRange = {
      to: {
        line: currentLine.number,
        ch: 1,
      },
      from: {
        line: 0,
        ch: 1,
      },
    };

    if (existingPos) {
      existingPos.editorRange = editorRange;
      existingPos.selectionRange = scrollSnapshot;
      existingPos.scrollposition = scrollposition;
      existingPos.updated = now;
    } else {
      data.scrollpositions.push({
        editorRange: editorRange,
        selectionRange: scrollSnapshot,
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
    );

    console.log(view.editor.cm);

    // TODO check how old the scroll position is and ignore it if configured in settings

    if (lastPosition && currentScrollPosition === 0) {
      console.log("dispatching ev", lastPosition.range);
      view.editor.cm.dispatch({
        // effects: view.editor.scrollIntoView(lastPosition.editorRange, true),
        effects: view.editor.cm.docView.scrollIntoView(lastPosition.selectionRange, {
          y: "center",
        }),
      });

      // TODO this would enable a smooth scrolling, but requires some calculation, see https://discuss.codemirror.net/t/smooth-scroll-to-selection-position/4875
      // view.editor.cm.scrollDOM.scrollTo({
      //   top: lastPosition.scrollposition,
      //   behavior: 'smooth'
      // });
    }
  }
}
