export default async (req, context) => {
  // This is a simple health check endpoint
  // In production, you'd route to your actual backend
  return new Response(JSON.stringify({ 
    status: 'ok', 
    time: new Date().toISOString() 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
