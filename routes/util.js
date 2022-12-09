const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const sts = require("qcloud-cos-sts");
const { config, policy } = require("../util/stsConfig");
const { tokenVerification } = require("../util/tokenVerification");
router.post("/upload-img", function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "public/image";
  form.parse(req, function (err, fields, files) {
    var extname = files.myFileName.originalFilename;
    var oldpath = files.myFileName.filepath;
    var newpath = "public/image/" + extname;
    try {
      fs.rename(oldpath, newpath, function (err) {
        if (err) {
          res.json({ errno: 1, data: [] });
        }
        var mypath = newpath.replace("public", "http://localhost:3000");
        res.send({
          errno: 0,
          data: {
            url: mypath,
          },
        });
      });
    } catch (ex) {
      res.send({
        errno: 1,
        message: "失败信息",
      });
    }
  });
});
router.get("/cosConfig", (req, res, next) => {
  tokenVerification(req, res, (username) => {
    sts.getCredential(
      {
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        durationSeconds: config.durationSeconds,
        policy: policy,
      },
      (err, data) => {
        if (err) throw err;
        res.send({
          code: 20000,
          data,
        });
      }
    );
  });
});
module.exports = router;
