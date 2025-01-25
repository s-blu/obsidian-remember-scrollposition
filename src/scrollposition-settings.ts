import { App, PluginSettingTab, Setting, moment } from "obsidian";
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
      .setName("Max Age for Scrolling Positions")
      .setDesc(
        "Configure how long a scroll position is applied before considered outdated. Leave empty to disable age check. Needs to conform moment.js duration format, i.e. 5 days; 3 weeks; 1 months",
      )
      .addText((text) =>
        text
          .setPlaceholder("7 days")
          .setValue(this.plugin.data.settings.maxAge.raw)
          .onChange((val) => {
            const maxAgeParts = val.split(" ");
            const amount = maxAgeParts[0]
            const unit = maxAgeParts[1] as moment.unitOfTime.DurationConstructor;
            if (!amount || !unit) {
              // TODO error
            } 
            const maxAgeDuration = moment.duration(amount, unit);
            if (maxAgeDuration.isValid()) {
              this.saveSetting("maxAge", { raw: val, unit, amount})
            } else {
              // TODO show error
            }
          }),
      );

    // TODO configure maxAge of scrolling position
    // TODO be able to exclude or include certain paths for saving only
    // TODO provide an option to correct saved line number of a certain degree to achieve more intuitive scrolling results
  }

  private async saveSetting<key extends keyof ReScrollPluginSettings>(name: key, value: ReScrollPluginSettings[key]) {
    this.plugin.data.settings[name] = value;
    await this.plugin.saveData(this.plugin.data);
  }
}
