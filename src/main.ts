import { MarkdownView, Plugin } from "obsidian";
import { ReScroll } from "./scrollposition";
import { ReScrollPluginSettings, ReScrollPluginData } from "./scrollposition.interface";
import { logDebug } from "./debugLog";

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
  private scrollListenerAborts = {};


  async onload() {
    await this.loadPluginData();

    // initially restore scroll position on all open editors
    this.app.workspace.onLayoutReady(() => {
      const activeLeaves = this.app.workspace.getLeavesOfType("markdown");
      activeLeaves.forEach((leaf) => {
        const view = leaf.view;
        // TODO is this even necessary?
        if (!(view instanceof MarkdownView)) return;
        ReScroll.restoreScrollposition(view, this.data);

        this.registerScrollListener(view, leaf["id"] as string)
      });
    });

    this.registerEvent(
      this.app.workspace.on("layout-change", (...args) => {
        console.log("=== // layout change", this.scrollListenerAborts);
        // TODO register missing leaves here
        const activeLeaves = this.app.workspace.getLeavesOfType("markdown");
        
        activeLeaves.forEach(leaf => {
          if (leaf.view instanceof MarkdownView && !this.scrollListenerAborts[leaf.id]) {
            this.registerScrollListener(leaf.view, leaf["id"] as string)
          }
        })
      }),
    );

    // FIXME scrolling via the scrollbar is not detected!
    // let scrollingDebounce: NodeJS.Timeout;
    // this.registerDomEvent(document, "wheel", (event: any) => {
    //   // Reset if we get another wheel event in the timeout duration to only save when stop scrolling
    //   window.clearTimeout(scrollingDebounce);

    //   scrollingDebounce = setTimeout(() => {
    //     const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    //     if (!view) return;

    //     ReScroll.saveScrollPosition(view, this.data, async (modifiedData) => {
    //       this.updateData(modifiedData);

    //       logDebug("saved modified data", this.data);
    //     });
    //   }, 350);
    // });


    // When focusing a leaf, restore its saved scroll position
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        // @ts-ignore cm is not part of the official API and I feel bad
        const cm = view?.editor?.cm;

        // const filename = view.file?.path;
        // const scrollEl = view.contentEl.querySelector(".cm-scroller") as HTMLElement;
        // if (scrollEl) this.registerScrollListener(scrollEl)

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

    // TODO add a menu entry, if possible, to reset/forget the scroll position ? theortically you only need to scroll back up, though
  }

  async updateData(modifiedData: ReScrollPluginData) {
    if (!modifiedData) return;

    this.data = modifiedData;
    await this.saveData(this.data);
  }

  registerScrollListener(view: MarkdownView, id: string) {
    const scrollEl = view.contentEl.querySelector(".cm-scroller") as HTMLElement;
    const abort = new AbortController();
    if (id) {
      // @ts-ignore
      this.scrollListenerAborts[id] = abort;
    }

    this.registerDomEvent(scrollEl, "scroll", (...args) => {
      console.log('scrolling', id)
      this.savePositionOnEndOfScrolling(view, id);
    }, {
      signal: abort.signal
    });
  }

  savePositionOnEndOfScrolling(view: MarkdownView, id: string) {
    // Reset if we get another event in the timeout duration to only save when stop scrolling
    window.clearTimeout(this.scrollingDebounce);

    this.scrollingDebounce = setTimeout(() => {
      console.log('timeout triggered', view.file?.path, id)
      //const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) return;

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
