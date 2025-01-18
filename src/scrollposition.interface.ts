import { SelectionRange } from "@codemirror/state";
import { EditorRange } from "obsidian";

export interface RememberScrollpositionPluginSettings {
  mySetting: string; // TODO
}

export interface RememberScrollpositionPluginItem {
  path: string;
  scrollposition: number;
  updated: number;
  editorRange: EditorRange
  selectionRange: SelectionRange
}

export interface RememberScrollpositionPluginData {
  settings: RememberScrollpositionPluginSettings;
  scrollpositions: RememberScrollpositionPluginItem[];
}