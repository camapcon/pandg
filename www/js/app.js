// Dom7
var $ = Dom7;

var lat = '';
var lng = '';
var demotime = 1;
var reported = null;
var reported_buys = {};

// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

// Init App
var app = new Framework7({
  id: 'pg1.liveapps.top',
  root: '#app',
  init: false,
  theme: theme,
  touch: {
    fastClicks: true
  },
  data: function () {
    return {
      preload: {},
      cache: {},
      checkin: '',
      checkout: ''
    };
  },
  methods: {
    checkin: function (recheckin) {
      recheckin = recheckin || false;
      app.panel.close();
      var router = app.router;
      var token = localStorage.getItem("token");
      if(!recheckin){
          if(app.data.checkin!=''){
            if(app.data.checkout==''){
                app.dialog.alert('Đã checkin rồi và bạn vẫn chưa checkout ca này', 'Thông báo');
                return;
            }
            app.dialog.confirm('Đã checkin rồi, bạn muốn checkin tiếp không?', 'Thông báo', function(){app.methods.checkin(true);}, function(){});
            return;
          }
          else{
            reported_buys = {};
          }
      }
      navigator.camera.getPicture(function(fileURI){
        var options = new FileUploadOptions();
        options.fileKey = "photo";
        options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.headers = { Connection: "close", token:token, lat:lat, lng:lng };
        options.httpMethod="POST";
        options.chunkedMode=false;
        var ft = new FileTransfer();
        ft.upload(fileURI, encodeURI("http://pg.liveapps.top/index.php/app/checkin"), function(raw){
          app.dialog.close();
          if(raw.response=='invalid'){
            app.dialog.alert('Phiên làm việc đã hết hạn', 'Báo lỗi', function(){
              router.navigate('/login/', {reloadAll:true, ignoreCache:true});
            });
            return;
          }
          if(raw.response=='failed'){
            app.dialog.alert('Không gửi được hình chụp từ Camera', 'Báo lỗi');
            return;
          }
          /*
          if(raw.response=='already'){
            app.dialog.alert('Bạn đã checkin hôm nay rồi', 'Thông báo');
            return;
          }
          */
          app.dialog.alert('Ghi nhận lúc ' + raw.response, 'Checkin thành công', function(){
            app.data.checkout = '';
            router.navigate('/status/', {reloadAll:true, reloadCurrent: true, ignoreCache:true});
          });
        }, function(error){
          app.dialog.close();
          app.dialog.alert('Không gửi được hình chụp từ Camera (' + error.code + ')', 'Báo lỗi');
        }, options);
        app.dialog.preloader('Đang gửi hình');
      }, function(message) {
       app.dialog.alert(message, 'Báo lỗi');
       }, {
         quality: 50,
         correctOrientation: true,
         destinationType: navigator.camera.DestinationType.FILE_URI,
         sourceType: Camera.PictureSourceType.CAMERA
      });
    },
    checkout: function (confirm) {
      confirm = confirm || false;
      app.panel.close();
      var router = app.router;
      var token = localStorage.getItem("token");
      if(!confirm){
          app.dialog.confirm('Bạn có muốn checkout không?', 'Thông báo', function(){app.methods.checkout(true);}, function(){});
          return;
      }
      if(app.data.checkin==''){
        app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
        return;
      }
      if(reported==null || reported!=new Date().toDateString()){
        app.dialog.alert('Bạn chưa báo cáo bán hàng hôm nay', 'Thông báo');
        return;
      }
      app.request.post('http://pg.liveapps.top/index.php/app/checkout/', { token:token }, function (raw) {
        if(raw=='invalid'){
          app.dialog.alert('Phiên làm việc đã hết hạn', 'Báo lỗi', function(){
            router.navigate('/login/', {reloadAll:true, ignoreCache:true});
          });
          return;
        }
        try{
          var json = JSON.parse(raw);
          if(json.result=='success'){
            app.dialog.alert('Ghi nhận lúc ' + json.checkout, 'Checkout thành công', function(){
              router.navigate('/status/', {reloadAll:true, reloadCurrent: true, ignoreCache:true});
            });
          }
          if(json.result=='nocheckin'){
            app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
          }
          /*
          if(json.result=='already'){
            app.dialog.alert('Bạn đã checkout hôm nay rồi', 'Thông báo');
          }
          */
        }
        catch(e){
          app.dialog.alert('Vui lòng cập nhật phiên bản mới', 'Báo lỗi');
          return;
        }
      },function(){
        app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
      });
    },
    logout: function(){
      app.panel.close();
      localStorage.removeItem("token");
      app.router.navigate('/login/', {reloadAll:true, ignoreCache:true});
    }
  },
  routes: routes,
  vi: {
    placementId: 'pltd4o7ibb9rc653x14',
  },
});

