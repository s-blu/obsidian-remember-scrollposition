import { App, MarkdownView, WorkspaceLeaf } from "obsidian";
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
  return jest.spyOn(ReScroll, "retrieveEditorRangeForCurrentPosition").mockReturnValue(getMockEditorRange(line));
}

export function getMockView(filepath = "mock/path.md", scrollTop = 222) {
  const viewObj = new MarkdownView(new WorkspaceLeaf());

  Object.assign(viewObj, {
    file: { path: filepath },
    editor: {
      cm: {
        dispatch: jest.fn(),
      },
      getScrollInfo: jest.fn().mockReturnValue({ top: scrollTop }),
      scrollIntoView: jest.fn(),
    },
    contentEl: {
      querySelector: jest.fn().mockReturnValue({}),
    },
  });

  return viewObj;
}

export function getMockPluginData() {
  return {
    settings: {
      scrollInstantly: true,
    },
    scrollpositions: [],
  } as ReScrollPluginData;
}

export function getMockApp() {
  return {
    workspace: {
      on: jest.fn(),
      getActiveViewOfType: () => {
        return {
          editor: {
            cm: {},
          },
        };
      },
      onLayoutReady: jest.fn(),
      getLeavesOfType: jest.fn().mockReturnValue([]),
    },
    vault: {
      on: jest.fn(),
    },
  } as unknown as App;
}

export function getMockWorkspaceLeaf(id: string) {
  const leaf = new WorkspaceLeaf();
  leaf.view = getMockView()
  leaf.view.leaf = leaf;

  // @ts-ignore internal property
  leaf.id = id;

  return leaf;
}
