const got = require('got')

// Possible values for order parameter in search
export const SearchOrder = {
  RANKING       : "RANKING"
  TRACK_ASC     : "TRACK_ASC"
  TRACK_DESC    : "TRACK_DESC"
  ARTIST_ASC    : "ARTIST_ASC"
  ARTIST_DESC   : "ARTIST_DESC"
  ALBUM_ASC     : "ALBUM_ASC"
  ALBUM_DESC    : "ALBUM_DESC"
  RATING_ASC    : "RATING_ASC"
  RATING_DESC   : "RATING_DESC"
  DURATION_ASC  : "DURATION_ASC"
  DURATION_DESC : "DURATION_DESC"
}

export class API{
  constructor(cookie_jar, headers){
    this.http_headers = headers
    this.cookie_jar = cookie_jar
    this.access_token = null
  }

  async api_call(method, args){
    if (typeof args == "undefined") args = {}
    if this.access_token: args.access_token = this.access_token
    try {
      const result_json = await got.get("https://api.deezer.com/" + method, {
        searchParams: args,
        cookieJar: this.cookie_jar,
        headers: this.http_headers,
        timeout: 30000
      }).json()
    } catch (error) {
      await new Promise(r => setTimeout(r, 2000)) // sleep(2000ms)
      return await this.api_call(method, args)
    }
    if (result_json.error){
      if (result_json.error.code){
        if ([4, 700].indexOf(result_json.error.code) != -1) {
          await new Promise(r => setTimeout(r, 5000)) // sleep(5000ms)
          return await this.api_call(method, args)
        }
        if (result_json.error.code == 100) throw new ItemsLimitExceededException(`ItemsLimitExceededException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 200) throw new PermissionException(`PermissionException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 300) throw new InvalidTokenException(`InvalidTokenException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 500) throw new WrongParameterException(`ParameterException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 501) throw new MissingParameterException(`MissingParameterException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 600) throw new InvalidQueryException(`InvalidQueryException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 800) throw new DataException(`DataException: ${method} ${result_json.error.message || ""}`)
        if (result_json.error.code == 901) throw new IndividualAccountChangedNotAllowedException(`IndividualAccountChangedNotAllowedException: ${method} ${result_json.error.message || ""}`)
      }
      throw APIError(result_json.error))
    }
    return result_json
  }

  async get_album(album_id){
    return await this.api_call(`album/${album_id}`)
  }

  async get_album_by_UPC(upc){
    return await this.get_album(`upc:${upc}`)
  }

  async get_album_comments(album_id, index=0, limit=10){
    return await this.api_call(`album/${album_id}/comments`, {index, limit})
  }

  async get_album_fans(album_id, index=0, limit=100){
    return await this.api_call(`album/${album_id}/fans`, {index, limit})
  }

  async get_album_tracks(album_id, index=0, limit=-1){
    return await this.api_call(`album/${album_id}/tracks`, {index, limit})
  }

  async get_artist(artist_id){
    return await this.api_call(`artist/${artist_id}`)
  }

  async get_artist_top(artist_id, index=0, limit=10){
    return await this.api_call(`artist/${artist_id}/top`, {index, limit})
  }

  async get_artist_albums(artist_id, index=0, limit=-1){
    return await this.api_call(`artist/${artist_id}/albums`, {index, limit})
  }

  async get_artist_comments(artist_id, index=0, limit=10){
    return await this.api_call(`artist/${artist_id}/comments`, {index, limit})
  }

  async get_artist_fans(artist_id, index=0, limit=100){
    return await this.api_call(`artist/${artist_id}/fans`, {index, limit})
  }

  async get_artist_related(artist_id, index=0, limit=20){
    return await this.api_call(`artist/${artist_id}/related`, {index, limit})
  }

  async get_artist_radio(artist_id, index=0, limit=25){
    return await this.api_call(`artist/${artist_id}/radio`, {index, limit})
  }

  async get_artist_playlists(artist_id, index=0, limit=-1){
    return await this.api_call(`artist/${artist_id}/playlists`, {index, limit})
  }

  async get_chart(genre_id=0, index=0, limit=10){
    return await this.api_call(`chart/${genre_id}`, {index, limit})
  }

  async get_chart_tracks(genre_id=0, index=0, limit=10){
    return await this.api_call(`chart/${genre_id}/tracks`, {index, limit})
  }

  async get_chart_albums(genre_id=0, index=0, limit=10){
    return await this.api_call(`chart/${genre_id}/albums`, {index, limit})
  }

  async get_chart_artists(genre_id=0, index=0, limit=10){
    return await this.api_call(`chart/${genre_id}/artists`, {index, limit})
  }

  async get_chart_playlists(genre_id=0, index=0, limit=10){
    return await this.api_call(`chart/${genre_id}/playlists`, {index, limit})
  }

  async get_chart_podcasts(genre_id=0, index=0, limit=10){
    return await this.api_call(`chart/${genre_id}/podcasts`, {index, limit})
  }

  async get_comment(comment_id){
    return await this.api_call(`comment/${comment_id}`)
  }

  async get_editorials(index=0, limit=10){
    return await this.api_call('editorial', {index, limit})
  }

  async get_editorial(genre_id=0){
    return await this.api_call(`editorial/${genre_id}`)
  }

  async get_editorial_selection(genre_id=0, index=0, limit=10){
    return await this.api_call(`editorial/${genre_id}/selection`, {index, limit})
  }

  async get_editorial_charts(genre_id=0, index=0, limit=10){
    return await this.api_call(`editorial/${genre_id}/charts`, {index, limit})
  }

  async get_editorial_releases(genre_id=0, index=0, limit=10){
    return await this.api_call(`editorial/${genre_id}/releases`, {index, limit})
  }

  async get_genres(index=0, limit=10){
    return await this.api_call('genre', {index, limit})
  }

  async get_genre(genre_id=0){
    return await this.api_call(`genre/${genre_id}`)
  }

  async get_genre_artists(genre_id=0, index=0, limit=10){
    return await this.api_call(`genre/${genre_id}/artists`, {index, limit})
  }

  async get_genre_radios( genre_id=0, index=0, limit=10){
    return await this.api_call(`genre/${genre_id}/radios`, {index, limit})
  }

  async get_infos(){
    return await this.api_call('infos')
  }

  async get_options(){
    return await this.api_call('options')
  }

  async get_playlist(playlist_id){
    return await this.api_call(`playlist/${playlist_id}`)
  }

  async get_playlist_comments(album_id, index=0, limit=10){
    return await this.api_call(`playlist/${album_id}/comments`, {index, limit})
  }

  async get_playlist_fans(album_id, index=0, limit=100){
    return await this.api_call(`playlist/${album_id}/fans`, {index, limit})
  }

  async get_playlist_tracks(album_id, index=0, limit=-1){
    return await this.api_call(`playlist/${album_id}/tracks`, {index, limit})
  }

  async get_playlist_radio(album_id, index=0, limit=100){
    return await this.api_call(`playlist/${album_id}/radio`, {index, limit})
  }

  async get_radios(index=0, limit=10){
    return await this.api_call('radio', {index, limit})
  }

  async get_radios_genres(index=0, limit=25){
    return await this.api_call('radio/genres', {index, limit})
  }

  async get_radios_top(index=0, limit=50){
    return await this.api_call('radio/top', {index, limit})
  }

  async get_radios_lists(index=0, limit=25){
    return await this.api_call('radio/lists', {index, limit})
  }

  async get_radio(radio_id){
    return await this.api_call(`radio/${radio_id}`)
  }

  async get_radio_tracks(radio_id, index=0, limit=40){
    return await this.api_call(`radio/${radio_id}/tracks`, {index, limit})
  }

  _generate_search_advanced_query(artist="", album="", track="", label="", dur_min=0, dur_max=0, bpm_min=0, bpm_max=0){
    let query = ""
    if (artist != "") query += `artist:"${artist}" `
    if (album != "") query += `album:"${album}" `
    if (track != "") query += `track:"${track}" `
    if (label != "") query += `label:"${label}" `
    if (dur_min != 0) query += `dur_min:"${dur_min}" `
    if (dur_max != 0) query += `dur_max:"${dur_max}" `
    if (bpm_min != 0) query += `bpm_min:"${bpm_min}" `
    if (bpm_max != 0) query += `bpm_max:"${bpm_max}" `
    return query.trim()
  }

  _generate_search_args(query, strict=false, order, index=0, limit=25){
    let args = {q: query, index, limit}
    if (strict) args.strict = 'on'
    if (order) args.order = order
    return args
  }

  async search(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search', args)
  }

  async advanced_search(artist="", album="", track="", label="", dur_min=0, dur_max=0, bpm_min=0, bpm_max=0, strict=false, order, index=0, limit=25){
    const query = this._generate_search_advanced_query(artist, album, track, label, dur_min, dur_max, bpm_min, bpm_max)
    return await this.search(query, strict, order, index, limit)
  }

  async search_album(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search/album', args)
  }

  async search_artist(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search/artist', args)
  }

  async search_playlist(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search/playlist', args)
  }

  async search_radio(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search/radio', args)
  }

  async search_track(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search/track', args)
  }

  async search_user(query, strict=false, order, index=0, limit=25){
    const args = this._generate_search_args(query, strict, order, index, limit)
    return await this.api_call('search/user', args)
  }

  async get_track(song_id){
    return await this.api_call(`track/${song_id}`)
  }

  async get_track_by_ISRC(isrc){
    return await this.get_track(`isrc:${isrc}`)
  }

  async get_user(user_id){
    return await this.api_call(`user/${user_id}`)
  }

  async get_user_albums(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/albums`, {index, limit})
  }

  async get_user_artists(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/artists`, {index, limit})
  }

  async get_user_artists(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/artists`, {index, limit})
  }

  async get_user_flow(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/flow`, {index, limit})
  }

  async get_user_following(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/followings`, {index, limit})
  }

  async get_user_followers(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/followers`, {index, limit})
  }

  async get_user_playlists(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/playlists`, {index, limit})
  }

  async get_user_radios(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/radios`, {index, limit})
  }

  async get_user_tracks(user_id, index=0, limit=25){
    return await this.api_call(`user/${user_id}/tracks`, {index, limit})
  }

  // Extra calls

  async get_countries_charts(){
    let temp = await this.get_user_playlists('637006841', limit=-1)['data']
    result = temp.sort((a, b) => a.title.localeCompare(b.title)) // Sort all playlists
    if (!result[0].title.startsWith('Top')) result.shift() // Remove loved tracks playlist
    return result
  }


  async get_track_id_from_metadata(artist, track, album){
    artist = artist.replace("–", "-").replace("’", "'")
    track = track.replace("–", "-").replace("’", "'")
    album = album.replace("–", "-").replace("’", "'")

    let resp = await this.advanced_search(artist=artist, track=track, album=album, limit=1)
    if (resp.data.length > 0) return resp.data[0].id

    resp = await this.advanced_search(artist=artist, track=track, limit=1)
    if (resp.data.length > 0) return resp.data[0].id

    // Try removing version
    if ( track.indexOf("(") != -1 && track.indexOf(")") != -1 && track.indexOf("(") < track.indexOf(")") ){
      resp = await this.advanced_search(artist=artist, track=track.split("(")[0], limit=1)
      if (resp.data.length > 0) return resp.data[0].id
    } else if ( track.indexOf(" - ") != -1) {
      resp = await this.advanced_search(artist=artist, track=track.split(" - ")[0], limit=1)
      if (resp.data.length > 0) return resp.data[0].id
    }

    return "0"
  }
}

// Base class for Deezer exceptions
export class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = "APIError";
  }
}
export class ItemsLimitExceededException extends APIError {
  constructor(message) {
    super(message);
    this.name = "ItemsLimitExceededException";
  }
}
export class PermissionException extends APIError {
  constructor(message) {
    super(message);
    this.name = "PermissionException";
  }
}
export class InvalidTokenException extends APIError {
  constructor(message) {
    super(message);
    this.name = "InvalidTokenException";
  }
}
export class WrongParameterException extends APIError {
  constructor(message) {
    super(message);
    this.name = "WrongParameterException";
  }
}
export class MissingParameterException extends APIError {
  constructor(message) {
    super(message);
    this.name = "MissingParameterException";
  }
}
export class InvalidQueryException extends APIError {
  constructor(message) {
    super(message);
    this.name = "InvalidQueryException";
  }
}
export class DataException extends APIError {
  constructor(message) {
    super(message);
    this.name = "DataException";
  }
}
export class IndividualAccountChangedNotAllowedException extends APIError {
  constructor(message) {
    super(message);
    this.name = "IndividualAccountChangedNotAllowedException";
  }
}
