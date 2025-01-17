import { MarkdownView, Plugin } from "obsidian";
import { RememberScrollposition } from "./scrollposition";
import { RememberScrollpositionPluginSettings, RememberScrollpositionPluginData } from "./scrollposition.interface";
import { EditorState, StateEffect, StateField, Transaction } from "@codemirror/state";

const DEFAULT_SETTINGS: RememberScrollpositionPluginSettings = {
  mySetting: "default", // TODO
};

const DEFAULT_DATA: RememberScrollpositionPluginData = {
  settings: DEFAULT_SETTINGS,
  scrollpositions: []
}


export default class RememberScrollpositionPlugin extends Plugin {
  data: RememberScrollpositionPluginData;

  async onload() {
    await this.loadPluginData();
    
    // TODO on scroll, save the file path + scroll position with a small delay via this.saveData()

    // TODO fetch the info with either getScroll() or `document.querySelector(".cm-editor.cm-focused .cm-scroller").scrollTop`
    // TODO on exit/close, save the scroll position

    // TODO register event on document.querySelector(".cm-editor.cm-focused .cm-scroller")

    let scrollingDebounce: NodeJS.Timeout;
    this.registerDomEvent(document, "wheel", (event: any) => {
      // Reset if we get another wheel event in the timeout duration
      window.clearTimeout(scrollingDebounce);

      scrollingDebounce = setTimeout(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;

        RememberScrollposition.saveScrollPosition(view, this.data, async (modifiedData) => {
          this.data = modifiedData;
          await this.saveData(this.data);
          console.log('saved modified data', this.data)
          for (const sc of this.data.scrollpositions) {
            console.log(`${sc.path}: ${sc.scrollposition}`)
          }
        })
      }, 350); // TODO figure out a good timeout time
    });

    // FIXME scrolling via the scrollbar is not detected

    // When focusing a leaf, restore its saved scroll position
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        console.log("active leave changed", leaf);
        const view =
          this.app.workspace.getActiveViewOfType(MarkdownView);

        if (view && view.editor.cm) {
          const lastPosition = this.data.scrollpositions.find(
            (p) => p.path === view.file?.path
          );

          if (!lastPosition) return
          view.editor.cm.dispatch({
            effects: view.editor.scrollIntoView(lastPosition.range, true)
          });
          // view.editor.cm.dispatch({
          //   selection: { 
          //     anchor: lastPosition.scrollposition
          //   },
          //   scrollIntoView: true,
          // });

          // view.editor.cm.scrollDOM.scrollTo({
          //   top: lastPosition.scrollposition,
          //   behavior: 'smooth'
          // });
          //RememberScrollposition.restoreScrollposition(view, this.data)
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("rename", (file) => {
        // TODO update path if available in scrollposition data
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        // TODO remove path if available in scrollposition data
      })
    );

    // TODO add settings: let the user decide to scroll instantly upon opening or by clicking a ribbon icon
    // TODO when scrolling instantly, allow disabling the ribbon icon
    // TODO add a ribbon icon to jump to the scroll position and make it configurable. see example_main
    // TODO be able to exclude or include certain paths for saving only

    // TODO add a menu entry, if possible, to reset/forget the scroll position ? theortically you only need to scroll back up, though

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(
      window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
    );
  }

  onunload() {}

  async loadPluginData() {
    this.data = Object.assign(
      {},
      DEFAULT_DATA,
      await this.loadData()
    );
  }
}