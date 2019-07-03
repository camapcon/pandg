function requireCheckin(routeTo, routeFrom, resolve, reject) {
  if (app.data.checkin != '') 
    resolve();
  else{
    app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
    reject();
  }
}
var routes = [
  // Index page
  {
    path: '/',
    url: './index.html',
    name: 'home'
  },
  {
    path: '/photo/',
    componentUrl: './pages/photo.html',
    name: 'photo',
    beforeEnter: requireCheckin
  },
  // Login page
  {
    path: '/login/',
    componentUrl: './pages/login.html',
    name: 'login'
  },
  // Report page
  {
    path: '/report/',
    componentUrl: './pages/report.html',
    name: 'report',
    beforeEnter: requireCheckin
  },
  // Outstock Report page
  {
    path: '/outstock_report/',
    componentUrl: './pages/outstock_report.html',
    name: 'outstock_report',
    beforeEnter: requireCheckin
  },
  // Outstock Product page
  {
    name: 'outstock_product',
    path: '/outstock_product/:categoryid/',
    componentUrl: './pages/outstock_product.html'
  },
  {
    name: 'outstock_product_brand',
    path: '/outstock_product_brand/:categoryid/:brand/',
    componentUrl: './pages/outstock_product_brand.html'
  },
  {
    name: 'outstock_enterdata',
    path: '/outstock_enterdata/:productid/',
    componentUrl: './pages/outstock_enterdata.html'
  },
  // Inventory Report pages
  {
    path: '/inventory_report/',
    componentUrl: './pages/inventory_report.html',
    name: 'inventory_report',
    beforeEnter: requireCheckin
  },
  {
    name: 'inventory_product',
    path: '/inventory_product/:categoryid/',
    componentUrl: './pages/inventory_product.html'
  },
  {
    name: 'inventory_product_brand',
    path: '/inventory_product_brand/:categoryid/:brand/',
    componentUrl: './pages/inventory_product_brand.html'
  },
  {
    name: 'inventory_enterdata',
    path: '/inventory_enterdata/:productid/',
    componentUrl: './pages/inventory_enterdata.html'
  },
  // Leaves page
  {
    path: '/leave/',
    async: function (routeTo, routeFrom, resolve, reject) {
      var username = localStorage.getItem("username");
      var token = localStorage.getItem("token");
      app.request.post('http://pg.liveapps.top/index.php/app/leave/', { username:username, token:token }, function (raw) {
        if(raw=='invalid'){
          app.dialog.alert('Phiên làm việc đã hết hạn', 'Thông báo', function(){
            resolve(
              {
                componentUrl: './pages/login.html',
                name: 'login'
              }
            );
          });
          return;
        }
        try{
          var json = JSON.parse(raw);
          resolve(
            {
              componentUrl: './pages/leave.html',
              name: 'leave'
            },
            {
              context: {
                leaves: json.leaves
              }
            }
          );
        }
        catch(e){
          app.dialog.alert('Vui lòng cập nhật phiên bản mới', 'Báo lỗi');
          return;
        }
      },function(){
        app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
      });
    }
  },
  // Weekreach page
  {
    path: '/weekreach/',
    async: function (routeTo, routeFrom, resolve, reject) {
      var username = localStorage.getItem("username");
      var token = localStorage.getItem("token");
      app.request.post('http://pg.liveapps.top/index.php/app/weekreach/', { username:username, token:token }, function (raw) {
        if(raw=='invalid'){
          app.dialog.alert('Phiên làm việc đã hết hạn', 'Thông báo', function(){
            resolve(
              {
                componentUrl: './pages/login.html',
                name: 'login'
              }
            );
          });
          return;
        }
        try{
          var json = JSON.parse(raw);
          resolve(
            {
              componentUrl: './pages/weekreach.html',
              name: 'weekreach'
            },
            {
              context: {
                leaves: json.reports
              }
            }
          );
        }
        catch(e){
          app.dialog.alert('Vui lòng cập nhật phiên bản mới', 'Báo lỗi');
          return;
        }
      },function(){
        app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
      });
    }
  },
  // Status page
  {
    path: '/status/',
    async: function (routeTo, routeFrom, resolve, reject) {
      var username = localStorage.getItem("username");
      var token = localStorage.getItem("token");
      app.request.post('http://pg.liveapps.top/index.php/app/status/', { username:username, token:token }, function (raw) {
        if(raw=='invalid'){
          app.dialog.alert('Phiên làm việc đã hết hạn', 'Thông báo', function(){
            resolve(
              {
                componentUrl: './pages/login.html',
                name: 'login'
              }
            );
          });
          return;
        }
        try{
          var json = JSON.parse(raw);
          app.data.checkin = json.checkin;
          app.data.checkout = json.checkout;
          json.reach = parseInt(json.reach);
          json.target = parseInt(json.target);
          resolve(
            {
              componentUrl: './pages/status.html',
              name: 'status'
            },
            {
              context: {
                fullname: localStorage.getItem("fullname"),
                loggedin: localStorage.getItem("loggedin"),
                location: localStorage.getItem("location"),
                checkin: json.checkin!='' ? json.checkin : '<span class="text-color-red">Bạn chưa checkin</span>',
                checkout:json.checkout!='' ? json.checkout : '<span class="text-color-red">Bạn chưa checkout</span>',
                reports:json.reports,
                sum_reports:json.sum_reports,
                empty_reports:json.reports.length==0,
                workday:json.workday,
                notyet: json.reach < json.target * 0.7,
                almost: json.reach >= json.target * 0.7 && json.reach < json.target,
                reached: json.reach >= json.target,
                reach: number_format(json.reach, 0, '.', '.'),
                target: number_format(json.target, 0, '.', '.'),
                needmore: number_format(Math.abs(json.target-json.reach), 0, '.', '.'),
                needmore_percent: number_format(Math.abs(json.target-json.reach)/json.target*100, 1, '.', '.')
              }
            }
          );
        }
        catch(e){
          app.dialog.alert('Vui lòng cập nhật phiên bản mới', 'Báo lỗi');
          return;
        }
      },function(){
        app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
      });
    }
  },
  {
    name: 'product_brand',
    path: '/product_brand/:categoryid/:brand/',
    componentUrl: './pages/product_brand.html'
  },
  {
    name: 'product',
    path: '/product/:categoryid/',
    componentUrl: './pages/product.html'
  },
  {
    name: 'enterdata',
    path: '/enterdata/:productid/',
    componentUrl: './pages/enterdata.html'
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
