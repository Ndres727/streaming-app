const token = process.env.RAILWAY_TOKEN;
const projectId = 'f1f98167-2de8-4fde-964a-acdc439e291b';

async function gql(query, vars = {}) {
  const r = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: vars })
  });
  return r.json();
}

async function main() {
  // Create PostgreSQL service
  const pg = await gql('mutation($projectId: String!) { serviceCreate(input: { projectId: $projectId, name: "postgres", source: { image: "postgres:16-alpine" } }) { id name } }', { projectId });
  console.log('PostgreSQL:', JSON.stringify(pg.data?.serviceCreate || pg.errors));
  
  // Create Redis service
  const redis = await gql('mutation($projectId: String!) { serviceCreate(input: { projectId: $projectId, name: "redis", source: { image: "redis:7-alpine" } }) { id name } }', { projectId });
  console.log('Redis:', JSON.stringify(redis.data?.serviceCreate || redis.errors));
  
  // Get environments
  const envData = await gql('query($projectId: String!) { project(id: $projectId) { environments { id name } } }', { projectId });
  console.log('Envs:', JSON.stringify(envData.data?.project?.environments));
}

main().catch(console.error);
