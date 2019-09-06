
## Features

* Creates a simplified format for the official BL3 build tool data
* Parses complete build JSON representation from on the shared build URL
* Searches Reddit for all the posts and comments containing BL3 character build URLs
* Aggregates and obtains statistics for all of the found builds

## Why did you do this?

A few reasons:

* Official BL3 build tool is unwieldy and requires a lot of interactions to understand the shared character build. Having a basic JSON representation allows to create a simpler interface to browse these (_in my todo_).
* There are many great builds shared by the passionate community on Reddit that get lost in the myriad of posts and comments in the midst of all the pre-release hype.
* Having an aggregated view of all the builds allows to mine cool statistics, for example which tree branches are the most popular or which skills are deemed essential for a given character.

## What are the results?

```
Got 285 raw posts from Reddit.
Got 579 raw comments from Reddit.
Extracted 565 builds (161 from posts, 404 from comments).
---
fl4k: 200 builds
Top branch: Stalker (61% of builds)
---
amara: 128 builds
Top branch: Mystical Assault (35.94% of builds)
---
zane: 117 builds
Top branch: Hitman (47.86% of builds)
---
moze: 120 builds
Top branch: Demolition Woman (89.17% of builds)
---
```

More insights and hopefully a simple web UI incoming as I continue tinkering with this data in my spare time.

## What's in the box?

### parse.js

#### What does this do?

It takes the raw BL3 tree data dumped from the official builds tool and converts it to more friendly format to work with.

#### Prerequisites

* Node.js (_no NPM dependencies_)
* Raw BL3 tree data at `./data/bl3-raw.json`.

> To obtain this data yourself, navigate to [https://borderlands.com/en-US/data/index.js?v=12](https://borderlands.com/en-US/data/index.js?v=12) and search for "`abilityTreeData`".

### main.js

#### What does this do?

It searches Reddit (_using PushShift API_) for all the comments and posts within 3 major BL subreddits containing links to the character builds, decodes the parameters from the URL and fills out the relevant details within the tree templates.

#### Prerequisites:

* Node.js (_no NPM dependencies_)
* Parsed BL3 tree templates (_see above_) at `./data/bl3.json`.

#### Notes:

> Since verbose builds take quite a bit of space, they are being processed for stats but not included in the final `reddit.json` output. You can choose to parse the full build object from the URL during the runtime as needed, or uncomment the relevant line to obtain those.

### utils.js

#### What does this do?

Just a bunch of shared helper functions, really :)

#### Prerequisites:

* Node.js (_no NPM dependencies_)

## Can I contribute?

Sure, just open a pull request and we will take it from there!