import { App, PluginSettingTab, Setting } from "obsidian";
import RememberScrollpositionPlugin from "./main";
import { ReScrollPluginSettings } from "../interfaces/scrollposition.interface";
import translations from "./translations.json"

export class RescrollSettingTab extends PluginSettingTab {
  plugin: RememberScrollpositionPlugin;

  constructor(app: App, plugin: RememberScrollpositionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName(translations.settings.scrollInstantly.name)
      .setDesc(translations.settings.scrollInstantly.description)
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.data.settings.scrollInstantly)
          .onChange((val) => this.saveSetting("scrollInstantly", val));
      });

    // TODO add settings: let the user decide to scroll instantly upon opening or by clicking a ribbon icon
    // TODO when scrolling instantly, allow disabling the ribbon icon
    // TODO add a ribbon icon to jump to the scroll position and make it configurable. see example_main
    // TODO be able to exclude or include certain paths for saving only
    // TODO provide an option to correct saved line number of a certain degree to achieve more intuitive scrolling results
  }

  private async saveSetting<key extends keyof ReScrollPluginSettings>(name: key, value: ReScrollPluginSettings[key]) {
    this.plugin.data.settings[name] = value;
    await this.plugin.saveData(this.plugin.data);
  }
}
