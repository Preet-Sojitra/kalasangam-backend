import axios from "axios"
import fs from "fs"

const seedArtisan = async () => {
  const artisanData = JSON.parse(fs.readFileSync("data/artisanData.json"))

  for (let index = 0; index < artisanData.length; index++) {
    const data = artisanData[index]
    try {
      await axios.post("http://localhost:3000/api/v2/auth/signup", data)
      console.log(`Artisan ${data.name} created`)
    } catch (error) {
      console.log(error)
      break
    }
  }
}

seedArtisan()
