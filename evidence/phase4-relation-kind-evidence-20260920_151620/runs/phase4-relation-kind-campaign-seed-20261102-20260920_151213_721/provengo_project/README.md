# provengo_project

---
2026-09-20 15:12:14
USER

Provengo project for spec-ing and testing my system.


## Important Files

* README.md This file.
* [config](config) Configuration files and administrative data.
    * [provengo.yml](config/provengo.yml) Main Configuration file
    * [hooks](config/hooks) Hook scripts (pre/post/...)
* [spec](spec) The code creating the specification space lives here. Organized by language.
    * [js](spec/js) JavaScript files
      * [hello-world.js](spec/js/hello-world.js) Initial model file.
* [meta-spec](meta-spec) Code for working with the specification space
    * [ensemble-code.js](meta-spec/ensemble-code.js) Sample code for generating test optimized test suites (ensembles)
    * [book-writer.js](meta-spec/book-writer.js) Sample code for generating test books
    * [script-writer.js](meta-spec/script-writer.js) Code for generating test scripts.
* [lib](lib) Place to store JavaScript libraries. Loaded first.
* [data](data) Place to store data files. Loaded second (so you can use library code to in your data).
    * [data.js](data/data.js) Sample data file.
* [products](products) Artifacts generated from the spec (such as run logs, scripts, and test-books) will be stored here. Much like `build` directories in other platforms, this directory can be ignored by version control systems (e.g. `git`).


## Useful Commands

⚠️ NOTE: In the below listings, we assume that `provengo` is in the system's PATH variable, and that `D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project` is the path to this directory.

For full documentation go to [https://docs.provengo.tech](docs.provengo.tech).

### Randomized Run 

Perform a single run through the specification. Good for "Sanity checks", i.e. to see examples of what can happen.

    provengo run --dry D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project


### Visualize the Spec

Draw the specification in a PDF file.

    provengo analyze -f pdf D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project


⚠️ NOTE: This requires [Graphviz](http://graphviz.org) to be installed.


### Sample Runs from the Spec

Sample 10 scenarios into a file. The scenarios are stored in a file called `samples.json` (this can be changed using the `-o`/`--output-file` switch).

    provengo sample --overwrite --size 10 D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project


### Create an Optimized Test Suite

Generate a test suite of 5 tests that provides a good coverage of items in the [GOALS](z-ranking.js#L18) array.

**Requires running `sample` first** (the previous command)**.**

    provengo ensemble --size 5 D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project

#### Visualize the Spec and the Suite

Draw the specification, and highlight the traces in the optimized test suite create by the previous command.

    provengo analyze -f pdf --highlight ensemble.json D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project

### Create Test Scripts for Third Party Systems

Converts the runs in `ensemble.json` to automation test scripts.

    provengo gen-scripts -s ensemble.json D:\Yeshayahu\Temp\vikunja_tse_study\runs\phase4-relation-kind-campaign-seed-20261102-20260920_151213_721\provengo_project

 
## Git MCP Support
To use this, Open your GitHub copilot on `Agent` mode and run the TechDemos MCP server. 
In the command palette type `MCP: list servers` and then choose `TechDemos`, then click run. 
GitMCP support Works with all popular MCP-compatible AI tools, including: `Claude` · `Cursor` · `Windsurf` · `Cline` · `Highlight AI` · `Augment Code`
Check https://gitmcp.io/Provengo/TechDemos for configurations. 
