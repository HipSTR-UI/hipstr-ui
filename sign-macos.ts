const { signAsync } = require("@electron/osx-sign");
require("dotenv").config();

if (!process.env.APPLE_DEVELOPER_IDENTITY) {
  throw new Error("APPLE_DEVELOPER_IDENTITY is not set in env file");
}

const opts = {
  app: "out/hipstr-ui-darwin-arm64/hipstr-ui.app",
  identity: process.env.APPLE_DEVELOPER_IDENTITY,
};

signAsync(opts)
  .then(function () {
    // Application signed
    console.info("Application signed");
  })
  .catch(function (err: Error) {
    // Handle the error
    console.error(err);
  });
