# substack-dl

# ?
simple program that uses puppeteer and basic API calls, to save all posts from a substack author to .pdf files.

## install/use

1. `npm install` and ensure you have node installed.
2. set values for the following variables in app.js:
- `EMAIL_ADDRESS` - your email address for your substack account
- `PASSWORD` - your password for your substack account
- `BASE_URL` - the base url for the substack that you want to download all the posts of
- `DOWNLOAD_FOLDER` - the path from this repo that leads to the folder that you want to save the posts in, each author will have its own sub-folder.

3. run the script: `node app.js`