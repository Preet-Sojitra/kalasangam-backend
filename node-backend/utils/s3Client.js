const {fromEnv} = require('@aws-sdk/credential-providers')
const {S3Client,PutObjectCommand, S3} = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromEnv()
})

module.exports = {s3Client}