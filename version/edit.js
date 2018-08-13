const JiraClient = require("jira-connector");

async function getProjects(argv, jira) {
  const projects = await jira.project.getAllProjects();

  if (!argv.projects) {
    return projects;
  }

  return projects.filter(project => argv.projects.indexOf(project.key) !== -1);
}

async function main(argv, jira, options) {
  if (Object.keys(options).length === 0) {
    console.error("No changes detected");
    return;
  }

  const projects = await getProjects(argv, jira);

  const versions = await Promise.all(
    projects.map(async project => {
      try {
        const versions = await jira.project.getVersions({
          projectIdOrKey: project.key
        });
        const version = versions.find(version => version.name === argv.version);
        if (!version) {
          if (argv.v > 0) {
            console.error(`${argv.version} not found in ${project.key}`);
          }
          return;
        }

        return jira.version.editVersion({
          versionId: version.id,
          version: {
            name: argv.version,
            project: project.key,
            ...options
          }
        });
      } catch (reason) {
        console.error(reason);
      }
    })
  );
  console.log(versions.filter(version => version != null));
}

module.exports = {
  main
};
