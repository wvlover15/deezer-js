const got = require('got')
const {CookieJar, Cookie} = require('tough-cookie')
const { API } = require('./api.js')
const { GW } = require('./gw.js')
const { DeezerError, WrongLicense, WrongGeolocation } = require('./errors.js')

// Number associtation for formats
const TrackFormats = {
  FLAC    : 9,
  MP3_320 : 3,
  MP3_128 : 1,
  MP4_RA3 : 15,
  MP4_RA2 : 14,
  MP4_RA1 : 13,
  DEFAULT : 8,
  LOCAL   : 0,
}

class Deezer{
  constructor(accept_language=""){
    this.http_headers = {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
      "Accept-Language": accept_language
    }
    this.cookie_jar = new CookieJar()

    this.logged_in = false
    this.current_user = {}
    this.childs = []
    this.selected_account = 0

    this.api = new API(this.cookie_jar, this.http_headers)
    this.gw = new GW(this.cookie_jar, this.http_headers)
  }

  get_accept_language(){
    return this.http_headers['Accept-Language']
  }

  set_accept_language(lang){
    this.http_headers['Accept-Language'] = lang
  }

  async login(email, password, re_captcha_token, child){
    if (child) child = parseInt(child)
    // Check if user already logged in
    let user_data = await this.gw.get_user_data()
    if (user_data.USER.USER_ID == 0){
      this.logged_in = false
      return false
    }
    // Get the checkFormLogin
    let check_form_login = user_data.checkFormLogin
    let login = await got.post("https://www.deezer.com/ajax/action.php", {
      headers: this.http_headers,
      cookieJar: this.cookie_jar,
      form:{
          type: 'login',
          mail: email,
          password: password,
          checkFormLogin: check_form_login,
          reCaptchaToken: re_captcha_token
      }
    }).text()
    // Check if user logged in
    if (login.text.indexOf('success') == -1){
      this.logged_in = false
      return false
    }
    user_data = await this.gw.get_user_data()
    await this._post_login(user_data)
    if (!child && user_data.USER.MULTI_ACCOUNT.CHILD_COUNT) child = (user_data.USER.MULTI_ACCOUNT.CHILD_COUNT -1) || 0
    else child = 0
    this.change_account(child)
    this.logged_in = true
    return true
  }

  async login_via_arl(arl, child){
    arl = arl.trim()
    if (child) child = parseInt(child)

    // Create cookie
    let cookie_obj = new Cookie({
      key: 'arl',
      value: arl,
      domain: '.deezer.com',
      path: "/",
      httpOnly: true
    })
    await this.cookie_jar.setCookie(cookie_obj.toString(), "https://www.deezer.com")

    let user_data = await this.gw.get_user_data()
    // Check if user logged in
    if (user_data.USER.USER_ID == 0){
      this.logged_in = false
      return false
    }
    await this._post_login(user_data)
    if (!child && user_data.USER.MULTI_ACCOUNT.CHILD_COUNT) child = (user_data.USER.MULTI_ACCOUNT.CHILD_COUNT -1) || 0
    else child = 0
    this.change_account(child)
    this.logged_in = true
    return true
  }

  async _post_login(user_data){
    this.childs = []
    let family = user_data.USER.MULTI_ACCOUNT.ENABLED && !user_data.USER.MULTI_ACCOUNT.IS_SUB_ACCOUNT
    if (family){
      let childs = await this.gw.get_child_accounts()
      childs.forEach(child => {
        if (child.EXTRA_FAMILY.IS_LOGGABLE_AS) {
          this.childs.push({
            'id': child.USER_ID,
            'name': child.BLOG_NAME,
            'picture': child.USER_PICTURE || "",
            'license_token': user_data.USER.OPTIONS.license_token,
            'can_stream_hq': user_data.USER.OPTIONS.web_hq || user_data.USER.OPTIONS.mobile_hq,
            'can_stream_lossless': user_data.USER.OPTIONS.web_lossless || user_data.USER.OPTIONS.mobile_lossless,
            'country': user_data.COUNTRY
          })
        }
      })
    } else {
      this.childs.push({
        'id': user_data.USER.USER_ID,
        'name': user_data.USER.BLOG_NAME,
        'picture': user_data.USER.USER_PICTURE || "",
        'license_token': user_data.USER.OPTIONS.license_token,
        'can_stream_hq': user_data.USER.OPTIONS.web_hq || user_data.USER.OPTIONS.mobile_hq,
        'can_stream_lossless': user_data.USER.OPTIONS.web_lossless || user_data.USER.OPTIONS.mobile_lossless,
        'country': user_data.COUNTRY
      })
    }
  }

  change_account(child_n){
    if (this.childs.length-1 < child_n) child_n = 0
    this.current_user = this.childs[child_n]
    this.selected_account = child_n

    return [this.current_user, this.selected_account]
  }

  async get_track_url(track_token, format) {
    return this.get_tracks_url([track_token, ], format)
  }

  async get_tracks_url(track_tokens, format){
    if (!Array.isArray(track_tokens)) track_tokens = [track_tokens, ]
    if (!this.current_user.license_token) return null
    if (
      format === "FLAC" && !this.current_user.can_stream_lossless ||
      format === "MP3_320" && !this.current_user.can_stream_hq
    ) throw new WrongLicense(format)

    let response

    try {
      response = await got.post("https://media.deezer.com/v1/get_url", {
        headers: this.http_headers,
        cookieJar: this.cookie_jar,
        json: {
          license_token: this.current_user.license_token,
          media: [{
            type: "FULL",
            formats: [{ cipher: "BF_CBC_STRIPE", format: format }]
          }],
          track_tokens
        }
      }).json()
    } catch (e){
      return null
    }

    if (response.data.length){
      if (response.data[0].errors){
        if (response.data[0].errors[0].code === 2002) throw new WrongGeolocation(this.current_user.country)
        throw new DeezerError(JSON.stringify(response))
      }
      if (response.data[0].media) return response.data[0].media[0].sources[0].url
    }
  }
}

module.exports = {
  TrackFormats,
  Deezer,
  api: {...require('./api.js')},
  gw: {...require('./gw.js')},
  utils: {...require('./utils.js')},
  errors: {...require('./errors.js')}
}
