const generateTemplate = (reason: string = "We're currently performing scheduled maintenance")=> (`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Maintenance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .maintenance-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 600px;
      width: 90%;
    }
    h1 { color: #2d3748; font-size: 2rem; margin-bottom: 1rem; }
    p { color: #4a5568; line-height: 1.6; margin-bottom: 1.5rem; }
    .icon { font-size: 4rem; margin-bottom: 1rem; color: #4a5568; }
    @media (max-width: 480px) {
      .maintenance-container { padding: 1.5rem; }
      h1 { font-size: 1.5rem; }
      .icon { font-size: 3rem; }
    }
  </style>
</head>
<body>
  <div class="maintenance-container">
    <div class="icon">🛠️</div>
    <h1>We'll be back soon!</h1>
    <p>${reason}</p>
    <p>Please try again later.</p>
  </div>
</body>
</html>
`)

export default generateTemplate;