import { Browser } from "puppeteer";

export async function savePageAsPdfForBun(
  browser: Browser,
  url: string,
  pdfPath: string
) {
  // bun shits itself when it tries to use puppeteer's page.pdf() function
  // so this is a workaround
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const cdp = await page.target().createCDPSession();
    const data = await cdp.send("Page.printToPDF");
    const buffer = Buffer.from(data.data, "base64");
    Bun.write(pdfPath, buffer);
    console.log(`Saved ${pdfPath}`);
    // close tab
    await page.close();
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

export function makeFileSafeString(inputString: string) {
  // Replace special characters with underscores
  const safeString = inputString.replace(/[!@#$%^&*(),.?":{}|<>]/g, "_");

  // Remove spaces and replace with underscores
  const noSpacesString = safeString.replace(/\s+/g, "_");

  // Remove any other invalid characters
  const fileSafeString = noSpacesString.replace(/[^a-zA-Z0-9_\-]/g, "");

  return fileSafeString;
}

export async function saveGoogleAsPdf(browser: Browser) {
  try {
    const page = await browser.newPage();
    await page.goto("https://www.google.com", { waitUntil: "networkidle0" });
    const cdp = await page.target().createCDPSession();
    const data = await cdp.send("Page.printToPDF");
    const buffer = Buffer.from(data.data, "base64");
    const dateTime = new Date().getTime();
    Bun.write(`google_buffer_BUN_${dateTime}.pdf`, buffer);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

export const authorFromUrlPattern = /^https?:\/\/(www\.)?([^\.\/]+)\/?/;

export const getFileNameFromData = (postDate: string, postTitle: string) =>
  `${postDate.slice(0, 10)}_${makeFileSafeString(postTitle)}`;

export const getFolderNameFromData = (handle: string, url: string) =>
  handle ?? url.match(authorFromUrlPattern)?.[2] ?? "unknown";

export async function loginToSubstack(
  browser: Browser,
  loginUrl: string,
  emailAddress: string,
  password: string
) {
  const page = await browser.newPage();
  await page.goto(loginUrl, { waitUntil: "networkidle0" });

  // Wait for the element to be present in the DOM
  await page.waitForSelector("a.login-option.substack-login__login-option");

  // Click the element
  await page.click("a.login-option.substack-login__login-option");

  // Wait for the email input element to be present in the DOM
  await page.waitForSelector('input[type="email"][name="email"]');

  // Input text into the email input element
  await page.type('input[type="email"][name="email"]', emailAddress);

  // Wait for the email input element to be present in the DOM
  await page.waitForSelector('input[type="password"][name="password"]');

  // Input text into the email input element
  await page.type('input[type="password"][name="password"]', password);

  await page.click('button[type="submit"][class="button primary"]');

  await page.waitForSelector('input[type="search"][name="search"]');
  console.log("login complete!");
}
