import { SelectionRange } from "@codemirror/state";
import { EditorRange } from "obsidian";

export interface RememberScrollpositionPluginSettings {
  mySetting: string; // TODO
}

export interface RememberScrollpositionPluginItem {
  path: string;
  scrollposition: number;
  updated: number;
  range: EditorRange
}

export interface RememberScrollpositionPluginData {
  settings: RememberScrollpositionPluginSettings;
  scrollpositions: RememberScrollpositionPluginItem[];
}