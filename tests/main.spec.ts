import { MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import RememberScrollpositionPlugin from "../src/main";
import { getMockApp, getMockWorkspaceLeaf } from "./mock.utils";
import { ReScroll } from "../src/scrollposition";

describe("main", () => {
  it("should sucessfully initialize plugin file", () => {
    expect(RememberScrollpositionPlugin).toBeTruthy();
  });

  describe("onload", () => {
    let plugin: RememberScrollpositionPlugin;

    beforeEach(() => {
      plugin = new RememberScrollpositionPlugin(getMockApp(), {} as any);
      jest.resetAllMocks();
    });

    it("should initialize data.scrollpositions with an empty array", async () => {
      await plugin.onload();

      expect(plugin["data"]).toEqual({
        settings: expect.anything(),
        scrollpositions: [],
      });
    });

    it("should initialize settings with default settings", async () => {
      await plugin.onload();

      expect(plugin["data"]).toEqual({
        settings: {
          scrollInstantly: true,
          maxAge: 14,
        },
        scrollpositions: expect.anything(),
      });
    });

    it("should register a ribbon icon to manually restore scroll position on active file", async () => {
      const ribbonSpy = jest
        .spyOn(Plugin.prototype, "addRibbonIcon")
        .mockImplementation((icon, title, cb) => cb({} as any));
      const restoreSpy = jest.spyOn(ReScroll, "restoreScrollposition").mockImplementation();

      await plugin.onload();

      expect(ribbonSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it("should add command to manually restore scroll position on active file", async () => {
      const cmdSpy = jest
        .spyOn(Plugin.prototype, "addCommand")
        .mockImplementation(({ callback }) => callback && callback());
      const restoreSpy = jest.spyOn(ReScroll, "restoreScrollposition").mockImplementation();

      await plugin.onload();

      expect(cmdSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it("should load saved data on startup", async () => {
      const loadDataSpy = jest.spyOn(Plugin.prototype, "loadData");

      await plugin.onload();

      expect(loadDataSpy).toHaveBeenCalled();
    });

    it("should register a scroll event listener and try to restore scroll position for every active Markdown leaf on startup", async () => {
      jest.useFakeTimers();
      const activeLeavesMock: WorkspaceLeaf[] = [];

      for (let i = 0; i < 5; i++) {
        activeLeavesMock.push(getMockWorkspaceLeaf(`mock-leaf-${i}`));
      }
      // add a non-markdownView leaf to make sure they're skipped out
      activeLeavesMock.splice(2, 0, {} as any);

      const domEvSpy = jest.spyOn(Plugin.prototype, "registerDomEvent").mockImplementation(() => {});
      const restoreScrollPosSpy = jest.spyOn(ReScroll, "restoreScrollposition").mockReturnValue();
      jest.spyOn(plugin.app.workspace, "onLayoutReady").mockImplementation((cb) => cb());
      jest.spyOn(plugin.app.workspace, "getLeavesOfType").mockImplementation((_) => activeLeavesMock);

      await plugin.onload();

      expect(domEvSpy).toHaveBeenCalledWith(expect.anything(), "scroll", expect.any(Function));
      expect(domEvSpy).toHaveBeenCalledTimes(5);
      expect(restoreScrollPosSpy).toHaveBeenCalledTimes(5);
    });

    it("should attempt to save scroll position on scroll event after debounce", async () => {
      jest.useFakeTimers();
      let callback!: () => void;
      const leaf = new WorkspaceLeaf();
      leaf.view = new MarkdownView(leaf); //getMockView();
      // @ts-ignore internal property
      leaf.id = "mock";
      // @ts-ignore internal property
      leaf.view.contentEl = {
        querySelector: () => {
          return {} as Element;
        },
      };

      const domEvSpy = jest
        .spyOn(Plugin.prototype, "registerDomEvent")
        .mockImplementation((doc: any, event: any, cb: any) => {
          if (event === "scroll") callback = cb;
        });
      const saveScrollPosSpy = jest.spyOn(ReScroll, "saveScrollPosition").mockImplementation((view, data, cb) => cb(data));
      const saveSpy = jest.spyOn(Plugin.prototype, 'saveData')
      jest.spyOn(plugin.app.workspace, "onLayoutReady").mockImplementation((cb) => cb());
      jest.spyOn(plugin.app.workspace, "getLeavesOfType").mockImplementation((_) => {
        return [leaf];
      });

      await plugin.onload();

      expect(domEvSpy).toHaveBeenCalledWith(expect.anything(), "scroll", expect.any(Function));

      callback();
      jest.advanceTimersByTime(1000);

      expect(saveScrollPosSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled()
    });

    it("should attempt to restore scroll position on active-leaf-change", async () => {
      let callback!: () => void;
      const registerEvSpy = jest.spyOn(Plugin.prototype, "registerEvent");

      const restoreScrollPosSpy = jest.spyOn(ReScroll, "restoreScrollposition").mockReturnValue();
      jest.spyOn(plugin.app.workspace, "on").mockImplementation((event: any, cb: any) => {
        if (event === "active-leaf-change") callback = cb;

        // to conform expected type
        return {} as any;
      });
      await plugin.onload();

      expect(registerEvSpy).toHaveBeenCalled();

      callback();
      expect(restoreScrollPosSpy).toHaveBeenCalled();
    });

    it("should not restore scroll position on active leaf change if scrollInstantly is false", async () => {
      let callback!: () => void;

      const restoreScrollPosSpy = jest.spyOn(ReScroll, "restoreScrollposition").mockReturnValue();
      jest.spyOn(plugin.app.workspace, "on").mockImplementation((event: any, cb: any) => {
        if (event === "active-leaf-change") callback = cb;

        // to conform expected type
        return {} as any;
      });
      await plugin.onload();
      plugin.data.settings.scrollInstantly = false;

      callback();
      expect(restoreScrollPosSpy).not.toHaveBeenCalled();
    });

    it("should call updatePathOfEntry on rename event", async () => {
      let callback!: () => void;
      const registerEvSpy = jest.spyOn(Plugin.prototype, "registerEvent");

      const updateEntrySpy = jest.spyOn(ReScroll, "updatePathOfEntry").mockReturnValue();
      const vaultOnSpy = jest.spyOn(plugin.app.vault, "on").mockImplementation((event: any, cb: any) => {
        if (event === "rename") callback = cb;

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

      const deleteEntrySpy = jest.spyOn(ReScroll, "deleteEntry").mockReturnValue();
      const vaultOnSpy = jest.spyOn(plugin.app.vault, "on").mockImplementation((event: any, cb: any) => {
        if (event === "delete") callback = cb;

        // to conform expected type
        return {} as any;
      });
      await plugin.onload();

      expect(registerEvSpy).toHaveBeenCalled();
      expect(vaultOnSpy).toHaveBeenCalledWith("delete", expect.any(Function));

      callback();
      expect(deleteEntrySpy).toHaveBeenCalled();
    });

    it("should register scroll listeners on new leaves on layout change", async () => {
      let callback!: () => void;
      const mockLeaf1 = getMockWorkspaceLeaf("l1");
      const mockLeaf2 = getMockWorkspaceLeaf("l2");
      const mockLeaf3 = getMockWorkspaceLeaf("l3");

      const vaultOnSpy = jest.spyOn(plugin.app.workspace, "on").mockImplementation((event: any, cb: any) => {
        if (event === "layout-change") callback = cb;

        // to conform expected type
        return {} as any;
      });
      jest.spyOn(plugin.app.workspace, 'onLayoutReady').mockImplementation(cb => cb())
      const registerScrollSpy = jest.spyOn(plugin, "registerScrollListener");

      jest
        .spyOn(plugin.app.workspace, "getLeavesOfType")
        .mockReturnValueOnce([mockLeaf1, mockLeaf2]) // for initial processing
        .mockReturnValueOnce([mockLeaf1, mockLeaf2, mockLeaf3]); // for the event

      await plugin.onload();

      expect(registerScrollSpy).toHaveBeenCalledTimes(2);

      callback();
      expect(registerScrollSpy).toHaveBeenCalledTimes(3);
      expect(registerScrollSpy).toHaveBeenLastCalledWith(mockLeaf3);
    });
  });
});
