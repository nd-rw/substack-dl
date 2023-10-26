import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";

function makeFileSafeString(inputString: string) {
  // Replace special characters with underscores
  const safeString = inputString.replace(/[!@#$%^&*(),.?":{}|<>]/g, "_");

  // Remove spaces and replace with underscores
  const noSpacesString = safeString.replace(/\s+/g, "_");

  // Remove any other invalid characters
  const fileSafeString = noSpacesString.replace(/[^a-zA-Z0-9_\-]/g, "");

  return fileSafeString;
}

const loginUrl = "https://substack.com/sign-in";

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS!;
const PASSWORD = process.env.PASSWORD!;
const BASE_URL = process.env.BASE_URL!;
const DOWNLOAD_FOLDER = process.env.DOWNLOAD_FOLDER!;

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
  executablePath: "/usr/bin/google-chrome", // Replace "7" with the actual path to Brave
  headless: false, // Set to true for headless mode, false for GUI mode
});

const page = await browser.newPage();
await page.goto(loginUrl, { waitUntil: "networkidle0" });
// Wait for the element to be present in the DOM
await page.waitForSelector("a.login-option.substack-login__login-option");

// Click the element
await page.click("a.login-option.substack-login__login-option");

// Wait for the email input element to be present in the DOM
await page.waitForSelector('input[type="email"][name="email"]');

// Input text into the email input element
await page.type('input[type="email"][name="email"]', EMAIL_ADDRESS);

// Wait for the email input element to be present in the DOM
await page.waitForSelector('input[type="password"][name="password"]');

// Input text into the email input element
await page.type('input[type="password"][name="password"]', PASSWORD);

await page.click('button[type="submit"][class="button primary"]');

await page.waitForSelector('input[type="search"][name="search"]');
console.log("login complete!");

for (let i = 0; i < allPosts.length; i++) {
  console.log(`Processing ${i} of ${allPosts.length}`);
  const currentPost = allPosts[i] as any;

  const url = currentPost.canonical_url;
  console.log("🚀 ~ file: app.js:318 ~ url:", url);

  const fileName = `${currentPost.post_date.slice(0, 10)}_${makeFileSafeString(
    currentPost.title
  )}`;

  const authorFromUrlPattern = /^https?:\/\/(www\.)?([^\.\/]+)\/?/;

  const authorFromUrlUsingRegex = url.match(authorFromUrlPattern);
  console.log(
    "🚀 ~ file: app.js:327 ~ authorFromUrlUsingRegex:",
    authorFromUrlUsingRegex
  );

  const handleFromBylines = currentPost.publishedBylines[0]?.handle;
  console.log("🚀 ~ file: app.js:330 ~ handleFromBylines:", handleFromBylines);

  const folder =
    `${currentPost.publishedBylines[0]?.handle}` ??
    url.match(authorFromUrlPattern)
      ? url.match(authorFromUrlPattern)[2]
      : "unknown";

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  if (!fs.existsSync(`${folder}/${fileName}.pdf`)) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const pdfPath = `${DOWNLOAD_FOLDER}/${folder}/${fileName}.pdf`;

    await page.pdf({
      path: pdfPath,
      format: "a4",
    });
    console.log(`Saved ${url} as ${pdfPath}`);

    // close tab
    await page.close();
  } else {
    console.log(`file already exists: ${folder}/${fileName}.pdf`);
  }
}

await browser.close();

// const b = x.map(obj => { return {'title': `${obj.title} - ${obj.post_date.slice(0,10)}`, 'url': obj.canonical_url}})
