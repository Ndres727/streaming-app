async function main() {
  const [projectId, envId, serviceId, token] = [
    'f1f98167-2de8-4fde-964a-acdc439e291b',
    '43e838da-f08c-4f2a-a8bf-1112b6076dbc',
    'be3987f1-cea2-49d7-a0d1-e2bcde56026a',
    process.env.RAILWAY_TOKEN
  ];
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  const gql = (q) => fetch('https://backboard.railway.app/graphql/v2', { method: 'POST', headers, body: JSON.stringify({ query: q }) }).then(r => r.json());
  const ref = (svc, varName) => '${{ ' + svc + '.' + varName + ' }}';
  const baseInput = `projectId: \"${projectId}\", environmentId: \"${envId}\", serviceId: \"${serviceId}\"`;
  let r1 = await gql(`mutation { v: variableUpsert(input: { ${baseInput}, name: \"DATABASE_URL\", value: \"${ref('Postgres', 'DATABASE_URL')}\" }) }`);
  console.log('DATABASE_URL:', r1.data?.v === true ? 'OK' : (r1.errors ? JSON.stringify(r1.errors) : 'FAIL'));
  let r2 = await gql(`mutation { v: variableUpsert(input: { ${baseInput}, name: \"REDIS_URL\", value: \"${ref('Redis', 'REDIS_URL')}\" }) }`);
  console.log('REDIS_URL:', r2.data?.v === true ? 'OK' : (r2.errors ? JSON.stringify(r2.errors) : 'FAIL'));
  // verify
  let r3 = await gql(`{ variables(projectId: \"${projectId}\", environmentId: \"${envId}\", serviceId: \"${serviceId}\") { edges { node { id name value } } } }`);
  const vars = r3.data?.variables?.edges || [];
  vars.forEach(e => console.log('  ' + e.node.name + ' = ' + e.node.value));
}
main().catch(e => console.log(e.message));
