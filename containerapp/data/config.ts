import { Config } from "./src/config";

export const defaultConfig: Config = {
  url: "https://developer.voiceflow.com/docs/get-started",
  match: "https://developer.voiceflow.com/docs/**",
  selector: '//*[@id="content-container"]/section[1]/div[1]',
  exclude: [],
  maxPagesToCrawl: 50,
  waitForSelectorTimeout: 4000,
  VFAPIKey: "VF.DM.XX",
  projectID: "XXX",
};
