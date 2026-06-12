# Contributing

This is the business website of Epildevconnect Ltd. Contributions are welcome but reviewed strictly.

## House style (CI enforced)

- UK English only in all user-facing text, comments and docs (colour, organise, behaviour, licence)
- No em dashes or en dashes anywhere; use a hyphen, comma, or full stop
- No leftover debug `console.log` statements

## Workflow

1. Fork and branch from `main`
2. Make your changes
3. Run `npm run build` and make sure it passes
4. Open a pull request; the template includes the full checklist

CI runs a build check, a language check (UK English, no long dashes) and a Docker build check on every pull request. All three must pass.

## Licence

By contributing you agree your contributions are licensed under the repository licence (MIT License with Additional Terms, see [LICENSE](LICENSE)).
