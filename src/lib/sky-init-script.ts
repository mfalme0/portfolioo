/**
 * Pre-paint sky initialisation.
 *
 * This runs in `<head>` BEFORE first paint. It computes the current sky from
 * the visitor's clock and writes it to `document.documentElement` as CSS
 * custom properties, so the first frame is already the correct sky — there is
 * no blue-purple flash like the previous implementation had, and no hydration
 * mismatch because the React tree never held the sky in state.
 *
 * Kept deliberately small and dependency-free: it duplicates a slimmed-down
 * copy of the solar maths rather than importing the module, because it must be
 * synchronous and inline.
 */
export const SKY_INIT_SCRIPT = `
(function () {
  var root = document.documentElement;
  var DEG = Math.PI / 180, RAD = 180 / Math.PI;

  function jd(d) { return d.getTime() / 86400000 + 2440587.5; }
  function cen(x) { return (x - 2451545) / 36525; }
  function gml(t) { var l = 280.46646 + t * (36000.76983 + t * 0.0003032); return ((l % 360) + 360) % 360; }
  function gma(t) { return 357.52911 + t * (35999.05029 - 0.0001536 * t); }
  function ecc(t) { return 0.016708634 - t * (0.000042037 + 0.0000001267 * t); }
  function eoc(t) {
    var m = gma(t) * DEG, e = ecc(t);
    return Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t))
         + Math.sin(2 * m) * (0.019993 - 0.000101 * t)
         + Math.sin(3 * m) * 0.000289;
  }
  function appLon(t) {
    var o = gml(t) + eoc(t), w = 125.04 - 1934.136 * t;
    return o - 0.00569 - 0.00478 * Math.sin(w * DEG);
  }
  function obliq(t) {
    var s = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
    return 23 + (26 + s / 60) / 60;
  }
  function decl(t) {
    var e = obliq(t) * DEG, l = appLon(t) * DEG;
    return Math.asin(Math.sin(e) * Math.sin(l)) * RAD;
  }
  function eot(t) {
    var e = obliq(t), l0 = gml(t), ec = ecc(t), m = gma(t);
    var y = Math.tan((e / 2) * DEG) * Math.tan((e / 2) * DEG);
    return (y * Math.sin(2 * l0 * DEG) - 2 * ec * Math.sin(m * DEG)
      + 4 * ec * y * Math.sin(m * DEG) * Math.cos(2 * l0 * DEG)
      - 0.5 * y * y * Math.sin(4 * l0 * DEG) - 1.25 * ec * ec * Math.sin(2 * m * DEG)) * RAD * 4;
  }
  function refr(a) {
    if (a > 85) return 0;
    var t = Math.tan(a * DEG), c;
    if (a > 5) c = 58.1 / t - 0.07 / (t*t*t) + 0.000086 / (t*t*t*t*t);
    else if (a > -0.575) c = 1735 + a * (-518.2 + a * (103.4 + a * (-12.79 + a * 0.711)));
    else c = -20.772 / t;
    return c / 3600;
  }
  function altitude(d) {
    var j = jd(d), t = cen(j), lat = -1.2864, lon = 36.8172;
    var dec = decl(t) * DEG;
    var mins = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
    var tst = ((mins + eot(t) + 4 * lon) % 1440 + 1440) % 1440;
    var ha = tst / 4 - 180;
    if (ha < -180) ha += 360; if (ha > 180) ha -= 360;
    var z = Math.acos(Math.sin(lat * DEG) * Math.sin(dec)
      + Math.cos(lat * DEG) * Math.cos(dec) * Math.cos(ha * DEG)) * RAD;
    return 90 - z + refr(90 - z);
  }

  // Sky gradient keyframes by sun altitude.
  var KF = [
    [-18, '#04060F', '#070B1A', '#0B1226', '#05070E'],
    [-12, '#070C1C', '#0E1730', '#16213F', '#070A14'],
    [ -6, '#101C3C', '#1E2C55', '#2B3E6B', '#0A0E1B'],
    [ -3, '#1A2A52', '#33436F', '#5A5A82', '#12121F'],
    [  0, '#26406F', '#5C5A85', '#C4703C', '#2A1B18'],
    [  4, '#2F5591', '#6E7FA8', '#E89A4A', '#3A2A1E'],
    [ 12, '#2F6BB5', '#5E9BD4', '#BCD9F2', '#6B5B44'],
    [ 35, '#2A6FD0', '#4E9BE4', '#A8D4F5', '#9A876A'],
    [ 70, '#1F63CC', '#3D8FE0', '#8CC7F2', '#B5A183']
  ];
  function hx(h) { h = h.replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  function mix(a, b, t) {
    var x = hx(a), y = hx(b);
    return '#' + [0,1,2].map(function (i) {
      return Math.round((x[i] + (y[i] - x[i]) * t)).toString(16).padStart(2, '0');
    }).join('');
  }
  function sample(alt) {
    if (alt <= KF[0][0]) return { z: KF[0][1], m: KF[0][2], h: KF[0][3], g: KF[0][4] };
    var last = KF[KF.length - 1];
    if (alt >= last[0]) return { z: last[1], m: last[2], h: last[3], g: last[4] };
    for (var i = 0; i < KF.length - 1; i++) {
      if (alt >= KF[i][0] && alt <= KF[i+1][0]) {
        var t = (alt - KF[i][0]) / (KF[i+1][0] - KF[i][0]);
        return { z: mix(KF[i][1], KF[i+1][1], t), m: mix(KF[i][2], KF[i+1][2], t),
                 h: mix(KF[i][3], KF[i+1][3], t), g: mix(KF[i][4], KF[i+1][4], t) };
      }
    }
  }
  function lum(hex) {
    var c = hx(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
  }

  function ratio(fg, bg) {
    var a = lum(fg), b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  // Must be pure black, not a lifted ink tone: a near-black leaves a gap at
  // mid-luminance backgrounds where neither black nor white reaches 4.5:1.
  function readable(bg) {
    return ratio('#FFFFFF', bg) >= ratio('#000000', bg) ? '#FFFFFF' : '#000000';
  }

  var alt = altitude(new Date());
  var g = sample(alt);
  var fg = readable(g.m);
  var fgH = readable(g.h);
  var muted = ['#E6E9EF', '#D4D8E0', '#C3C8D2', '#B4BAC6', '#5A6270', '#3A3F4A', '#22262E']
    .reduce(function (best, c) { return ratio(c, g.m) > ratio(best, g.m) ? c : best; }, fg);
  if (ratio(muted, g.m) < 4.5) muted = fg;
  var temp = Math.round(1900 + Math.min(1, Math.max(0, (Math.min(60, Math.max(-6, alt)) + 6) / 66)) * 4600);
  var inten = alt <= -6 ? 0 : (function (x) { x = Math.min(1, Math.max(0, (alt + 6) / 40)); return x*x*(3-2*x); })();
  var night = alt < -0.833;
  var dark = alt >= 20 ? 0 : alt <= -12 ? 1 : Math.min(1, Math.max(0, (20 - alt) / 32));
  var phase = alt < -18 ? 'night' : alt < -12 ? 'astronomical' : alt < -6 ? 'nautical'
            : alt < -0.833 ? 'civil' : alt < 6 ? 'golden' : 'day';
  var stars = Math.min(1, Math.max(0, (-alt - 4) / 12));

  var s = root.style;
  s.setProperty('--sky-zenith', g.z);
  s.setProperty('--sky-mid', g.m);
  s.setProperty('--sky-horizon', g.h);
  s.setProperty('--sky-ground', g.g);
  s.setProperty('--sky-fg', fg);
  s.setProperty('--sky-fg-muted', muted);
  s.setProperty('--sky-fg-horizon', fgH);
  s.setProperty('--sky-light-temperature', temp + 'K');
  s.setProperty('--sky-light-intensity', String(inten));
  s.setProperty('--sky-star-opacity', String(stars));
  s.setProperty('--sky-darkness', dark.toFixed(3));
  s.setProperty('--sky-phase', phase);
  s.setProperty('--sky-mood', night ? 'street' : 'beach');
  s.setProperty('--sky-sun-altitude', alt.toFixed(2) + 'deg');
  root.setAttribute('data-sky-ready', '1');
})();
`.trim();