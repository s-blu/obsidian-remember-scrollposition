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

    const scrollInfo = view.editor.getScrollInfo();
    console.log('editor scroll info', scrollInfo)

  //   const topLine = view.editor.lineAtHeight(scrollInfo.top, "local");
  // const bottomLine = view.editor.lineAtHeight(scrollInfo.top + scrollInfo.clientHeight, "local");
  // console.log('editor scroll info', topLine, bottomLine)

    // TODO check if you can get the line info from within official obsidian API
    // @ts-ignore cm is not part of the official API and I feel bad
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

    /** TODO You might be able to use the codemirror.viewport information to adjust the
     * target line somewhat and allow configuring if we should scroll to top/center or bottom
     * logDebug(scrollSnapshot.range.head, codemirror.viewport)
     *  contentEl.getBoundingClientRect().top
     */
    logDebug(scrollSnapshot.range.head, codemirror.viewport, codemirror.visibleRanges);
    logDebug(
      codemirror.viewState?.state?.doc?.lineAt(scrollSnapshot.range.head),
      codemirror.viewState?.state?.doc?.lineAt(codemirror.viewport.from),
      codemirror.viewState?.state?.doc?.lineAt(codemirror.viewport.to),
      codemirror.viewState?.state?.doc?.lineAt(codemirror.visibleRanges[0].from),
      codemirror.viewState?.state?.doc?.lineAt(codemirror.visibleRanges[0].to),
      codemirror.viewportLineBlocks,
      codemirror.moveToLineBoundary(scrollSnapshot.range, true)
    );

    logDebug(
      "snapshot head line",
      codemirror.viewState?.state?.doc?.lineAt(scrollSnapshot.range.head),
      scrollSnapshot
    );


    logDebug(
      "viewport / visible Ranges lines",
      codemirror.viewState?.state?.doc?.lineAt(codemirror.viewport.from).number,
      codemirror.viewState?.state?.doc?.lineAt(codemirror.viewport.to).number,
      // codemirror.viewState?.state?.doc?.lineAt(codemirror.visibleRanges[0].from),
      // codemirror.viewState?.state?.doc?.lineAt(codemirror.visibleRanges[0].to)
    )

    const moved = codemirror.moveToLineBoundary(scrollSnapshot.range, true, true);
    logDebug(
      "viewport lineblocks, moveToLineBoundary",
      codemirror.viewportLineBlocks,
      moved,
      codemirror.viewState?.state?.doc?.lineAt(moved.from)
    );

    logDebug(
      "///////// SNAPSHOT / MOVED /////////\n",
      codemirror.viewState?.state?.doc?.lineAt(scrollSnapshot.range.head),
      codemirror.viewState?.state?.doc?.lineAt(moved.to)
    )

    logDebug(
      "///////// SNAPSHOT -- MOVED /////////\n",
      scrollSnapshot,
      moved
    )

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

      view.editor.transaction({ selection: lastPosition.editorRange });
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
