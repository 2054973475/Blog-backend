const config = {
  secretId: "",
  secretKey: "",
  proxy: "",
  host: "sts.tencentcloudapi.com",
  durationSeconds: 1800,
  bucket: "",
  region: "",
  allowPrefix: "images/*",
  allowActions: [
    // 简单上传
    "name/cos:PutObject",
    "name/cos:PostObject",
    // 分片上传
    "name/cos:InitiateMultipartUpload",
    "name/cos:ListMultipartUploads",
    "name/cos:ListParts",
    "name/cos:UploadPart",
    "name/cos:CompleteMultipartUpload",
    "name/cos:PutObjectCopy",
    "name/cos:DeleteObject"
  ],
};
const shortBucketName = config.bucket.substr(0, config.bucket.lastIndexOf("-"));
const appId = config.bucket.substr(1 + config.bucket.lastIndexOf("-"));
const policy = {
  version: "2.0",
  statement: [
    {
      action: [...config.allowActions],
      effect: "allow",
      principal: { qcs: ["*"] },
      resource: [
        "qcs::cos:" +
          config.region +
          ":uid/" +
          appId +
          ":prefix//" +
          appId +
          "/" +
          shortBucketName +
          "/" +
          config.allowPrefix,
      ],
    },
  ],
};
module.exports = {
  config,
  shortBucketName,
  appId,
  policy,
};
