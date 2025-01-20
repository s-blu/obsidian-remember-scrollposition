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
