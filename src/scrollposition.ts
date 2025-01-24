import { MarkdownView } from "obsidian";
import { ReScrollPluginData } from "./scrollposition.interface";
import { logDebug } from "./debugLog";
import { ViewUtils } from "./view.utils";

export class ReScroll {
  scrollingDebounce: NodeJS.Timeout;

  static saveScrollPosition(
    view: MarkdownView,
    data: ReScrollPluginData,
    callback: (data: ReScrollPluginData) => void,
  ) {
    logDebug("attempting to save scroll position", view?.file?.path);
    if (!view?.file) return;

    const filepath = view.file.path;
    const existingPos = data.scrollpositions.find((p) => p.path === filepath);
    const now = Date.now();

    const scrollInfo = ReScroll.retrieveScrollInfoCurrentPosition(view);

    if (!scrollInfo) {
      console.error(
        `RememberScrollposition: Could not retrieve editor range to save scroll position for ${filepath}. Exiting.`,
      );
      return;
    }

    logDebug(
      `${existingPos ? "updating" : "saving new"} position ${scrollInfo.editorRange?.to?.line}/${scrollInfo.scrollTop} for ${filepath}`,
    );
    if (existingPos) {
      existingPos.editorRange = scrollInfo.editorRange;
      existingPos.updated = now;
      existingPos.scrollTop = scrollInfo.scrollTop;
    } else {
      data.scrollpositions.push({
        editorRange: scrollInfo.editorRange,
        path: filepath,
        updated: now,
        scrollTop: scrollInfo.scrollTop,
      });
    }

    callback(data);
  }

  static retrieveScrollInfoCurrentPosition(view: MarkdownView) {
    if (!view) return null;
    //@ts-ignore internal property
    const codemirror = view.editor.cm;

    let scrollTop;
    if (ViewUtils.isViewInReadMode(view)) {
      scrollTop = ViewUtils.getReadScrollContainer(view)?.scrollTop;
    } else {
      scrollTop = codemirror.scrollSnapshot()?.value?.range.head;
    }

    if (!scrollTop) return null;

    const currentLine = codemirror.viewState?.state?.doc?.lineAt(scrollTop);
    if (!currentLine) return null;

    /** TODO You might be able to use the codemirror.viewport information to adjust the
     * target line somewhat and allow configuring if we should scroll to top/center or bottom
     * logDebug(scrollSnapshot.range.head, codemirror.viewport)
     */

    return {
      scrollTop,
      editorRange: {
        to: {
          line: currentLine.number,
          ch: 1,
        },
        from: {
          line: currentLine.number,
          ch: 1,
        },
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
    console.log("lastpos", lastPosition);

    if (lastPosition) {
      logDebug(
        `restoring scroll position for ${view?.file?.path} to line ${lastPosition.editorRange.to.line} or coord ${lastPosition.scrollTop}`,
      );

      if (ViewUtils.isViewInReadMode(view)) {
        ViewUtils.getReadScrollContainer(view)?.scroll({ top: lastPosition.scrollTop, behavior: "instant" });
        // ViewUtils.getReadScrollContainer(view)?.scroll(lastPosition.scrollTop, 0);
        // ViewUtils.getReadScrollContainer(view)?.scrollIntoView({ top: lastPosition.scrollTop})
      } else {
        view.editor.transaction({ selection: lastPosition.editorRange });
      }

      // view.editor.scrollIntoView(lastPosition.editorRange, true)
      // view.currentMode.applyScroll(lastPosition.editorRange.from.line * 100)
      // view.previewMode.applyScroll(lastPosition.editorRange.from.line * 100)

      // view.editor.transaction({selection: lastPosition.editorRange})
      // @ts-ignore cm is not part of the official API and I feel bad
      // view.editor.cm.dispatch({
      //   effects: view.editor.scrollIntoView(lastPosition.editorRange, true),
      // });
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
