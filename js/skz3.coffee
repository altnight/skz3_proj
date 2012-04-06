class TwitterBase

    CONSUMER_KEY = "YOUR KEY"
    CONSUMER_SECRET = "YOUR KEY"
    @TWITTER_ROOT = "https://twitter.com/#!/"
    @TWITTER_API = "https://api.twitter.com/1/"

    setOAuth: (method, api, params)->
        accessor =
          consumerSecret: CONSUMER_SECRET
          tokenSecret: localStorage.getItem("access_token_secret")

        message =
            method: method
            action: api
            parameters:
              oauth_consumer_key: CONSUMER_KEY
              oauth_token: localStorage.getItem("access_token")
              oauth_signature_method: "HMAC-SHA1"

        for key of params
            message.parameters[key] = params[key]

        OAuth.setTimestampAndNonce(message)
        OAuth.SignatureMethod.sign(message, accessor)
        authed_url= OAuth.addToURL(message.action, message.parameters)
        return authed_url

    loadJSON: (url) ->
        script = $("<script>")
        script.attr('src', url)
        script.attr('type', "application/javascript")
        script.attr('charset', "UTF-8")
        $(document.body).append(script)

    postIframe: (url) ->
       form = $("<form/>")
       form.attr('method', "POST")
       form.attr('target', "dummy")
       form.attr('action', url)
       $("[name='dummy']").append(form)
       form.submit()

    postAjax: (url) ->
        $.ajax
            type: "POST"
            url: url
            success: (arg)->
                console.log arg
            error: (XMLHttpRequest, textStatus, errorThrown) ->
                console.log errorThrown


class API extends TwitterBase

    getStatus: (id) ->
        params =
            callback: "callback_get_status"
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}statuses/show/#{id}.json", params)
        TwitterBase::loadJSON(url)

    destroyStatus: (id) ->
        params = id
        url = TwitterBase::setOAuth("POST", "#{TwitterBase.TWITTER_API}statuses/destroy/#{id}.xml", params)
        if window.opera
            TwitterBase::postIframe(url)
        else
            TwitterBase::postAjax(url)

    updateStatus: (text, in_reply_to_status_id)->
        params =
            status: text
            in_reply_to_status_id: in_reply_to_status_id
        url = TwitterBase::setOAuth("POST", "#{TwitterBase.TWITTER_API}statuses/update.xml", params)
        if window.opera
            TwitterBase::postIframe(url)
        else
            TwitterBase::postAjax(url)

    getHomeTimeline: ->
        params =
            include_entities: "True"
            callback: "callback"
            count: "50"
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}statuses/home_timeline.json", params)
        TwitterBase::loadJSON(url)

    #getUserTimeline: (screen_name) ->
        #params =
            #include_entities: "True"
            #callback: "callback"
            #screen_name: screen_name
            #count: "50"
        #url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}statuses/user_timeline.json", params)
        #TwitterBase::loadJSON(url)

    getMention: ->
        params =
            callback: "callback"
            include_entities: "True"
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}statuses/mentions.json", params)
        TwitterBase::loadJSON(url)

    getDirectMessage: ->
        params =
            callback: "callback"
            include_entities: "True"
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}direct_messages.json", params)
        TwitterBase::loadJSON(url)

    getLists: (screen_name) ->
        params =
            callback: "callback_lists"
            screen_name: screen_name
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}lists.json", params)
        TwitterBase::loadJSON(url)

    getListTimeline: (screen_name, list_name, include_rts) ->
        params =
            callback: "callback"
            include_entities: "True"
            slug: list_name
            owner_screen_name: screen_name
            include_rts: include_rts
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}lists/statuses.json", params)
        TwitterBase::loadJSON(url)

    getSearch: (query)->
        params =
            callback: "callback"
            include_entities: "True"
            q: query
        url = TwitterBase::setOAuth("GET", "http://search.twitter.com/search.json", params)
        TwitterBase::loadJSON(url)

    getAPILimit: ->
        params =
            callback: "callback_api_limit"
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}account/rate_limit_status.json", params)
        TwitterBase::loadJSON(url)

    getRetweetedByMe: ->
        params =
            callback: "callback_retweeted_by_me"
        url = TwitterBase::setOAuth("GET", "#{TwitterBase.TWITTER_API}statuses/retweeted_by_me.json", params)
        TwitterBase::loadJSON(url)

