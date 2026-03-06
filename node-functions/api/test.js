export const onRequestGet = async ({ request }) => {
  return new Response(JSON.stringify({ 
    message: 'Node Functions working!',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
