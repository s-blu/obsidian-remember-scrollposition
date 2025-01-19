import { RememberScrollposition } from "../src/scrollposition";
import { getMockPluginData, getMockView, mockRetrieveEditorRange } from "./mock.utils";

describe("RememberScrollposition", () => {
  describe("saveScrollPosition", () => {
    it('should save current scrollposition for new file records', () => {
      const mockView = getMockView("mock/path/file.md");
      const mockData = getMockPluginData();
      mockRetrieveEditorRange(11);

      const cbSpy = jest.fn();

      RememberScrollposition.saveScrollPosition(mockView, mockData, cbSpy)
      expect(cbSpy).toHaveBeenCalledWith({
        settings: expect.anything(),
        scrollpositions: [
          {
            editorRange: {
              to: {
                line: 11,
                ch: 1,
              },
              from: {
                line: 0,
                ch: 1,
              }, 
            },
            path: "mock/path/file.md",
            updated: expect.any(Number)
          }
        ]
      })
    });
    it.todo('should update current scrollposition for existing file records')

    it.todo('should save current date to record')

    it.todo('should pass updated data to callback for further processing')
    it("should do nothing if app is invalid", () => {
      RememberScrollposition.saveScrollPosition(
        null as any,
        null as any,
        null as any,
      );
    });

    it.todo('should do nothing if codemirror is inaccesible')
  });

  describe('retrieveEditorRangeForCurrentPosition', () => {
    it.todo('should extract current line number from scrollSnapshot')

    it.todo('should return null if called with invalid parameters')
  })

  describe('restoreScrollposition', () => {

    it.todo('should load last scroll position and dispatch scrollIntoView effect to codemirror')

    it.todo('should do nothing if called with invalid parameters')

    it.todo('should do nothing if current scroll is not on top (meaning file was already scrolled)')

    it.todo('should do nothing if no scrollposition is found for current file')
  })
});
