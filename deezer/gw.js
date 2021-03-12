const got = require('got')
const {map_artist_album, map_user_track, map_user_artist, map_user_album, map_user_playlist} = require('./utils.js')

// Explicit Content Lyrics
export const LyricsStatus = {
  NOT_EXPLICIT: 0 // Not Explicit
  EXPLICIT: 1 // Explicit
  UNKNOWN: 2 // Unknown
  EDITED: 3 // Edited
  PARTIALLY_EXPLICIT: 4 // Partially Explicit (Album "lyrics" only)
  PARTIALLY_UNKNOWN: 5 // Partially Unknown (Album "lyrics" only)
  NO_ADVICE: 6 // No Advice Available
  PARTIALLY_NO_ADVICE: 7 // Partially No Advice Available (Album "lyrics" only)
}

export const PlaylistStatus = {
  PUBLIC: 0
  PRIVATE: 1
  COLLABORATIVE: 2
}


export const EMPTY_TRACK_OBJ = {
  SNG_ID: 0,
  SNG_TITLE: '',
  DURATION: 0,
  MD5_ORIGIN: 0,
  MEDIA_VERSION: 0,
  FILESIZE: 0,
  ALB_TITLE: "",
  ALB_PICTURE: "",
  ART_ID: 0,
  ART_NAME: ""
}

export class GW{
  constructor(cookie_jar, headers){
    this.http_headers = headers
    this.cookie_jar = cookie_jar
  }

  async api_call(method, args, params){
    if (typeof args == "unasyncined") args = {}
    if (typeof params == "unasyncined") params = {}
    p = {
      api_version: "1.0",
      api_token: method == 'deezer.getUserData' ? 'null' : this._get_token(),
      input: '3',
      method: method,
      ..params
    }
    try{
      const result_json = await got.get("http://www.deezer.com/ajax/gw-light.php", {
        searchParams: p,
        json: args,
        cookieJar: this.cookie_jar,
        headers: this.http_headers,
        timeout: 30000
      }).json()
    }catch{
      await new Promise(r => setTimeout(r, 2000)) // sleep(2000ms)
      return await this.api_call(method, args, params)
    }
    if (result_json.error.length):
        throw new GWAPIError(result_json.error)
    return result_json.results
  }

  async _get_token(){
    let token_data = await this.get_user_data()
    return token_data.checkForm
  }

  async get_user_data(){
    return await this.api_call('deezer.getUserData')
  }

  async get_user_profile_page(user_id, tab, limit=10){
    return await this.api_call('deezer.pageProfile', {user_id, tab, nb: limit})
  }

  async get_child_accounts(){
    return await this.api_call('deezer.getChildAccounts')
  }

  async get_track(sng_id){
    return await this.api_call('song.getData', {sng_id})
  }

  async get_track_page(sng_id){
    return await this.api_call('deezer.pageTrack', {sng_id})
  }

  async get_track_lyrics(sng_id){
    return await this.api_call('song.getLyrics', {sng_id})
  }

  async get_tracks_gw(sng_ids){
    let tracks_array = []
    let body = await this.api_call('song.getListData', {sng_ids})
    let errors = 0
    for (let i = 0; i < sng_ids.length; i++){
      if (sng_ids[0] != 0){
        tracks_array.push(body.data[i - errors])
      } else {
        errors++
        tracks_array.push(EMPTY_TRACK_OBJ)
      }
    }
    return tracks_array
  }

  async get_album(alb_id){
    return await this.api_call('album.getData', {alb_id})
  }

  async get_album_page(alb_id){
    return await this.api_call('deezer.pageAlbum', {
      alb_id,
      lang: 'en',
      header: True,
      tab: 0
    })
  }

  async get_album_tracks(alb_id){
    let tracks_array = []
    let body = await this.api_call('song.getListByAlbum', {alb_id, nb: -1})
    body.data.forEach(track => {
      let _track = track
      _track.POSITION = body.data.indexOf(track)
      tracks_array.push(_track)
    })
    return tracks_array
  }

  async get_artist(art_id){
    return await this.api_call('artist.getData', {art_id})
  }

  async get_artist_page(art_id){
    return this.api_call('deezer.pageArtist', {
      art_id,
      lang: 'en',
      header: True,
      tab: 0
    })
  }

  async get_artist_top_tracks(art_id, limit=100){
    let tracks_array = []
    let body = await this.api_call('artist.getTopTrack', {art_id, nb: limit})
    body.data.forEach(track => {
      track.POSITION = body.data.indexOf(track)
      tracks_array.push(_track)
    })
    return tracks_array
  }

  async get_artist_discography(art_id, index=0, limit=25){
    return await this.api_call('album.getDiscography', {
      art_id,
      discography_mode:"all",
      nb: limit,
      nb_songs: 0,
      start: index
    })
  }

  async get_playlist(playlist_id){
    return await this.api_call('playlist.getData', {playlist_id})
  }

  async get_playlist_page(playlist_id){
    return await this.api_call('deezer.pagePlaylist', {
      playlist_id,
      lang: 'en',
      header: True,
      tab: 0
    })
  }

  async get_playlist_tracks(playlist_id){
    let tracks_array = []
    let body = await this.api_call('playlist.getSongs', {playlist_id, nb: -1})
    body.data.forEach(track => {
      track.POSITION = body.data.indexOf(track)
      tracks_array.push(_track)
    })
    return tracks_array
  }

  async create_playlist(title, status=PlaylistStatus.PUBLIC, description, songs=[]){
    newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return await this.api_call('playlist.create', {
      title,
      status,
      description,
      songs: newSongs
    })
  }

