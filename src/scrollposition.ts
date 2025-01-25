import { MarkdownView } from "obsidian";
import { ReScrollPluginData } from "../interfaces/scrollposition.interface";
import { logDebug } from "./debug-log";
import { ObsidianCodemirror } from "../interfaces/codemirror.interface";

export class ReScroll {
  scrollingDebounce: NodeJS.Timeout;

  static saveScrollPosition(
    view: MarkdownView,
    data: ReScrollPluginData,
    callback: (data: ReScrollPluginData) => void,
  ) {
    if (!view?.file) return;

    // @ts-ignore access to internal property
    const cm = view.editor?.cm;

    if (!cm) {
      console.error(
        "RememberScrollposition: No access to codemirror instance available, thus cannot retrieve necessary information to save scroll position. Exiting.",
      );
      return;
    }

    const filepath = view.file.path;
    const existingPos = data.scrollpositions.find((p) => p.path === filepath);
    const now = Date.now();

    const editorRange = ReScroll.retrieveEditorRangeForCurrentPosition(cm);

    if (!editorRange) {
      console.error(
        `RememberScrollposition: Could not retrieve editor range to save scroll position for ${filepath}. Exiting.`,
      );
      return;
    }

    logDebug(`${existingPos ? "updating" : "saving new"} position ${editorRange?.to?.line} for ${filepath}`);
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

  static retrieveEditorRangeForCurrentPosition(codemirror: ObsidianCodemirror) {
    if (!codemirror) return null;

    const scrollSnapshot = codemirror.scrollSnapshot()?.value;
    if (!scrollSnapshot) return null;

    const currentLine = codemirror.viewState?.state?.doc?.lineAt(scrollSnapshot.range.head);
    if (!currentLine) return null;
    console.log(scrollSnapshot, currentLine);

    return {
      from: {
        line: currentLine.number,
        ch: 1,
      },
      to: {
        line: currentLine.number,
        ch: 1,
      },
    };
  }

  static restoreScrollposition(view: MarkdownView, data: ReScrollPluginData) {
    if (!view || !data) {
      console.warn("RememberScrollposition: restoreScrollposition was called with invalid parameters.");
      return;
    }
    const currentScrollPosition = view.editor?.getScrollInfo()?.top;
    logDebug(`attempt to restore scroll position for ${view.file?.path}, current: ${currentScrollPosition}`);

    // only try to set the scroll position if its on top. If its not, it was already updated before
    if (currentScrollPosition !== 0) return;

    const lastPosition = ReScroll.getScrollpositionEntry(data, view.file?.path);

    // TODO check how old the scroll position is and ignore it if configured in settings
    if (lastPosition && currentScrollPosition === 0) {
      logDebug("dispatching scrollIntoView", lastPosition);

      view.editor.scrollIntoView(lastPosition.editorRange, true);
    }
  }

  static updatePathOfEntry(
    data: ReScrollPluginData,
    oldName: string,
    newName: string | undefined,
    callback: (data: ReScrollPluginData) => void,
  ) {
    const entry = ReScroll.getScrollpositionEntry(data, oldName);
    if (!entry) return;

    if (newName) {
      entry.path = newName;
      callback(data);
    } else {
      console.warn(
        `RememberScrollposition: ${oldName} was renamed, but was not able to fetch new file name. Entry would get inaccessible; deleting.`,
      );
      ReScroll.deleteEntry(data, oldName, callback);
    }
  }

  static deleteEntry(data: ReScrollPluginData, filepath: string, callback: (data: ReScrollPluginData) => void) {
    if (!data?.scrollpositions) return;

    const index = data.scrollpositions.findIndex((p) => p.path === filepath);
    if (index === -1) return;

    data.scrollpositions.splice(index, 1);
    callback(data);
  }

  private static getScrollpositionEntry(data: ReScrollPluginData, filepath?: string) {
    if (!filepath) return null;
    return data?.scrollpositions.find((p) => p.path === filepath);
  }
}
