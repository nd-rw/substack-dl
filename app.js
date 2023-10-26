"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = require("puppeteer");
var fs_1 = require("fs");
function makeFileSafeString(inputString) {
    // Replace special characters with underscores
    var safeString = inputString.replace(/[!@#$%^&*(),.?":{}|<>]/g, "_");
    // Remove spaces and replace with underscores
    var noSpacesString = safeString.replace(/\s+/g, "_");
    // Remove any other invalid characters
    var fileSafeString = noSpacesString.replace(/[^a-zA-Z0-9_\-]/g, "");
    return fileSafeString;
}
var loginUrl = "https://substack.com/sign-in";
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var PASSWORD = process.env.PASSWORD;
var BASE_URL = process.env.BASE_URL;
var DOWNLOAD_FOLDER = process.env.DOWNLOAD_FOLDER;
function rebuildAllPosts() {
    return __awaiter(this, void 0, void 0, function () {
        var allPosts, i, offsetVal, x, xResp, allPostsFlat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allPosts = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 500)) return [3 /*break*/, 5];
                    offsetVal = i * 50;
                    return [4 /*yield*/, fetch("".concat(BASE_URL, "/api/v1/archive?sort=new&search=&limit=50&offset=").concat(offsetVal))];
                case 2:
                    x = _a.sent();
                    return [4 /*yield*/, x.json()];
                case 3:
                    xResp = (_a.sent());
                    if (xResp.length === 0) {
                        return [3 /*break*/, 5];
                    }
                    if (i === 0) {
                        console.log("first post: ", xResp[0].post_date);
                    }
                    console.log("last post: ", xResp[xResp.findLastIndex(function (b) { return b; })].post_date);
                    allPosts.push(xResp);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5:
                    allPostsFlat = allPosts.flat();
                    fs_1.default.writeFile("allPosts.json", JSON.stringify(allPostsFlat), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    return [2 /*return*/, allPostsFlat];
            }
        });
    });
}
var allPosts = await rebuildAllPosts();
var browser = await puppeteer_1.default.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: false, // Set to true for headless mode, false for GUI mode
});
var page = await browser.newPage();
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
for (var i = 0; i < allPosts.length; i++) {
    console.log("Processing ".concat(i, " of ").concat(allPosts.length));
    var currentPost = allPosts[i];
    var url = currentPost.canonical_url;
    console.log("🚀 ~ file: app.js:318 ~ url:", url);
    var fileName = "".concat(currentPost.post_date.slice(0, 10), "_").concat(makeFileSafeString(currentPost.title));
    var authorFromUrlPattern = /^https?:\/\/(www\.)?([^\.\/]+)\/?/;
    var authorFromUrlUsingRegex = url.match(authorFromUrlPattern);
    console.log("🚀 ~ file: app.js:327 ~ authorFromUrlUsingRegex:", authorFromUrlUsingRegex);
    var handleFromBylines = (_a = currentPost.publishedBylines[0]) === null || _a === void 0 ? void 0 : _a.handle;
    console.log("🚀 ~ file: app.js:330 ~ handleFromBylines:", handleFromBylines);
    var folder = ((_c = "".concat((_b = currentPost.publishedBylines[0]) === null || _b === void 0 ? void 0 : _b.handle)) !== null && _c !== void 0 ? _c : url.match(authorFromUrlPattern))
        ? url.match(authorFromUrlPattern)[2]
        : "unknown";
    if (!fs_1.default.existsSync(folder)) {
        fs_1.default.mkdirSync(folder);
    }
    if (!fs_1.default.existsSync("".concat(folder, "/").concat(fileName, ".pdf"))) {
        var page_1 = await browser.newPage();
        await page_1.goto(url, { waitUntil: "networkidle0" });
        var pdfPath = "".concat(DOWNLOAD_FOLDER, "/").concat(folder, "/").concat(fileName, ".pdf");
        await page_1.pdf({
            path: pdfPath,
            format: "a4",
        });
        console.log("Saved ".concat(url, " as ").concat(pdfPath));
        // close tab
        await page_1.close();
    }
    else {
        console.log("file already exists: ".concat(folder, "/").concat(fileName, ".pdf"));
    }
}
await browser.close();
// const b = x.map(obj => { return {'title': `${obj.title} - ${obj.post_date.slice(0,10)}`, 'url': obj.canonical_url}})
