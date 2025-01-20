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

export default class RememberScrollpositionPlugin extends Plugin {
  data: ReScrollPluginData;

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
      });
    });

    // FIXME scrolling via the scrollbar is not detected!
    let scrollingDebounce: NodeJS.Timeout;
    this.registerDomEvent(document, "wheel", (event: any) => {
      // Reset if we get another wheel event in the timeout duration to only save when stop scrolling
      window.clearTimeout(scrollingDebounce);

      scrollingDebounce = setTimeout(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;

        ReScroll.saveScrollPosition(view, this.data, async (modifiedData) => {
          this.updateData(modifiedData);

          logDebug("saved modified data", this.data);
        });
      }, 350);
    });

    // When focusing a leaf, restore its saved scroll position
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
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

    // TODO add a menu entry, if possible, to reset/forget the scroll position ? theortically you only need to scroll back up, though
  }

  async updateData(modifiedData: ReScrollPluginData) {
    if (!modifiedData) return;

    this.data = modifiedData;
    await this.saveData(this.data);
  }

  onunload() {}

  async loadPluginData() {
    this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
  }
}
