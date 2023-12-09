const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const articles = [];

const app = express();

//Newspapers that we will target for getting news
const information = [
  {
    name: "BBC",
    address: "https://www.bbc.com/sport/football",
  },
  {
    name: "Gaurdian",
    address: "https://www.theguardian.com/football",
  },
  {
    name: "SkySports",
    address: "https://www.skysports.com/football",
  },
];

//Parsing websites for getting data
information.forEach((info) => {
  axios.get(info.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("football")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");

      articles.push({
        title,
        //url:information.base+url
        url,
        source: info.name,
      });
    });
  });
});

//Returned array of objects to be accessible by this route
app.get("/news", (req, res) => {
  res.status(200).send(articles);
});

//For getting results for specific newspaper
app.get("/news/:informationId", (req, res) => {
  const informationId = req.params.informationId;

  const informationAddress = information.filter(
    (info) => info.name == informationId
  )[0].address;
  const informationBase = information.filter(
    (info) => info.name == informationId
  )[0].base;

  axios
    .get(informationAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("football")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        specificArticles.push({
          title,
          url: informationBase + url,
          source: informationId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

//Server is listening at port 8080
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Hello from server");
});