class APILimit

    createAPILimitFormat: (json)->
        remaining = json.remaining_hits
        hourly_limit= json.hourly_limit
        reset_time= Datetime::createDateTimeFormat(new Date(json.reset_time))
        return "APILimit::#{remaining}/#{hourly_limit} resetTime::#{reset_time}"

    setAPILimit: (json)->
        $('#api_limit').append(APILimit::createAPILimitFormat(json))

class Stream extends TwitterBase

    createTweetdiv: (arg) ->
        tweetdiv = $("<div>")
        tweetdiv.attr('class', 'tweet')
        tweetdiv.attr('id', arg.id_str)

    createImage: (arg) ->
        img = $("<img/>")

        if arg.sender #DM
            img.attr('src', arg.sender.profile_image_url)
        else if not arg.user #Search
            img.attr('src', arg.profile_image_url)
        else #Home, Mention, List
            img.attr('src', arg.user.profile_image_url)

        if arg.sender #DM
            img.attr('src', arg.sender.screen_name)
        else if not arg.user #Search
            img.attr('alt', arg.from_user)
        else #Home, Mention, List
            img.attr('alt', arg.user.screen_name)
        img.attr('class', 'user_icon')

    createUserName: (arg) ->
        user_name = $("<a>")

        if arg.sender #DM
            if arg.sender.screen_name == arg.sender.name
                display_name= arg.sender.screen_name
            else
                display_name = "#{arg.sender.screen_name}(#{arg.sender.name})"
        else if not arg.user #Search
            display_name = arg.from_user
        else #Home, Mention, List
            if arg.user.screen_name == arg.user.name
                display_name= arg.user.screen_name
            else
                display_name = "#{arg.user.screen_name}(#{arg.user.name})"

        if arg.sender #DM
            user_name.attr('href', TwitterBase.TWITTER_ROOT + arg.sender.screen_name)
        else if not arg.user #Search
            user_name.attr('href', TwitterBase.TWITTER_ROOT + arg.from_user)
        else #Home, Mention, List
            user_name.attr('href', TwitterBase.TWITTER_ROOT + arg.user.screen_name)
        user_name.attr('class', 'user_name')
        user_name.text(display_name)

    createProtectedImg: ->
        button = $('<img/>')
        button.attr('src', './image/protected.png')
        button.attr('alt', 'protected')
        button.attr('class', 'protected')

    createText: (arg) ->
        textdiv = $('<div>')
        textdiv.attr('class', 'text')
        tweet = arg.text
        #t.co展開
        if not arg.entities.urls
            pass
        else
            for i of arg.entities.urls
                tweet = tweet.replace(arg.entities.urls[i].url, arg.entities.urls[i].expanded_url)
        tweet = tweet.replace(/(https?:\/\/[\w\.\,\-\+\?\/\%#=\&\!]+)/ig , "<a href='$1' class='url'>$1</a>")
        tweet = tweet.replace(/@([\a-zA-Z0-9_]+)/g , "<a href=#{TwitterBase.TWITTER_ROOT}$1>@$1</a>")
        tweet = tweet.replace(/#([\w一-龠ぁ-んァ-ヴー]+)/g , "<a href=#{TwitterBase.TWITTER_ROOT}search/%23$1>#$1</a>")
        if /shindanmaker/.test(tweet)
             tweet = 'また診断メーカーか。'
        if Setting::loadAllowdisplayJapaneseHashtag() == "False" or Setting::loadAllowdisplayJapaneseHashtag() == null
            if /#[一-龠ぁ-んァ-ヴー０-９]{10,}/.test(tweet)
                tweet = 'また日本語ハッシュタグか'
        if /gohantabeyo/.test(tweet)
             tweet = 'またごはんか'

        textdiv.html(tweet)

    createTimeLink: (arg) ->
        timelink = $('<a>')

        if arg.sender #DM
            timelink.attr('href', "#{TwitterBase.TWITTER_ROOT}#{arg.sender.screen_name}")
        else if not arg.user #Search
            timelink.attr('href', "#{TwitterBase.TWITTER_ROOT}#{arg.from_user}/status/#{arg.id_str}")
        else #Home, Mention, List
            timelink.attr('href', "#{TwitterBase.TWITTER_ROOT}#{arg.user.screen_name}/status/#{arg.id_str}")
        timelink.attr('class', 'time')

        time = Datetime::createDateTimeFormat(new Date(arg.created_at))
        timelink.text(time)

    createSource: (arg) ->
        a = $("<a>")
        a.attr('class', 'source')
        if /&lt;/.test(arg.source) #Search
            encoded_text = arg.source
            encoded_text = encoded_text.replace(/&lt;/g, '<')
            encoded_text = encoded_text.replace(/&gt;/g, '>')
            encoded_text = encoded_text.replace(/&quot;/g, '"')
            a.html(" / #{encoded_text}")
        else
            a.html(" / #{arg.source}")

    createRTImg: (arg) ->
        img = $('<img/>')
        img.attr('src', arg.user.profile_image_url)
        img.attr('class', 'retweeter_user_icon')
        img.attr('alt', arg.user.screen_name)

    createRTscreenName: (arg) ->
        span = $('<span>')
        span.attr('class', 'retweeter_screen_name')
        span.text("RT::#{arg.user.screen_name}")

    createRTcount: (arg) ->
        span = $('<span>')
        span.attr('class', 'retweet_count')
        retweeted_count = parseInt(arg.retweet_count) + 1
        span.text("&#{retweeted_count}")

    createReplyButton: ->
        button = $('<img/>')
        button.attr('src', './image/reply.png')
        button.attr('alt', 'replyButton')
        button.attr('class', 'reply')

    createFavButton: (arg) ->
        button = $('<img/>')
        if arg.favorited
            button.attr('src', './image/favorite_on.png')
        else
            button.attr('src', './image/favorite.png')
        button.attr('alt', 'FavButton')
        button.attr('class', 'fav')

    createRTButton: (arg)->
        button = $('<img/>')
        if arg.retweeted
            button.attr('src', './image/retweet_on.png')
        else
            button.attr('src', './image/retweet.png')
        button.attr('alt', 'RTButton')
        button.attr('class', 'retweet')

    buildStream: (json, column_id) ->
        for arg in json
            old_arg = null
            tweetdiv = Stream::createTweetdiv(arg)
            if arg.retweeted_status
                old_arg = arg
                arg = arg.retweeted_status
            $("#column#{column_id}").append(tweetdiv)
            tweetdiv.append(Stream::createImage(arg))
            tweetdiv.append(Stream::createUserName(arg))
            if arg.user.protected
                tweetdiv.append(Stream::createProtectedImg())
            tweetdiv.append(Stream::createText(arg))
            tweetdiv.append(Stream::createTimeLink(arg))
            tweetdiv.append(Stream::createSource(arg))
            tweetdiv.append(Stream::createReplyButton())
            tweetdiv.append(Stream::createFavButton(arg))
            tweetdiv.append(Stream::createRTButton(arg))
            #公式RTの場合
            if old_arg
                tweetdiv.append(Stream::createRTImg(old_arg))
                tweetdiv.append(Stream::createRTscreenName(old_arg))
                tweetdiv.append(Stream::createRTcount(old_arg))

    buildSearchStream: (json, column_id) ->
        for arg in json.results
            tweetdiv = Stream::createTweetdiv(arg)
            $("#column#{column_id}").append(tweetdiv)
            tweetdiv.append(Stream::createImage(arg))
            tweetdiv.append(Stream::createUserName(arg))
            tweetdiv.append(Stream::createText(arg))
            tweetdiv.append(Stream::createTimeLink(arg))
            tweetdiv.append(Stream::createSource(arg))
            tweetdiv.append(Stream::createReplyButton())
            tweetdiv.append(Stream::createFavButton(arg))
            tweetdiv.append(Stream::createRTButton(arg))

    buildDirectMessageStream: (json, column_id) ->
        for arg in json
            tweetdiv = Stream::createTweetdiv(arg)
            $("#column#{column_id}").append(tweetdiv)
            tweetdiv.append(Stream::createImage(arg))
            tweetdiv.append(Stream::createUserName(arg))
            tweetdiv.append(Stream::createText(arg))
            tweetdiv.append(Stream::createTimeLink(arg))

    buildColumn: ->
        column_id = 0
        incID: ->
            column_id++
        getCloumnID: ->
            return column_id
        #resetCloumnID: ->
            #column_id = 0

    column = @::buildColumn()

    readCallback: (json)->
        column.incID()
        if json.results #Search
            Stream::buildSearchStream(json, column.getCloumnID())
        else if json[0].recipient #DM
            Stream::buildDirectMessageStream(json, column.getCloumnID())
        else #Home, Mention, List
            Stream::buildStream(json, column.getCloumnID())


class Oparate extends TwitterBase

    createFav: (id) ->
        params = null
        url = TwitterBase::setOAuth("POST", "#{TwitterBase.TWITTER_API}favorites/create/#{id}.xml", params)
        if window.opera
            TwitterBase::postIframe(url)
        else
            TwitterBase::postAjax(url)

    destroyFav: (id) ->
        params = null
        url = TwitterBase::setOAuth("POST", "#{TwitterBase.TWITTER_API}favorites/destroy/#{id}.xml", params)
        if window.opera
            TwitterBase::postIframe(url)
        else
            TwitterBase::postAjax(url)

    createRetweet: (id, protected) ->
        if protected == "protected"
            alert "鍵垢です"
            return false
        params = null
        url = TwitterBase::setOAuth("POST", "#{TwitterBase.TWITTER_API}statuses/retweet/#{id}.xml", params)
        if window.opera
            TwitterBase::postIframe(url)
        else
            TwitterBase::postAjax(url)

class Datetime

    getCurrentDate: ->
        new Date
    createDateTimeFormat: (d) ->
        year = d.getFullYear()
        month = (d.getMonth() + 1)
        date = d.getDate()
        hour = d.getHours()
        minutes = ("0" + d.getMinutes()).slice(-2)
        seconds = ("0" + d.getSeconds()).slice(-2)
        return "#{year}/#{month}/#{date} #{hour}:#{minutes}:#{seconds}"

    setCurrentDate: ->
        $('#current_date').append(Datetime::createDateTimeFormat(Datetime::getCurrentDate()))

class Setting

    setSetting: (form)->
        settings = []
        for num in [1..20]
            setting =
               stream_num: "#{num}"
               type: $("[name='Stream#{num}']:checked").val()
               list_owner: $("[name='list_owner#{num}']").val()
               list_name: $("[name='list_name#{num}']").val()
               include_rts: $("[name='include_rts#{num}']").attr('checked')
               search: $("[name='search#{num}']").val()
               #interval: $("[name='interval#{num}']").val()
               interval: $("[name='interval']").val()
            settings.push(setting)
        localStorage.setItem("settings", JSON.stringify(settings))

    getSettings: ->
        settings = JSON.parse(localStorage.getItem("settings"))

    parseSettings: (settings)->
        for arg in settings
            if arg.type == "Home"
                API::getHomeTimeline()
            else if arg.type == "Mention"
                API::getMention()
            else if arg.type == "DM"
                API::getDirectMessage()
            else if arg.type == "List"
                if arg.include_rts == "checked"
                    include_rts = "True"
                else
                    include_rts = "False"
                API::getListTimeline(arg.list_owner, arg.list_name, include_rts)
            else if arg.type == "Search"
                API::getSearch(arg.search)

    setReloadTime: (settings) ->
        for arg in settings
            if arg.interval == ""
                interval = 5*60*1000
            else
                interval = arg.interval * 60 * 1000
        return interval

    setUserSetting: ->
        settings = Setting::getSettings()

        $(".list_owner").css("display", "none")
        $(".list_name").css("display", "none")
        $(".include_rts").css("display", "none")
        $(".include_rts").text('')
        $(".search").css("display", "none")

        for arg in settings
            if arg.type == "None"
                $("[name='Stream#{arg.stream_num}']").val(["None"])
            if arg.type == "Home"
                $("[name='Stream#{arg.stream_num}']").val(["Home"])
            if arg.type == "Mention"
                $("[name='Stream#{arg.stream_num}']").val(["Mention"])
            if arg.type == "DM"
                $("[name='Stream#{arg.stream_num}']").val(["DM"])
            if arg.type == "List"
                $("[name='Stream#{arg.stream_num}']").val(["List"])
                $("[name=list_owner#{arg.stream_num}]").css('display', 'block')
                $("[name=list_name#{arg.stream_num}]").css('display', 'block')
                $("[name=include_rts#{arg.stream_num}]").css('display', 'block')
            if arg.type == "Search"
                $("[name='Stream#{arg.stream_num}']").val(["Search"])
                $("[name=search#{arg.stream_num}]").css('display', 'block')
            $("[name=list_owner#{arg.stream_num}]").val(arg.list_owner)
            $("[name=list_name#{arg.stream_num}]").val(arg.list_name)
            $("[name=include_rts#{arg.stream_num}]").attr('checked', arg.include_rts)
            $("[name=search#{arg.stream_num}]").val(arg.search)
            $("[name=interval]").val(arg.interval)

    clearSettings: ->
        if confirm "ぜんぶけしちゃう？？？？"
            alert "全部消しちゃった"
            localStorage.clear()
            location.href = "./index.html"

    recordUserStyle: (form) ->
        localStorage.setItem("user_style", $("[name=user_style]").val())

    loadUserStyle: ->
        $("[name=user_style]").val(localStorage.getItem("user_style"))

    setUserStyle: ->
        style = $("<style>")
        style.attr('type', 'text/css')
        style.html(localStorage.getItem("user_style"))
        $(document.body).append(style)

    setAllowdisplayJapaneseHashtag: (form) ->
        if $("[name='JapaneseHashtag']").attr('checked')
            localStorage.setItem("JapaneseHashtag", "True")
        else
            localStorage.setItem("JapaneseHashtag", "False")

    loadAllowdisplayJapaneseHashtag: ->
        localStorage.getItem("JapaneseHashtag")


#callback
#=============================

callback = (json) ->
    Stream::readCallback(json)

callback_api_limit = (json) ->
    APILimit::setAPILimit(json)

callback_retweeted_by_me = (json) ->
    for arg in json
        localStorage.setItem("toggle_rt_destroy#{arg.retweeted_status.id_str}", "#{arg.id_str}/#{arg.retweeted_status.id_str}")

callback_get_status = (json) ->
    localStorage.setItem("toggle_fav_#{json.id_str}", json.favorited)
    localStorage.setItem("toggle_rt_#{json.id_str}", json.retweeted)

callback_lists = (json) ->
   for arg in json.lists
       $("#lists_window").append("<li>" + arg.full_name + "</li>")

#=============================

#document.ready
#初期化処理
#=============================

$ ->
    if not localStorage.getItem("access_user")
        if confirm "あれ、もしかしてコピペミスってません？再認証しませんか？"
            location.href = "./oauth/request_token.html"
    #更新日時を設定
    Datetime::setCurrentDate()

    #login_nameを設定
    $("#login_name").append(localStorage.getItem("access_user"))

    #初期化時にもろもろを消す
    Clean::cleanToggleFav()
    Clean::cleanToggleRT()
    Clean::cleanDestroyRT()
    Clean::cleanInReplyToStatusId()

    #UserStyleの設定を読み込む
    if localStorage.getItem("user_style")
        Setting::loadUserStyle()
        Setting::setUserStyle()

    #日本語ハッシュタグの設定を読み込む
    if Setting::loadAllowdisplayJapaneseHashtag() == "True"
        $("[name='JapaneseHashtag']").val(['allowJapaneseHashtag'])

    #Streamの設定を読み込む
    if Setting::getSettings()
        interval = Setting::setReloadTime(Setting::getSettings())
    if Setting::getSettings()
        Setting::parseSettings(Setting::getSettings())
    reload_func = ->  location.reload()
    if Setting::getSettings()
        reload_time = setInterval(reload_func
                                  interval)
    API::getAPILimit()

    API::getLists(localStorage.getItem("access_user"))

    #=========================
    #投稿する
    #=========================

    $('#status').on('focus', ->
        $(@).css('rows', 8)
        $(@).css('cols', 80)
        $(@).css('width', '400px')
        $(@).css('height', '80px')
    )
    $('#status').on('blur', ->
        $(@).css('rows', 1)
        $(@).css('cols', 30)
        $(@).css('width', '227px')
        $(@).css('height', '13px')
    )

    max_length= 140
    $('#count').text(max_length)

    $('#status').on('keydown', (ev)->
        if $(@).val().length == 0
            localStorage.removeItem("in_reply_to_status_id")
        if ev.keyCode == 13 #Enter
            if max_length < $(@).val().length
                alert '140字を超えています'
                return false
            localStorage.setItem("last_update", $(@).val())
            if $(@).val() == "r" # r だけのときは前のポストを再送信する
                API::updateStatus(localStorage.getItem("last_update"), localStorage.getItem("in_reply_to_status_id"))
            else
                API::updateStatus($(@).val(), localStorage.getItem("in_reply_to_status_id"))
            #alert "発言しました"
            $(@).val('')
            $(@).blur()
            $('#count').text(max_length)
    )

    $('#status').on('keyup', ->
        $('#count').text(max_length - $(@).val().length)
        if max_length < $(@).val().length
            $('#count').css('color', 'red')
        else
            $('#count').css('color', 'black')
    )

#=============================
#Oparate Event
#=============================

#Replyイベント関係
#=========================

$('.reply').live("mouseenter", ->
    $(@).attr('src', './image/reply_hover.png')
)
$('.reply').live("mouseleave", ->
    $(@).attr('src', './image/reply.png')
)

$('.reply').live('click', ->
    tweet = $(@).parent()
    id = tweet.attr('id')
    screen_name = "@" + $("##{id} .user_icon").attr('alt')
    localStorage.setItem("in_reply_to_status_id", id)
    $('#status').focus()
    $('#status').val("#{screen_name} ")
)

#favイベント関係
#=========================
$('.fav').live('click', ->
    tweet = $(@).parent()
    id = tweet.attr('id')
    #localStorageにfav情報を格納
    API::getStatus(id)
    #まだfavられてないときはfavる
    if localStorage.getItem("toggle_fav_#{id}") == "false"
        Oparate::createFav(id)
        localStorage.setItem("toggle_fav_#{id}", "true")
        $(@).attr('src', './image/favorite_on.png')
    #favられてるときは取り消し
    else if localStorage.getItem("toggle_fav_#{id}") == "true"
        Oparate::destroyFav(id)
        localStorage.setItem("toggle_fav_#{id}", "false")
        $(@).attr('src', './image/favorite.png')
)

#RTイベント関係
#=========================
$('.retweet').live('click', ->
    tweet = $(@).parent()
    id = tweet.attr('id')
    protected = $("##{id} .protected").attr('alt')
    #localStorageにRT情報を格納
    API::getStatus(id)
    if localStorage.getItem("toggle_rt_#{id}") == "false"
        Oparate::createRetweet(id, protected)
        localStorage.setItem("toggle_rt_#{id}", "true")
        $(@).attr('src', './image/retweet_on.png')
    else if localStorage.getItem("toggle_rt_#{id}") == "true"
        #NOTE:自分がRTものは取り消せるが、他人がRTしたものは取り消せない
        API::getRetweetedByMe()
        retweeted_id= localStorage.getItem("toggle_rt_destroy#{id}")
        #RTの親元を取ってくる
        destroy_status = retweeted_id.split('/')[0]
        API::destroyStatus(destroy_status)
        localStorage.setItem("toggle_rt_#{id}", "false")
        $(@).attr('src', './image/retweet.png')
)


#=============================
#Scroll
#=============================
#キーボード
$ ->
    $(document).on("keydown", (ev)->
        if ev.keyCode == 39 and ev.shiftKey == true #shift Right
           ev.preventDefault()
           scrollBy(parseInt($(".column").css("width")), 0)
        else if ev.keyCode == 37 and ev.shiftKey == true #shift Left
           ev.preventDefault()
           scrollBy( - parseInt($(".column").css("width")), 0)
    )
#マウス
    $("#right_scroll").on("click", ->
       scrollBy(parseInt($(".column").css("width")), 0)
    )
    $("#left_scroll").on("click", ->
       scrollBy( - parseInt($(".column").css("width")), 0)
    )
#=============================
#GUI config
#=============================
$ ->
    $('#stream_config').on('click', ->
        if Setting::getSettings()
            Setting::setUserSetting()
        else
            $(".list_owner").css("display", "none")
            $(".list_name").css("display", "none")
            $(".include_rts").css("display", "none")
            $(".include_rts").text('')
            $(".search").css("display", "none")

        if $('#stream_setting').css('display') == "none"
            $("#stream_setting").css('display', 'block')

        else
            $("#stream_setting").css('display', 'none')
    )

    $("#stream_setting").on("click", (ev) ->

        stream = ev.target.name
        num = stream.substring(6,8)

        if $("[name='Stream#{num}']:checked").val() == "None"
            $("[name=list_owner#{num}]").css("display", "none")
            $("[name=list_name#{num}]").css("display", "none")
            $("[name=include_rts#{num}]").css("display", "none")
            $("[name=search#{num}]").css("display", "none")
        else if $("[name='Stream#{num}']:checked").val() == "Home"
            $("[name=list_owner#{num}]").css("display", "none")
            $("[name=list_name#{num}]").css("display", "none")
            $("[name=include_rts#{num}]").css("display", "none")
            $("[name=search#{num}]").css("display", "none")
        else if $("[name='Stream#{num}']:checked").val() == "Mention"
            $("[name=list_owner#{num}]").css("display", "none")
            $("[name=list_name#{num}]").css("display", "none")
            $("[name=include_rts#{num}]").css("display", "none")
            $("[name=search#{num}]").css("display", "none")
        else if $("[name='Stream#{num}']:checked").val() == "DM"
            $("[name=list_owner#{num}]").css("display", "none")
            $("[name=list_name#{num}]").css("display", "none")
            $("[name=include_rts#{num}]").css("display", "none")
            $("[name=search#{num}]").css("display", "none")
        else if $("[name='Stream#{num}']:checked").val() == "List"
            $("[name=list_owner#{num}]").css("display", "block")
            $("[name=list_name#{num}]").css("display", "block")
            $("[name=include_rts#{num}]").css("display", "block")
            $("[name=search#{num}]").css("display", "none")
        else if $("[name='Stream#{num}']:checked").val() == "Search"
            $("[name=list_owner#{num}]").css("display", "none")
            $("[name=list_name#{num}]").css("display", "none")
            $("[name=include_rts#{num}]").css("display", "none")
            $("[name=search#{num}]").css("display", "block")
    )

    $('#other_config').on('click', (ev)->
        if $("#other_setting").css('display') == "none"
            $("#other_setting").css('display', 'block')
        else
            $("#other_setting").css('display', 'none')
    )
#=============================
#Utils
#=============================
class Clean

    cleanToggleFav: ->
        local_fav = []
        for i of localStorage
            if /toggle_fav_[0-9]+/.test(i)
                local_fav.push(i)
        for j of local_fav
            localStorage.removeItem(local_fav[j])
    cleanToggleRT: ->
        local_rt = []
        for i of localStorage
            if /toggle_rt_[0-9]+/.test(i)
                local_rt.push(i)
        for j of local_rt
            localStorage.removeItem(local_rt[j])
    cleanDestroyRT: ->
        local_drt = []
        for i of localStorage
            if /toggle_rt_destroy[0-9]+/.test(i)
                local_drt.push(i)
        for j of local_drt
            localStorage.removeItem(local_drt[j])
    cleanInReplyToStatusId: ->
        localStorage.removeItem("in_reply_to_status_id")
