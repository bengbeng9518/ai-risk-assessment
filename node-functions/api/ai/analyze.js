export const onRequestPost = async ({ request }) => {
  try {
    const body = await request.json();
    
    return new Response(JSON.stringify({ 
      success: true,
      received: true,
      body: body
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestGet = async ({ request }) => {
  return new Response(JSON.stringify({ 
    message: 'AI analyze endpoint working',
    method: 'GET'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
