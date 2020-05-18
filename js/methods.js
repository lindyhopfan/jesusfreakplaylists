$.urlParam = function (name, queryString) {
  var results = new RegExp(name + '=([^&#]*)')
  .exec(queryString);

  return (results !== null) ? results[1] || 0 : false;
};

$.addSpaces = function(arg) {
  return arg.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
};

$.priorYear = function() {
  if($.year != $.minYear){
    $.year--;
    $("#year").val($.year);
  }
  $("#custom-handle").text($.year);
  $("#slider-vertical").slider('value', $.year);
};

$.nextYear = function() {
  if($.year != $.maxYear){
    $.year++;
    $("#year").val($.year);
  }
  $("#custom-handle").text($.year);
  $("#slider-vertical").slider('value', $.year);
};

$.changeYear = async function (year) {
  $.year = year;
  $("#year").val($.year);

  window.history.pushState(null, null, '/#year=' + year + '&genre=' + $.genre );
  let connectionOk = await $.testConnection();
  if(!connectionOk) {
    $.showDialog();
  }

  let yearPlaylists = _.filter(playlists, function (o) {
    return o.year == year;
  });

  let tabs = $("#tabs").tabs();
  let ul = tabs.find("ul");

  ul.empty();
  tabs.find("div").remove();
  let index = 0;
  let preferredIndex = 0;
  _.each(yearPlaylists, function (playlist) {

    let headerLi = $("<li>");
    let link = $("<a>");
    link.attr("href", "#" + playlist.code);
    link.text(playlist.genre);
    if($.genre == playlist.genre){
      preferredIndex = index;
    }
    headerLi.html(link);

    ul.append(headerLi);

    let tabDiv = $("<div>");
    tabDiv.attr("id", playlist.code);

    let tabP = $("<p>");
    tabDiv.append(tabP);

    if(!connectionOk){

      let playlistAnchor = $("<a>");
      playlistAnchor.attr("href", "https://open.spotify.com/playlist/" + playlist.code);
      playlistAnchor.attr("style", "color:#039be5;");
      playlistAnchor.text("Open playlist in Spotify");

      tabDiv.append(playlistAnchor);
    }

    tabs.append(tabDiv);
    index++;
  });
  tabs.tabs("refresh");
  tabs.tabs("option", "active", preferredIndex);

  if(connectionOk){

    _.each(yearPlaylists, function(playlist){

      let tabDiv = $("#" + playlist.code);

      let playlistAnchor = $("<a>");
      playlistAnchor.attr("href", "https://open.spotify.com/playlist/" + playlist.code);
      playlistAnchor.attr("style", "color:#039be5;");
      playlistAnchor.text("Open playlist in Spotify");

      tabDiv.append(playlistAnchor);

      $.fetchPlaylist(playlist);

    });
  }
};

$.fetchPlaylist = function(playlist) {

  let tabDiv = $("#" + playlist.code);
  let albumContainerDiv = $("<div>");
  albumContainerDiv.attr("id", "albums_" + playlist.code);

  tabDiv.append(albumContainerDiv);

  var albums = {};

  $.fetchAdditionalTracks('https://api.spotify.com/v1/playlists/' + playlist.code + '/tracks', playlist.code, albums);

};

$.testConnection = function () {

  return new Promise(function(resolve) {
    $.accessToken = Cookies.get('accessToken');
    let request = $.ajax({
      method: "GET",
      url: 'https://api.spotify.com/v1/playlists/4pNCAzJDFPOrfeTpxwZsB8/tracks',
      headers: {
        'Authorization': 'Bearer ' + $.accessToken
      }
    });
    request.done(function( response ) {
      if(response.error) {
        resolve(false);
      }
      else {
        resolve(true);
      }
    });
  });
};

