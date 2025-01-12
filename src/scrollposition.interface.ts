export interface RememberScrollpositionPluginSettings {
  mySetting: string; // TODO
}

export interface RememberScrollpositionPluginItem {
  path: string;
  scrollposition: number;
  updated: number;
}

export interface RememberScrollpositionPluginData {
  settings: RememberScrollpositionPluginSettings;
  scrollpositions: RememberScrollpositionPluginItem[];
}