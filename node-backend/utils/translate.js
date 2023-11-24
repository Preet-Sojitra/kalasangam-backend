const axios = require('axios');

async function translate(obj){
    if(obj["en"] && obj.en.length > 0)
        obj["gu"] = await translateEnToGu(obj["en"]);
    else
        obj["en"] = await translateGuToEn(obj["gu"]);
    return obj;
}

//for en to gu translation
async function translateEnToGu(textData){
    let resData = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${process.env.API_KEY}`,  
    { 
        q: textData, target: "gu"
    });  
    
    let textGu = resData.data.data.translations[0].translatedText;  
    return textGu
}

//for gu to en translation
async function translateGuToEn(textData){
    let resData = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${process.env.API_KEY}`,  
    { 
        q: textData, target: "en"
    });  
    
    let textEn = resData.data.data.translations[0].translatedText;  
    return textEn
}

// console.log(translate({
//     "en": "Hello"
// }))

module.exports.translate = translate