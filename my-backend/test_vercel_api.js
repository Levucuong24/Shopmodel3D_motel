async function run() {
  try {
    console.log("Sending POST to live Vercel API...");
    const response = await fetch("https://www.homie.website/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "quanghuyn267@gmail.com" }),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log("Response Body (first 500 chars):", text.slice(0, 500));
  } catch (error) {
    console.error("Error calling Vercel API:", error);
  }
}
run();
