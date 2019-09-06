const u = require("./utils.js");
const bl3 = require("./data/bl3.json");

const parseURL = (url) => {
  if (!url) {
    return null;
  }

  const character = u.cutAfter(
    u.cutAfter(
      u.cutBefore(url, "characters/"), 
      "#"),
    "?")
    .replace("/", "");

  const serializedData = u.cutBefore(url, "#t=")
    .replace(/%22/g, "")
    .replace(/"/g, "");
  
  let p;
  if (serializedData.indexOf("p__") >= 0) {
    p = u.cutAfter(u.cutBefore(serializedData, "p__"), "__");
  }

  let e;
  if (serializedData.indexOf("e__") >= 0) {
    e = u.cutAfter(u.cutBefore(serializedData, "e__"), "__");
  }
  
  const isError = !p || !e || p.search(/[a-z]/g) >= 0 || e.search(/[a-z]/g) >= 0;
  if (isError) {
    console.log("Issue with deserialization: " + serializedData);
    return null;
  }
  
  const pDict = extractParams(p);
  const eDict = extractParams(e);

  const treeTemplate = bl3.filter(x => x.name == character)[0];
  if (!treeTemplate) {
    console.log("Couldn't find a tree template for the character " + character);
    return null;
  }

  const newTree = { ...treeTemplate };

  for (const pHash of Object.keys(pDict)) {
    const pVal = parseInt(pDict[pHash]);
    const item = findByHash(newTree.items, pHash);

    if (item) {
      item.points = pVal;
      item.selected = true;
    }
    else {
      console.log("Couldn't match item by hash " + pHash);
    }
  }

  for (const slotHash of Object.keys(eDict)) {
    const eHash = eDict[slotHash];
    const item = findByHash(newTree.items, eHash);

    if (item) {
      item.selected = true;
    }
    else {
      console.log("Couldn't match item by hash " + eHash);
    }
  }

  return newTree;
}

const findByHash = (items, hash) => {
  for (const item of items) {
      if (item.hash == hash) {
        return item;
      }
    }
}

const extractParams = (s) => {
  const dict = {};
  const tokens = s.split("_");

  for (const token of tokens) {
    const [key, value] = token.split("-");
    dict[key] = value;
  }

  return dict;
}

const createRedditItem = (c, treeUrl) => {
  const tree = parseURL(treeUrl);
  const item = {
    character: tree.name,
    dominantBranch: dominantBranch(tree),
    url: treeUrl,
    link: c.permalink,
    score: c.score,
    author: c.author,
    subreddit: c.subreddit,

    // Full trees are quite sizeable - avoid writing to JSON and opt to deserialize as needed instead
    // tree: tree
  };

  return item;
}

const getRedditComments = (fn) => {
  const url = "http://api.pushshift.io/reddit/comment/search/?subreddit=borderlands,borderlands3,borderlandsbuilds&q=borderlands.com/en-US/characters&sort=asc&size=10000&after=1564617600";
  const comments = [];

  u.get(url, res => {
    console.log("Got " + res.data.length + " raw comments from Reddit.");

    for (const c of res.data) {
      const treeUrl = extractUrl(c.body);
      if (treeUrl) {
        const item = createRedditItem(c, treeUrl);
        item.type = "comment";
        comments.push(item);
      }
    }

    fn && fn(comments);
  });
}

const getRedditPosts = (fn) => {
  const url = "http://api.pushshift.io/reddit/submission/search/?subreddit=borderlands,borderlands3,borderlandsbuilds&q=borderlands.com/en-US/characters&sort=asc&size=10000&after=1564617600";
  const posts = [];

  u.get(url, res => {
    console.log("Got " + res.data.length + " raw posts from Reddit.");

    for (const c of res.data) {
      const treeUrl = extractUrl(c.selftext);
      if (treeUrl) {
        const item = createRedditItem(c, treeUrl);
        item.type = "post";
        posts.push(item);
      }
    }

    fn && fn(posts);
  });
}

const dominantBranch = (tree) => {
  return u.findTop(tree.items, x => x.branch, x => x.points)[0];
}

const extractUrl = (s) => {
  const linkStart = s.indexOf("(https://borderlands.com/en-US/characters/");

    if (linkStart >= 0) {
      const firstCut = s.substr(linkStart + 1);
      const linkEnd = firstCut.indexOf(")");

      if (linkEnd >= 0) {
        const finalCut = firstCut.substr(0, linkEnd);
        if (finalCut.indexOf("#t=") >= 0 && finalCut.indexOf("p__") >= 0 && finalCut.indexOf("e__") >= 0) {
          // Confirm an actual build tree
          return finalCut;
        }
      }
    }

    return null;
}

const getRedditTrees = (fn) => {
  getRedditPosts(p => {
    getRedditComments(c => {
      const agg = p.concat(c);
      console.log(`Extracted ${agg.length} builds (${p.length} from posts, ${c.length} from comments).`);
  
      fn && fn(agg);
    });
  });
}

const printStats = (res) => {
  console.log("---");
  printCharacterStats(res, "fl4k");
  console.log("---");
  printCharacterStats(res, "amara");
  console.log("---");
  printCharacterStats(res, "zane");
  console.log("---");
  printCharacterStats(res, "moze");
  console.log("---");
}

const printCharacterStats = (res, char) => {
  const builds = res.filter(x => x.character == char);

  const count = builds.length;
  console.log(`${char}: ${count} builds`);

  const [topBranch, topBranchCount] = u.findTop(builds, x => x.dominantBranch, x => 1);
  const topBranchPercent = u.roundToTwo(topBranchCount / count * 100);
  console.log(`Top branch: ${topBranch} (${topBranchPercent}% of builds)`);
}

const processRedditTrees = (fn) => {
  u.readFile("./data/reddit.json", (cached) => {
    if (cached) {
      console.log(`Got ${cached.length} builds from cache.`);
      fn && fn(cached);
    }
    else {
      getRedditTrees((res) => {
        u.writeFile("./data/reddit.json", res);
        fn && fn(res);
      })
    }
  });
}

const testTree = () => {
  const tree = parseURL("https://borderlands.com/en-US/characters/fl4k/#t=%22cb__2015308718___p__2158073648-5_117127705-3_281565876-5_1740990601-3_4171864922-1_2927115417-3_3477499401-2_202840317-3_2675403350-3_696695617-5_2555484897-5_37164101-3_895088904-1_390492389-1_2581189346-1_2694263575-3_3096568734-1___e__1618958551-3114692079_403040056-2701689408_1825536534-2842141809_772024924-1899745313%22");

  if (tree) {
    console.log("Parsed a tree from the test URL successfully!");
    u.writeFile("./data/test.json", tree);
  }
}

// testTree();

processRedditTrees((redditTrees) => {
  printStats(redditTrees);
});