# Voiceflow Crawler | KB Uploader <!-- omit from toc -->

### Forked from https://github.com/BuilderIO/gpt-crawler

Crawl a website URL to extract content, convert it in markdown format, generate files and upload them as text in your Voiceflow knowledge base.

- [Get started](#get-started)
  - [Running locally](#running-locally)
    - [Clone the repository](#clone-the-repository)
    - [Install dependencies](#install-dependencies)
    - [Configure the crawler](#configure-the-crawler)
    - [Run your crawler](#run-your-crawler)
  - [Alternative methods](#alternative-methods)
    - [Running in a container with Docker](#running-in-a-container-with-docker)
    - [Running as a CLI](#running-as-a-cli)
      - [Development](#development)
    - [Running as an API](#running-as-an-api)

## Get started

### Running locally

#### Clone the repository

Be sure you have Node.js >= 16 installed.

```sh
git clone https://github.com/builderio/gpt-crawler
```

#### Install dependencies

```sh
npm i
```

#### Configure the crawler

Open [config.ts](config.ts) and edit the `url` and `selector` properties to match your needs.

E.g. to crawl the Voiceflow Dev docs and upload the docs to your knowledge base you can use:

```ts
export const defaultConfig: Config = {
  url: "https://developer.voiceflow.com/docs/get-started",
  match: "https://developer.voiceflow.com/docs/**",
  selector: '//*[@id="content-container"]/section[1]/div[1]',
  maxPagesToCrawl: 100,
  waitForSelectorTimeout: 10000,
  VFAPIKey: "VF.DM.XYZ",
  projectID: "xyz",
};
```

See [config.ts](src/config.ts) for all available options. Here is a sample of the common configuration options:

```ts
type Config = {
  /** URL to start the crawl, if sitemap is provided then it will be used instead and download all pages in the sitemap */
  url: string;
  /** Pattern to match against for links on a page to subsequently crawl */
  match: string;
  /** Selector to grab the inner text from */
  selector: string;
  /** Don't crawl more than this many pages */
  exclude?: string | string[];
  /** Don't crawl more than this many pages */
  maxPagesToCrawl: number;
  /** Optional resources to exclude
   *
   * @example
   * ['png','jpg','jpeg','gif','svg','css','js','ico','woff','woff2','ttf','eot','otf','mp4','mp3','webm','ogg','wav','flac','aac','zip','tar','gz','rar','7z','exe','dmg','apk','csv','xls','xlsx','doc','docx','pdf','epub','iso','dmg','bin','ppt','pptx','odt','avi','mkv','xml','json','yml','yaml','rss','atom','swf','txt','dart','webp','bmp','tif','psd','ai','indd','eps','ps','zipx','srt','wasm','m4v','m4a','webp','weba','m4b','opus','ogv','ogm','oga','spx','ogx','flv','3gp','3g2','jxr','wdp','jng','hief','avif','apng','avifs','heif','heic','cur','ico','ani','jp2','jpm','jpx','mj2','wmv','wma','aac','tif','tiff','mpg','mpeg','mov','avi','wmv','flv','swf','mkv','m4v','m4p','m4b','m4r','m4a','mp3','wav','wma','ogg','oga','webm','3gp','3g2','flac','spx','amr','mid','midi','mka','dts','ac3','eac3','weba','m3u','m3u8','ts','wpl','pls','vob','ifo','bup','svcd','drc','dsm','dsv','dsa','dss','vivo','ivf','dvd','fli','flc','flic','flic','mng','asf','m2v','asx','ram','ra','rm','rpm','roq','smi','smil','wmf','wmz','wmd','wvx','wmx','movie','wri','ins','isp','acsm','djvu','fb2','xps','oxps','ps','eps','ai','prn','svg','dwg','dxf','ttf','fnt','fon','otf','cab']
   */
  resourceExclusions?: string[];
  /** Optional maximum file size in megabytes to include in the output file */
  maxFileSize?: number;
  /** Optional maximum number tokens to include in the output file */
  maxTokens?: number;
  /** The Voiceflow API key linked to the knowledge base you want to update */
  VFAPIKey?: string[];
  /** Your agent project ID */
  projectID?: string[];
};
```

#### Run your crawler

```sh
npm start
```

### Alternative methods

#### Running in a container with Docker

[README](./containerapp/README.md)

Go into the `containerapp/data` directory and modify the `config.ts` as shown above.

#### Running as a CLI

To run the app as a CLI you will need to do an `npm install` to install the dependencies.

To run the CLI:
`npm run start:cli`

#### Running as an API

To run the app as a API server you will need to do an `npm install` to install the dependencies. The server is written in Express JS.

To run the server:

`npm run start:server` to start the server. The server runs by default on port 3000.

You can use the endpoint `/crawl` with the post request body of config json to run the crawler. The api docs are served on the endpoint `/api-docs` and are served using swagger.

To modify the environment you can copy over the `.env.example` to `.env` and set your values like port, etc. to override the variables for the server.

## Video
Here's a video to show how to use the crawler as a server with an example of a request to the API.

[![Demo Video](https://i9.ytimg.com/vi_webp/0HeSG-KjZrw/mqdefault.webp?v=65b3bd02&sqp=CIz4zq0G&rs=AOn4CLD0RqNAmNdUaQcC4f4k_PgU9cuh1w)](https://youtu.be/0HeSG-KjZrw)
