async function main() {
  const projectId = 'f1f98167-2de8-4fde-964a-acdc439e291b';
  const envId = '43e838da-f08c-4f2a-a8bf-1112b6076dbc';
  const serviceId = 'be3987f1-cea2-49d7-a0d1-e2bcde56026a';
  const token = process.env.RAILWAY_TOKEN;
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  const gql = (q) => fetch('https://backboard.railway.app/graphql/v2', { method: 'POST', headers, body: JSON.stringify({ query: q }) }).then(r => r.json());

  // Re-add JWT secrets (lost when service was recreated)
  let r1 = await gql(`mutation { v1: variableUpsert(input: { projectId: "${projectId}", environmentId: "${envId}", serviceId: "${serviceId}", name: "JWT_SECRET", value: "d62e17a5d4a8c3b9f6e0d1c2b4a80987654321fedcba9876543210abcdef012345" }) v2: variableUpsert(input: { projectId: "${projectId}", environmentId: "${envId}", serviceId: "${serviceId}", name: "JWT_REFRESH_SECRET", value: "a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01" }) }`);
  const errs = r1.errors || [];
  errs.forEach(e => console.log('Error:', e.message));
  console.log('JWT_SECRET:', r1.data?.v1 === true ? 'OK' : 'FAIL');
  console.log('JWT_REFRESH_SECRET:', r1.data?.v2 === true ? 'OK' : 'FAIL');

  // Update startCommand with migration before app
  let r2 = await gql(`mutation { s: serviceInstanceUpdate(serviceId: "${serviceId}", environmentId: "${envId}", input: { startCommand: "cd apps/api && ./node_modules/.bin/prisma db push && node dist/main" }) }`);
  console.log('startCommand update:', r2.data?.s ? 'OK' : JSON.stringify(r2.errors));

  // Re-add DATABASE_URL and REDIS_URL references (verify)
  const ref = (svc, varName) => '${{ ' + svc + '.' + varName + ' }}';
  let r3 = await gql(`mutation { v3: variableUpsert(input: { projectId: "${projectId}", environmentId: "${envId}", serviceId: "${serviceId}", name: "DATABASE_URL", value: "${ref('Postgres', 'DATABASE_URL')}" }) v4: variableUpsert(input: { projectId: "${projectId}", environmentId: "${envId}", serviceId: "${serviceId}", name: "REDIS_URL", value: "${ref('Redis', 'REDIS_URL')}" }) }`);
  console.log('DATABASE_URL ref:', r3.data?.v3 === true ? 'OK' : 'FAIL');
  console.log('REDIS_URL ref:', r3.data?.v4 === true ? 'OK' : 'FAIL');

  // Verify all vars
  let r4 = await gql(`{ variablesForServiceDeployment(projectId: "${projectId}", environmentId: "${envId}", serviceId: "${serviceId}") }`);
  const vars = r4.data?.variablesForServiceDeployment || {};
  ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL', 'REDIS_URL'].forEach(k => console.log(k + '=' + (vars[k] ? 'SET' : 'MISSING')));

  // Deploy
  let r5 = await gql(`mutation { d: serviceInstanceDeployV2(environmentId: "${envId}", serviceId: "${serviceId}") }`);
  console.log('Deploy ID:', r5.data?.d);
}
main().catch(e => console.log(e.message));
