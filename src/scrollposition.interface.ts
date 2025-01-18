import { EditorRange } from "obsidian";

export interface RememberScrollpositionPluginSettings {
  mySetting: string; // TODO
}

export interface RememberScrollpositionPluginItem {
  path: string;
  updated: number;
  editorRange: EditorRange
}

export interface RememberScrollpositionPluginData {
  settings: RememberScrollpositionPluginSettings;
  scrollpositions: RememberScrollpositionPluginItem[];
}