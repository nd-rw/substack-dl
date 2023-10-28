import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";
import {
  authorFromUrlPattern,
  getFileNameFromData,
  getFolderNameFromData,
  loginToSubstack,
  savePageAsPdfForBun,
} from "./utils";

function makeFileSafeString(inputString: string) {
  // Replace special characters with underscores
  const safeString = inputString.replace(/[!@#$%^&*(),.?":{}|<>]/g, "_");

  // Remove spaces and replace with underscores
  const noSpacesString = safeString.replace(/\s+/g, "_");

  // Remove any other invalid characters
  const fileSafeString = noSpacesString.replace(/[^a-zA-Z0-9_\-]/g, "");

  return fileSafeString;
}

const LOGIN_URL = "https://substack.com/sign-in";

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS!;
const PASSWORD = process.env.PASSWORD!;
const BASE_URL = process.env.BASE_URL!;
const DOWNLOAD_FOLDER = process.env.DOWNLOAD_FOLDER!;
const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH!;

async function rebuildAllPosts() {
  const allPosts = [];
  for (let i = 0; i < 500; i++) {
    const offsetVal = i * 50;
    const x = await fetch(
      `${BASE_URL}api/v1/archive?sort=new&search=&limit=50&offset=${offsetVal}`
    );
    const xResp = (await x.json()) as any;
    if (xResp.length === 0) {
      break;
    }
    if (i === 0) {
      console.log("first post: ", xResp[0].post_date);
    }
    console.log(
      "last post: ",
      xResp[xResp.findLastIndex((b: number) => b)].post_date
    );
    allPosts.push(xResp);
  }

  const allPostsFlat = allPosts.flat();

  fs.writeFile("allPosts.json", JSON.stringify(allPostsFlat), function (err) {
    if (err) {
      console.log(err);
    }
  });

  return allPostsFlat;
}

const allPosts = await rebuildAllPosts();

const browser = await puppeteer.launch({
  headless: false,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
  ignoreDefaultArgs: ["--disable-extensions"],
  executablePath: "/usr/bin/google-chrome",
});

await doSubstackStuff();

await browser.close();

async function doSubstackStuff() {
  await loginToSubstack(browser, LOGIN_URL, EMAIL_ADDRESS, PASSWORD);
  for (let i = 0; i < allPosts.length; i++) {
    console.log(`Processing ${i} of ${allPosts.length}`);
    const currentPost = allPosts[i] as any;

    const url = currentPost.canonical_url;
    console.log("starting to parse:", url);

    const fileName = getFileNameFromData(
      currentPost.post_date,
      currentPost.title
    );

    const folder = getFolderNameFromData(
      currentPost?.publishedBylines?.[0]?.handle,
      url
    );

    if (!fs.existsSync(`${DOWNLOAD_FOLDER}/${folder}`)) {
      fs.mkdirSync(`${DOWNLOAD_FOLDER}/${folder}`);
    }

    if (!fs.existsSync(`${folder}/${fileName}.pdf`)) {
      const pdfPath = `${DOWNLOAD_FOLDER}/${folder}/${fileName}.pdf`;
      await savePageAsPdfForBun(browser, url, pdfPath);
    } else {
      console.log(`file already exists: ${folder}/${fileName}.pdf`);
    }
  }
}
