// For more information, see https://crawlee.dev/
import axios from "axios";
import { Log, PlaywrightCrawler, downloadListOfUrls } from "crawlee";
import { Config, configSchema } from "./config.js";
import { Page } from "playwright";
import html2md from "html-to-md";
import FormData from "form-data";

//let pageCounter = 0;
//let crawler: PlaywrightCrawler;

async function executePostRequest(
  filename: string,
  doc: string,
  apiKey: string,
  projectID: string,
  log: Log,
) {
  let form = new FormData();

  form.append("file", doc, { filename: filename });
  form.append("canEdit", "true");

  let request = {
    method: "post",
    url: `https://api.voiceflow.com/v3/projects/${projectID}/knowledge-base/documents/file`,
    headers: {
      accept: "application/json, text/plain, */*",
      "content-type": `multipart/form-data; boundary=${form.getBoundary()}`,
      authorization: apiKey,
      ...form.getHeaders(),
    },
    data: form,
  };

  return axios(request)
    .then(function (response) {
      //console.log(JSON.stringify(response.data))
      log.info(`Uploading ${filename} to KB | ${response.data.status.type}`);
      return;
    })
    .catch(function (error) {
      console.log(error);
      return;
    });
}

export function getPageHtml(page: Page, selector = "body") {
  return page.evaluate((selector) => {
    // Check if the selector is an XPath
    if (selector.startsWith("/")) {
      const elements = document.evaluate(
        selector,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      let result = elements.iterateNext() as HTMLElement | null;
      return result ? result.innerHTML : "";
    } else {
      // Handle as a CSS selector
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.innerHTML || "";
    }
  }, selector);
}

export async function waitForXPath(page: Page, xpath: string, timeout: number) {
  await page.waitForFunction(
    (xpath) => {
      const elements = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      return elements.iterateNext() !== null;
    },
    xpath,
    { timeout },
  );
}

export async function crawl(config: Config) {
  let pageCounter = 0;
  configSchema.parse(config);

  if (process.env.NO_CRAWL !== "true") {
    // PlaywrightCrawler crawls the web using a headless
    // browser controlled by the Playwright library.

    let localCrawler = new PlaywrightCrawler({
      // Use the requestHandler to process each of the crawled pages.
      async requestHandler({ request, page, enqueueLinks, log, pushData }) {
        const title = await page.title();
        pageCounter++;
        log.info(
          `Crawling: Page ${pageCounter} / ${config.maxPagesToCrawl} - URL: ${request.loadedUrl}...`,
        );

        // Use custom handling for XPath selector
        if (config.selector) {
          if (config.selector.startsWith("/")) {
            await waitForXPath(
              page,
              config.selector,
              config.waitForSelectorTimeout ?? 1000,
            );
          } else {
            await page.waitForSelector(config.selector, {
              timeout: config.waitForSelectorTimeout ?? 1000,
            });
          }
        }

        const html = await getPageHtml(page, config.selector);

        // Save results as JSON to ./storage/datasets/default
        let mrkdown = html2md(
          html,
          {
            ignoreTags: [
              "",
              "style",
              "head",
              "!doctype",
              "form",
              "svg",
              "noscript",
              "script",
              "meta",
              "footer",
              "button",
            ],
            skipTags: [
              "div",
              "html",
              "body",
              "nav",
              "section",
              "footer",
              "main",
              "aside",
              "article",
              "header",
              "label",
            ],
            emptyTags: [],
            aliasTags: {
              figure: "p",
              dl: "p",
              dd: "p",
              dt: "p",
              figcaption: "p",
            },
            renderCustomTags: "SKIP",
          },
          true,
        );

        await pushData({ title, url: request.loadedUrl, content: mrkdown });

        if (config.onVisitPage) {
          await config.onVisitPage({ page, pushData });
        }

        await executePostRequest(
          `${title}.txt`,
          mrkdown,
          config.VFAPIKey,
          config.projectID,
          log,
        );

        // Extract links from the current page
        // and add them to the crawling queue.
        await enqueueLinks({
          globs:
            typeof config.match === "string" ? [config.match] : config.match,
          exclude:
            typeof config.exclude === "string"
              ? [config.exclude]
              : config.exclude ?? [],
        });
      },
      // Comment this option to scrape the full website.
      maxRequestsPerCrawl: config.maxPagesToCrawl,
      // Uncomment this option to see the browser window.
      // headless: false,
      preNavigationHooks: [
        // Abort requests for certain resource types
        async ({ request, page, log }) => {
          // If there are no resource exclusions, return
          const RESOURCE_EXCLUSTIONS = config.resourceExclusions ?? [];
          if (RESOURCE_EXCLUSTIONS.length === 0) {
            return;
          }
          if (config.cookie) {
            const cookies = (
              Array.isArray(config.cookie) ? config.cookie : [config.cookie]
            ).map((cookie) => {
              return {
                name: cookie.name,
                value: cookie.value,
                url: request.loadedUrl,
              };
            });
            await page.context().addCookies(cookies);
          }
          await page.route(`**\/*.{${RESOURCE_EXCLUSTIONS.join()}}`, (route) =>
            route.abort("aborted"),
          );
          log.info(
            `Aborting requests for as this is a resource excluded route`,
          );
        },
      ],
    });

    const isUrlASitemap = /sitemap.*\.xml$/.test(config.url);

    if (isUrlASitemap) {
      const listOfUrls = await downloadListOfUrls({ url: config.url });

      // Add the initial URL to the crawling queue.
      await localCrawler.addRequests(listOfUrls);

      // Run the crawler
      await localCrawler.run();
    } else {
      // Add first URL to the queue and start the crawl.
      await localCrawler.run([config.url]);
    }
  }
}

class GPTCrawlerCore {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async crawl() {
    await crawl(this.config);
  }
}

export default GPTCrawlerCore;
