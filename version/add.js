const JiraClient = require("jira-connector");

async function getProjects(argv, jira) {
  const projects = await jira.project.getAllProjects();

  if (!argv.projects) {
    return projects;
  }

  return projects.filter(project => argv.projects.indexOf(project.key) !== -1);
}

async function main(argv, jira, options) {
  const projects = await getProjects(argv, jira);

  const versions = await Promise.all(
    projects.map(async project => {
      try {
        return await jira.version.createVersion({
          version: {
            name: argv.version,
            project: project.key,
            ...options
          }
        });
      } catch (reason) {
        if (argv.v > 0) {
          console.error(reason);
        }
      }
    })
  );
  console.log(versions.filter(version => version != null));
}

module.exports = {
  main
};
