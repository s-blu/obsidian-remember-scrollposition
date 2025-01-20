import { Plugin } from "obsidian";
import RememberScrollpositionPlugin from "../src/main";
import { getMockApp } from "./mock.utils";
import { ReScroll } from "../src/scrollposition";

describe("main", () => {
  it("should sucessfully initialize plugin file", () => {
    expect(RememberScrollpositionPlugin).toBeTruthy();
  });

  describe("onload", () => {
    let plugin: RememberScrollpositionPlugin;

    beforeEach(() => {
      plugin = new RememberScrollpositionPlugin(getMockApp(), {} as any);
    });

    it("should initialize data.scrollpositions with an empty array", async () => {
      await plugin.onload();

      expect(plugin.data).toEqual({
        settings: expect.anything(),
        scrollpositions: [],
      });
    });

    it("should load saved data on startup", async () => {
      const loadDataSpy = jest.spyOn(Plugin.prototype, "loadData");

      await plugin.onload();

      expect(loadDataSpy).toHaveBeenCalled();
    });

    it("should attempt to save scroll position on wheel event", async () => {
      jest.useFakeTimers();
      let callback!: () => void;
      const domEvSpy = jest
        .spyOn(Plugin.prototype, "registerDomEvent")
        .mockImplementationOnce((doc: any, event: any, cb: any) => {
          callback = cb;
        });
      const saveScrollPosSpy = jest.spyOn(ReScroll, "saveScrollPosition");

      await plugin.onload();

      expect(domEvSpy).toHaveBeenCalledWith(
        expect.any(Document),
        "wheel",
        expect.any(Function),
      );

      callback();
      jest.advanceTimersByTime(1000);

      expect(saveScrollPosSpy).toHaveBeenCalled();
    });

    it("should attempt to restore scroll position on active-leaf-change", async () => {
      let callback!: () => void;
      const registerEvSpy = jest.spyOn(Plugin.prototype, "registerEvent");

      const restoreScrollPosSpy = jest
        .spyOn(ReScroll, "restoreScrollposition")
        .mockReturnValue();
      jest
        .spyOn(plugin.app.workspace, "on")
        .mockImplementationOnce((event: any, cb: any) => {
          callback = cb;

          // to conform expected type
          return {} as any;
        });
      await plugin.onload();

      expect(registerEvSpy).toHaveBeenCalled();

      callback();
      expect(restoreScrollPosSpy).toHaveBeenCalled();
    });

    it("should call updatePathOfEntry on rename event", async () => {
      let callback!: () => void;
      const registerEvSpy = jest.spyOn(Plugin.prototype, "registerEvent");

      const updateEntrySpy = jest
        .spyOn(ReScroll, "updatePathOfEntry")
        .mockReturnValue();
      const vaultOnSpy = jest
        .spyOn(plugin.app.vault, "on")
        .mockImplementation((event: any, cb: any) => {
          if (event === 'rename') callback = cb;

          // to conform expected type
          return {} as any;
        });
      await plugin.onload();

      expect(registerEvSpy).toHaveBeenCalled();
      expect(vaultOnSpy).toHaveBeenCalledWith("delete", expect.any(Function));

      callback();
      expect(updateEntrySpy).toHaveBeenCalled();
    });

    it("should call deleteEntry on delete event", async () => {
      let callback!: () => void;
      const registerEvSpy = jest.spyOn(Plugin.prototype, "registerEvent");

      const deleteEntrySpy = jest
        .spyOn(ReScroll, "deleteEntry")
        .mockReturnValue();
      const vaultOnSpy = jest
        .spyOn(plugin.app.vault, "on")
        .mockImplementation((event: any, cb: any) => {
          if (event === 'delete') callback = cb;
          

          // to conform expected type
          return {} as any;
        });
      await plugin.onload();

      expect(registerEvSpy).toHaveBeenCalled();
      expect(vaultOnSpy).toHaveBeenCalledWith("delete", expect.any(Function));

      callback();
      expect(deleteEntrySpy).toHaveBeenCalled();
    });
  });
});
