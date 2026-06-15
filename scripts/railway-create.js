const token = process.env.RAILWAY_TOKEN;

async function graphql(query, vars = {}) {
  const res = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: vars })
  });
  return res.json();
}

async function main() {
  // Get workspace ID
  const meData = await graphql('query { me { id email } }');
  console.log('Me:', JSON.stringify(meData.data?.me));

  // Create project
  const projData = await graphql('mutation { createProject(input: { name: "streaming-app" }) { id name } }');
  if (projData.errors) {
    console.log('Create project ERROR:', JSON.stringify(projData.errors));
    return;
  }
  const projectId = projData.data.createProject.id;
  console.log('Project created:', JSON.stringify(projData.data.createProject));

  // Add PostgreSQL
  const pgData = await graphql('mutation($projectId: String!) { pluginInstanceCreate(input: { projectId: $projectId, plugin: "postgresql" }) { id name } }', { projectId });
  if (pgData.errors) {
    console.log('PostgreSQL ERROR:', JSON.stringify(pgData.errors));
  } else {
    console.log('PostgreSQL added:', JSON.stringify(pgData.data.pluginInstanceCreate));
  }

  // Add Redis
  const redisData = await graphql('mutation($projectId: String!) { pluginInstanceCreate(input: { projectId: $projectId, plugin: "redis" }) { id name } }', { projectId });
  if (redisData.errors) {
    console.log('Redis ERROR:', JSON.stringify(redisData.errors));
  } else {
    console.log('Redis added:', JSON.stringify(redisData.data.pluginInstanceCreate));
  }

  // Get project variables
  const varsData = await graphql('query($projectId: String!) { project(id: $projectId) { id name environments { id name variables { id name value } } } }', { projectId });
  console.log('Project:', JSON.stringify(varsData.data?.project, null, 2));
}

main().catch(console.error);
