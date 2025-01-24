import { MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import { ReScroll } from "./scrollposition";
import { ReScrollPluginSettings, ReScrollPluginData } from "./scrollposition.interface";
import { logDebug } from "./debug-log";
import { RescrollSettingTab } from "./scrollposition-settings";

const DEFAULT_SETTINGS: ReScrollPluginSettings = {
  scrollInstantly: true,
};

const DEFAULT_DATA: ReScrollPluginData = {
  settings: DEFAULT_SETTINGS,
  scrollpositions: [],
};

// FIXME scroll position is not restored in read mode
export default class RememberScrollpositionPlugin extends Plugin {
  public data: ReScrollPluginData;
  // FIXME when switching the active leaf while scrolling, the scroll position of the previous leaf is not saved
  private scrollingDebounce: NodeJS.Timeout;
  private observedLeaves: string[] = [];

  async onload() {
    await this.loadPluginData();
    this.addSettingTab(new RescrollSettingTab(this.app, this));

    this.addRibbonIcon("gallery-vertical-end", "Scroll to saved position", (evt: MouseEvent) => {
      this.triggerScrollpositionRestore();
    });

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
        if (this.data.settings.scrollInstantly) {
          this.triggerScrollpositionRestore();
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

    }

  triggerScrollpositionRestore() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    // @ts-ignore cm is not part of the official API and I feel bad
    const cm = view?.editor?.cm;

    // TODO is cm still necessary?
    if (cm) {
      ReScroll.restoreScrollposition(view, this.data);
    }
  }

  async updateData(modifiedData: ReScrollPluginData) {
    if (!modifiedData) return;

    this.data = modifiedData;
    await this.saveData(this.data);
  }

  registerScrollListener(leaf: WorkspaceLeaf) {
    if (!leaf?.view || !(leaf.view instanceof MarkdownView)) return;
    const view = leaf.view as MarkdownView;
    const scrollEl = view.contentEl.querySelector(".cm-scroller") as HTMLElement;
    // @ts-ignore usage of internal property
    const id = leaf?.id;

    this.registerDomEvent(scrollEl, "scroll", () => {
      this.savePositionOnEndOfScrolling(view, id);
    });
  }

  savePositionOnEndOfScrolling(view: MarkdownView, id: string) {
    // Reset if we get another event in the timeout duration to only save when stop scrolling
    window.clearTimeout(this.scrollingDebounce);

    this.scrollingDebounce = setTimeout(() => {
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
