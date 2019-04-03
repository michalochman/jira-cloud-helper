const JiraClient = require("jira-connector");
const semver = require("semver");

async function getProjects(argv, jira) {
  const projects = await jira.project.getAllProjects();

  if (!argv.projects) {
    return projects;
  }

  return projects.filter(project => argv.projects.indexOf(project.key) !== -1);
}

async function getVersions(argv, jira, project, options) {
  let versions = await jira.project.getVersions({
    projectIdOrKey: project.key
  });

  if ("archived" in options) {
    versions = versions.filter(v => v.archived === options.archived);
  }

  if ("released" in options) {
    versions = versions.filter(v => v.released === options.released);
  }

  return versions;
}

const specialVersionsList = ["develop", "rc1"];

function compareVersions(v1, v2) {
  try {
    return semver.rcompare(v1, v2);
  } catch (e) {
    return 1;
  }
}

function sort(a, b) {
  if (a == b) {
    return 0;
  }

  return a > b ? 1 : -1;
}

function sortBy(property) {
  return function(a, b) {
    return sort(a[property], b[property]);
  };
}

async function main(argv, jira, options) {
  const projects = await getProjects(argv, jira);

  const versions = await Promise.all(
    projects.map(async project => {
      try {
        const projectVersions = await getVersions(argv, jira, project, options);

        if (!projectVersions.length) {
          return;
        }

        const specialVersions = projectVersions
          .filter(v => specialVersionsList.indexOf(v.name) !== -1)
          .map(v => v.name);
        const semverVersions = projectVersions
          .filter(v => specialVersionsList.indexOf(v.name) === -1)
          .sort(compareVersions)
          .map(v => v.name);

        return {
          key: project.key,
          versions: specialVersions.concat(semverVersions).join(", ")
        };
      } catch (reason) {
        console.error(reason);
      }
    })
  );

  versions
    .filter(x => x)
    .sort(sortBy("key"))
    .forEach(project => {
      console.log(`Versions in ${project.key}:\n${project.versions}\n`);
    });
}

module.exports = {
  main
};
