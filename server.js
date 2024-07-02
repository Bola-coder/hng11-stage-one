const express = require("express");
const { fetchWeatherApi } = require("openmeteo");

const app = express();

app.set("trust proxy", true);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/hello", async (req, res) => {
  if (!req.query.visitor_name) {
    return res
      .status(400)
      .json({ message: "Please provide a visitor_name query parameter" });
  }
  const visitor_name = req.query.visitor_name;
  const ip = req.ip.replace("::ffff:", "");
  const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);

  const geo = await response.json();
  console.log(geo);

  const city = geo ? geo.city : "Unknown city";

  // Getting temparature details
  const params = {
    latitude: geo.latitude,
    longitude: geo.longitude,
    hourly: "temperature_2m",
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  console.log(responses[0]);

  res.status(200).json({
    client_ip: ip,
    location: city,
    message: `Hello ${visitor_name}, the temperature is 25°C in ${city} today`,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
