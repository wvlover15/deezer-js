const got = require('got')
const {map_artist_album, map_user_track, map_user_artist, map_user_album, map_user_playlist} = require('./utils.js')

// Explicit Content Lyrics
const LyricsStatus = {
  NOT_EXPLICIT: 0, // Not Explicit
  EXPLICIT: 1, // Explicit
  UNKNOWN: 2, // Unknown
  EDITED: 3, // Edited
  PARTIALLY_EXPLICIT: 4, // Partially Explicit (Album "lyrics" only)
  PARTIALLY_UNKNOWN: 5, // Partially Unknown (Album "lyrics" only)
  NO_ADVICE: 6, // No Advice Available
  PARTIALLY_NO_ADVICE: 7 // Partially No Advice Available (Album "lyrics" only)
}

const PlaylistStatus = {
  PUBLIC: 0,
  PRIVATE: 1,
  COLLABORATIVE: 2,
}


const EMPTY_TRACK_OBJ = {
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

class GW{
  constructor(cookie_jar, headers){
    this.http_headers = headers
    this.cookie_jar = cookie_jar
  }

  async api_call(method, args, params){
    if (typeof args === undefined) args = {}
    if (typeof params === undefined) params = {}
    let p = {
      api_version: "1.0",
      api_token: method == 'deezer.getUserData' ? 'null' : await this._get_token(),
      input: '3',
      method: method,
      ...params
    }
    let result_json
    try{
      result_json = await got.post("http://www.deezer.com/ajax/gw-light.php", {
        searchParams: p,
        json: args,
        cookieJar: this.cookie_jar,
        headers: this.http_headers,
        timeout: 30000
      }).json()
    }catch (e){
      console.debug("[ERROR] deezer.gw", method, args, e.message)
      await new Promise(r => setTimeout(r, 2000)) // sleep(2000ms)
      return this.api_call(method, args, params)
    }
    if (result_json.error.length) throw new GWAPIError(result_json.error)
    return result_json.results
  }

  async _get_token(){
    let token_data = await this.get_user_data()
    return token_data.checkForm
  }

  get_user_data(){
    return this.api_call('deezer.getUserData')
  }

  get_user_profile_page(user_id, tab, options={}){
    const limit = options.limit || 10
    return this.api_call('deezer.pageProfile', {user_id, tab, nb: limit})
  }

  get_child_accounts(){
    return this.api_call('deezer.getChildAccounts')
  }

  get_track(sng_id){
    return this.api_call('song.getData', {sng_id})
  }

  get_track_page(sng_id){
    return this.api_call('deezer.pageTrack', {sng_id})
  }

  get_track_lyrics(sng_id){
    return this.api_call('song.getLyrics', {sng_id})
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

  get_album(alb_id){
    return this.api_call('album.getData', {alb_id})
  }

  get_album_page(alb_id){
    return this.api_call('deezer.pageAlbum', {
      alb_id,
      lang: 'en',
      header: true,
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

  get_artist(art_id){
    return this.api_call('artist.getData', {art_id})
  }

  get_artist_page(art_id){
    return this.api_call('deezer.pageArtist', {
      art_id,
      lang: 'en',
      header: true,
      tab: 0
    })
  }

  async get_artist_top_tracks(art_id, options={}){
    const limit = options.limit || 100
    let tracks_array = []
    let body = await this.api_call('artist.getTopTrack', {art_id, nb: limit})
    body.data.forEach(track => {
      track.POSITION = body.data.indexOf(track)
      tracks_array.push(track)
    })
    return tracks_array
  }

  get_artist_discography(art_id, options={}){
    const index = options.index || 0
    const limit = options.limit || 25
    return this.api_call('album.getDiscography', {
      art_id,
      discography_mode:"all",
      nb: limit,
      nb_songs: 0,
      start: index
    })
  }

  get_playlist(playlist_id){
    return this.api_call('playlist.getData', {playlist_id})
  }

  get_playlist_page(playlist_id){
    return this.api_call('deezer.pagePlaylist', {
      playlist_id,
      lang: 'en',
      header: true,
      tab: 0
    })
  }

  async get_playlist_tracks(playlist_id){
    let tracks_array = []
    let body = await this.api_call('playlist.getSongs', {playlist_id, nb: -1})
    body.data.forEach(track => {
      track.POSITION = body.data.indexOf(track)
      tracks_array.push(track)
    })
    return tracks_array
  }

  create_playlist(title, status=PlaylistStatus.PUBLIC, description, songs=[]){
    let newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return this.api_call('playlist.create', {
      title,
      status,
      description,
      songs: newSongs
    })
  }

  edit_playlist(playlist_id, title, status, description, songs=[]){
    let newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return this.api_call('playlist.update', {
      playlist_id,
      title,
      status,
      description,
      songs: newSongs
    })
  }

  add_songs_to_playlist(playlist_id, songs, offset=-1){
    let newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return this.api_call('playlist.addSongs', {
      playlist_id,
      songs: newSongs,
      offset
    })
  }

  add_song_to_playlist(playlist_id, sng_id, offset=-1){
    return this.add_songs_to_playlist(playlist_id, [sng_id], offset)
  }

  remove_songs_from_playlist(playlist_id, songs){
    let newSongs = []
    songs.forEach(song => {
      newSongs.push([song, 0])
    });
    return this.api_call('playlist.deleteSongs', {
        playlist_id,
        songs: newSongs
    })
  }

  remove_song_from_playlist(playlist_id, sng_id){
    return this.remove_songs_from_playlist(playlist_id, [sng_id])
  }

  delete_playlist(playlist_id){
    return this.api_call('playlist.delete', {playlist_id})
  }

  add_song_to_favorites(sng_id){
    return this.gw_api_call('favorite_song.add', {sng_id})
  }

  remove_song_from_favorites(sng_id){
    return this.gw_api_call('favorite_song.remove', {sng_id})
  }

  add_album_to_favorites(alb_id){
    return this.gw_api_call('album.addFavorite', {alb_id})
  }

  remove_album_from_favorites(alb_id){
    return this.gw_api_call('album.deleteFavorite', {alb_id})
  }

  add_artist_to_favorites(art_id){
    return this.gw_api_call('artist.addFavorite', {art_id})
  }

  remove_artist_from_favorites(art_id){
    return this.gw_api_call('artist.deleteFavorite', {art_id})
  }

  add_playlist_to_favorites(playlist_id){
    return this.gw_api_call('playlist.addFavorite', {PARENT_PLAYLIST_ID: playlist_id})
  }

  remove_playlist_from_favorites(playlist_id){
    return this.gw_api_call('playlist.deleteFavorite', {PLAYLIST_ID: playlist_id})
  }

  get_page(page){
    let params = {
      gateway_input: JSON.stringify({
        PAGE: page,
        VERSION: '2.3',
        SUPPORT: {
          grid: [
            'channel',
            'album'
          ],
          'horizontal-grid': [
            'album'
          ],
        },
        LANG: 'en'
      })
    }
    return this.api_call('page.get', {}, params)
  }

  search(query, index=0, limit=10, suggest=true, artist_suggest=true, top_tracks=true){
    return this.api_call('deezer.pageSearch', {
      query,
      start: index,
      nb: limit,
      suggest,
      artist_suggest,
      top_tracks
    })
  }

  search_music(query, type, options={}){
    const index = options.index || 0
    const limit = options.limit || 10
    return this.api_call('search.music', {
      query,
      filter: "ALL",
      output: type,
      start: index,
      nb: limit
    })
  }

  // Extra calls

  async get_artist_discography_tabs(art_id, options={}){
    const limit = options.limit || 100
    let index = 0
    let releases = []
    let result = {all: []}
    let ids = []

    // Get all releases
    let response
    do {
      response = await this.get_artist_discography(art_id, {index, limit})
      releases = releases.concat(response.data)
      index += limit
    } while (index < response.total)

    releases.forEach(release => {
      if (ids.indexOf(release.ALB_ID) == -1){
        ids.push(release.ALB_ID)
        let obj = map_artist_album(release)
        if ((release.ART_ID == art_id || release.ART_ID != art_id && release.ROLE_ID == 0) && release.ARTISTS_ALBUMS_IS_OFFICIAL){
          // Handle all base record types
          if (!result[obj.record_type]) result[obj.record_type] = []
          result[obj.record_type].push(obj)
          result.all.push(obj)
        } else {
          if (release.ROLE_ID == 5) { // Handle albums where the artist is featured
            if (!result.featured) result.featured = []
            result.featured.push(obj)
          } else if (release.ROLE_ID == 0) { // Handle "more" albums
            if (!result.more) result.more = []
            result.more.push(obj)
            result.all.push(obj)
          }
        }
      }
    })
    return result
  }

  async get_track_with_fallback(sng_id){
    let body
    if (parseInt(sng_id) > 0){
      try{ body = await this.get_track_page(sng_id) }
      catch (e) { /*nothing*/ }
    }

    if (body){
      if (body.LYRICS) body.DATA.LYRICS = body.LYRICS
      body = body.DATA
    } else {
      body = await this.get_track(sng_id)
    }
    return body
  }

  async get_user_playlists(user_id, options={}){
    const limit = options.limit || 25
    let user_profile_page = await this.get_user_profile_page(user_id, 'playlists', {limit})
    let blog_name = user_profile_page.DATA.USER.BLOG_NAME || "Unknown"
    let data = user_profile_page.TAB.playlists.data
    let result = []
    data.forEach(playlist => {
      result.push(map_user_playlist(playlist, blog_name))
    })
    return result
  }

  async get_user_albums(user_id, options={}){
    const limit = options.limit || 25
    let data = await this.get_user_profile_page(user_id, 'albums', {limit})
    data = data.TAB.albums.data
    let result = []
    data.forEach(album => {
      result.push(map_user_album(album))
    })
    return result
  }

  async get_user_artists(user_id, options={}){
    const limit = options.limit || 25
    let data = this.get_user_profile_page(user_id, 'artists', {limit})
    data = data.TAB.artists.data
    let result = []
    data.forEach(artist => {
      result.push(map_user_artist(artist))
    })
    return result
  }

  async get_user_tracks(user_id, options={}){
    const limit = options.limit || 25
    let data = this.get_user_profile_page(user_id, 'loved', {limit})
    data = data.TAB.loved.data
    let result = []
    data.forEach(track => {
      result.push(map_user_track(track))
    })
    return result
  }

}

// Base class for Deezer exceptions
class GWAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = "APIError";
  }
}

module.exports = {
  LyricsStatus,
  PlaylistStatus,
  EMPTY_TRACK_OBJ,
  GW,
  GWAPIError
}
