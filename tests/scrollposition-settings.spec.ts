import RememberScrollpositionPlugin from "../src/main";
import { RescrollSettingTab } from "../src/scrollposition-settings";
import { getMockApp } from "./mock.utils";
import { App, Setting, TextComponent, ToggleComponent } from "obsidian";
import translations from "../src/translations.json";

describe("RememberScrollposition Settings", () => {
  let app: App;
  let plugin: RememberScrollpositionPlugin;
  let nameSpy: jest.SpyInstance;
  let descSpy: jest.SpyInstance;

  beforeEach(async () => {
    app = getMockApp();
    plugin = new RememberScrollpositionPlugin(app, {} as any);
    await plugin.onload();

    jest.resetAllMocks();
    nameSpy = jest.spyOn(Setting.prototype, "setName").mockReturnThis();
    descSpy = jest.spyOn(Setting.prototype, "setDesc").mockReturnThis();
  });

  it("should provide a toggle to change scrollInstantly setting", () => {
    const toggleSpy = jest.spyOn(Setting.prototype, "addToggle");

    new RescrollSettingTab(app, plugin).display();

    expect(nameSpy).toHaveBeenCalledWith(translations.settings.scrollInstantly.name);
    expect(descSpy).toHaveBeenCalledWith(translations.settings.scrollInstantly.description);
    expect(toggleSpy).toHaveBeenCalled();
  });

  it("should save scrollInstantly on change", () => {
    let toggleCallback!: (val: boolean) => void;
    const toggle: ToggleComponent = {
      setValue: jest.fn().mockReturnThis(),
      onChange: (callback: (value: boolean) => any) => {
        toggleCallback = callback;
        return toggle;
      },
    } as unknown as ToggleComponent;
    jest.spyOn(Setting.prototype, "addToggle").mockImplementation((cb) => cb(toggle));
    const saveDataSpy = jest.spyOn(plugin, "saveData");

    new RescrollSettingTab(app, plugin).display();

    toggleCallback(false);

    expect(saveDataSpy).toHaveBeenCalledWith({
      scrollpositions: expect.anything(),
      settings: { maxAge: expect.anything(), scrollInstantly: false },
    });
  });

  it("should provide a text input to change max age", () => {
    const textSpy = jest.spyOn(Setting.prototype, "addText");

    new RescrollSettingTab(app, plugin).display();

    expect(nameSpy).toHaveBeenCalledWith(translations.settings.maxAge.name);
    expect(descSpy).toHaveBeenCalledWith(translations.settings.maxAge.description);
    expect(textSpy).toHaveBeenCalled();
  });

  it("should save new max age as number on change", () => {
    let callback!: (val: string) => void;
    const text: TextComponent = {
      setValue: jest.fn().mockReturnThis(),
      onChange: (cb: (value: string) => any) => {
        callback = cb;
        return text;
      },
    } as unknown as TextComponent;
    jest.spyOn(Setting.prototype, "addText").mockImplementation((cb) => cb(text));
    const saveDataSpy = jest.spyOn(plugin, "saveData");

    new RescrollSettingTab(app, plugin).display();

    callback("333");

    expect(saveDataSpy).toHaveBeenCalledWith({
      scrollpositions: expect.anything(),
      settings: { maxAge: 333, scrollInstantly: expect.anything() },
    });
  });

  it("should not save invalid inputs to max age input", () => {
    let callback!: (val: string) => void;
    const text: TextComponent = {
      setValue: jest.fn().mockReturnThis(),
      onChange: (cb: (value: string) => any) => {
        callback = cb;
        return text;
      },
    } as unknown as TextComponent;
    jest.spyOn(Setting.prototype, "addText").mockImplementation((cb) => cb(text));
    const saveDataSpy = jest.spyOn(plugin, "saveData");

    new RescrollSettingTab(app, plugin).display();

    callback("asd");

    expect(saveDataSpy).not.toHaveBeenCalled();
  });
});
