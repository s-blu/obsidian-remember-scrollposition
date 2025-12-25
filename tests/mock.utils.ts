import { App, MarkdownView, WorkspaceLeaf } from "obsidian";
import { ReScroll } from "../src/scrollposition";
import { ReScrollPluginData } from "../interfaces/scrollposition.interface";

export function getMockEditorRange(line = 2) {
  return {
    to: {
      line: line,
      ch: 1,
    },
    from: {
      line: line,
      ch: 1,
    },
  };
}

export function mockRetrieveEditorRange(line?: number) {
  return jest.spyOn(ReScroll, "retrieveEditorRangeForCurrentPosition").mockReturnValue(getMockEditorRange(line));
}

export function getMockView(filepath = "mock/path.md", scrollTop = 222): MarkdownView {
  const viewObj = new MarkdownView(new WorkspaceLeaf());

  Object.assign(viewObj, {
    file: { path: filepath },
    editor: {
      cm: {
        dispatch: jest.fn(),
      },
      getScrollInfo: jest.fn().mockReturnValue({ top: scrollTop }),
      scrollIntoView: jest.fn(),
      transaction: jest.fn()
    },
    getViewType: () => "markdown", 
    contentEl: {
      querySelector: jest.fn().mockReturnValue({}),
    },
  });

  return viewObj;
}

export function getMockPluginData(): ReScrollPluginData {
  return {
    settings: {
      scrollInstantly: true,
      maxAge: 7
    },
    scrollpositions: [],
  } as ReScrollPluginData;
}

export function getMockApp(): App {
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

export function getMockWorkspaceLeaf(id: string): WorkspaceLeaf {
  const leaf = new WorkspaceLeaf();
  leaf.view = getMockView()
  leaf.view.leaf = leaf;

  // @ts-expect-error internal property
  leaf.id = id;

  return leaf;
}
