const fs = require("fs");
const http = require("http");

const cutBefore = (src, cut) => {
  if (!src) {
    return null;
  }

  const i = src.indexOf(cut);

  if (i < 0) {
    return src;
  }

  const fi = i + cut.length;
  return src.substr(fi);
}

const cutAfter = (src, cut) => {
  if (!src) {
    return null;
  }

  const i = src.indexOf(cut);

  if (i < 0) {
    return src;
  }

  return src.substr(0, i);
}

const cutMeta = (src) => {
  if (!src) {
    return null;
  }

  return src
    .replace(/\[\/?[a-zA-Z]*\]/g, "")
    .replace(/<br\/?>/g, "")
    .replace(/\\u003cbr\/?\\u003e/g, "")
    .replace(/{OakPC_ActionSkill}/g, "\"F\"")
    .replace(/{OakPC_Melee}/g, "\"V\"")
    .replace(/{OakPC_Grenade}/g, "\"G\"");
}

const get = (url, fn) => {
  http.get(url, res => {
    let data = "";

    res.on("data", chunk => {
      data += chunk;
    });

    res.on("end", () => {
      const obj = JSON.parse(data);
      fn && fn(obj);
    });
  }).on("error", err => {
    console.log("Error during GET: " + err.message);
    fn && fn(null);
  });
}

const readFile = (file, fn) => {
  fs.readFile(file, (err, data) => {
    if (err) {
      fn && fn(null);
    }
    else {
      const obj = JSON.parse(data);
      fn && fn(obj);
    }
  });
}

const writeFile = (file, obj, fn) => {
  fs.writeFile(file, JSON.stringify(obj), "utf8", (err) => {
    if (err) {
      console.log(`Error writing to ${file}. Message: ${err.message}`);
    }

    fn && fn(err);
  });
}

const findTop = (coll, getProp, getAgg) => {
  const props = {};
  for (const item of coll) {
    const prop = getProp(item);

    props[prop] = props[prop] || 0;
    props[prop] += getAgg(item);
  }

  let topScore = 0;
  let topProp = null;
  for (const prop of Object.keys(props)) {
    const score = props[prop];
    if (score > topScore) {
      topScore = score;
      topProp = prop;
    }
  }

  return [topProp, topScore];
}

const roundToTwo = (num) => {
  return +(Math.round(num + "e+2")  + "e-2");
}

module.exports = {
  cutBefore,
  cutAfter,
  cutMeta,
  get,
  readFile,
  writeFile,
  findTop,
  roundToTwo
};