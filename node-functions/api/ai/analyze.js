export const onRequestGet = async (context) => {
  const { request } = context;
  return new Response(JSON.stringify({ 
    message: 'Node Functions GET working!',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost = async (context) => {
  const { request } = context;
  
  try {
    const body = await request.json();
    return new Response(JSON.stringify({ 
      received: true,
      body: body,
      message: 'POST working!'
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
