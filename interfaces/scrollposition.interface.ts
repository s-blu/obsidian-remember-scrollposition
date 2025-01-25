import { EditorRange, moment } from "obsidian";

export interface ReScrollPluginSettings {
  scrollInstantly: boolean,
  maxAge: {
    raw: string,
    unit: moment.unitOfTime.DurationConstructor,
    amount: string
  }
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