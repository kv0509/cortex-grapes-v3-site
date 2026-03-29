# Mistakes

## 2026-03-29 - Removed DOM node but left renderer writing into it

- What happened:
  I removed `#grapes-summary` and `#citrus-summary` from `grapes/dashboard/strategy_os.html`, but `renderGrapesSummary()` and `renderCitrusSummary()` in `grapes/dashboard/strategy_os.js` still called `.innerHTML` on those ids.

- Root cause:
  I changed the page layout first and assumed the old render path was already unused. I did not do a full DOM target sweep after deleting the section.

- Impact:
  The whole page failed with `Strategy OS data load failed: Cannot set properties of null (setting 'innerHTML')`, even though the rest of the dashboard data was valid.

- Correct rule:
  Any time a dashboard section is removed or renamed in HTML, I must immediately grep every renderer and language-binding function for that id/class and either remove the render path or add a null guard.

- Future check:
  Before considering a layout refactor done, run an id-level sweep for deleted targets such as:
  `rg -n "target-id|innerHTML|getElementById\\(" grapes/dashboard/strategy_os.js grapes/dashboard/strategy_os.html`