var mainView = app.views.create('.view-main');
var token = localStorage.getItem("token");
if(token){
  mainView.router.navigate('/status/');
}
else{
  mainView.router.navigate('/login/', {reloadAll:true, ignoreCache:true});
}

$(document).on('page:init', function (e) {
  // Page Data contains all required information about loaded and initialized page
  var page = e.detail;
  if(page.name != 'login')
    $('.navbar').show();
});

$(document).on('click', '.require-checkin', function (e) {
  if (app.data.checkin == ''){
    app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
    setTimeout(function(){mainView.router.back('/status/', {reloadAll:true, ignoreCache:true});}, 1000);
  }
});

$(document).on('click', '.require-checkin-report', function (e) {
  if (app.data.checkin != ''){
    if(reported==null || reported!=new Date().toDateString()){
      app.dialog.alert('Bạn phải báo cáo bán hàng trước khi báo tiếp cận', 'Thông báo');
      setTimeout(function(){mainView.router.back('/status/', {reloadAll:true, ignoreCache:true});}, 1000);
    }
  }
  else{
    app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
    setTimeout(function(){mainView.router.back('/status/', {reloadAll:true, ignoreCache:true});}, 1000);
  }
});

$(document).on('page:init', '.page[data-name="login"]', function (e) {
  $('.navbar').hide();
});

app.init();

//preload some data
app.request.post('http://pg.liveapps.top/index.php/app/allproducts', {}, function (raw) {
  try{
    var json = JSON.parse(raw);
    window.localStorage.setItem("preload", json);
    app.data.preload = json;
  }
  catch(e){
    app.dialog.alert('Vui lòng cập nhật phiên bản mới', 'Báo lỗi');
    return;
  }
},function(xhr, status){
  app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
  //app.dialog.alert(JSON.stringify(xhr), status);
});

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {  
  navigator.geolocation.getCurrentPosition(function(position) {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
  }, function(error) {
      app.dialog.alert('Không thể xác định vị trí của bạn', 'Lỗi GPS');
  });
}

function getCursorPosition(input) {
    if (!input) return -1; // No (input) element found
    if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
    } else if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
    }
}

var receive_length = 0;
var receive_check = null;
function receive(){
  var barcode = document.getElementById('bluetooth_receive').value;//$('#bluetooth_receive').val();
  if(receive_check == null && barcode!='')
    receive_check = setTimeout(receive_listener, 500);
}

function receive_listener(){
  var barcode = document.getElementById('bluetooth_receive').value;//$('#bluetooth_receive').val();
  //alert(getCursorPosition(document.getElementById('bluetooth_receive')));
  if(barcode==''){
      clearTimeout(receive_check);
      receive_check = null;
      receive_length = 0;
      return;
  }
  if(barcode.length != receive_length){
      receive_length = barcode.length;
      receive_check = setTimeout(receive_listener, 1000);
      return;
  }
  //render
  var barcodes = barcode.split("\n");
  for(var i=0; i<barcodes.length; i++){
      barcode = barcodes[i];
      if(window.cordova.platformId=='android'){
          //barcode = barcode.split("").reverse().join("");
      }
      for(var id in app.data.preload.byids){
        //console.log(app.data.preload.byids[id].barcode);
        if(app.data.preload.byids[id].barcode==barcode){
          if($('#receive_list [data-buys="'+id+'"]').length > 0)
          {
            $('#receive_list [data-buys="'+id+'"]').html(parseInt($('#receive_list [data-buys="'+id+'"]').text()) + 1);
          }
          else
            $('#receive_list tbody').append('<tr><td class="label-cell" align="left">'+app.data.preload.byids[id].sku+' <span class="badge buys color-orange" style="float:right; font-weight:bold;" data-buys="'+id+'">1</span></td></tr>');
        }
      }
  }
  //cleanup
  clearTimeout(receive_check);
  receive_check = null;
  receive_length = 0;
  $('#bluetooth_receive').val("");
  $('#receive_list').show();
}

function number_format (number, decimals, decPoint, thousandsSep) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
  var n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
  var s = ''

  var toFixedFix = function (n, prec) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
    } else {
      var arr = ('' + n).split('e')
      var sig = ''
      if (+arr[1] + prec > 0) {
        sig = '+'
      }
      return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
    }
  }

  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }

  return s.join(dec)
}