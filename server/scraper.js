const cheerio = require("cheerio");
const axios = require("axios");

const siteUrl = "https://www.promet.si/portal/sl/stevci-prometa.aspx";

let siteName = "";
const locations = new Set();
const roads = new Set();
const directions = new Set();
const num_vehicles = new Set();
const speed = new Set();
const conditions = new Set();

const fetchData = async () => {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};

const getResults = async () => {
  const $ = await fetchData();

  siteName = $('.top > .headertitle').text();

  $("table td:nth-child(2)").each((index, element) => {
    locations.add($(element).text());
  });
  $("table td:nth-child(3)").each((index, element) => {
    roads.add($(element).text());
  });
  $("table td:nth-child(4)").each((index, element) => {
    directions.add($(element).text());
  });
  $("table td:nth-child(6)").each((index, element) => {
    num_vehicles.add($(element).text());
  });
  $("table td:nth-child(7)").each((index, element) => {
    speed.add($(element).text());
  });
  $('table td:nth-child(9)').each((index, element) => {
    conditions.add($(element).text());
  });
  return {
    conditions: [...conditions].sort(),
    speed: [...speed].sort(),
    num_vehicles: [...num_vehicles].sort(),
    directions: [...directions].sort(),
    roads: [...roads].sort(),
    locations: [...locations].sort(),
    siteName,
  };
};

module.exports = getResults;