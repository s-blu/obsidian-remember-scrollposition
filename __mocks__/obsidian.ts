import { App } from "obsidian";


export class Plugin {
  onload() {}
  onunload() {}
  registerEvent() {}
  registerDomEvent() {}
  registerInterval() {}

  loadData() {
    return {}
  }

  app = {
      workspace: {
        on: jest.fn()
      },
      vault: {
        on: jest.fn()
      }
    } as unknown as App;
}