### parse.js

#### What does this do?

It takes the raw BL3 tree data dumped from the official builds tool and converts it to more friendly format to work with.

#### Prerequisites

* Node.js
* Raw BL3 tree data at `./data/bl3-raw.json`.

> To obtain this data yourself, navigate to [https://borderlands.com/en-US/data/index.js?v=12](https://borderlands.com/en-US/data/index.js?v=12) and search for "`abilityTreeData`".

### main.js

#### What does this do?

It searches Reddit (_using PushShift API_) for all the comments and posts within 3 major BL subreddits containing links to the character builds, decodes the parameters from the URL and fills out the relevant details within the tree templates.

#### Prerequisites:

* Node.js
* Parsed BL3 tree templates (_see above_) at `./data/bl3.json`.

#### Notes:

* Since verbose builds take quite a bit of space, they are being processed for stats but not included in the final `reddit.json` output.
* You can choose to parse the full build object from the URL during the runtime as needed, or uncomment the relevant line to obtain those.

### utils.js

#### What does this do?

Just a bunch of shared helper functions, really :)