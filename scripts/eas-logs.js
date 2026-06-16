async function main() {
  const token = process.env.EXPO_TOKEN;
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  const gql = (q) => fetch('https://api.expo.dev/graphql', { method: 'POST', headers, body: JSON.stringify({ query: q }) }).then(r => r.json());
  
  // Get build by ID
  let r = await gql('{ builds { byId(buildId: "bd497eda-08ff-4bc4-a33b-e7137044937a") { id status error { message } } } }');
  if (r.errors) {
    console.log('GraphQL Error:', JSON.stringify(r.errors));
    return;
  }
  console.log(JSON.stringify(r.data?.builds?.byId, null, 2));
  
  // Check Build type for log fields
  let r2 = await gql('{ __type(name: "Build") { fields { name type { name ofType { name } } } } }');
  if (!r2.errors) {
    const logFields = r2.data?.__type?.fields?.filter(f => f.name.includes('og') || f.name.includes('Log'));
    console.log('Build log fields:', logFields?.map(f => f.name + ': ' + (f.type?.name || f.type?.ofType?.name)));
  }
  
  // Get logFiles for the build (just URLs)
  let r3 = await gql('{ builds { byId(buildId: "bd497eda-08ff-4bc4-a33b-e7137044937a") { logFiles } } }');
  if (r3.errors) { console.log('logFiles Error:', JSON.stringify(r3.errors)); }
  else { console.log('logFiles:', r3.data?.builds?.byId?.logFiles?.join(', ')); }
  
  // If we have logFiles, fetch the first one
  const urls = r3.data?.builds?.byId?.logFiles;
  if (urls && urls.length > 0) {
    let logContent = await fetch(urls[0]).then(r => r.text());
    console.log('=== LOG CONTENT (last 50 lines) ===');
    const lines = logContent.split('\n');
    console.log(lines.slice(-50).join('\n'));
  }
}
main().catch(e => console.log(e.message));