  async edit_playlist(playlist_id, title, status, description, songs=[]){
    newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return await this.api_call('playlist.update', {
      playlist_id,
      title,
      status,
      description,
      songs: newSongs
    })
  }

  async add_songs_to_playlist(playlist_id, songs, offset=-1){
    newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return await this.api_call('playlist.addSongs', {
      playlist_id,
      songs: newSongs,
      offset
    })
  }

  async add_song_to_playlist(playlist_id, sng_id, offset=-1){
    return await this.add_songs_to_playlist(playlist_id, [sng_id], offset)
  }

  async remove_songs_from_playlist(playlist_id, songs){
    newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return await this.api_call('playlist.deleteSongs', {
        playlist_id,
        songs: newSongs
    })
  }

  async remove_song_from_playlist(playlist_id, sng_id){
    return await this.remove_songs_from_playlist(playlist_id, [sng_id])
  }

  async delete_playlist(playlist_id){
    return await this.api_call('playlist.delete', {playlist_id})
  }

  async add_song_to_favorites(sng_id){
    return await this.gw_api_call('favorite_song.add', {sng_id})
  }

  async remove_song_from_favorites(sng_id){
    return await this.gw_api_call('favorite_song.remove', {sng_id})
  }

  async add_album_to_favorites(alb_id){
    return await this.gw_api_call('album.addFavorite', {alb_id})
  }

  async remove_album_from_favorites(alb_id){
    return await this.gw_api_call('album.deleteFavorite', {alb_id})
  }

  async add_artist_to_favorites(art_id){
    return await this.gw_api_call('artist.addFavorite', {art_id})
  }

  async remove_artist_from_favorites(art_id){
    return await this.gw_api_call('artist.deleteFavorite', {art_id})
  }

  async add_playlist_to_favorites(playlist_id){
    return await this.gw_api_call('playlist.addFavorite', {PARENT_PLAYLIST_ID: playlist_id})
  }

  async remove_playlist_from_favorites(playlist_id){
    return await this.gw_api_call('playlist.deleteFavorite', {PLAYLIST_ID: playlist_id})
  }

  async get_page(page){
    let params = {
      gateway_input: JSON.stringify({
        PAGE: page,
        VERSION: '2.3',
        SUPPORT: {
          grid: [
            'channel',
            'album'
          ],
          horizontal-grid: [
            'album'
          ],
        },
        LANG: 'en'
      })
    }
    return await this.api_call('page.get', params=params)
  }

  async search(query, index=0, limit=10, suggest=true, artist_suggest=true, top_tracks=true){
    return await this.api_call('deezer.pageSearch', {
      query,
      start: index,
      nb: limit,
      suggest,
      artist_suggest,
      top_tracks
    })
  }

  async search_music(query, type, index=0, limit=10){
    return await this.api_call('search.music', {
      query,
      filter: "ALL",
      output: type,
      start: index,
      nb: limit
    })
  }

  // Extra calls

  async get_artist_discography_tabs(art_id, limit=100){
    let index = 0
    let releases = []
    let result = {all: []}
    let ids = []

    // Get all releases
    do {
      response = await this.get_artist_discography(art_id, index=index, limit=limit)
      releases.concat(response.data)
      index += limit
    } while (index < response.total)

    releases.forEach(release => {
      if (ids.indexOf(release.ALB_ID) == -1){
        ids.push(release.ALB_ID)
        obj = map_artist_album(release)
        if ((release.ART_ID == art_id || release.ART_ID != art_id && release.ROLE_ID == 0) && release.ARTISTS_ALBUMS_IS_OFFICIAL){
          // Handle all base record types
          if (!result[obj.record_type]) result[obj.record_type] = []
          result[obj.record_type].push(obj)
          result.all.push(obj)
        }
      } else {
        if (release.ROLE_ID == 5) { // Handle albums where the artist is featured
          if (!result.featured) result.featured = []
          result.featured.push(obj)
        } else if release.ROLE_ID == 0 { // Handle "more" albums
          if (!result.more) result.more = []
          result.more.push(obj)
          result.all.push(obj)
        }
      }
    })
    return result
  }

  async get_track_with_fallback(sng_id){
    let body
    if (int(sng_id) > 0){
      try{ body = await this.get_track_page(sng_id) }
      catch (e) {}
    }

    if (body){
      if (body.LYRICS) body.DATA.LYRICS = body.LYRICS
      body = body.DATA
    } else {
      body = await this.get_track(sng_id)
    }
    return body
  }

  async get_user_playlists(user_id, limit=25){
    let user_profile_page = await this.get_user_profile_page(user_id, 'playlists', limit=limit)
    let blog_name = user_profile_page.DATA.USER.BLOG_NAME || "Unknown"
    let data = user_profile_page.TAB.playlists.data
    let result = []
    data.forEach(playlist => {
      result.push(map_user_playlist(playlist, blog_name))
    })
    return result
  }

  async get_user_albums(user_id, limit=25){
    let data = await this.get_user_profile_page(user_id, 'albums', limit=limit).TAB.albums.data
    let result = []
    data.forEach(album => {
      result.push(map_user_album(album))
    })
    return result
  }

  async get_user_artists(user_id, limit=25){
    let data = this.get_user_profile_page(user_id, 'artists', limit=limit).TAB.artists.data
    let result = []
    data.forEach(artist => {
      result.push(map_user_artist(artist))
    })
    return result
  }

  async get_user_tracks(user_id, limit=25){
    let data = this.get_user_profile_page(user_id, 'loved', limit=limit).TAB.loved.data
    let result = []
    data.forEach(track => {
      result.push(map_user_track(track))
    })
    return result
  }

}

// Base class for Deezer exceptions
export class GWAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = "APIError";
  }
}
