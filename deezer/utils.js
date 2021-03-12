const RELEASE_TYPE = ["single", "album", "compile", "ep", "bundle"]

// maps gw-light api user/tracks to standard api
export function map_user_track(track){
  return {
    id: track.SNG_ID,
    title: track.SNG_TITLE,
    link: 'https://www.deezer.com/track/'+track.SNG_ID,
    duration: track.DURATION,
    rank: track.RANK_SNG,
    explicit_lyrics: int(track.EXPLICIT_LYRICS) > 0,
    explicit_content_lyrics: track.EXPLICIT_TRACK_CONTENT.EXPLICIT_COVER_STATUS,
    explicit_content_cover: track.EXPLICIT_TRACK_CONTENT.EXPLICIT_LYRICS_STATUS,
    time_add: track.DATE_ADD,
    album: {
      id: track.ALB_ID,
      title: track.ALB_TITLE,
      cover: 'https://api.deezer.com/album/'+track.ALB_ID+'/image',
      cover_small: 'https://e-cdns-images.dzcdn.net/images/cover/'+track.ALB_PICTURE+'/56x56-000000-80-0-0.jpg',
      cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/'+track.ALB_PICTURE+'/250x250-000000-80-0-0.jpg',
      cover_big: 'https://e-cdns-images.dzcdn.net/images/cover/'+track.ALB_PICTURE+'/500x500-000000-80-0-0.jpg',
      cover_xl: 'https://e-cdns-images.dzcdn.net/images/cover/'+track.ALB_PICTURE+'/1000x1000-000000-80-0-0.jpg',
      tracklist: 'https://api.deezer.com/album/'+track.ALB_ID+'/tracks',
      type: 'album'
    },
    artist: {
      id: track.ART_ID,
      name: track.ART_NAME,
      picture: 'https://api.deezer.com/artist/'+track.ART_ID+'/image',
      picture_small: 'https://e-cdns-images.dzcdn.net/images/artist/'+track.ART_PICTURE+'/56x56-000000-80-0-0.jpg',
      picture_medium: 'https://e-cdns-images.dzcdn.net/images/artist/'+track.ART_PICTURE+'/250x250-000000-80-0-0.jpg',
      picture_big: 'https://e-cdns-images.dzcdn.net/images/artist/'+track.ART_PICTURE+'/500x500-000000-80-0-0.jpg',
      picture_xl: 'https://e-cdns-images.dzcdn.net/images/artist/'+track.ART_PICTURE+'/1000x1000-000000-80-0-0.jpg',
      tracklist: 'https://api.deezer.com/artist/'+track.ART_ID+'/top?limit=50',
      type: 'artist'
    },
    type: 'track'
  }
}

// maps gw-light api user/artists to standard api
export function map_user_artist(artist){
  return {
    id: artist.ART_ID,
    name: artist.ART_NAME,
    link: 'https://www.deezer.com/artist/'+artist.ART_ID,
    picture: 'https://api.deezer.com/artist/'+artist.ART_ID+'/image',
    picture_small: 'https://e-cdns-images.dzcdn.net/images/artist/'+artist.ART_PICTURE+'/56x56-000000-80-0-0.jpg',
    picture_medium: 'https://e-cdns-images.dzcdn.net/images/artist/'+artist.ART_PICTURE+'/250x250-000000-80-0-0.jpg',
    picture_big: 'https://e-cdns-images.dzcdn.net/images/artist/'+artist.ART_PICTURE+'/500x500-000000-80-0-0.jpg',
    picture_xl: 'https://e-cdns-images.dzcdn.net/images/artist/'+artist.ART_PICTURE+'/1000x1000-000000-80-0-0.jpg',
    nb_fan: artist.NB_FAN,
    tracklist: 'https://api.deezer.com/artist/'+artist.ART_ID+'/top?limit=50',
    type: 'artist'
  }
}


