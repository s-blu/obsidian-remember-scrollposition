import { App, MarkdownView } from "obsidian";
import { ReScroll } from "../src/scrollposition";
import { ReScrollPluginData } from "../src/scrollposition.interface";

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
    .spyOn(ReScroll, "retrieveEditorRangeForCurrentPosition")
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
      scrollInstantly: true
    },
    scrollpositions: []
  } as ReScrollPluginData;
}

export function getMockApp() {
  return {
    workspace: {
      on: jest.fn(),
      getActiveViewOfType: () => {
        return {
          editor: {
            cm: {}
          }
        }
      }
    },
    vault: {
      on: jest.fn()
    }
  } as unknown as App;
}