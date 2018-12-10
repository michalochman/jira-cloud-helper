const JiraClient = require("jira-connector");

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

async function main(argv, jira, options) {
  const projects = await getProjects(argv, jira);

  const versions = await Promise.all(
    projects.map(async project => {
      try {
        const versions = await getVersions(argv, jira, project, options);

        if (!versions.length) {
          return;
        }

        console.log(
          `Versions in ${project.key}: ${versions.map(v => v.name).join(", ")}`
        );
      } catch (reason) {
        console.error(reason);
      }
    })
  );
}

module.exports = {
  main
};
