import { config } from "../config.mjs";
import fs from "fs";
import { dbConnection, pool } from "../dbconnection.mjs";
import sharp from "sharp";
import imageSize from "image-size";

export async function imageEnlarger(imageName, size) {
    try {
        const imageDimensions = await imageSize("./public/img/"+ imageName);
        
        const enlargeImageData = await sharp("./public/img/"+imageName).resize({ width: imageDimensions.width * size, height: imageDimensions.height * size }).toBuffer();
        const result = await new Promise(resolve=>{
            fs.writeFile("./public/img/"+size+"x_"+imageName, enlargeImageData, (error)=>{
                if(error) {
                    return resolve(false);
                }
                return resolve(true);
            })
        });
        if(result) {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.log(e.message);
        return false;
    }
}
