const dotenv = require("dotenv").config();
const express = require("express");
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
  const lat = geo.latitude;
  const lon = geo.longitude;

  if (!lat || !lon) {
    return res.status(500).json({ message: "Could not determine location" });
  }

  console.log(process.env.openWeatherAPIKEY);

  const weatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=${process.env.openWeatherAPIKEY}`
  );
  const weather = await weatherResponse.json();
  console.log(weather);
  const temperature = weather?.main?.temp || 27;

  res.status(200).json({
    client_ip: ip,
    location: city,
    message: `Hello ${visitor_name}, the temperature is ${temperature}°C in ${city} today`,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
