# anilist-readme-action

GitHub Action that updates your profile README with your AniList stats, currently watching/reading, and recent completions.

## Setup

1. Add markers to your profile `README.md` where you want the AniList section:

```md
<!-- anilist:start -->
<!-- anilist:end -->
```

2. Create a workflow file (e.g. `.github/workflows/anilist.yml`):

```yml
name: Update AniList README
on:
  schedule:
    - cron: '0 */6 * * *'  # every 6 hours
  workflow_dispatch:        # manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
      - uses: gavxm/anilist-readme-action@v1
        with:
          anilist_username: 'YOUR_ANILIST_USERNAME'
      - uses: stefanzweifel/git-auto-commit-action@b863ae1933cb653a53c021fe36dbb774e1fb9403 # v5
        with:
          commit_message: 'chore: update AniList stats'
```

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `anilist_username` | Yes | - | Your AniList username |
| `readme_path` | No | `README.md` | Path to the README to update |
| `display_style` | No | `full` | `compact` (bullet list) or `full` (table with cover images) |
| `max_items` | No | `5` | Max items per section |

## License

MIT
