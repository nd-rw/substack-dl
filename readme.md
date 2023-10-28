# substack-dl

# ?
simple program that uses puppeteer and basic API calls, to save all posts from a substack author to .pdf files.

## install/use

1. ensure you have [bun](https://bun.sh/) installed (you can install it by running the following in your terminal `curl -fsSL https://bun.sh/install | bash`)
2. `bun install` (to install dependencies)
3. duplicate the `.env.example` file and create a file named `.env` in the root of the repo and set values for the following variables:

- `EMAIL_ADDRESS` - your email address for your substack account
- `PASSWORD` - your password for your substack account
- `BASE_URL` - the base url for the substack that you want to download all the posts of
- `DOWNLOAD_FOLDER` - the path from this repo that leads to the folder that you want to save the posts in, each author will have its own sub-folder.

4. run the script: `bun app.ts`
