const axios = require("axios")

function getTokensFromCode({ code, clientId, clientSecret, redirectUri }) {
  const url = "https://oauth2.googleapis.com/token"
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }

  return axios
    .post(url, new URLSearchParams(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => {
      //   console.log("Data from google accessed by access token")
      //   console.log(res.data)

      return res.data
    })
    .catch((error) => {
      console.log(error)
      throw new Error(error.message)
    })
}

function getGoogleAuthUrl(SERVER_ROOT_URI, redirectURI, GOOGLE_CLIENT_ID, who) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"
  const options = {
    redirect_uri: `${SERVER_ROOT_URI}/${redirectURI}`,
    // redirect_uri: `http://localhost:5173/auth/login`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    // This state is used to pass the optional parameters. This will be returned back to us by Google. So we can use this to pass the who parameter. It is used to identify whether the user is a artisan or a customer.
    state: JSON.stringify({
      who,
    }),
  }

  return `${rootUrl}?${new URLSearchParams(options)}`
}

module.exports = {
  getTokensFromCode,
  getGoogleAuthUrl,
}
