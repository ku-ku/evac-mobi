const NULL_ID = "00000000-0000-0000-0000-000000000000";

const MODES = {
    "none":     0,
    "default":  1,
    "loading":  2,
    "saving":   3,
    "success":  4,
    "search":   5,
    "error":    9
};

/**
 *
 * Need`s masks for toolbar actions (see provide on layouts/default.vue)
 */
const NEEDS = {
    none: 0,
    back:   1,
    search: 2
};

/**
 * @param {String} val
 * @return {Boolean}
 */
function isEmpty(val) {
    if (!!val){
        return /^$/.test(val);
    }
    return true;
}


function tod(){
    var s, h = (new Date()).getHours();
    if (((h >= 21)&&(h<24)) || ((h >= 0)&&(h<5))){
        s = 'Доброй ночи';
    } else if ((h>=5) && (h<12)){
        s = 'Доброе утро';
    } else if ((h>=12) && (h<18)){
        s = 'Добрый день';
    } else if ((h>=18) && (h<21)){
        s = 'Добрый вечер';
    }
    return s;
}   //tod


function short(s){
    var res, n = s.indexOf(' ');
    if ( n > 0 ){
        res = s.charAt(0) + s.charAt(n + 1);
    } else if (s.length > 2){
        res = s.substr(0, 2);
    } else {
        res = s;
    }
    return res.toUpperCase();
}

/**
 * Convert utf8 to base64
 * @param {String} str
 * @return {String}
 */
function utf8ToB64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * Convert base64 to utf64
 * @param {String} str
 * @return {String}
 */
function b64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}


export {
    NULL_ID,
    MODES,
    NEEDS,
    isEmpty,
    tod,
    short,
    utf8ToB64,
    b64ToUtf8,
};
