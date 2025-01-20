import { App, MarkdownView } from "obsidian";
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

export function getMockView(filepath = "mock/path.md", scrollTop = 222) {
  return {
    file: { path: filepath},
    editor: {
      cm: {
        dispatch: jest.fn()
      },
      getScrollInfo: jest.fn().mockReturnValue({ top: scrollTop }),
      scrollIntoView: jest.fn()
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

export function getMockApp() {
  return {
    workspace: {
      on: jest.fn()
    },
    vault: {
      on: jest.fn()
    }
  } as unknown as App;
}