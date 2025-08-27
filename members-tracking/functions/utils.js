export const success = (data, status=200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { 
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      } 
    }
  );
}

export const error = (error, status=400) => {
  return new Response(
    JSON.stringify({ error }),
    { 
      status, 
      headers: { 
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      } 
    }
  );
}

// Helper function to parse date string (YYYY-MM-DD)
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00.000Z');
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to format date as YYYY-MM-DD
export const formatDate = (date) => {
  return date.toISOString().slice(0, 10);
};

// Helper function to add days to a date
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
