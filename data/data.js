const d3 = require("d3"),
      fs = require("fs");

qbnSuburbs = ["The Ridgeway", "Greenleigh", "Crestwood", "Karabar", "Queanbeyan", "Queanbeyan West", "Queanbeyan East", "Jerrabomberra"];

fs.readFile("./forgotten_suburbs.csv", "utf8", function(error, data) {
  if (error) throw error;
  stats = d3.csvParse(data);
  stats.forEach(function(d) {
    for (i in stats.columns) {
      if (stats.columns[i] !== "suburb" && stats.columns[i] !== "state") {
        d[stats.columns[i]] = +d[stats.columns[i]];
      }
    }
  });

  fs.readFile("ssc.geojson", "utf8", function(error, data) {
    if (error) throw error;
    suburbs = JSON.parse(data)
      .features
      .filter(function(d) {
        return (d.properties.SSC_CODE.slice(0, 1) == "8" && d.properties.SQKM > 0)
          || (d.properties.SSC_CODE.slice(0, 1) == "1" && d.properties.SQKM > 0);
      });

    newSuburbs = {
      type: "FeatureCollection",
      features: []
    };

    stats.forEach(function(d) {
      matches = suburbs
        .filter(function(e) {
          return (d.suburb == e.properties.SSC_NAME) || ((d.suburb + " (" + d.state + ")") == e.properties.SSC_NAME);
        });
      newSuburbs.features
        .push({
          type: "Feature",
          geometry: matches[0].geometry,
          properties: d
        });
    });

    fs.writeFile("forgottenSuburbs.geojson", JSON.stringify(newSuburbs), function(error) {
      console.log("forgottenSuburbs.geojson written");
    });
  });
});
