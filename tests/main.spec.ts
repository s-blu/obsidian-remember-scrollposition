import RememberScrollpositionPlugin from "../src/main"
import { getMockApp } from "./mock.utils";

describe("main", () => {
  it('should sucessfully initialize plugin file', () => {
    expect(RememberScrollpositionPlugin).toBeTruthy()
  });

  it('should initialize data.scrollpositions with an empty array', async () => {
    const plugin = new RememberScrollpositionPlugin(getMockApp(), {} as any);
    await plugin.onload()

    expect(plugin.data).toEqual({
      settings: expect.anything(),
      scrollpositions: []
    });
  })
})