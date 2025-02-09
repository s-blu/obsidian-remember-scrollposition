import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
  PluginSpec,
} from '@codemirror/view';
import { Plugin } from "obsidian";

class ExamplePlugin implements PluginValue {
  view;
  callback;
  private scrollingDebounce: NodeJS.Timeout;

  constructor(view: EditorView) {
    // ...
    this.view = view;
  }

  setScrollCallback(cb: any) {
    console.log('asidgw')
    this.callback = cb;
  }

  update(update: ViewUpdate) {
    console.log('update of view plugin called', update)
    // ...
  }

  docViewUpdate(up) {
    console.log('docViewUpdate', up)

    window.clearTimeout(this.scrollingDebounce);
  
    this.scrollingDebounce = setTimeout(() => {
      console.log('hello')
      this.callback && this.callback(this.view)
    }, 350);
  }

  destroy() {
    // ...
  }
}

const pluginSpec: PluginSpec<ExamplePlugin> = {

  
};


export const examplePlugin = ViewPlugin.fromClass(ExamplePlugin, pluginSpec);

export const createExampleViewPlugin = (plugin: Plugin) => 
  ViewPlugin.fromClass(ExamplePlugin, {  });