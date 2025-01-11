import { MarkdownView, Plugin } from "obsidian";

// Remember to rename these classes and interfaces!

interface RememberScrollpositionPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: RememberScrollpositionPluginSettings = {
	mySetting: "default", // TODO
};

export default class RememberScrollpositionPlugin extends Plugin {
	settings: RememberScrollpositionPluginSettings;

	async onload() {
		await this.loadSettings();
		let lastPosition = 500;

		// TODO on scroll, save the file path + scroll position with a small delay via this.saveData()

		// TODO fetch the info with either getScroll() or `document.querySelector(".cm-editor.cm-focused .cm-scroller").scrollTop`
		// TODO on exit/close, save the scroll position

		// TODO register event on document.querySelector(".cm-editor.cm-focused .cm-scroller")

		let isScrolling;
		this.registerDomEvent(document, "wheel", (event: any) => {
			console.log("wheel", event);

			// Clear our timeout throughout the scroll
			window.clearTimeout(isScrolling);

			// Set a timeout to run after scrolling ends
			isScrolling = setTimeout(function () {
				// Run the callback
				console.log("Scrolling has stopped.");
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) lastPosition = view.editor.getScrollInfo()?.top ?? 0;
			}, 66);
		});

		// When focusing a leaf, restore its saved scroll position
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				console.log("active leave changed", leaf);
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);

				if (view) {
					const currentScrollPosition =
						view.editor.getScrollInfo()?.top;
					// TODO check if there's a saved scroll position and restore the correct position
					console.log(
						"received view, current scrollposition:",
						view.editor.getScrollInfo()?.top
					);
					// only try to set the scroll position if its on top. If its not, it was already updated before
					if (currentScrollPosition === 0) {
						view.editor.scrollTo(null, lastPosition);
						console.log(
							"updated scrollposition:",
							view.editor.getScrollInfo()?.top
						);
					}
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("rename", (file) => {
				// TODO update path if available in scrollposition data
			})
		);

		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				// TODO remove path if available in scrollposition data
			})
		);

		// TODO add settings: let the user decide to scroll instantly upon opening or by clicking a ribbon icon
		// TODO when scrolling instantly, allow disabling the ribbon icon
		// TODO add a ribbon icon to jump to the scroll position and make it configurable. see example_main
		// TODO be able to exclude or include certain paths for saving only

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

// class SampleSettingTab extends PluginSettingTab {
// 	plugin: MyPlugin;

// 	constructor(app: App, plugin: MyPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const {containerEl} = this;

// 		containerEl.empty();

// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settings.mySetting)
// 				.onChange(async (value) => {
// 					this.plugin.settings.mySetting = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }
