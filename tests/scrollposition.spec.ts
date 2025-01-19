import { Editor } from "obsidian";
import { RememberScrollposition } from "../src/scrollposition";
import {
  getMockEditorRange,
  getMockPluginData,
  getMockView,
  mockRetrieveEditorRange,
} from "./mock.utils";

describe("RememberScrollposition", () => {
  describe("saveScrollposition", () => {
    it("should save current scrollposition for new file records", () => {
      const mockView = getMockView("mock/path/file.md");
      const mockData = getMockPluginData();
      const cbSpy = jest.fn();
      mockRetrieveEditorRange(11);

      RememberScrollposition.saveScrollPosition(mockView, mockData, cbSpy);
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

      RememberScrollposition.saveScrollPosition(mockView, mockData, cbSpy);

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

      RememberScrollposition.saveScrollPosition(mockView, mockData, cbSpy);

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

      RememberScrollposition.saveScrollPosition(null as any, mockData, cbSpy);

      expect(cbSpy).not.toHaveBeenCalled();
    });

    it("should do nothing if codemirror is inaccesible", () => {
      const mockView = getMockView();
      mockView.editor = {} as unknown as Editor;
      const mockData = getMockPluginData();
      const cbSpy = jest.fn();

      RememberScrollposition.saveScrollPosition(mockView, mockData, cbSpy);

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
      };

      const result =
        RememberScrollposition.retrieveEditorRangeForCurrentPosition(mockCm);
      expect(result?.to?.line).toEqual(123);
    });

    it("should return null if called with invalid parameters", () => {
      expect(
        RememberScrollposition.retrieveEditorRangeForCurrentPosition(null),
      ).toEqual(null);
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
      };

      expect(
        RememberScrollposition.retrieveEditorRangeForCurrentPosition(null),
      ).toEqual(null);

      // @ts-expect-error should not error out on missing cm functionality
      mockCm.scrollSnapshot = jest.fn().mockReturnValue({})
      // @ts-expect-error should not error out on missing cm functionality
      mockCm.viewState = { state: {}};
      expect(RememberScrollposition.retrieveEditorRangeForCurrentPosition(mockCm)).toEqual(null)
    });
  });

  describe("restoreScrollposition", () => {
    it.todo(
      "should load last scroll position and dispatch scrollIntoView effect to codemirror",
    );

    it.todo("should do nothing if called with invalid parameters");

    it.todo(
      "should do nothing if current scroll is not on top (meaning file was already scrolled)",
    );

    it.todo("should do nothing if no scrollposition is found for current file");
  });
});
