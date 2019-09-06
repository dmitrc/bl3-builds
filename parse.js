const u = require("./utils.js");
const bl3 = require('./data/bl3-raw.json');

const parseRaw = () => {  
  const treeColors = {
    // Zane - Doubled Agent
    "2319350167" : "orange",
    // Zane - Hitman
    "3497412252" : "blue",
    // Zane - Under Cover
    "3859198443" : "green",
    // Fl4K - Stalker
    "2015308718" : "green",
    // Fl4k - Hunter
    "2554538832" : "orange",
    // Fl4k - Master
    "2759216193" : "blue",
    // Amara - First of the Elements
    "2768336927" : "orange",
    // Amara - Brawl
    "3125379342" : "green",
    // Amara - Mystical Assault
    "678936198" : "blue",
    // Moze - Bottomless Mags
    "1265601393" : "green",
    // Moze - Demolition Woman
    "2329045862" : "blue",
    // Moze - Shield of Retribution
    "502316498" : "green"
  };

  const pretty = [];

  for (const char of Object.keys(bl3)) {
    const raw = bl3[char];
    const character = {
      name: char,
      items: []
    };

    for (const treeHash of Object.keys(raw.Trees)) {
      const tree = raw.Trees[treeHash];
      for (const branchHash of tree.TreeBranchesHashes) {
        const branch = raw.Branches[branchHash];
        for (const tierHash of branch.TiersHashes) {
          const tier = raw.Tiers[tierHash];
          for (const itemHash of tier.ItemsHashes) {
            const item = raw.Items[itemHash];
            const resolvedItem = resolveItem(raw, branch, tier, item, treeColors[branchHash]);
            character.items.push(resolvedItem);
          }
        }
      }
    }

    // Special case: Amara has a default shock elemental augment that doesn't appear in trees ._.
    if (char == "amara") {
      const shockAugment = resolveItem(
        raw, 
        {Hash: 678936198, BranchName: "Mystical Assault"}, 
        {PointsToUnlock: 0}, 
        {ItemHash: 3547096573, ThumbnailHash: 3293267429}, 
        "blue");

      character.items.push(shockAugment)
    }

    pretty.push(character);
  }

  return pretty;
}

const resolveItem = (raw, branch, tier, item, color) => {
  const resolvedItem = {
    hash: item.ItemHash,
    itemHash: item.Hash || null,
    branchHash: branch.Hash || null,
    tierHash: tier.Hash || null,
    points: 0,
    maxPoints: item.MaxPoints || 0,
    selected: false,
    branch: branch.BranchName || null,
    color: color,
    tier: tier.PointsToUnlock / 5,
    type: item.DisplayType || null,
    layout: item.LayoutInfo || null,
    flavor: u.cutMeta(item.FlavorText)
  };

  const thumbnail = raw.SkillThumbnails[item.ThumbnailHash];
  if (thumbnail) {
    resolvedItem.thumbnail = `https://borderlands.com/skill-thumbnails/${thumbnail.AssetName}.png`;
  }

  const passive = raw.Passives[item.ItemHash];
  if (passive) {
    resolvedItem.name = passive.AbilityName;
    resolvedItem.desc = u.cutMeta(passive.AbilityDescription);
    resolvedItem.stats = resolveStats(raw, passive.StatDataItems);
  }

  const augment = raw.Augments[item.ItemHash];
  if (augment) {
    resolvedItem.name = augment.DisplayName;
    resolvedItem.desc = u.cutMeta(augment.Description);
    resolvedItem.stats = resolveStats(raw, augment.StatDataItems);
  }

  const actionAbility = raw.ActionAbilities[item.ItemHash];
  if (actionAbility) {
    resolvedItem.name = actionAbility.AbilityName;
    resolvedItem.desc = u.cutMeta(actionAbility.AbilityDescription);
    resolvedItem.stats = resolveStats(raw, actionAbility.StatDataItems);
  }
  
  if (!passive && !augment && !actionAbility) {
    console.log("Unresolved: " + item.ItemHash);
  }

  return resolvedItem;
}

const resolveStats = (raw, statItems) => {
  const stats = [];
  for (const statItem of statItems) {
    const statObj = raw.StatDataItems[statItem.Hash];

    if (statObj) {
      const stat = {
        hash: statItem.Hash,
        name: u.cutMeta(statObj.FormatText),
        base: statObj.BaseValue,
        ranks: statItem.RankValues || [statItem.RankValue],
        isPercent: statObj.DisplayAsPercentage
      };
      stats.push(stat);
    }
    else {
      console.log("Unresolved: " + statItem.Hash);
    }
  }

  return stats;
}

const res = parseRaw();
if (res) {
  console.log("Parsed raw BL3 data into tree templates successfully!");
  u.writeFile("./data/bl3.json", res);
}
else {
  console.error("An error occured while parsing the raw BL3 data.");
}