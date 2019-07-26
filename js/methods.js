$.urlParam = function (name, queryString) {
  var results = new RegExp(name + '=([^&#]*)')
  .exec(queryString);

  return (results !== null) ? results[1] || 0 : false;
};

$.changeYear = function (year) {
  let yearPlaylists = _.filter(playlists, function (o) {
    return o.year == year;
  });

  let tabs = $("#tabs").tabs();
  let ul = tabs.find("ul");

  let accessToken = $.urlParam('access_token', window.location.hash.substr(1));

  ul.empty();
  tabs.find("div").remove();
  _.each(yearPlaylists, function (playlist) {

    let headerLi = $("<li>");
    let link = $("<a>");
    link.attr("href", "#" + playlist.code);
    link.text(playlist.genre);
    headerLi.html(link);

    ul.append(headerLi);

    let tabDiv = $("<div>");
    tabDiv.attr("id", playlist.code);

    let tabP = $("<p>");
    tabP.text(playlist.year + " " + playlist.genre);
    tabDiv.append(tabP);

    if(!accessToken){

      let iframe = $("<iframe>");
      iframe.attr("src", "https://open.spotify.com/embed/user/josh.sarean/playlist/" + playlist.code);
      iframe.attr("width", "300");
      iframe.attr("height", "380");
      iframe.attr("iframeborder", "0");
      iframe.attr("allowtransparency", true);
      iframe.attr("allow", "encrypted-media");

      tabDiv.append(iframe);
    }

    tabs.append(tabDiv);
  });
  tabs.tabs("refresh");
  tabs.tabs("option", "active", 0);

  if(accessToken){

    _.each(yearPlaylists, function(playlist){
      var albums = {};

      let request = $.ajax({
        method: "GET",
        url: 'https://api.spotify.com/v1/playlists/' + playlist.code + '/tracks',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
      request.done(function( response ) {

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

        _.each(albums, function (album) {

          let albumDiv = $("<div>");
          albumDiv.attr("style", "display:inline-block;");

          let albumModal = $("<div>");
          albumModal.attr("id", album.id);
          albumModal.attr("class", "modal");

          let modalIframe = $("<iframe>");
          modalIframe.attr("src", "https://open.spotify.com/embed/album/" + album.id);
          modalIframe.attr("width", "300");
          modalIframe.attr("height", "300");
          modalIframe.attr("iframeborder", "0");
          modalIframe.attr("allowtransparency", true);
          modalIframe.attr("allow", "encrypted-media");

          let modalClose = $("<a>");
          modalClose.attr("href", "#");
          modalClose.attr("rel", "modal:close");
          modalClose.text("Close");

          albumModal.append(modalIframe);
          albumModal.append(modalClose);
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

        tabDiv.append(albumContainerDiv);

        let iframe = $("<iframe>");
        iframe.attr("src", "https://open.spotify.com/embed/user/josh.sarean/playlist/" + playlist.code);
        iframe.attr("width", "300");
        iframe.attr("height", "380");
        iframe.attr("iframeborder", "0");
        iframe.attr("allowtransparency", true);
        iframe.attr("allow", "encrypted-media");

        tabDiv.append(iframe);

      });
    });
  }
};
