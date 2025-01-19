import { MarkdownView } from "obsidian";
import { RememberScrollposition } from "../src/scrollposition";
import { RememberScrollpositionPluginData } from "../src/scrollposition.interface";

export function getMockEditorRange(line = 2) {
  return {
    to: {
      line: line,
      ch: 1,
    },
    from: {
      line: 0,
      ch: 1,
    },
  };
}

export function mockRetrieveEditorRange(line?: number) {
  return jest
    .spyOn(RememberScrollposition, "retrieveEditorRangeForCurrentPosition")
    .mockReturnValue(getMockEditorRange(line));
}

export function getMockView(filepath = "mock/path.md") {
  return {
    file: { path: filepath},
    editor: {
      cm: {}
    }
  } as unknown as MarkdownView;
}

export function getMockPluginData() {
  return {
    settings: {
      mySetting: 'mock'
    },
    scrollpositions: []
  } as RememberScrollpositionPluginData;
}