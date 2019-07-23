window.changeYear = function (year) {
  let yearPlaylists = _.filter(playlists, function (o) {
    return o.year == year;
  });

  let tabs = $("#tabs").tabs();
  let ul = tabs.find("ul");
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

    tabs.append(tabDiv);
  });
  tabs.tabs("refresh");
  tabs.tabs("option", "active", 0);

  if($.urlParam('token')){
    _.each(yearPlaylists, function(playlist){
      var albums = {};

      let request = $.ajax({
        method: "GET",
        url: 'https://api.spotify.com/v1/playlists/' + playlist.code + '/tracks',
        headers: {
          'Authorization': 'Bearer ' + $.urlParam('token')
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
          albumDiv.attr("id", album.id);
          albumDiv.attr("style", "display:inline-block;");

          let imageContainer = $("<p>");
          let albumImage = $("<img>");
          albumImage.attr("src", album.img);
          imageContainer.append(albumImage);

          albumDiv.append(imageContainer);

          let albumLabel = $("<p>");
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

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
  .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
}
