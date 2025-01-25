import { View } from "obsidian";
import { getMockApp } from "../tests/mock.utils";

export class Plugin {
  onload() {}
  onunload() {}
  registerEvent() {}
  registerDomEvent() {}
  registerInterval() {}
  addSettingTab() {}
  addRibbonIcon() {}
  addCommand() {}

  loadData() {
    return {};
  }
  saveData() {}

  app = getMockApp();
}

export class MarkdownView {
  constructor() {}
}

export class WorkspaceLeaf {
  view: View;
  id: string;

  constructor(view: View, id: string) {
    this.view = view;
    this.id = id;
  }
}

export class PluginSettingTab {
  containerEl = {
    empty: jest.fn(),
  };
}

export class Setting {
  constructor() {}

  setName() {
    console.log('set name mock called')
    return this;
  }
  setDesc() {
    return this;
  }

  addText() {

  }
  addToggle() {}
}

export class Notice {}