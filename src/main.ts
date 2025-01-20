import { MarkdownView, Plugin } from "obsidian";
import { RememberScrollposition } from "./scrollposition";
import {
  RememberScrollpositionPluginSettings,
  RememberScrollpositionPluginData,
} from "./scrollposition.interface";
import { logDebug } from "./debugLog";

const DEFAULT_SETTINGS: RememberScrollpositionPluginSettings = {
  scrollInstantly: true
};

const DEFAULT_DATA: RememberScrollpositionPluginData = {
  settings: DEFAULT_SETTINGS,
  scrollpositions: [],
};

export default class RememberScrollpositionPlugin extends Plugin {
  data: RememberScrollpositionPluginData;

  async onload() {
    await this.loadPluginData();

    // FIXME scrolling via the scrollbar is not detected!
    let scrollingDebounce: NodeJS.Timeout;
    this.registerDomEvent(document, "wheel", (event: any) => {
      // Reset if we get another wheel event in the timeout duration to only save when stop scrolling
      window.clearTimeout(scrollingDebounce);

      scrollingDebounce = setTimeout(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;

        RememberScrollposition.saveScrollPosition(
          view,
          this.data,
          async (modifiedData) => {
            this.updateData(modifiedData);

            logDebug("saved modified data", this.data);
          },
        );
      }, 350);
    });

    // When focusing a leaf, restore its saved scroll position
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        // @ts-ignore cm is not part of the official API and I feel bad
        const cm = view?.editor?.cm

        if (cm) {
          RememberScrollposition.restoreScrollposition(view, this.data);
        }
      }),
    );

    this.registerEvent(
      this.app.vault.on("rename", (file, oldName) => {
        const newName = file?.path;
        RememberScrollposition.updatePathOfEntry(
          this.data,
          oldName,
          newName,
          this.updateData,
        );
      }),
    );

    this.registerEvent(
      this.app.vault.on("delete", (deletedFile) => {
        RememberScrollposition.deleteEntry(
          this.data,
          deletedFile?.path,
          this.updateData,
        );
      }),
    );

    // TODO add settings: let the user decide to scroll instantly upon opening or by clicking a ribbon icon
    // TODO when scrolling instantly, allow disabling the ribbon icon
    // TODO add a ribbon icon to jump to the scroll position and make it configurable. see example_main
    // TODO be able to exclude or include certain paths for saving only
    // TODO provide an option to correct saved line number of a certain degree to achieve more intuitive scrolling results

    // TODO add a menu entry, if possible, to reset/forget the scroll position ? theortically you only need to scroll back up, though
  }

  async updateData(modifiedData: RememberScrollpositionPluginData) {
    if (!modifiedData) return;

    this.data = modifiedData;
    await this.saveData(this.data);
  }

  onunload() {}

  async loadPluginData() {
    this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
  }
}
