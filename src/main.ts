import { MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import { ReScroll } from "./scrollposition";
import { ReScrollPluginSettings, ReScrollPluginData } from "../interfaces/scrollposition.interface";
import { logDebug } from "./debug-log";
import { RescrollSettingTab } from "./scrollposition-settings";
import translations from "./translations.json";

const DEFAULT_SETTINGS: ReScrollPluginSettings = {
  scrollInstantly: true,
  maxAge: 14,
};

const DEFAULT_DATA: ReScrollPluginData = {
  settings: DEFAULT_SETTINGS,
  scrollpositions: [],
};

export default class RememberScrollpositionPlugin extends Plugin {
  public data: ReScrollPluginData;

  private scrollingDebounces: { [key:string]: NodeJS.Timeout} = {};
  private observedLeaves: string[] = [];

  async onload() {
    await this.loadPluginData();
    this.addSettingTab(new RescrollSettingTab(this.app, this));

    this.addRibbonIcon("gallery-vertical-end", translations.action_description, (evt: MouseEvent) => {
      this.triggerScrollpositionRestore();
    });

    this.addCommand({
      id: "restore-scrollposition",
      name: translations.action_description,
      editorCallback: () => {
        this.triggerScrollpositionRestore();
      },
    });

    // initially restore scroll position on all open editors
    // listen to scroll events on open editors
    this.app.workspace.onLayoutReady(() => {
      const activeLeaves = this.app.workspace.getLeavesOfType("markdown");
      activeLeaves.forEach((leaf) => {
        const view = leaf.view;
        // @ts-ignore usage of internal property
        const id = leaf.id;
        if (!(view instanceof MarkdownView)) return;
        if (this.data.settings.scrollInstantly) {
          ReScroll.restoreScrollposition(view, this.data);
        }

        this.registerScrollListener(leaf);
        this.observedLeaves.push(id);
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
        });
      }),
    );

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        if (!this.data.settings.scrollInstantly) return;
        this.triggerScrollpositionRestore();
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

  triggerScrollpositionRestore(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    ReScroll.restoreScrollposition(view, this.data);
  }

  async updateData(modifiedData: ReScrollPluginData) {
    if (!modifiedData) return;

    this.data = modifiedData;
    await this.saveData(this.data);
  }

  registerScrollListener(leaf: WorkspaceLeaf): void {
    if (!leaf?.view || !(leaf.view instanceof MarkdownView)) return;
    const view = leaf.view;
    const scrollEl = view.contentEl.querySelector(".cm-scroller") as HTMLElement;

    this.registerDomEvent(scrollEl, "scroll", () => {
      // @ts-ignore usage of internal property
        const id = leaf.id;
      this.savePositionOnEndOfScrolling(view, id);
    });
  }

  savePositionOnEndOfScrolling(view: MarkdownView, id: string): void {
    // Reset if we get another event in the timeout duration to only save when stop scrolling
    if (this.scrollingDebounces[id]) window.clearTimeout(this.scrollingDebounces[id]);

    this.scrollingDebounces[id] = setTimeout(() => {
      if (!view) return;

      logDebug('onEndOfScrolling: Attempt to save scroll pos', id, view?.file?.path)

      ReScroll.saveScrollPosition(view, this.data, async (modifiedData) => {
        await this.updateData(modifiedData);

        logDebug("saved modified data", this.data);
      });
    }, 350);
  }

  async loadPluginData(): Promise<void> {
    this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
  }
}
