import { EditorRange } from "obsidian";

export interface ReScrollPluginSettings {
  scrollInstantly: boolean
}

export interface ReScrollPluginItem {
  path: string;
  updated: number;
  editorRange: EditorRange,
  scrollTop: number
}

export interface ReScrollPluginData {
  settings: ReScrollPluginSettings;
  scrollpositions: ReScrollPluginItem[];
}