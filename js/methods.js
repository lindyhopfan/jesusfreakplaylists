$.urlParam = function (name, queryString) {
  var results = new RegExp(name + '=([^&#]*)')
  .exec(queryString);

  return (results !== null) ? results[1] || 0 : false;
};

$.priorYear = function() {
  let year = $("#year").val();
  if(year != "1949"){
    year--;
    $("#year").val(year);
  }
  $("#custom-handle").text(year);
  $("#slider-vertical").slider('value', year);
};

$.nextYear = function() {
  let year = $("#year").val();
  if(year != "2019"){
    year++;
    $("#year").val(year);
  }
  $("#custom-handle").text(year);
  $("#slider-vertical").slider('value', year);
};

$.changeYear = function (year) {
  let yearPlaylists = _.filter(playlists, function (o) {
    return o.year == year;
  });

  let tabs = $("#tabs").tabs();
  let ul = tabs.find("ul");

  $.accessToken = $.urlParam('access_token', window.location.hash.substr(1));

  ul.empty();
  tabs.find("div").remove();
  let index = 0;
  let preferredIndex = 0;
  _.each(yearPlaylists, function (playlist) {

    let headerLi = $("<li>");
    let link = $("<a>");
    link.attr("href", "#" + playlist.code);
    link.text(playlist.genre);
    if($.lastTab == playlist.genre){
      preferredIndex = index;
    }
    headerLi.html(link);

    ul.append(headerLi);

    let tabDiv = $("<div>");
    tabDiv.attr("id", playlist.code);

    let tabP = $("<p>");
    tabDiv.append(tabP);

    if(!$.accessToken){

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

  if($.accessToken){

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

  var albums = {};

  let request = $.ajax({
    method: "GET",
    url: 'https://api.spotify.com/v1/playlists/' + playlist.code + '/tracks',
    headers: {
      'Authorization': 'Bearer ' + $.accessToken
    }
  });
  request.done(function( response ) {

    console.log(response);

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

    let tabDiv = $("#" + playlist.code);
    let albumContainerDiv = $("<div>");
    albumContainerDiv.attr("id", "albums_" + playlist.code);

    tabDiv.append(albumContainerDiv);

    $.addAlbumsToTab(albums, playlist.code);

  });

};

$.addAlbumsToTab = function(albums, playlistCode) {

  let albumContainerDiv = $("#albums_" + playlistCode);

  _.each(albums, function (album) {

    console.log("album", album);

    let albumDiv = $("<div>");
    albumDiv.attr("style", "display:inline-block;");

    let albumModal = $("<div>");
    albumModal.attr("id", album.id);
    albumModal.attr("class", "modal");
    albumModal.attr("style", "text-align:center;overflow:visible;padding-top:22px;max-width:660px;");

    let modalIframe = $("<iframe>");
    modalIframe.attr("src", "https://open.spotify.com/embed/album/" + album.id);
    modalIframe.attr("width", "300");
    modalIframe.attr("height", "300");
    modalIframe.attr("iframeborder", "0");
    modalIframe.attr("allowtransparency", true);
    modalIframe.attr("allow", "encrypted-media");
    modalIframe.attr("style", "display:inline-block;");

    let modalAlbumImage = $("<img>");
    modalAlbumImage.attr("src", album.img);
    modalAlbumImage.attr("style", "display:inline-block;");

    albumModal.append(modalAlbumImage);
    albumModal.append(modalIframe);
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
