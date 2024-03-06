import fs from "fs"
import axios from "axios"

let storedProductDetails = []

const randomIndexGenerator = (max) => {
  return Math.floor(Math.random() * max)
}

async function downloadImages(products) {
  // if directory does not exist, create it
  if (!fs.existsSync("images")) {
    fs.mkdirSync("images")
  }

  for (let i = 0; i < products.length; i++) {
    const imgUrl = products[i].images
    const fileName = products[i].savedImageFile

    try {
      const response = await axios.get(imgUrl, { responseType: "arraybuffer" })
      fs.writeFileSync(`images/${fileName}.jpg`, response.data)
      console.log(`Downloaded ${fileName}`)
    } catch (error) {
      console.log(`Error downloading ${imgUrl}: ${error}`)
    }
  }
}

async function addProducts(artisans, products) {
  for (let i = 0; i < 50; i++) {
    const randomIndex = randomIndexGenerator(artisans.length)
    const randomArtisan = artisans[randomIndex]

    try {
      const res = await axios.post("http://localhost:3000/api/v2/auth/login", {
        mobile: randomArtisan.mobile,
        password: randomArtisan.password,
      })
      const accessToken = res.data.accessToken
      console.log(`Logged in artisan ${randomArtisan.mobile} and got the token`)

      // add time sleep to avoid rate limit
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const productRandomIndex = randomIndexGenerator(products.length)
      const randomProduct = products[productRandomIndex]
      // const randomProduct = products[0]

      const image = await fs.openAsBlob(
        `images/${randomProduct.savedImageFile}.jpg`
      )
      const formData = new FormData()
      formData.append("name", randomProduct.name)
      formData.append("price", randomProduct.price)
      formData.append("description", randomProduct.description)
      formData.append("images", image, `${randomProduct.savedImageFile}.jpg`)
      formData.append("category", randomProduct.category)
      formData.append("quantity", randomProduct.availableQuantity)

      const productRes = await axios.post(
        "http://localhost:3000/api/v2/artisan/product/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      // console.log(productRes.data)
      storedProductDetails.push({
        id: productRes.data.productId,
        price: productRes.data.price,
        totalQuantity: productRes.data.quantity,
      })

      console.log(
        `Added product ${randomProduct.name} to artisan ${randomArtisan.name}`
      )
    } catch (error) {
      console.log(`Error adding product to artisan: ${error}`)
    }
  }
}

;(async () => {
  try {
    const artisans = JSON.parse(fs.readFileSync("data/artisans.json", "utf-8"))
    const products = JSON.parse(
      fs.readFileSync("toseed/products.json", "utf-8")
    )

    if (products && products.length > 0) {
      await downloadImages(products)
      await addProducts(artisans, products)
      console.log("All products added")

      fs.writeFileSync(
        "data/products.json",
        JSON.stringify(storedProductDetails, null, 2)
      )
    } else {
      console.log("No products found.")
    }
  } catch (error) {
    console.log("An error occurred:", error)
  }
})()
