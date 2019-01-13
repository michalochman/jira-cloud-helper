// See:
// - http://floralvikings.github.io/jira-connector/ProjectClient.html
// - http://floralvikings.github.io/jira-connector/VersionClient.html

const JiraClient = require("jira-connector");
const config = require("../config.json");
const add = require("./add").main;
const clean = require("./clean").main;
const edit = require("./edit").main;
const list = require("./list").main;

// common options
const verbose = { describe: "Show verbose output", type: "count" };
const projects = {
  describe: "A list of Project keys to apply changes to",
  type: "array"
};
const version = { describe: "Jira version", type: "string" };

// version options
const startDate = { describe: "Start date of a Jira version" };
const releaseDate = { describe: "Release date of a Jira version" };
const released = { describe: "Whether the version was released or not" };
const archived = { describe: "Whether the version was archived or not" };
const name = { describe: "Rename Jira version" };

const commonOptions = {
  v: verbose,
  projects
};
const versionOptions = {
  add: { startDate, releaseDate, released, archived },
  clean: {},
  edit: { startDate, releaseDate, released, archived, name },
  list: { released, archived }
};

const argv = require("yargs")
  .version(false)
  .strict()
  .alias("help", "h")
  .command(
    "add <version> [options]",
    "Creates version for all or selected Jira projects",
    yargs => {
      yargs
        .wrap(yargs.terminalWidth())
        .positional("version", version)
        .options({
          ...commonOptions,
          ...versionOptions.add
        })
        .example(
          "$0 1.2.3 --startDate 2018-08-12",
          "Create version 1.2.3 with start date set to 2018-08-12"
        );
    }
  )
  .command(
    "clean <version> [options]",
    "Removes unused versions from all or selected Jira projects",
    yargs => {
      yargs
        .wrap(yargs.terminalWidth())
        .positional("version", version)
        .options({
          ...commonOptions,
          ...versionOptions.clean
        })
        .example(
          "$0 1.2.3",
          "Removes version 1.2.3 if it doesn't have any issues"
        );
    }
  )
  .command(
    "edit <version> [options]",
    "Synchronizes versions across all or selected Jira projects",
    yargs => {
      yargs
        .wrap(yargs.terminalWidth())
        .positional("version", version)
        .options({
          ...commonOptions,
          ...versionOptions.edit
        })
        .example(
          "$0 1.2.3 --startDate 2018-08-12",
          "Set start date of version 1.2.3 to 2018-08-12"
        );
    }
  )
  .command(
    "list [options]",
    "List versions from all or selected Jira projects",
    yargs => {
      yargs
        .wrap(yargs.terminalWidth())
        .options({
          ...commonOptions,
          ...versionOptions.list
        })
        .example("$0 --projects DINO", "List version for project DINO");
    }
  )
  .demandCommand().argv;

var jira = new JiraClient({
  host: config.jira.host,
  ...config.jira.auth
});

const command = argv._[0];

const versionConfig = Object.keys(argv).reduce((acc, k) => {
  if (!Object.keys(versionOptions[command]).includes(k)) return acc;
  return {
    ...acc,
    [k]: argv[k]
  };
}, {});

if (argv.v > 1) {
  console.log(argv);
  console.log(versionConfig);
}

switch (command) {
  case "add":
    return add(argv, jira, versionConfig);
  case "clean":
    return clean(argv, jira, versionConfig);
  case "edit":
    return edit(argv, jira, versionConfig);
  case "list":
    return list(argv, jira, versionConfig);
  default:
    console.error("No valid command selected");
    return;
}
