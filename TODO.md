# TODO

- [ ] Fix/verify why clicking **Asia Foods** / **Europe Foods** shows no content
  - [ ] Confirm `activeCuisine` / `activeCategory` filtering logic
  - [ ] Check how `menuItems` are built (server vs local) and what `category` / `cuisine` values look like
  - [ ] If mismatch exists, normalize `category`/`cuisine` or adjust `categoryCuisine` mapping

- [ ] List foods by categories of foods (Asia/Eurpe + each photo category)
  - [ ] Generate list based on current `categoryOrder` and `categoryCuisine`
  - [ ] If server menu has actual food names, optionally fetch/inspect via code

