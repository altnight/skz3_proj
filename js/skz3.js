var API, APILimit, Clean, Datetime, Oparate, Setting, Stream, TwitterBase, callback, callback_api_limit, callback_get_status, callback_lists, callback_retweeted_by_me,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

TwitterBase = (function() {
  var CONSUMER_KEY, CONSUMER_SECRET;

  function TwitterBase() {}

  CONSUMER_KEY = "YOUR KEY";

  CONSUMER_SECRET = "YOUR KEY";

  TwitterBase.TWITTER_ROOT = "https://twitter.com/#!/";

  TwitterBase.TWITTER_API = "https://api.twitter.com/1/";

  TwitterBase.prototype.setOAuth = function(method, api, params) {
    var accessor, authed_url, key, message;
    accessor = {
      consumerSecret: CONSUMER_SECRET,
      tokenSecret: localStorage.getItem("access_token_secret")
    };
    message = {
      method: method,
      action: api,
      parameters: {
        oauth_consumer_key: CONSUMER_KEY,
        oauth_token: localStorage.getItem("access_token"),
        oauth_signature_method: "HMAC-SHA1"
      }
    };
    for (key in params) {
      message.parameters[key] = params[key];
    }
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    authed_url = OAuth.addToURL(message.action, message.parameters);
    return authed_url;
  };

  TwitterBase.prototype.loadJSON = function(url) {
    var script;
    script = $("<script>");
    script.attr('src', url);
    script.attr('type', "application/javascript");
    script.attr('charset', "UTF-8");
    return $(document.body).append(script);
  };

  TwitterBase.prototype.postIframe = function(url) {
    var form;
    form = $("<form/>");
    form.attr('method', "POST");
    form.attr('target', "dummy");
    form.attr('action', url);
    $("[name='dummy']").append(form);
    return form.submit();
  };

  TwitterBase.prototype.postAjax = function(url) {
    return $.ajax({
      type: "POST",
      url: url,
      success: function(arg) {
        return console.log(arg);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        return console.log(errorThrown);
      }
    });
  };

  return TwitterBase;

})();

