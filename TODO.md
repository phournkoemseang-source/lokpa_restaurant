# TODO

- [x] Fix/verify why clicking **Asia Foods** / **Europe Foods** shows no content
  - [x] Confirm `activeCuisine` / `activeCategory` filtering logic
  - [x] Check how `menuItems` are built (server vs local) and what `category` / `cuisine` values look like
  - [x] If mismatch exists, normalize `category`/`cuisine` or adjust `categoryCuisine` mapping
  - [x] Refactored `MenuView.vue` to fetch from server and merge with local fallbacks.

- [ ] List foods by categories of foods (Asia/Eurpe + each photo category)
  - [ ] Generate list based on current `categoryOrder` and `categoryCuisine`
  - [ ] If server menu has actual food names, optionally fetch/inspect via code
  - [ ] Implement a "View All" mode in `MenuView.vue` that groups by category.

- [ ] Improve Admin Dashboard
  - [ ] Add menu item reordering persistence (currently only local state)
  - [ ] Add image upload to a real storage or public folder.
