import { MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import { ReScroll } from "./scrollposition";
import { ReScrollPluginSettings, ReScrollPluginData } from "./scrollposition.interface";
import { logDebug } from "./debugLog";
import { ViewUtils } from "./view.utils";

const DEFAULT_SETTINGS: ReScrollPluginSettings = {
  scrollInstantly: true,
};

const DEFAULT_DATA: ReScrollPluginData = {
  settings: DEFAULT_SETTINGS,
  scrollpositions: [],
};

// FIXME scroll position is not restored in read mode
export default class RememberScrollpositionPlugin extends Plugin {
  private data: ReScrollPluginData;
  // FIXME when switching the active leaf while scrolling, the scroll position of the previous leaf is not saved
  private scrollingDebounce: NodeJS.Timeout;
  private observedLeaves: string[] = [];

  private justOpened;

  async onload() {
    await this.loadPluginData();

    // initially restore scroll position on all open editors
    // listen to scroll events on open editors
    this.app.workspace.onLayoutReady(() => {
      const activeLeaves = this.app.workspace.getLeavesOfType("markdown");
      activeLeaves.forEach((leaf) => {
        const view = leaf.view;
        if (!(view instanceof MarkdownView)) return;
        ReScroll.restoreScrollposition(view, this.data);

        this.registerScrollListener(leaf);
      });
    });

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        this.justOpened = view?.file?.path
        console.log('layout change')
        const activeLeaves = this.app.workspace.getLeavesOfType("markdown");
        activeLeaves.forEach((leaf) => {
          // @ts-ignore usage of internal property
          const id = leaf.id;
          if (this.observedLeaves.indexOf(id) === -1) {
            this.registerScrollListener(leaf);
            this.observedLeaves.push(id);
          }

          // TODO clean up obsolete ids? Unregister those listeners?
        });
      }),
    );

    // When focusing a leaf, restore its saved scroll position
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        console.log('active leaf change')
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        // @ts-ignore cm is not part of the official API and I feel bad
        const cm = view?.editor?.cm;

        if (cm) {
          ReScroll.restoreScrollposition(view, this.data);
        }
      }),
    );

    this.registerEvent(
      this.app.vault.on("rename", (file, oldName) => {
        const newName = file?.path;
        ReScroll.updatePathOfEntry(this.data, oldName, newName, this.updateData);
      }),
    );

    this.registerEvent(
      this.app.vault.on("delete", (deletedFile) => {
        ReScroll.deleteEntry(this.data, deletedFile?.path, this.updateData);
      }),
    );

    // TODO add settings: let the user decide to scroll instantly upon opening or by clicking a ribbon icon
    // TODO when scrolling instantly, allow disabling the ribbon icon
    // TODO add a ribbon icon to jump to the scroll position and make it configurable. see example_main
    // TODO be able to exclude or include certain paths for saving only
    // TODO provide an option to correct saved line number of a certain degree to achieve more intuitive scrolling results
  }

  async updateData(modifiedData: ReScrollPluginData) {
    if (!modifiedData) return;

    this.data = modifiedData;
    await this.saveData(this.data);
  }

  registerScrollListener(leaf: WorkspaceLeaf) {
    if (!leaf?.view || !(leaf.view instanceof MarkdownView)) return;
    const view = leaf.view as MarkdownView;
    const cmScrollEl = view.contentEl.querySelector(".cm-scroller") as HTMLElement;
    const readScrollEl = ViewUtils.getReadScrollContainer(view);
    // @ts-ignore usage of internal property
    const id = leaf?.id;

    this.registerDomEvent(cmScrollEl, "scroll", () => {
      this.savePositionOnEndOfScrolling(view, id, false);
    });
    this.registerDomEvent(readScrollEl, "scroll", () => {
      if (this.justOpened === view?.file?.name) {
        // this.justOpened = null;
        return;
      }
      this.savePositionOnEndOfScrolling(view, id, true);
    });
  }

  savePositionOnEndOfScrolling(view: MarkdownView, id: string, readMode: boolean) {
    // Reset if we get another event in the timeout duration to only save when stop scrolling
    window.clearTimeout(this.scrollingDebounce);

    this.scrollingDebounce = setTimeout(() => {
      logDebug("scroll debounce triggered", view.file?.path, id);
      if (!view) return;
      // TODO this makes no sense, the other scroll isnot triggered. though why does it trigger when opening up the file?
      if (ViewUtils.isViewInReadMode(view) !== readMode) return;

      ReScroll.saveScrollPosition(view, this.data, async (modifiedData) => {
        this.updateData(modifiedData);

        logDebug("saved modified data", this.data);
      });
    }, 350);
  }

  onunload() {}

  async loadPluginData() {
    this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
  }
}
