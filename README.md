# jira-helper - A set of helpers for common Jira tasks

## Requirements

* node >=8.6

## Commands

### Project Versions

> All commands run with against all projects by default. Use `--projects` option to supply a list of project keys.

Inspect all available commands:

    node version -h

#### Add

Creates version for all or selected Jira projects

    node version add -h
    node version add <version> [options]

#### Edit

Synchronizes versions across all or selected Jira projects

    node version edit -h
    node version edit <version> [options]

#### Clean

Removes unused versions from all or selected Jira projects

    node version clean -h
    node version clean <version> [options]

## License

MIT
