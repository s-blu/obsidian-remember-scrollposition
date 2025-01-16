import { RememberScrollpositionPluginData } from "./scrollposition.interface";

export class RememberScrollposition {
  scrollingDebounce: NodeJS.Timeout;

  static saveScrollPosition(
    view,
    data: RememberScrollpositionPluginData,
    callback: (data: RememberScrollpositionPluginData) => void
  ) {
    console.log("saving scroll position");
    if (!view?.file) return;

    const filepath = view.file.path;
    const scrollposition = view.editor.getScrollInfo()?.top ?? 0;
    const now = Date.now();
    const existingPos = data.scrollpositions.find(
      (p) => p.path === filepath
    );

    if (existingPos) {
      existingPos.scrollposition = scrollposition;
      existingPos.updated = now;
    } else {
      data.scrollpositions.push({
        path: filepath,
        scrollposition,
        updated: now,
      });
    }

    callback(data);
  }

  static restoreScrollposition(view, data: RememberScrollpositionPluginData) {
    if (!view || !data) {
      console.error(
        "restoreScrollposition was called with invalid parameters."
      );
      return;
    }
    console.log('restoring scroll position, current: ', view.editor.getScrollInfo()?.top)
    const currentScrollPosition = view.editor.getScrollInfo()?.top;
    // only try to set the scroll position if its on top. If its not, it was already updated before
    if (currentScrollPosition !== 0) return;

    const lastPosition = data.scrollpositions.find(
      (p) => p.path === view.file?.path
    )?.scrollposition;

    // TODO check how old the scroll position is and ignore it if configured in settings

    if (lastPosition && currentScrollPosition === 0) {
      view.editor.scrollTo(null, lastPosition);
      console.log(
        "updated scrollposition to:",
        view.editor.getScrollInfo()?.top
      );
    }
  }
}
