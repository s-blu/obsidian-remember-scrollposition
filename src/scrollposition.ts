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

    if (!editorRange) {
      console.error(`Could not retrieve editor range to save scroll position for ${filepath}. Exiting.`)
      return;
    }

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
    if (!codemirror) return null;
    const scrollSnapshot = codemirror.scrollSnapshot()?.value;
    if (!scrollSnapshot) return null;
    const currentLine = codemirror.viewState?.state?.doc?.lineAt(scrollSnapshot.range.head);
    if (!currentLine) return null;

    /** TODO You might be able to use the codemirror.viewport information to adjust the target
     * line somewhat and allow configuring if we should scroll to top/center or bottom
     * console.log(scrollSnapshot.range.head, codemirror.viewport)
     */
    
    return {
      to: {
        line: currentLine.number,
        ch: 1,
      },
      from: {
        line: currentLine.number,
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

    const lastPosition = RememberScrollposition.getScrollpositionEntry(data, view.file?.path)

    // TODO check how old the scroll position is and ignore it if configured in settings
    if (lastPosition && currentScrollPosition === 0) {
      console.log("dispatching scrollIntoView", lastPosition);

      // @ts-ignore cm is not part of the official API and I feel bad 
      view.editor.cm.dispatch({
        effects: view.editor.scrollIntoView(lastPosition.editorRange, true),
      });
    }
  }

  static updatePathOfEntry(data: RememberScrollpositionPluginData, oldName: string, newName: string | undefined, callback: (data: RememberScrollpositionPluginData) => void) {
    const entry = RememberScrollposition.getScrollpositionEntry(data, oldName);

    if (!entry) return;

    if (newName) {
      entry.path = newName;
      callback(data)
    } else {
      console.warn(`RememberScrollposition: ${oldName} was renamed, but was not able to fetch new file name. Entry would get inaccessible; deleting.`)
      RememberScrollposition.deleteEntry(data, oldName, callback);
    }
  }

  static deleteEntry(data: RememberScrollpositionPluginData, filepath: string, callback: (data: RememberScrollpositionPluginData) => void) {
    if (!data?.scrollpositions) return;
    
    const index = data.scrollpositions.findIndex((p) => p.path === filepath)
    if (index === -1) return;

    data.scrollpositions.splice(index, 1);
    callback(data);
  }

  private static getScrollpositionEntry(data: RememberScrollpositionPluginData, filepath?: string) {
    if (!filepath) return null;
    return data?.scrollpositions.find(
      (p) => p.path === filepath,
    );
  }
}
