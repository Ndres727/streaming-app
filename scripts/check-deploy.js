async function main() {
  const id = process.argv[2];
  const headers = { 'Authorization': 'Bearer ' + process.env.RAILWAY_TOKEN, 'Content-Type': 'application/json' };
  const gql = (q) => fetch('https://backboard.railway.app/graphql/v2', { method: 'POST', headers, body: JSON.stringify({ query: q }) }).then(r => r.json());
  
  // Deployment events
  let r = await gql('{ deploymentEvents(id: "' + id + '") { edges { node { step payload { error } } } } }');
  const edges = r.data?.deploymentEvents?.edges || [];
  console.log('=== DEPLOYMENT EVENTS ===');
  edges.forEach(e => console.log(e.node.step + ': ' + (e.node.payload?.error || 'OK')));
  
  // Build logs (last 30)
  let r2 = await gql('{ buildLogs(deploymentId: "' + id + '") { message } }');
  const logs = r2.data?.buildLogs || [];
  console.log('\n=== BUILD LOGS (last 10) ===');
  logs.slice(-10).forEach(l => console.log(l.message));
  
  // Runtime logs
  let r3 = await gql('{ deploymentLogs(deploymentId: "' + id + '") { message } }');
  console.log('\n=== RUNTIME LOGS ===');
  (r3.data?.deploymentLogs || []).forEach(l => console.log(l.message));
}
main().catch(e => console.log(e.message));
