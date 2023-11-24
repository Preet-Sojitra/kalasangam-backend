const {s3Client} = require('../utils/s3Client')
const {PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('fs')

exports.uploadImages = async(res,images) => {
    try {
        let urlArr=[]
            if(Array.isArray(images)){
                for(let index in images){
                    console.log(images[index].name);
                    let image = images[index]
                    let name = image.name
                    name = name.replaceAll(/\s/g,'')
                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: name,
                        Body: fs.createReadStream(image.tempFilePath),
                        ACL:'public-read',
                        ContentDisposition: "inline",
                        ContentType: image.mimetype
                    }

                    const command = new PutObjectCommand(params)

                    await s3Client.send(command)

                    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${name}`

                    urlArr.push({"key":name, "url": url})
                }
                return urlArr;
            }else if(!Array.isArray(images)){
                // console.log(images);
                let name = images.name
                name = name.replaceAll(/\s/g,'')
                // console.log(name);
                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: name,
                        Body: fs.createReadStream(images.tempFilePath),
                        ACL:'public-read',
                        ContentDisposition: "inline",
                        ContentType: images.mimetype
                    }
                    const command = new PutObjectCommand(params)
                    await s3Client.send(command)
                    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${name}` 
                    urlArr.push({key:name, url: url})
                    return urlArr;
            }
    } catch (error) {
        return res.status(500).json(error)
    }
}