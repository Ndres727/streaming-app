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
  // Get project details including environments
  const proj = await gql('query($id: String!) { project(id: $id) { id name environments { id name } services { id name } } }', { id: projectId });
  console.log('Project:', JSON.stringify(proj.data?.project, null, 2));
  
  const envId = proj.data?.project?.environments?.[0]?.id;
  if (!envId) { console.log('No env found'); return; }
  console.log('Using env:', envId);
}

main().catch(console.error);
