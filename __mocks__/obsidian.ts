import { View } from "obsidian";
import { getMockApp } from "../tests/mock.utils";

export class Plugin {
  onload() {}
  onunload() {}
  registerEvent() {}
  registerDomEvent() {}
  registerInterval() {}

  loadData() {
    return {};
  }

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