API = (function(_super) {

  __extends(API, _super);

  function API() {
    API.__super__.constructor.apply(this, arguments);
  }

  API.prototype.getStatus = function(id) {
    var params, url;
    params = {
      callback: "callback_get_status"
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "statuses/show/" + id + ".json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.destroyStatus = function(id) {
    var params, url;
    params = id;
    url = TwitterBase.prototype.setOAuth("POST", "" + TwitterBase.TWITTER_API + "statuses/destroy/" + id + ".xml", params);
    if (window.opera) {
      return TwitterBase.prototype.postIframe(url);
    } else {
      return TwitterBase.prototype.postAjax(url);
    }
  };

  API.prototype.updateStatus = function(text, in_reply_to_status_id) {
    var params, url;
    params = {
      status: text,
      in_reply_to_status_id: in_reply_to_status_id
    };
    url = TwitterBase.prototype.setOAuth("POST", "" + TwitterBase.TWITTER_API + "statuses/update.xml", params);
    if (window.opera) {
      return TwitterBase.prototype.postIframe(url);
    } else {
      return TwitterBase.prototype.postAjax(url);
    }
  };

  API.prototype.getHomeTimeline = function() {
    var params, url;
    params = {
      include_entities: "True",
      callback: "callback",
      count: "50"
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "statuses/home_timeline.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getMention = function() {
    var params, url;
    params = {
      callback: "callback",
      include_entities: "True"
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "statuses/mentions.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getDirectMessage = function() {
    var params, url;
    params = {
      callback: "callback",
      include_entities: "True"
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "direct_messages.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getLists = function(screen_name) {
    var params, url;
    params = {
      callback: "callback_lists",
      screen_name: screen_name
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "lists.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getListTimeline = function(screen_name, list_name, include_rts) {
    var params, url;
    params = {
      callback: "callback",
      include_entities: "True",
      slug: list_name,
      owner_screen_name: screen_name,
      include_rts: include_rts
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "lists/statuses.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getSearch = function(query) {
    var params, url;
    params = {
      callback: "callback",
      include_entities: "True",
      q: query
    };
    url = TwitterBase.prototype.setOAuth("GET", "http://search.twitter.com/search.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getAPILimit = function() {
    var params, url;
    params = {
      callback: "callback_api_limit"
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "account/rate_limit_status.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  API.prototype.getRetweetedByMe = function() {
    var params, url;
    params = {
      callback: "callback_retweeted_by_me"
    };
    url = TwitterBase.prototype.setOAuth("GET", "" + TwitterBase.TWITTER_API + "statuses/retweeted_by_me.json", params);
    return TwitterBase.prototype.loadJSON(url);
  };

  return API;

})(TwitterBase);

APILimit = (function() {

  function APILimit() {}

  APILimit.prototype.createAPILimitFormat = function(json) {
    var hourly_limit, remaining, reset_time;
    remaining = json.remaining_hits;
    hourly_limit = json.hourly_limit;
    reset_time = Datetime.prototype.createDateTimeFormat(new Date(json.reset_time));
    return "APILimit::" + remaining + "/" + hourly_limit + " resetTime::" + reset_time;
  };

  APILimit.prototype.setAPILimit = function(json) {
    return $('#api_limit').append(APILimit.prototype.createAPILimitFormat(json));
  };

  return APILimit;

})();

Stream = (function(_super) {
  var column;

  __extends(Stream, _super);

  function Stream() {
    Stream.__super__.constructor.apply(this, arguments);
  }

  Stream.prototype.createTweetdiv = function(arg) {
    var tweetdiv;
    tweetdiv = $("<div>");
    tweetdiv.attr('class', 'tweet');
    return tweetdiv.attr('id', arg.id_str);
  };

  Stream.prototype.createImage = function(arg) {
    var img;
    img = $("<img/>");
    if (arg.sender) {
      img.attr('src', arg.sender.profile_image_url);
    } else if (!arg.user) {
      img.attr('src', arg.profile_image_url);
    } else {
      img.attr('src', arg.user.profile_image_url);
    }
    if (arg.sender) {
      img.attr('src', arg.sender.screen_name);
    } else if (!arg.user) {
      img.attr('alt', arg.from_user);
    } else {
      img.attr('alt', arg.user.screen_name);
    }
    return img.attr('class', 'user_icon');
  };

  Stream.prototype.createUserName = function(arg) {
    var display_name, user_name;
    user_name = $("<a>");
    if (arg.sender) {
      if (arg.sender.screen_name === arg.sender.name) {
        display_name = arg.sender.screen_name;
      } else {
        display_name = "" + arg.sender.screen_name + "(" + arg.sender.name + ")";
      }
    } else if (!arg.user) {
      display_name = arg.from_user;
    } else {
      if (arg.user.screen_name === arg.user.name) {
        display_name = arg.user.screen_name;
      } else {
        display_name = "" + arg.user.screen_name + "(" + arg.user.name + ")";
      }
    }
    if (arg.sender) {
      user_name.attr('href', TwitterBase.TWITTER_ROOT + arg.sender.screen_name);
    } else if (!arg.user) {
      user_name.attr('href', TwitterBase.TWITTER_ROOT + arg.from_user);
    } else {
      user_name.attr('href', TwitterBase.TWITTER_ROOT + arg.user.screen_name);
    }
    user_name.attr('class', 'user_name');
    return user_name.text(display_name);
  };

  Stream.prototype.createProtectedImg = function() {
    var button;
    button = $('<img/>');
    button.attr('src', './image/protected.png');
    button.attr('alt', 'protected');
    return button.attr('class', 'protected');
  };

  Stream.prototype.createText = function(arg) {
    var i, textdiv, tweet;
    textdiv = $('<div>');
    textdiv.attr('class', 'text');
    tweet = arg.text;
    if (!arg.entities.urls) {
      pass;
    } else {
      for (i in arg.entities.urls) {
        tweet = tweet.replace(arg.entities.urls[i].url, arg.entities.urls[i].expanded_url);
      }
    }
    tweet = tweet.replace(/(https?:\/\/[\w\.\,\-\+\?\/\%#=\&\!]+)/ig, "<a href='$1' class='url'>$1</a>");
    tweet = tweet.replace(/@([\a-zA-Z0-9_]+)/g, "<a href=" + TwitterBase.TWITTER_ROOT + "$1>@$1</a>");
    tweet = tweet.replace(/#([\w一-龠ぁ-んァ-ヴー]+)/g, "<a href=" + TwitterBase.TWITTER_ROOT + "search/%23$1>#$1</a>");
    if (/shindanmaker/.test(tweet)) tweet = 'また診断メーカーか。';
    if (Setting.prototype.loadAllowdisplayJapaneseHashtag() === "False" || Setting.prototype.loadAllowdisplayJapaneseHashtag() === null) {
      if (/#[一-龠ぁ-んァ-ヴー０-９]{10,}/.test(tweet)) tweet = 'また日本語ハッシュタグか';
    }
    if (/gohantabeyo/.test(tweet)) tweet = 'またごはんか';
    return textdiv.html(tweet);
  };

  Stream.prototype.createTimeLink = function(arg) {
    var time, timelink;
    timelink = $('<a>');
    if (arg.sender) {
      timelink.attr('href', "" + TwitterBase.TWITTER_ROOT + arg.sender.screen_name);
    } else if (!arg.user) {
      timelink.attr('href', "" + TwitterBase.TWITTER_ROOT + arg.from_user + "/status/" + arg.id_str);
    } else {
      timelink.attr('href', "" + TwitterBase.TWITTER_ROOT + arg.user.screen_name + "/status/" + arg.id_str);
    }
    timelink.attr('class', 'time');
    time = Datetime.prototype.createDateTimeFormat(new Date(arg.created_at));
    return timelink.text(time);
  };

  Stream.prototype.createSource = function(arg) {
    var a, encoded_text;
    a = $("<a>");
    a.attr('class', 'source');
    if (/&lt;/.test(arg.source)) {
      encoded_text = arg.source;
      encoded_text = encoded_text.replace(/&lt;/g, '<');
      encoded_text = encoded_text.replace(/&gt;/g, '>');
      encoded_text = encoded_text.replace(/&quot;/g, '"');
      return a.html(" / " + encoded_text);
    } else {
      return a.html(" / " + arg.source);
    }
  };

  Stream.prototype.createRTImg = function(arg) {
    var img;
    img = $('<img/>');
    img.attr('src', arg.user.profile_image_url);
    img.attr('class', 'retweeter_user_icon');
    return img.attr('alt', arg.user.screen_name);
  };

  Stream.prototype.createRTscreenName = function(arg) {
    var span;
    span = $('<span>');
    span.attr('class', 'retweeter_screen_name');
    return span.text("RT::" + arg.user.screen_name);
  };

  Stream.prototype.createRTcount = function(arg) {
    var retweeted_count, span;
    span = $('<span>');
    span.attr('class', 'retweet_count');
    retweeted_count = parseInt(arg.retweet_count) + 1;
    return span.text("&" + retweeted_count);
  };

  Stream.prototype.createReplyButton = function() {
    var button;
    button = $('<img/>');
    button.attr('src', './image/reply.png');
    button.attr('alt', 'replyButton');
    return button.attr('class', 'reply');
  };

  Stream.prototype.createFavButton = function(arg) {
    var button;
    button = $('<img/>');
    if (arg.favorited) {
      button.attr('src', './image/favorite_on.png');
    } else {
      button.attr('src', './image/favorite.png');
    }
    button.attr('alt', 'FavButton');
    return button.attr('class', 'fav');
  };

  Stream.prototype.createRTButton = function(arg) {
    var button;
    button = $('<img/>');
    if (arg.retweeted) {
      button.attr('src', './image/retweet_on.png');
    } else {
      button.attr('src', './image/retweet.png');
    }
    button.attr('alt', 'RTButton');
    return button.attr('class', 'retweet');
  };

  Stream.prototype.buildStream = function(json, column_id) {
    var arg, old_arg, tweetdiv, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = json.length; _i < _len; _i++) {
      arg = json[_i];
      old_arg = null;
      tweetdiv = Stream.prototype.createTweetdiv(arg);
      if (arg.retweeted_status) {
        old_arg = arg;
        arg = arg.retweeted_status;
      }
      $("#column" + column_id).append(tweetdiv);
      tweetdiv.append(Stream.prototype.createImage(arg));
      tweetdiv.append(Stream.prototype.createUserName(arg));
      if (arg.user.protected) {
        tweetdiv.append(Stream.prototype.createProtectedImg());
      }
      tweetdiv.append(Stream.prototype.createText(arg));
      tweetdiv.append(Stream.prototype.createTimeLink(arg));
      tweetdiv.append(Stream.prototype.createSource(arg));
      tweetdiv.append(Stream.prototype.createReplyButton());
      tweetdiv.append(Stream.prototype.createFavButton(arg));
      tweetdiv.append(Stream.prototype.createRTButton(arg));
      if (old_arg) {
        tweetdiv.append(Stream.prototype.createRTImg(old_arg));
        tweetdiv.append(Stream.prototype.createRTscreenName(old_arg));
        _results.push(tweetdiv.append(Stream.prototype.createRTcount(old_arg)));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Stream.prototype.buildSearchStream = function(json, column_id) {
    var arg, tweetdiv, _i, _len, _ref, _results;
    _ref = json.results;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      tweetdiv = Stream.prototype.createTweetdiv(arg);
      $("#column" + column_id).append(tweetdiv);
      tweetdiv.append(Stream.prototype.createImage(arg));
      tweetdiv.append(Stream.prototype.createUserName(arg));
      tweetdiv.append(Stream.prototype.createText(arg));
      tweetdiv.append(Stream.prototype.createTimeLink(arg));
      tweetdiv.append(Stream.prototype.createSource(arg));
      tweetdiv.append(Stream.prototype.createReplyButton());
      tweetdiv.append(Stream.prototype.createFavButton(arg));
      _results.push(tweetdiv.append(Stream.prototype.createRTButton(arg)));
    }
    return _results;
  };

  Stream.prototype.buildDirectMessageStream = function(json, column_id) {
    var arg, tweetdiv, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = json.length; _i < _len; _i++) {
      arg = json[_i];
      tweetdiv = Stream.prototype.createTweetdiv(arg);
      $("#column" + column_id).append(tweetdiv);
      tweetdiv.append(Stream.prototype.createImage(arg));
      tweetdiv.append(Stream.prototype.createUserName(arg));
      tweetdiv.append(Stream.prototype.createText(arg));
      _results.push(tweetdiv.append(Stream.prototype.createTimeLink(arg)));
    }
    return _results;
  };

  Stream.prototype.buildColumn = function() {
    var column_id;
    column_id = 0;
    return {
      incID: function() {
        return column_id++;
      },
      getCloumnID: function() {
        return column_id;
      }
    };
  };

  column = Stream.prototype.buildColumn();

  Stream.prototype.readCallback = function(json) {
    column.incID();
    if (json.results) {
      return Stream.prototype.buildSearchStream(json, column.getCloumnID());
    } else if (json[0].recipient) {
      return Stream.prototype.buildDirectMessageStream(json, column.getCloumnID());
    } else {
      return Stream.prototype.buildStream(json, column.getCloumnID());
    }
  };

  return Stream;

})(TwitterBase);

Oparate = (function(_super) {

  __extends(Oparate, _super);

  function Oparate() {
    Oparate.__super__.constructor.apply(this, arguments);
  }

  Oparate.prototype.createFav = function(id) {
    var params, url;
    params = null;
    url = TwitterBase.prototype.setOAuth("POST", "" + TwitterBase.TWITTER_API + "favorites/create/" + id + ".xml", params);
    if (window.opera) {
      return TwitterBase.prototype.postIframe(url);
    } else {
      return TwitterBase.prototype.postAjax(url);
    }
  };

  Oparate.prototype.destroyFav = function(id) {
    var params, url;
    params = null;
    url = TwitterBase.prototype.setOAuth("POST", "" + TwitterBase.TWITTER_API + "favorites/destroy/" + id + ".xml", params);
    if (window.opera) {
      return TwitterBase.prototype.postIframe(url);
    } else {
      return TwitterBase.prototype.postAjax(url);
    }
  };

  Oparate.prototype.createRetweet = function(id, protected) {
    var params, url;
    if (protected === "protected") {
      alert("鍵垢です");
      return false;
    }
    params = null;
    url = TwitterBase.prototype.setOAuth("POST", "" + TwitterBase.TWITTER_API + "statuses/retweet/" + id + ".xml", params);
    if (window.opera) {
      return TwitterBase.prototype.postIframe(url);
    } else {
      return TwitterBase.prototype.postAjax(url);
    }
  };

  return Oparate;

})(TwitterBase);

Datetime = (function() {

  function Datetime() {}

  Datetime.prototype.getCurrentDate = function() {
    return new Date;
  };

  Datetime.prototype.createDateTimeFormat = function(d) {
    var date, hour, minutes, month, seconds, year;
    year = d.getFullYear();
    month = d.getMonth() + 1;
    date = d.getDate();
    hour = d.getHours();
    minutes = ("0" + d.getMinutes()).slice(-2);
    seconds = ("0" + d.getSeconds()).slice(-2);
    return "" + year + "/" + month + "/" + date + " " + hour + ":" + minutes + ":" + seconds;
  };

  Datetime.prototype.setCurrentDate = function() {
    return $('#current_date').append(Datetime.prototype.createDateTimeFormat(Datetime.prototype.getCurrentDate()));
  };

  return Datetime;

})();

Setting = (function() {

  function Setting() {}

  Setting.prototype.setSetting = function(form) {
    var num, setting, settings;
    settings = [];
    for (num = 1; num <= 20; num++) {
      setting = {
        stream_num: "" + num,
        type: $("[name='Stream" + num + "']:checked").val(),
        list_owner: $("[name='list_owner" + num + "']").val(),
        list_name: $("[name='list_name" + num + "']").val(),
        include_rts: $("[name='include_rts" + num + "']").attr('checked'),
        search: $("[name='search" + num + "']").val(),
        interval: $("[name='interval']").val()
      };
      settings.push(setting);
    }
    return localStorage.setItem("settings", JSON.stringify(settings));
  };

  Setting.prototype.getSettings = function() {
    var settings;
    return settings = JSON.parse(localStorage.getItem("settings"));
  };

  Setting.prototype.parseSettings = function(settings) {
    var arg, include_rts, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = settings.length; _i < _len; _i++) {
      arg = settings[_i];
      if (arg.type === "Home") {
        _results.push(API.prototype.getHomeTimeline());
      } else if (arg.type === "Mention") {
        _results.push(API.prototype.getMention());
      } else if (arg.type === "DM") {
        _results.push(API.prototype.getDirectMessage());
      } else if (arg.type === "List") {
        if (arg.include_rts === "checked") {
          include_rts = "True";
        } else {
          include_rts = "False";
        }
        _results.push(API.prototype.getListTimeline(arg.list_owner, arg.list_name, include_rts));
      } else if (arg.type === "Search") {
        _results.push(API.prototype.getSearch(arg.search));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Setting.prototype.setReloadTime = function(settings) {
    var arg, interval, _i, _len;
    for (_i = 0, _len = settings.length; _i < _len; _i++) {
      arg = settings[_i];
      if (arg.interval === "") {
        interval = 5 * 60 * 1000;
      } else {
        interval = arg.interval * 60 * 1000;
      }
    }
    return interval;
  };

  Setting.prototype.setUserSetting = function() {
    var arg, settings, _i, _len, _results;
    settings = Setting.prototype.getSettings();
    $(".list_owner").css("display", "none");
    $(".list_name").css("display", "none");
    $(".include_rts").css("display", "none");
    $(".include_rts").text('');
    $(".search").css("display", "none");
    _results = [];
    for (_i = 0, _len = settings.length; _i < _len; _i++) {
      arg = settings[_i];
      if (arg.type === "None") {
        $("[name='Stream" + arg.stream_num + "']").val(["None"]);
      }
      if (arg.type === "Home") {
        $("[name='Stream" + arg.stream_num + "']").val(["Home"]);
      }
      if (arg.type === "Mention") {
        $("[name='Stream" + arg.stream_num + "']").val(["Mention"]);
      }
      if (arg.type === "DM") {
        $("[name='Stream" + arg.stream_num + "']").val(["DM"]);
      }
      if (arg.type === "List") {
        $("[name='Stream" + arg.stream_num + "']").val(["List"]);
        $("[name=list_owner" + arg.stream_num + "]").css('display', 'block');
        $("[name=list_name" + arg.stream_num + "]").css('display', 'block');
        $("[name=include_rts" + arg.stream_num + "]").css('display', 'block');
      }
      if (arg.type === "Search") {
        $("[name='Stream" + arg.stream_num + "']").val(["Search"]);
        $("[name=search" + arg.stream_num + "]").css('display', 'block');
      }
      $("[name=list_owner" + arg.stream_num + "]").val(arg.list_owner);
      $("[name=list_name" + arg.stream_num + "]").val(arg.list_name);
      $("[name=include_rts" + arg.stream_num + "]").attr('checked', arg.include_rts);
      $("[name=search" + arg.stream_num + "]").val(arg.search);
      _results.push($("[name=interval]").val(arg.interval));
    }
    return _results;
  };

  Setting.prototype.clearSettings = function() {
    if (confirm("ぜんぶけしちゃう？？？？")) {
      alert("全部消しちゃった");
      localStorage.clear();
      return location.href = "./index.html";
    }
  };

  Setting.prototype.recordUserStyle = function(form) {
    return localStorage.setItem("user_style", $("[name=user_style]").val());
  };

  Setting.prototype.loadUserStyle = function() {
    return $("[name=user_style]").val(localStorage.getItem("user_style"));
  };

  Setting.prototype.setUserStyle = function() {
    var style;
    style = $("<style>");
    style.attr('type', 'text/css');
    style.html(localStorage.getItem("user_style"));
    return $(document.body).append(style);
  };

  Setting.prototype.setAllowdisplayJapaneseHashtag = function(form) {
    if ($("[name='JapaneseHashtag']").attr('checked')) {
      return localStorage.setItem("JapaneseHashtag", "True");
    } else {
      return localStorage.setItem("JapaneseHashtag", "False");
    }
  };

  Setting.prototype.loadAllowdisplayJapaneseHashtag = function() {
    return localStorage.getItem("JapaneseHashtag");
  };

  return Setting;

})();

callback = function(json) {
  return Stream.prototype.readCallback(json);
};

callback_api_limit = function(json) {
  return APILimit.prototype.setAPILimit(json);
};

callback_retweeted_by_me = function(json) {
  var arg, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = json.length; _i < _len; _i++) {
    arg = json[_i];
    _results.push(localStorage.setItem("toggle_rt_destroy" + arg.retweeted_status.id_str, "" + arg.id_str + "/" + arg.retweeted_status.id_str));
  }
  return _results;
};

callback_get_status = function(json) {
  localStorage.setItem("toggle_fav_" + json.id_str, json.favorited);
  return localStorage.setItem("toggle_rt_" + json.id_str, json.retweeted);
};

callback_lists = function(json) {
  var arg, _i, _len, _ref, _results;
  _ref = json.lists;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    arg = _ref[_i];
    _results.push($("#lists_window").append("<li>" + arg.full_name + "</li>"));
  }
  return _results;
};

$(function() {
  var interval, max_length, reload_func, reload_time;
  if (!localStorage.getItem("access_user")) {
    if (confirm("あれ、もしかしてコピペミスってません？再認証しませんか？")) {
      location.href = "./oauth/request_token.html";
    }
  }
  Datetime.prototype.setCurrentDate();
  $("#login_name").append(localStorage.getItem("access_user"));
  Clean.prototype.cleanToggleFav();
  Clean.prototype.cleanToggleRT();
  Clean.prototype.cleanDestroyRT();
  Clean.prototype.cleanInReplyToStatusId();
  if (localStorage.getItem("user_style")) {
    Setting.prototype.loadUserStyle();
    Setting.prototype.setUserStyle();
  }
  if (Setting.prototype.loadAllowdisplayJapaneseHashtag() === "True") {
    $("[name='JapaneseHashtag']").val(['allowJapaneseHashtag']);
  }
  if (Setting.prototype.getSettings()) {
    interval = Setting.prototype.setReloadTime(Setting.prototype.getSettings());
  }
  if (Setting.prototype.getSettings()) {
    Setting.prototype.parseSettings(Setting.prototype.getSettings());
  }
  reload_func = function() {
    return location.reload();
  };
  if (Setting.prototype.getSettings()) {
    reload_time = setInterval(reload_func, interval);
  }
  API.prototype.getAPILimit();
  API.prototype.getLists(localStorage.getItem("access_user"));
  $('#status').on('focus', function() {
    $(this).css('rows', 8);
    $(this).css('cols', 80);
    $(this).css('width', '400px');
    return $(this).css('height', '80px');
  });
  $('#status').on('blur', function() {
    $(this).css('rows', 1);
    $(this).css('cols', 30);
    $(this).css('width', '227px');
    return $(this).css('height', '13px');
  });
  max_length = 140;
  $('#count').text(max_length);
  $('#status').on('keydown', function(ev) {
    if ($(this).val().length === 0) {
      localStorage.removeItem("in_reply_to_status_id");
    }
    if (ev.keyCode === 13) {
      if (max_length < $(this).val().length) {
        alert('140字を超えています');
        return false;
      }
      localStorage.setItem("last_update", $(this).val());
      if ($(this).val() === "r") {
        API.prototype.updateStatus(localStorage.getItem("last_update"), localStorage.getItem("in_reply_to_status_id"));
      } else {
        API.prototype.updateStatus($(this).val(), localStorage.getItem("in_reply_to_status_id"));
      }
      $(this).val('');
      $(this).blur();
      return $('#count').text(max_length);
    }
  });
  return $('#status').on('keyup', function() {
    $('#count').text(max_length - $(this).val().length);
    if (max_length < $(this).val().length) {
      return $('#count').css('color', 'red');
    } else {
      return $('#count').css('color', 'black');
    }
  });
});

$('.reply').live("mouseenter", function() {
  return $(this).attr('src', './image/reply_hover.png');
});

$('.reply').live("mouseleave", function() {
  return $(this).attr('src', './image/reply.png');
});

$('.reply').live('click', function() {
  var id, screen_name, tweet;
  tweet = $(this).parent();
  id = tweet.attr('id');
  screen_name = "@" + $("#" + id + " .user_icon").attr('alt');
  localStorage.setItem("in_reply_to_status_id", id);
  $('#status').focus();
  return $('#status').val("" + screen_name + " ");
});

$('.fav').live('click', function() {
  var id, tweet;
  tweet = $(this).parent();
  id = tweet.attr('id');
  API.prototype.getStatus(id);
  if (localStorage.getItem("toggle_fav_" + id) === "false") {
    Oparate.prototype.createFav(id);
    localStorage.setItem("toggle_fav_" + id, "true");
    return $(this).attr('src', './image/favorite_on.png');
  } else if (localStorage.getItem("toggle_fav_" + id) === "true") {
    Oparate.prototype.destroyFav(id);
    localStorage.setItem("toggle_fav_" + id, "false");
    return $(this).attr('src', './image/favorite.png');
  }
});

$('.retweet').live('click', function() {
  var destroy_status, id, protected, retweeted_id, tweet;
  tweet = $(this).parent();
  id = tweet.attr('id');
  protected = $("#" + id + " .protected").attr('alt');
  API.prototype.getStatus(id);
  if (localStorage.getItem("toggle_rt_" + id) === "false") {
    Oparate.prototype.createRetweet(id, protected);
    localStorage.setItem("toggle_rt_" + id, "true");
    return $(this).attr('src', './image/retweet_on.png');
  } else if (localStorage.getItem("toggle_rt_" + id) === "true") {
    API.prototype.getRetweetedByMe();
    retweeted_id = localStorage.getItem("toggle_rt_destroy" + id);
    destroy_status = retweeted_id.split('/')[0];
    API.prototype.destroyStatus(destroy_status);
    localStorage.setItem("toggle_rt_" + id, "false");
    return $(this).attr('src', './image/retweet.png');
  }
});

$(function() {
  $(document).on("keydown", function(ev) {
    if (ev.keyCode === 39 && ev.shiftKey === true) {
      ev.preventDefault();
      return scrollBy(parseInt($(".column").css("width")), 0);
    } else if (ev.keyCode === 37 && ev.shiftKey === true) {
      ev.preventDefault();
      return scrollBy(-parseInt($(".column").css("width")), 0);
    }
  });
  $("#right_scroll").on("click", function() {
    return scrollBy(parseInt($(".column").css("width")), 0);
  });
  return $("#left_scroll").on("click", function() {
    return scrollBy(-parseInt($(".column").css("width")), 0);
  });
});

$(function() {
  $('#stream_config').on('click', function() {
    if (Setting.prototype.getSettings()) {
      Setting.prototype.setUserSetting();
    } else {
      $(".list_owner").css("display", "none");
      $(".list_name").css("display", "none");
      $(".include_rts").css("display", "none");
      $(".include_rts").text('');
      $(".search").css("display", "none");
    }
    if ($('#stream_setting').css('display') === "none") {
      return $("#stream_setting").css('display', 'block');
    } else {
      return $("#stream_setting").css('display', 'none');
    }
  });
  $("#stream_setting").on("click", function(ev) {
    var num, stream;
    stream = ev.target.name;
    num = stream.substring(6, 8);
    if ($("[name='Stream" + num + "']:checked").val() === "None") {
      $("[name=list_owner" + num + "]").css("display", "none");
      $("[name=list_name" + num + "]").css("display", "none");
      $("[name=include_rts" + num + "]").css("display", "none");
      return $("[name=search" + num + "]").css("display", "none");
    } else if ($("[name='Stream" + num + "']:checked").val() === "Home") {
      $("[name=list_owner" + num + "]").css("display", "none");
      $("[name=list_name" + num + "]").css("display", "none");
      $("[name=include_rts" + num + "]").css("display", "none");
      return $("[name=search" + num + "]").css("display", "none");
    } else if ($("[name='Stream" + num + "']:checked").val() === "Mention") {
      $("[name=list_owner" + num + "]").css("display", "none");
      $("[name=list_name" + num + "]").css("display", "none");
      $("[name=include_rts" + num + "]").css("display", "none");
      return $("[name=search" + num + "]").css("display", "none");
    } else if ($("[name='Stream" + num + "']:checked").val() === "DM") {
      $("[name=list_owner" + num + "]").css("display", "none");
      $("[name=list_name" + num + "]").css("display", "none");
      $("[name=include_rts" + num + "]").css("display", "none");
      return $("[name=search" + num + "]").css("display", "none");
    } else if ($("[name='Stream" + num + "']:checked").val() === "List") {
      $("[name=list_owner" + num + "]").css("display", "block");
      $("[name=list_name" + num + "]").css("display", "block");
      $("[name=include_rts" + num + "]").css("display", "block");
      return $("[name=search" + num + "]").css("display", "none");
    } else if ($("[name='Stream" + num + "']:checked").val() === "Search") {
      $("[name=list_owner" + num + "]").css("display", "none");
      $("[name=list_name" + num + "]").css("display", "none");
      $("[name=include_rts" + num + "]").css("display", "none");
      return $("[name=search" + num + "]").css("display", "block");
    }
  });
  return $('#other_config').on('click', function(ev) {
    if ($("#other_setting").css('display') === "none") {
      return $("#other_setting").css('display', 'block');
    } else {
      return $("#other_setting").css('display', 'none');
    }
  });
});

Clean = (function() {

  function Clean() {}

  Clean.prototype.cleanToggleFav = function() {
    var i, j, local_fav, _results;
    local_fav = [];
    for (i in localStorage) {
      if (/toggle_fav_[0-9]+/.test(i)) local_fav.push(i);
    }
    _results = [];
    for (j in local_fav) {
      _results.push(localStorage.removeItem(local_fav[j]));
    }
    return _results;
  };

  Clean.prototype.cleanToggleRT = function() {
    var i, j, local_rt, _results;
    local_rt = [];
    for (i in localStorage) {
      if (/toggle_rt_[0-9]+/.test(i)) local_rt.push(i);
    }
    _results = [];
    for (j in local_rt) {
      _results.push(localStorage.removeItem(local_rt[j]));
    }
    return _results;
  };

  Clean.prototype.cleanDestroyRT = function() {
    var i, j, local_drt, _results;
    local_drt = [];
    for (i in localStorage) {
      if (/toggle_rt_destroy[0-9]+/.test(i)) local_drt.push(i);
    }
    _results = [];
    for (j in local_drt) {
      _results.push(localStorage.removeItem(local_drt[j]));
    }
    return _results;
  };

  Clean.prototype.cleanInReplyToStatusId = function() {
    return localStorage.removeItem("in_reply_to_status_id");
  };

  return Clean;

})();
