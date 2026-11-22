
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://cat-ellen.github.io",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin"
  };

  // Handle the browser's preliminary CORS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {
    const { url } = JSON.parse(event.body || "{}");

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("Please provide a valid job advertisement URL.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Please provide a valid job advertisement URL.");
    }

    const token = process.env.TINYURL_API_TOKEN;

    if (!token) {
      throw new Error("TinyURL API token is not configured.");
    }

    const response = await fetch(
      "https://api.tinyurl.com/create",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: parsedUrl.href,
          domain: "tinyurl.com"
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.data?.tiny_url) {
      throw new Error(
        result.errors?.[0]?.message ||
        result.message ||
        "TinyURL could not shorten this link."
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        shortUrl: result.data.tiny_url
      })
    };

  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
