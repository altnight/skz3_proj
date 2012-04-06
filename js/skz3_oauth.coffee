class TwitterOAuth

    CONSUMER_KEY = "YOUR KEY"
    CONSUMER_SECRET = "YOUR KEY"

    getRequestToken: ->

        accessor =
          consumerSecret: CONSUMER_SECRET
          tokenSecret: ''

        message =
          method: "GET"
          action: "https://api.twitter.com/oauth/request_token"
          parameters:
            oauth_signature_method: "HMAC-SHA1"
            oauth_consumer_key: CONSUMER_KEY

        OAuth.setTimestampAndNonce(message)
        OAuth.SignatureMethod.sign(message, accessor)
        target = OAuth.addToURL(message.action, message.parameters)

        window.open(target)

    setRequestToken: (tkn) ->
        key = tkn.oauth_token.value
        if key.match(/^oauth_token=([^&]+)&oauth_token_secret=([^&]+)/)
            localStorage.setItem("request_token", RegExp.$1)
            localStorage.setItem("request_token_secret", RegExp.$2)
            tkn.oauth_token.value = RegExp.$1
        else
            alert "なんかコピペみすってない？"
            return false

    setVerifier: (href) ->
        if href.match(/oauth_verifier=([^&]+)/)
            localStorage.setItem("verifier",  RegExp.$1)
            location.href = "./access_token.html"


    getAccessToken: ->
        accessor =
          consumerSecret: CONSUMER_SECRET
          tokenSecret: localStorage.getItem("request_token_secret") # Request Token Secret

        message =
          method: "GET"
          action: "https://api.twitter.com/oauth/access_token"
          parameters:
            oauth_signature_method: "HMAC-SHA1"
            oauth_consumer_key: CONSUMER_KEY
            oauth_token: localStorage.getItem("request_token") # Request Token
            oauth_verifier: localStorage.getItem("verifier")

        OAuth.setTimestampAndNonce(message)
        OAuth.SignatureMethod.sign(message, accessor)
        target = OAuth.addToURL(message.action, message.parameters)

        window.open(target)

    setAccessToken: (form) ->
        key = form.access_token.value
        if (key.match(/^oauth_token=([^&]+)&oauth_token_secret=([^&]+)/))
            localStorage.setItem("access_token", RegExp.$1)
            localStorage.setItem("access_token_secret", RegExp.$2)
            if (key.match(/screen_name=([^&]+)/))
                localStorage.setItem("access_user", RegExp.$1)
        else
            alert "なんかコピペみすってない？"
            return false
