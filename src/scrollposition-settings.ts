import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import RememberScrollpositionPlugin from "./main";
import { ReScrollPluginSettings } from "../interfaces/scrollposition.interface";
import translations from "./translations.json";

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

    new Setting(containerEl)
      .setName(translations.settings.maxAge.name)
      .setDesc(translations.settings.maxAge.description)
      .addText((text) => {
        text
        .setValue("" + this.plugin.data.settings.maxAge)
        .onChange(async (val) => {
          const num = parseInt(val);
          if (Number.isInteger(num) && num >= 0) {
            await this.saveSetting("maxAge", num);
          } else {
            new Notice(translations.settings.maxAge.error);
          }
        });
      });

    // TODO be able to exclude or include certain paths for saving only
    // TODO provide an option to correct saved line number of a certain degree to achieve more intuitive scrolling results
    // TODO add setting to customize timeout time of scroll position saving
    // TODO add setting to (a) prefer cursor position if cursor is inside visibleRanges and (b) to ALWAYS use cursor position for saving, even if not visible (and to ignore scroll pos then)
  }

  private async saveSetting<key extends keyof ReScrollPluginSettings>(name: key, value: ReScrollPluginSettings[key]) {
    this.plugin.data.settings[name] = value;
    await this.plugin.saveData(this.plugin.data);
  }
}