// maps gw-light api user/albums to standard api
export function map_user_album(album){
  return {
    id: album.ALB_ID,
    title: album.ALB_TITLE,
    link: 'https://www.deezer.com/album/'+album.ALB_ID,
    cover: 'https://api.deezer.com/album/'+album.ALB_ID+'/image',
    cover_small: 'https://e-cdns-images.dzcdn.net/images/cover/'+album.ALB_PICTURE+'/56x56-000000-80-0-0.jpg',
    cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/'+album.ALB_PICTURE+'/250x250-000000-80-0-0.jpg',
    cover_big: 'https://e-cdns-images.dzcdn.net/images/cover/'+album.ALB_PICTURE+'/500x500-000000-80-0-0.jpg',
    cover_xl: 'https://e-cdns-images.dzcdn.net/images/cover/'+album.ALB_PICTURE+'/1000x1000-000000-80-0-0.jpg',
    tracklist: 'https://api.deezer.com/album/'+album.ALB_ID+'/tracks',
    explicit_lyrics: album.EXPLICIT_ALBUM_CONTENT.EXPLICIT_LYRICS_STATUS > 0,
    artist: {
      id: album.ART_ID,
      name: album.ART_NAME,
      picture: 'https://api.deezer.com/artist/'+album.ART_ID+'image',
      tracklist: 'https://api.deezer.com/artist/'+album.ART_ID+'/top?limit=50'
    },
    type: 'album'
  }
}


// maps gw-light api user/playlists to standard api
export function map_user_playlist(playlist, default_user_name=""){
  return {
    id: playlist.PLAYLIST_ID,
    title: playlist.TITLE,
    description: playlist.DESCRIPTION || "",
    nb_tracks: playlist.NB_SONG,
    link: 'https://www.deezer.com/playlist/'+playlist.PLAYLIST_ID,
    picture: 'https://api.deezer.com/playlist/'+playlist.PLAYLIST_ID+'/image',
    picture_small: 'https://e-cdns-images.dzcdn.net/images/'+playlist.PICTURE_TYPE+'/'+playlist.PLAYLIST_PICTURE+'/56x56-000000-80-0-0.jpg',
    picture_medium: 'https://e-cdns-images.dzcdn.net/images/'+playlist.PICTURE_TYPE+'/'+playlist.PLAYLIST_PICTURE+'/250x250-000000-80-0-0.jpg',
    picture_big: 'https://e-cdns-images.dzcdn.net/images/'+playlist.PICTURE_TYPE+'/'+playlist.PLAYLIST_PICTURE+'/500x500-000000-80-0-0.jpg',
    picture_xl: 'https://e-cdns-images.dzcdn.net/images/'+playlist.PICTURE_TYPE+'/'+playlist.PLAYLIST_PICTURE+'/1000x1000-000000-80-0-0.jpg',
    tracklist: 'https://api.deezer.com/playlist/'+playlist.PLAYLIST_ID+'/tracks',
    creation_date: playlist.DATE_ADD,
    creator: {
      id: playlist.PARENT_USER_ID,
      name: playlist.PARENT_USERNAME || default_user_name
    },
    type: 'playlist'
  }
}


// maps gw-light api albums to standard api
export function map_album(album){
  return {
    id: album.ALB_ID,
    title: album.ALB_TITLE,
    upc: "", // TODO: Needs to be checked
    link: `https://www.deezer.com/album/${album.ALB_ID}`,
    share: "", // TODO: Needs to be checked
    cover: `https://api.deezer.com/album/${album.ALB_ID}/image`,
    cover_small: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/56x56-000000-80-0-0.jpg`,
    cover_medium: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/250x250-000000-80-0-0.jpg`,
    cover_big: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/500x500-000000-80-0-0.jpg`,
    cover_xl: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/1000x1000-000000-80-0-0.jpg`,
    md5_image: album.ALB_PICTURE,
    genre_id: album.GENRE_ID,
    genres: [], // TODO: Needs to be checked
    label: "", // TODO: Needs to be checked
    nb_tracks: album.NUMBER_TRACK,
    duration: 0, // TODO: Needs to be checked
    fans: album.RANK,
    rating: 0, // TODO: Needs to be checked
    release_date: album.PHYSICAL_RELEASE_DATE,
    record_type: RELEASE_TYPE[int(album.TYPE)] || "unknown",
    available: true, // TODO: Needs to be checked
    alternative: null, // TODO: Needs to be checked
    tracklist: `https://api.deezer.com/album/${album.ALB_ID}/tracks`,
    explicit_lyrics: int(album.EXPLICIT_LYRICS) > 0,
    explicit_content_lyrics: 2, // TODO: Needs to be checked
    explicit_content_cover: 2, // TODO: Needs to be checked
    contributors: [], // TODO: Needs to be checked
    artist: null, // TODO: Needs to be checked
    tracks: [], // TODO: Needs to be checked
    type: album.__TYPE__,
    // Extras
    nb_disk: album.NUMBER_DISK
  }
}


