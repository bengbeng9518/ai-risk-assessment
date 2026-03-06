export default function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Node Functions working!',
      method: 'GET'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'POST') {
    return new Response(JSON.stringify({ 
      message: 'Node Functions POST working!',
      method: 'POST'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
