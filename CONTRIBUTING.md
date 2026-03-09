# Contributing

Thanks for your interest in contributing to anilist-readme-action!

## Getting started

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Make your changes in `src/`
4. Run checks: `npm run typecheck && npm test`
5. Rebuild the bundle: `npm run build`
6. Commit both `src/` changes and updated `dist/index.js`

## Development

```sh
npm run typecheck   # type-check without emitting
npm test            # run unit tests
npm run build       # bundle with ncc into dist/
```

The `dist/index.js` bundle must be committed because GitHub Actions runs it directly. The CI workflow will fail if `dist/` is out of date.

## Pull requests

- Keep changes focused -- one feature or fix per PR
- Add tests for new functionality
- Make sure CI passes before requesting review

## Reporting issues

Open a GitHub issue with:

- What you expected to happen
- What actually happened
- Your workflow YAML
