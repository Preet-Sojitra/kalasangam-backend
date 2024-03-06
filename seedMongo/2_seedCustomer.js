import axios from "axios"
import fs from "fs"

const seedArtisan = async () => {
  const customerData = JSON.parse(fs.readFileSync("data/customers.json"))

  for (let index = 0; index < customerData.length; index++) {
    const data = customerData[index]

    try {
      await axios.post("http://localhost:3000/api/v2/auth/signup", data)
      console.log(`Customer ${data.name} created`)
    } catch (error) {
      console.log(error)
      break
    }
  }
}

seedArtisan()
