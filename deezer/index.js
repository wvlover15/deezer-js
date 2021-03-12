const got = require('got')
const {CookieJar, Cookie} = require('tough-cookie')
const { API } = require('./api.js')
const { GW } = require('./gw.js')

// Number associtation for formats
export const TrackFormats = {
  FLAC    : 9
  MP3_320 : 3
  MP3_128 : 1
  MP4_RA3 : 15
  MP4_RA2 : 14
  MP4_RA1 : 13
  DEFAULT : 8
  LOCAL   : 0
}

export class Deezer{
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

  async login(email, password, re_captcha_token, child=0){
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
    this.change_account(child)
    this.logged_in = true
    return true
  }

  async login_via_arl(arl, child=0){
    arl = arl.trim()
    // TODO: Check how to do this
    let cookie_obj = Cookie({
      key: 'arl',
      value: arl,
      path: "/",
      httpOnly: true
    })
    this.cookie_jar.setCookie(cookie_obj, '.deezer.com')

    let user_data = await this.gw.get_user_data()
    // Check if user logged in
    if (user_data.USER.USER_ID == 0){
      this.logged_in = false
      return false
    }
    await this._post_login(user_data)
    this.change_account(child)
    this.logged_in = true
    return true
  }

  async _post_login(user_data){
    this.childs = []
    let family = user_data.USER.MULTI_ACCOUNT.ENABLED
    if (family){
      let childs = await this.gw.get_child_accounts()
      childs.forEach(child => {
        this.childs.push({
          'id': child.USER_ID,
          'name': child.BLOG_NAME,
          'picture': child.USER_PICTURE || ""
        })
      })
    } else {
      this.childs.append({
        'id': user_data.USER.USER_ID,
        'name': user_data.USER.BLOG_NAME,
        'picture': user_data.USER.USER_PICTURE || ""
      })
    }
  }

  change_account(child_n){
    if (this.childs.length-1 < child_n) child_n = 0
    this.current_user = this.childs[child_n]
    this.selected_account = child_n

    return [this.current_user, this.selected_account]
  }

}
