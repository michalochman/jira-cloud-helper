const JiraClient = require("jira-connector");

async function getProjects(argv, jira) {
  const projects = await jira.project.getAllProjects();

  if (!argv.projects) {
    return projects;
  }

  return projects.filter(project => argv.projects.indexOf(project.key) !== -1);
}

async function getVersion(argv, jira, project) {
  const versions = await jira.project.getVersions({
    projectIdOrKey: project.key
  });
  return versions.find(version => version.name === argv.version);
}

async function getTotalIssueCount(argv, jira, version) {
  const relatedIssueCounts = await jira.version.getRelatedIssueCounts({
    versionId: version.id
  });

  return (
    relatedIssueCounts.issuesFixedCount +
    relatedIssueCounts.issuesAffectedCount +
    relatedIssueCounts.issueCountWithCustomFieldsShowingVersion
  );
}

async function main(argv, jira, options) {
  const projects = await getProjects(argv, jira);

  const versions = await Promise.all(
    projects.map(async project => {
      try {
        const version = await getVersion(argv, jira, project);
        if (!version) {
          if (argv.v > 0) {
            console.error(`${argv.version} not found in ${project.key}`);
          }
          return;
        }

        const totalIssueCount = await getTotalIssueCount(argv, jira, version);
        if (totalIssueCount === 0) {
          console.log(`Deleting ${version.name} from ${project.key}`);
          await jira.version.deleteVersion({
            versionId: version.id
          });
          return version;
        }
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
