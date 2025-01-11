import { MarkdownView, Plugin } from "obsidian";

// Remember to rename these classes and interfaces!

interface RememberScrollpositionPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: RememberScrollpositionPluginSettings = {
	mySetting: "default", // TODO
};

interface RememberScrollpositionPluginData {
	settings: RememberScrollpositionPluginSettings;
	scrollpositions: RememberScrollpositionPluginItem[];
}

interface RememberScrollpositionPluginItem {
	path: string;
	scrollposition: number;
	updated: number;
}

export default class RememberScrollpositionPlugin extends Plugin {
	settings: RememberScrollpositionPluginSettings;
	data: RememberScrollpositionPluginData;

	async onload() {
		await this.loadSettings();
		let lastPosition = 500;

		// TODO on scroll, save the file path + scroll position with a small delay via this.saveData()

		// TODO fetch the info with either getScroll() or `document.querySelector(".cm-editor.cm-focused .cm-scroller").scrollTop`
		// TODO on exit/close, save the scroll position

		// TODO register event on document.querySelector(".cm-editor.cm-focused .cm-scroller")

		let scrollingDebounce: NodeJS.Timeout;
		this.registerDomEvent(document, "wheel", (event: any) => {
			// Clear our timeout throughout the scroll
			window.clearTimeout(scrollingDebounce);

			// Set a timeout to run after scrolling ends
			scrollingDebounce = setTimeout(() => {
				// Run the callback
				console.log("Scrolling has stopped.");
				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file) {
					lastPosition = view.editor.getScrollInfo()?.top ?? 0;
					this.saveScrollPosition(view.file.path, lastPosition)
				}
			}, 200); // TODO figure out a good timeout time
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

		// TODO add a menu entry, if possible, to reset/forget the scroll position ? theortically you only need to scroll back up, though

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async saveScrollPosition(filepath: string, scrollposition: number) {
		this.data = (await this.loadData()) ?? {
			scrollpositions: []
		}
		const now = Date.now();
		const existingPos = this.data.scrollpositions.find(p => p.path === filepath);

		if (existingPos) {
			existingPos.scrollposition = scrollposition;
			existingPos.updated = now;
		} else {
			this.data.scrollpositions.push({
				path: filepath,
				scrollposition,
				updated: now
			});
		}

		await this.saveData(this.data);
	}

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
