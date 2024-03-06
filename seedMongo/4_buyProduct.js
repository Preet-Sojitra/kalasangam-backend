import fs from "fs"
import axios from "axios"
import process from "process"

const randomIndexGenerator = (max) => {
  return Math.floor(Math.random() * max)
}

// random purchase quantity generator between 1 and totalQuantity
const randomQuantityGenerator = (totalQuantity) => {
  return Math.floor(Math.random() * totalQuantity) + 1
}

const buyProduct = async (products, customers) => {
  for (let i = 0; i < 50; i++) {
    try {
      const randomIndex = randomIndexGenerator(customers.length)
      const randomCustomer = customers[randomIndex]

      const res = await axios.post("http://localhost:3000/api/v2/auth/login", {
        mobile: randomCustomer.mobile,
        password: randomCustomer.password,
      })
      const accessToken = res.data.accessToken
      console.log(
        `Logged in customer ${randomCustomer.mobile} and got the token`
      )

      // add time sleep to avoid rate limit
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const productRandomIndex = randomIndexGenerator(products.length)
      const randomProduct = products[productRandomIndex]

      const quantity = randomQuantityGenerator(3) // random purchase quantity between 1 and 3 , so that product will not be out of stock quickly

      const purchaseRes = await axios.post(
        "http://localhost:3000/api/v2/seed/orders",
        {
          product: {
            id: randomProduct.id,
            purchasedQuantity: quantity,
            totalPrice: randomProduct.price * quantity,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      console.log(
        `Purchased ${quantity} of product ${randomProduct.totalQuantity} for ${
          randomProduct.price * quantity
        } from customer ${randomCustomer?.name || randomCustomer?.mobile}`
      )

      //   add time sleep to avoid rate limit
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.log(`Error purchasing product: ${error}`)
      process.exit(1)
    }
  }
}

;(async () => {
  try {
    const products = JSON.parse(fs.readFileSync("data/products.json", "utf-8"))
    const customers = JSON.parse(
      fs.readFileSync("data/customers.json", "utf-8")
    )

    if (products && customers) {
      await buyProduct(products, customers)

      console.log("All products purchased successfully")
    } else {
      console.log("No products or customers found")
    }
  } catch (error) {
    console.log(`Error purchasing product: ${error}`)
  }
})()
