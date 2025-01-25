import { EditorRange } from "obsidian";

export interface ReScrollPluginSettings {
  scrollInstantly: boolean,
  maxAge: number
}

export interface ReScrollPluginItem {
  path: string;
  updated: number;
  editorRange: EditorRange
}

export interface ReScrollPluginData {
  settings: ReScrollPluginSettings;
  scrollpositions: ReScrollPluginItem[];
}