// maps gw-light api artist/albums to standard api
export function map_artist_album(album){
  return {
    id: album.ALB_ID,
    title: album.ALB_TITLE,
    link: `https://www.deezer.com/album/${album.ALB_ID}`,
    cover: `https://api.deezer.com/album/${album.ALB_ID}/image`,
    cover_small: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/56x56-000000-80-0-0.jpg`,
    cover_medium: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/250x250-000000-80-0-0.jpg`,
    cover_big: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/500x500-000000-80-0-0.jpg`,
    cover_xl: `https://cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/1000x1000-000000-80-0-0.jpg`,
    genre_id: album.GENRE_ID,
    fans: album.RANK,
    release_date: album.PHYSICAL_RELEASE_DATE,
    record_type: RELEASE_TYPE[int(album.TYPE)] || "unknown",
    tracklist: `https://api.deezer.com/album/${album.ALB_ID}/tracks`,
    explicit_lyrics: int(album.EXPLICIT_LYRICS) > 0,
    type: album.__TYPE__,
    // Extras
    nb_tracks: album.NUMBER_TRACK,
    nb_disk: album.NUMBER_DISK
  }
}


// maps gw-light api playlists to standard api
export function map_playlist(playlist){
  return {
    id: playlist.PLAYLIST_ID,
    title: playlist.TITLE,
    description: playlist.DESCRIPTION,
    duration: playlist.DURATION,
    public: playlist.STATUS == 1,
    is_loved_track: playlist.TYPE == 4,
    collaborative: playlist.STATUS == 2,
    nb_tracks: playlist.NB_SONG,
    fans: playlist.NB_FAN,
    link: "https://www.deezer.com/playlist/"+playlist.PLAYLIST_ID,
    share: "https://www.deezer.com/playlist/"+playlist.PLAYLIST_ID,
    picture: "https://api.deezer.com/playlist/"+playlist.PLAYLIST_ID+"/image",
    picture_small: "https://cdns-images.dzcdn.net/images/"+playlist.PICTURE_TYPE+"/"+playlist.PLAYLIST_PICTURE+"/56x56-000000-80-0-0.jpg",
    picture_medium: "https://cdns-images.dzcdn.net/images/"+playlist.PICTURE_TYPE+"/"+playlist.PLAYLIST_PICTURE+"/250x250-000000-80-0-0.jpg",
    picture_big: "https://cdns-images.dzcdn.net/images/"+playlist.PICTURE_TYPE+"/"+playlist.PLAYLIST_PICTURE+"/500x500-000000-80-0-0.jpg",
    picture_xl: "https://cdns-images.dzcdn.net/images/"+playlist.PICTURE_TYPE+"/"+playlist.PLAYLIST_PICTURE+"/1000x1000-000000-80-0-0.jpg",
    checksum: playlist.CHECKSUM,
    tracklist: "https://api.deezer.com/playlist/"+playlist.PLAYLIST_ID+"/tracks",
    creation_date: playlist.DATE_ADD,
    creator: {
      id: playlist.PARENT_USER_ID,
      name: playlist.PARENT_USERNAME,
      tracklist: "https://api.deezer.com/user/"+playlist.PARENT_USER_ID+"/flow",
      type: "user"
    },
    type: "playlist"
  }
}


// Cleanup terms that can hurt search results
export function clean_search_query(term){
  term = term.replaceAll(/ feat[\.]? /g, " ")
  term = term.replaceAll(/ ft[\.]? /g, " ")
  term = term.replaceAll(/\(feat[\.]? /g, " ")
  term = term.replaceAll(/\(ft[\.]? /g, " ")
  term = term.replace(' & ', " ").replace('–', "-").replace('—', "-")
  return term
}
