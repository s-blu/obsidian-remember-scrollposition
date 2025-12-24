# Remember Scrollposition
This is a community plugin for Obsidian (https://obsidian.md).

Upon opening a note in Obsidian, your scroll position is set to the top of the document. For long notes that you wish to keep continue reading, this can be suboptimal.

Remember Scrollposition saves your scroll positions in a note and restores it as soon as you open the note again to return you where you left off. Optionally, you can configure to not restore your position automatically but only on usage of the ribbon icon or command. 

## Limitations

This is a very basic plugin, mainly supporting my personal flow of work. Following limitations are in place:

- Does not work for notes in read view (Live Preview and Source works)
- The scroll position save is an estimation, not a perfect match
- This plugin is untested for mobile devices and will probably not work.

## Installing the Plugin

Search for "Remember Scrollposition" in the Obsidian Community Plugins.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` from [releases](https://github.com/s-blu/obsidian-remember-scrollposition/releases) to your vault `VaultFolder/.obsidian/plugins/remember-scrollposition/`.

## Releasing new releases

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

## Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## API Documentation

See https://github.com/obsidianmd/obsidian-api