$.fetchAdditionalTracks = function (url, playlistCode, albums) {

  let tabDiv = $("#" + playlistCode);

  let request = $.ajax({
    method: "GET",
    url: url,
    headers: {
      'Authorization': 'Bearer ' + $.accessToken
    }
  });
  request.done(function( response ) {

    let next = response.next;

    _.each(response.items, function (item) {
      let id = _.get(item, "track.album.id");
      if(!_.includes(_.keys(albums), id)){
        let album = {
          "id": id,
          "artist": _.get(item, "track.album.artists.0.name"),
          "name": _.get(item, "track.album.name"),
          "img": _.get(item, "track.album.images.1.url")
        };
        albums[id] = album;
      }
    });

    $.addAlbumsToTab(albums, playlistCode);

    if(response.next){

      let moreDiv = $("#more_" + playlistCode);
      if(!moreDiv.length){
        moreDiv = $("<div>");
        moreDiv.attr("id", "more_" + playlistCode);
        moreDiv.attr("style", "width:300; height:20; font-size:XX-LARGE; cursor:pointer; color:#039be5;");
        moreDiv.text("load more results");
        tabDiv.append(moreDiv);
      }

      moreDiv.unbind();
      moreDiv.click(
        function(url, code, albumArray){
          return function(){
            $.fetchAdditionalTracks(url, code, albumArray);
          };
        }(next, playlistCode, albums)
      );

    }
    else {
      let moreDiv = $("#more_" + playlistCode);
      if(moreDiv.length){
        moreDiv.remove();
      }
    }

  });

};

$.addAlbumsToTab = function(albums, playlistCode) {

  let albumContainerDiv = $("#albums_" + playlistCode);
  albumContainerDiv.empty();

  _.each(albums, function (album) {

    let albumDiv = $("<div>");
    albumDiv.attr("style", "display:inline-block;");
    albumDiv.click(function() {

      let albumModal = $("#" + album.id);

      let modalIframe = $("<iframe>");
      modalIframe.attr("src", "https://open.spotify.com/embed/album/" + album.id);
      modalIframe.attr("width", "300");
      modalIframe.attr("height", "300");
      modalIframe.attr("iframeborder", "0");
      modalIframe.attr("allowtransparency", true);
      modalIframe.attr("allow", "encrypted-media");
      modalIframe.attr("style", "display:inline-block;");

      albumModal.append(modalIframe);

    });

    let albumModal = $("<div>");
    albumModal.attr("id", album.id);
    albumModal.attr("class", "modal");
    albumModal.attr("style", "text-align:center;overflow:visible;padding-top:22px;max-width:660px;");

    let modalAlbumImage = $("<img>");
    modalAlbumImage.attr("src", album.img);
    modalAlbumImage.attr("style", "display:inline-block;");

    albumModal.append(modalAlbumImage);
    albumDiv.append(albumModal);

    let imageContainer = $("<p>");

    let imageLink = $("<a>");
    imageLink.attr("href", "#" + album.id);
    imageLink.attr("rel", "modal:open");

    let albumImage = $("<img>");
    albumImage.attr("src", album.img);

    imageLink.append(albumImage);

    imageContainer.append(imageLink);

    albumDiv.append(imageContainer);

    let albumLabel = $("<p>");
    albumLabel.attr("style", "width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
    albumLabel.text(album.artist + ": " + album.name);

    albumDiv.append(albumLabel);

    albumContainerDiv.append(albumDiv);

  });

};

$.spotfiyLogin = function () {
  window.location.href = "https://accounts.spotify.com/authorize?client_id=3c0bcabb9b94479fa174125745f056ae&response_type=token&redirect_uri=http%3A%2F%2Fjesusfreakplaylists.com";
};

$.setupDialog = function () {
  $.createDialog({

    // trigger element
    attachAfter: '#trigger',

    // dialog title
    title: 'Please login to Spotify before using this site.',

    // text for confirm button
    accept: 'Yes',

    // text for cancel button
    refuse: 'Cancel',

    // button styles
    acceptStyle: 'red',
    refuseStyle: 'gray',

    acceptAction: $.spotfiyLogin
  });
};

$.hideDialog = function() {
  $('#confirm_dialog').remove();
  $('#confirm_backdrop').remove();
  $.setupDialog();
};
