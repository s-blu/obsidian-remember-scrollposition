import { Editor, EditorRange } from "obsidian";
import { ReScroll } from "../src/scrollposition";
import {
  getMockEditorRange,
  getMockPluginData,
  getMockView,
  mockRetrieveEditorRange,
} from "./mock.utils";
import { ReScrollPluginData } from "interfaces/scrollposition.interface";

describe("RememberScrollposition", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("saveScrollposition", () => {
    it("should save current scrollposition for new file records", () => {
      const mockView = getMockView("mock/path/file.md");
      const mockData = getMockPluginData();
      const cbSpy = jest.fn();
      mockRetrieveEditorRange(11);

      ReScroll.saveScrollPosition(mockView, mockData, cbSpy);
      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [
          {
            editorRange: getMockEditorRange(11),
            path: "mock/path/file.md",
            updated: expect.any(Number),
          },
        ],
      });
    });
    it("should update current scrollposition for existing file records", () => {
      const mockPath = "existing/file.md";
      const mockView = getMockView(mockPath);
      const mockData = getMockPluginData();
      mockData.scrollpositions.push({
        path: mockPath,
        editorRange: getMockEditorRange(),
        updated: Date.now(),
      });
      const cbSpy = jest.fn();
      mockRetrieveEditorRange(20);

      ReScroll.saveScrollPosition(mockView, mockData, cbSpy);

      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [
          {
            editorRange: getMockEditorRange(20),
            path: mockPath,
            updated: expect.any(Number),
          },
        ],
      });
    });

    it("should update timestamp on record", () => {
      const mockPath = "existing/file.md";
      const mockView = getMockView(mockPath);
      const mockData = getMockPluginData();

      mockData.scrollpositions.push({
        path: mockPath,
        editorRange: getMockEditorRange(),
        updated: new Date("2024-10-02T09:00").valueOf(),
      });
      const cbSpy = jest.fn();
      mockRetrieveEditorRange(20);

      const newTime = new Date("2024-10-02T11:00").valueOf();
      jest.spyOn(Date, "now").mockReturnValue(newTime);

      ReScroll.saveScrollPosition(mockView, mockData, cbSpy);

      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [
          {
            editorRange: getMockEditorRange(20),
            path: mockPath,
            updated: newTime,
          },
        ],
      });
    });

    it("should do nothing if app is invalid", () => {
      const mockData = getMockPluginData();
      const cbSpy = jest.fn();

      ReScroll.saveScrollPosition(null as any, mockData, cbSpy);

      expect(cbSpy).not.toHaveBeenCalled();
    });

    it("should do nothing if codemirror is inaccesible", () => {
      const mockView = getMockView();
      mockView.editor = {} as unknown as Editor;
      const mockData = getMockPluginData();
      const cbSpy = jest.fn();

      ReScroll.saveScrollPosition(mockView, mockData, cbSpy);

      expect(cbSpy).not.toHaveBeenCalled();
    });
  });

  describe("retrieveEditorRangeForCurrentPosition", () => {
    it("should extract current line number from scrollSnapshot", () => {
      const mockCm = {
        scrollSnapshot: jest
          .fn()
          .mockReturnValue({ value: { range: { head: 1230 } } }),
        viewState: {
          state: {
            doc: {
              lineAt: jest.fn().mockImplementation((pos) => {
                return { number: pos / 10 };
              }),
            },
          },
        },
      } as any;

      const result = ReScroll.retrieveEditorRangeForCurrentPosition(mockCm);
      expect(result?.to?.line).toEqual(123);
      expect(result?.from?.line).toEqual(123);
    });

    it("should return null if called with invalid parameters", () => {
      //@ts-expect-error should not crash with invalid data
      expect(ReScroll.retrieveEditorRangeForCurrentPosition(null)).toEqual(
        null,
      );
    });
    it("should return null if codemirror does not provide needed properties", () => {
      const mockCm = {
        viewState: {
          state: {
            doc: {
              lineAt: jest.fn().mockImplementation((pos) => {
                return { number: pos / 10 };
              }),
            },
          },
        },
      } as any;
      //@ts-expect-error should not crash with invalid data
      expect(ReScroll.retrieveEditorRangeForCurrentPosition(null)).toEqual(
        null,
      );

      mockCm.scrollSnapshot = jest.fn().mockReturnValue({});
      mockCm.viewState = { state: {} };
      expect(ReScroll.retrieveEditorRangeForCurrentPosition(mockCm)).toEqual(
        null,
      );
    });
  });

  describe("restoreScrollposition", () => {
    it("should load last scroll position and call scrollIntoView", () => {
      const mockView = getMockView(undefined, 0);
      const mockData = getMockPluginData();
      const mockEditorRange = getMockEditorRange(15);

      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: mockView.file?.path ?? "",
        updated: Date.now(),
      });

      ReScroll.restoreScrollposition(mockView, mockData);

      expect(mockView.editor.scrollIntoView).toHaveBeenCalledWith(
        mockEditorRange, true
      );
    });

    it("should do nothing if called with invalid parameters", () => {
      const mockView = getMockView(undefined, 0);
      ReScroll.restoreScrollposition(null as any, null as any);
      ReScroll.restoreScrollposition(mockView, null as any);

      expect(mockView.editor.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should do nothing if current scroll is not on top (meaning file was already scrolled)", () => {
      const mockView = getMockView(undefined, 300);
      const mockData = getMockPluginData();
      const mockEditorRange = getMockEditorRange(15);

      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: mockView.file?.path ?? "",
        updated: Date.now(),
      });

      ReScroll.restoreScrollposition(mockView, mockData);

      // @ts-expect-error usage of inofficial API
      expect(mockView.editor.cm.dispatch).not.toHaveBeenCalled();
      expect(mockView.editor.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should do nothing if no scrollposition is found for current file", () => {
      const mockView = getMockView(undefined, 0);
      const mockData = getMockPluginData();

      ReScroll.restoreScrollposition(mockView, mockData);

      // @ts-expect-error usage of inofficial API
      expect(mockView.editor.cm.dispatch).not.toHaveBeenCalled();
      expect(mockView.editor.scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe("updatePathOfEntry", () => {
    let mockData: ReScrollPluginData;
    let mockEditorRange: EditorRange;
    let updated: number;

    beforeEach(() => {
      mockData = getMockPluginData();
      mockEditorRange = getMockEditorRange(15);
      updated = Date.now();
    });
    it("should update path to given new name, if entry is available while keeping old updated timestamp", () => {
      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: "oldName.md",
        updated: updated,
      });
      const cbSpy = jest.fn();

      ReScroll.updatePathOfEntry(
        mockData,
        "oldName.md",
        "path/to/new.md",
        cbSpy,
      );

      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [
          {
            editorRange: mockEditorRange,
            path: "path/to/new.md",
            updated,
          },
        ],
      });
    });
    it("should do nothing if no entry for oldName is available", () => {
      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: "otherOldName.md",
        updated: updated,
      });
      const cbSpy = jest.fn();

      ReScroll.updatePathOfEntry(
        mockData,
        "oldName.md",
        "path/to/new.md",
        cbSpy,
      );

      expect(cbSpy).not.toHaveBeenCalled();
    });
    it("should delete entry if no newName is known", () => {
      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: "oldName.md",
        updated: updated,
      });
      const cbSpy = jest.fn();

      ReScroll.updatePathOfEntry(mockData, "oldName.md", undefined, cbSpy);

      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [],
      });
    });
  });

  describe("deleteEntry", () => {
    let mockData: ReScrollPluginData;
    let mockEditorRange: EditorRange;
    let updated: number;

    beforeEach(() => {
      mockData = getMockPluginData();
      mockEditorRange = getMockEditorRange(2);
      updated = Date.now();
    });
    it("should delete entry, if entry is available", () => {
      const mockEntryToDelete = {
        editorRange: mockEditorRange,
        path: "nameToDelete.md",
        updated: updated,
      };
      const mockEntry2 = {
        editorRange: mockEditorRange,
        path: "some/other/file.md",
        updated: updated,
      };
      const mockEntry3 = {
        editorRange: mockEditorRange,
        path: "doNotDeleteMePlease.md",
        updated: updated,
      };
      mockData.scrollpositions.push(mockEntry2, mockEntryToDelete, mockEntry3);
      const cbSpy = jest.fn();

      ReScroll.deleteEntry(mockData, "nameToDelete.md", cbSpy);

      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [mockEntry2, mockEntry3],
      });
    });
    it("should do nothing if no entry is available", () => {
      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: "someName.md",
        updated: updated,
      });
      const cbSpy = jest.fn();

      ReScroll.deleteEntry(mockData, "delete/this.md", cbSpy);

      expect(cbSpy).not.toHaveBeenCalled();
    });

    it("should do nothing if filepath is inavlid", () => {
      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: "someName.md",
        updated: updated,
      });
      const cbSpy = jest.fn();

      // @ts-expect-error should not crash with invalid data
      ReScroll.deleteEntry(mockData, undefined, cbSpy);

      expect(cbSpy).not.toHaveBeenCalled();
    });

    it("should do nothing, if data is invalid", () => {
      mockData.scrollpositions.push({
        editorRange: mockEditorRange,
        path: "oldName.md",
        updated: updated,
      });
      const cbSpy = jest.fn();

      ReScroll.deleteEntry({} as any, "delete/this.md", cbSpy);

      expect(cbSpy).not.toHaveBeenCalled();
    });
  });
});
